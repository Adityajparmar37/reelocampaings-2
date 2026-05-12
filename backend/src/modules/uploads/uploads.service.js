'use strict';

const fs = require('fs');
const csvParser = require('csv-parser');
const uploadsRepo = require('../../queries/uploads.queries');
const contactsRepo = require('../../queries/contacts.queries');
const { logger } = require('../../middlewares/logger');
const { sendToAll } = require('../../socket/socket.gateway');

const CHUNK_SIZE = 1000; // rows per bulkWrite batch

/**
 * Streams a CSV file, parses rows in chunks, and bulk-upserts contacts.
 * Supports 50k+ contacts without memory blowup via streaming.
 * Emits real-time progress via Socket.IO.
 */
const processCSV = async (uploadId, filePath) => {
  let totalRows = 0;
  let insertedRows = 0;
  let updatedRows = 0;
  let failedRows = 0;
  const errors = [];
  const rowBuffer = [];

  // Emit upload started event
  sendToAll('upload.started', { uploadId, status: 'processing' });

  const flushBuffer = async () => {
    if (!rowBuffer.length) return;
    const batch = rowBuffer.splice(0, rowBuffer.length);
    try {
      const result = await contactsRepo.bulkUpsertContacts(batch);
      insertedRows += result.inserted;
      updatedRows += result.updated;
    } catch (err) {
      failedRows += batch.length;
      errors.push({ message: err.message, rows: batch.length });
    }

    const processedRows = insertedRows + updatedRows + failedRows;

    await uploadsRepo.updateUploadProgress(uploadId, {
      totalRows,
      processedRows,
      insertedRows,
      updatedRows,
      failedRows,
    });

    // Emit progress event
    sendToAll('upload.progress', {
      uploadId,
      totalRows,
      processedRows,
      insertedRows,
      updatedRows,
      failedRows,
      status: 'processing',
    });
  };

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csvParser({
        mapHeaders: ({ header }) => header.trim().toLowerCase(),
      }));

    stream.on('data', async (row) => {
      totalRows++;
      let metadata = {};
      if (row.metadata) {
        try {
          metadata = JSON.parse(row.metadata);
        } catch (e) {
          logger.error(`[Upload] Invalid JSON metadata: ${row.metadata}`);
        }
      }

      const contact = {
        name: row.name || '',
        email: row.email ? row.email.trim().toLowerCase() : undefined,
        phone: row.phone || undefined,
        metadata,
        tags: row.tags ? row.tags.split('|').map((t) => t.trim()) : [],
      };

      rowBuffer.push(contact);

      if (rowBuffer.length >= CHUNK_SIZE) {
        stream.pause();
        try {
          await flushBuffer();
        } catch (e) {
          logger.error('[Upload] flushBuffer error:', e.message);
        }
        stream.resume();
      }
    });

    stream.on('end', async () => {
      try {
        await flushBuffer(); // flush remaining rows
        const finalStatus = failedRows === totalRows && totalRows > 0 ? 'failed' : 'completed';
        const processedRows = insertedRows + updatedRows + failedRows;
        
        await uploadsRepo.updateUploadProgress(uploadId, {
          totalRows,
          processedRows,
          insertedRows,
          updatedRows,
          failedRows,
          errors: errors.slice(0, 50),
          status: finalStatus,
        });

        // Emit completion event
        sendToAll('upload.completed', {
          uploadId,
          totalRows,
          processedRows,
          insertedRows,
          updatedRows,
          failedRows,
          status: finalStatus,
          errors: errors.slice(0, 10),
        });

        // Clean up temp file
        fs.unlink(filePath, () => {});
        resolve({ totalRows, insertedRows, updatedRows, failedRows });
      } catch (err) {
        reject(err);
      }
    });

    stream.on('error', async (err) => {
      await uploadsRepo.updateUploadProgress(uploadId, { status: 'failed', errors: [{ message: err.message }] });
      
      // Emit failure event
      sendToAll('upload.failed', {
        uploadId,
        status: 'failed',
        error: err.message,
      });

      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
};

module.exports = { processCSV };
