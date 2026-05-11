'use strict';

const chunkArray = (array, size) => {
  if (!Array.isArray(array) || size < 1) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
};

module.exports = { chunkArray };
