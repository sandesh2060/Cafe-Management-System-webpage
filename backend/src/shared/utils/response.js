// File: backend/src/shared/utils/response.js
// ✅ PRODUCTION-READY: Standardized API response utilities

/**
 * Standard success response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    if (typeof data === 'object' && !Array.isArray(data) && !(data instanceof Date)) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard error response
 */
const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${statusCode}] ${message}`, errors || '');
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error response (422)
 */
const validationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    statusCode: 422,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Not found response (404)
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
    statusCode: 404
  });
};

/**
 * Unauthorized response (401)
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    statusCode: 401
  });
};

/**
 * Forbidden response (403)
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    statusCode: 403
  });
};

/**
 * Created response (201)
 */
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Bad request response (400)
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Conflict response (409)
 */
const conflictResponse = (res, message = 'Resource conflict') => {
  return res.status(409).json({
    success: false,
    message,
    statusCode: 409
  });
};

/**
 * Too many requests response (429)
 */
const rateLimitResponse = (res, message = 'Too many requests', retryAfter = null) => {
  const response = {
    success: false,
    message,
    statusCode: 429
  };

  if (retryAfter) {
    response.retryAfter = retryAfter;
    res.set('Retry-After', retryAfter.toString());
  }

  return res.status(429).json(response);
};

/**
 * Internal server error response (500)
 */
const serverErrorResponse = (res, message = 'Internal server error', error = null) => {
  if (process.env.NODE_ENV === 'development' && error) {
    console.error('Server Error:', error);
  }

  return res.status(500).json({
    success: false,
    message,
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && error && {
      error: {
        message: error.message,
        stack: error.stack
      }
    })
  });
};

/**
 * Paginated success response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      total: pagination.total || data.length,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || data.length) / (pagination.limit || 20)),
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1
    }
  });
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom Application Error class
 * Use this for throwing errors that should be caught by error handlers
 * 
 * Example:
 *   throw new AppError('Order not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ✅ CRITICAL: Export as object for destructuring
module.exports = {
  successResponse,
  errorResponse,
  validationError,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  createdResponse,
  noContentResponse,
  badRequestResponse,
  conflictResponse,
  rateLimitResponse,
  serverErrorResponse,
  paginatedResponse,
  asyncHandler,
  AppError  // ✅ Added AppError export
};