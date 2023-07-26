const STATUS_CODE = require('../../../constants/statusCode');

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case STATUS_CODE.VALIDATION_ERROR:
      return res.json({
        title: 'Validation Error',
        message: error.message,
        stackTrace: error.stack,
      });
      break;

    case STATUS_CODE.NOT_FOUND:
      return res.json({
        title: 'Not Found',
        message: error.message,
        stackTrace: error.stack,
      });
      break;

    case STATUS_CODE.UNAUTHORIZED:
      return res.json({
        title: 'Unauthorized',
        message: error.message,
        stackTrace: error.stack,
      });
      break;

    case STATUS_CODE.FORBIDDEN:
      return res.json({
        title: 'Forbidden',
        message: error.message,
        stackTrace: error.stack,
      });
      break;

    case STATUS_CODE.SERVER_ERROR:
      return res.json({
        title: 'Internal Server Error',
        message: error.message,
        stackTrace: error.stack,
      });
      break;

    default:
      console.log('No Error, All Good!🌹');
      break;
  }
};

module.exports = errorHandler;
