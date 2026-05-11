'use strict';

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') console.error(`[Error]`, err);
  else console.error(`[Error] ${status} ${req.method} ${req.url} — ${message}`);
  res.status(status).json({
    success: false,
    error: { message, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), ...(err.details && { details: err.details }) },
  });
};

const createError = (message, status = 500, details = null) => {
  const err = new Error(message);
  err.status = status;
  if (details) err.details = details;
  return err;
};

module.exports = { errorHandler, createError };
