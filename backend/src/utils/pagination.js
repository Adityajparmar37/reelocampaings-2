'use strict';

const parsePagination = (query, defaultLimit = 50) => {
  const page  = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

const paginationMeta = ({ page, limit, total }) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { parsePagination, paginationMeta };
