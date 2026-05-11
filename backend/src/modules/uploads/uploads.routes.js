'use strict';

const { Router } = require('express');
const controller = require('./uploads.controller');
const { uploadRateLimiter } = require('../../middlewares/rateLimiter');

const router = Router();

router.post('/', uploadRateLimiter, controller.upload.single('file'), controller.uploadCSV);
router.get('/',  controller.listUploads);
router.get('/:id', controller.getUploadStatus);

module.exports = router;
