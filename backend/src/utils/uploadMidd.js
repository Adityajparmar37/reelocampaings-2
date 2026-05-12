const multer = require("multer");
const path = require("path");

const multerUploadMiddleware = multer({
  dest: '/tmp/campaign_uploads/',
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(Object.assign(new Error('Only CSV files allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});

module.exports = multerUploadMiddleware;