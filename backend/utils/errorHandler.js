class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

const sendError = (err, res) => {
  let error = { ...err };
  error.message = err.message;

  // Hide stacktrace in production
  if (process.env.NODE_ENV === 'production') {
    if (error.isOperational) {
      error = { message: error.message };
    } else {
      error = { message: 'Something went wrong!' };
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = { AppError, ValidationError, NotFoundError, sendError };

