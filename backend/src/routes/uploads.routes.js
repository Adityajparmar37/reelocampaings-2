'use strict';

const { Router } = require('express');
const controller = require('../controllers/uploads.controller');
const multerUploadMiddleware = require('../utils/uploadMidd');
const { uploadRateLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.post('/', uploadRateLimiter, multerUploadMiddleware.single('file'), controller.uploadCSV);
router.get('/',  controller.listUploads);
router.get('/:id', controller.getUploadStatus);

module.exports = router;
