'use strict';

const contactsService = require('../modules/contacts/contacts.service');
const { asyncWrapper } = require('../middlewares/asyncWrapper');

const listContacts = asyncWrapper(async (req, res) => {
  const result = await contactsService.listContacts(req.query);
  res.json({ success: true, data: result });
});

const getContact = asyncWrapper(async (req, res) => {
  const contact = await contactsService.getContactById(req.params.id);
  res.json({ success: true, data: contact });
});

const getContactStats = asyncWrapper(async (req, res) => {
  const count = await contactsService.getContactCount();
  res.json({ success: true, data: { total: count } });
});

const deleteContact = asyncWrapper(async (req, res) => {
  await contactsService.deleteContact(req.params.id);
  res.json({ success: true, message: 'Contact deleted successfully' });
});

module.exports = { listContacts, getContact, getContactStats, deleteContact };
