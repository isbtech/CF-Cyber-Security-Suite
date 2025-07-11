const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  };

  // Handle different error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    };
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.error = {
      code: 'INVALID_ID',
      message: 'Invalid ID format'
    };
  } else if (err.code === 11000) {
    statusCode = 409;
    errorResponse.error = {
      code: 'DUPLICATE_ENTRY',
      message: 'Resource already exists'
    };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error = {
      code: 'UNAUTHORIZED',
      message: 'Invalid token'
    };
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.error = {
      code: 'UNAUTHORIZED',
      message: 'Token expired'
    };
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    errorResponse.error = {
      code: err.code || 'CUSTOM_ERROR',
      message: err.message
    };
  }

  // Don't expose detailed error messages in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error.message = 'Internal server error';
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;