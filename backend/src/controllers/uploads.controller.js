'use strict';

const multer = require('multer');
const path = require('path');
const { asyncWrapper } = require('../middlewares/asyncWrapper');
const uploadsRepo = require('../queries/uploads.queries');
const uploadsService = require('../modules/uploads/uploads.service');
const { parsePagination, paginationMeta } = require('../utils/pagination');

const upload = multer({
  dest: '/tmp/campaign_uploads/',
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(Object.assign(new Error('Only CSV files allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});

const uploadCSV = asyncWrapper(async (req, res) => {
  if (!req.file) throw Object.assign(new Error('No file uploaded'), { status: 400 });

  const record = await uploadsRepo.createUpload({
    filename: req.file.filename,
    originalName: req.file.originalname,
  });

  // Fire-and-forget — respond immediately with 202
  uploadsService.processCSV(record._id.toString(), req.file.path)
    .catch((err) => console.error('[Upload] Background error:', err.message));

  res.status(202).json({
    success: true,
    data: { uploadId: record._id, message: 'CSV processing started. Poll /uploads/:id for status.' },
  });
});

const getUploadStatus = asyncWrapper(async (req, res) => {
  const record = await uploadsRepo.findUploadById(req.params.id);
  if (!record) throw Object.assign(new Error('Upload not found'), { status: 404 });
  res.json({ success: true, data: record });
});

const listUploads = asyncWrapper(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 20);
  const { items, total } = await uploadsRepo.listUploads({ page, limit, skip });
  res.json({ success: true, data: { items, meta: paginationMeta({ page, limit, total }) } });
});

module.exports = { upload, uploadCSV, getUploadStatus, listUploads };
