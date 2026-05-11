'use strict';

const contactsRepo = require('./contacts.repository');
const { parsePagination, paginationMeta } = require('../../utils/pagination');

const listContacts = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const tags = query.tags ? query.tags.split(',').map((t) => t.trim()) : undefined;

  const { items, total } = await contactsRepo.findContacts({
    page, limit, skip,
    search: query.search,
    tags,
    sortBy: query.sortBy || 'createdAt',
    sortDir: query.sortDir || 'desc',
  });

  return { items, meta: paginationMeta({ page, limit, total }) };
};

const getContactById = async (id) => {
  const contact = await contactsRepo.findContactById(id);
  if (!contact) throw Object.assign(new Error('Contact not found'), { status: 404 });
  return contact;
};

const getContactCount = async () => contactsRepo.countContacts();

const deleteContact = async (id) => {
  const contact = await getContactById(id);
  await contactsRepo.deleteContact(id);
  return contact;
};

module.exports = { listContacts, getContactById, getContactCount, deleteContact };
