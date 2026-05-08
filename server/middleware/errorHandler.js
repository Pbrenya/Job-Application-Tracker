const logger = require('../logger');

module.exports = (err, req, res, next) => {
  logger.error(err.message, { error: err });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};
