'use strict';

const morgan = require('morgan');

const httpLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { skip: (req) => req.url === '/health' }
);

const logger = {
  info:  (...a) => console.log('[INFO]',  new Date().toISOString(), ...a),
  warn:  (...a) => console.warn('[WARN]',  new Date().toISOString(), ...a),
  error: (...a) => console.error('[ERROR]', new Date().toISOString(), ...a),
  debug: (...a) => { if (process.env.NODE_ENV !== 'production') console.debug('[DEBUG]', ...a); },
};

module.exports = { httpLogger, logger };
