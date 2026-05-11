'use strict';

const { createError } = require('./errorHandler');

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(createError('Validation failed', 400, issues));
  }
  req[source] = result.data;
  next();
};

module.exports = { validate };
