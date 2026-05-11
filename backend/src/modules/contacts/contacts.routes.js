'use strict';

const { Router } = require('express');
const contactsController = require('./contacts.controller');
const { validate } = require('../../middlewares/validate');
const { contactQuerySchema } = require('../../validators/contact.validator');

const router = Router();

// GET /contacts — paginated list with search + filter
router.get('/', validate(contactQuerySchema, 'query'), contactsController.listContacts);

// GET /contacts/stats — total count
router.get('/stats', contactsController.getContactStats);

// GET /contacts/:id — single contact
router.get('/:id', contactsController.getContact);

// DELETE /contacts/:id — delete a contact
router.delete('/:id', contactsController.deleteContact);

module.exports = router;
