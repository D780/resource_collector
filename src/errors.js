/**
 * 错误处理模块
 */
const logger = require('./logger');

class BaseError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.statusCode = options.statusCode || 500;
    this.details = options.details || {};
    this.context = options.context || {};
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      context: this.context,
      stack: this.stack
    };
  }
}

class NetworkError extends BaseError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'NETWORK_ERROR', statusCode: 503 });
    this.retryable = true;
  }
}

class TimeoutError extends BaseError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'TIMEOUT_ERROR', statusCode: 504 });
    this.retryable = true;
  }
}

class HttpError extends BaseError {
  constructor(message, statusCode, options = {}) {
    super(message, { ...options, code: 'HTTP_ERROR', statusCode });
    this.retryable = statusCode >= 500 || statusCode === 429;
  }
}

class ApiError extends BaseError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'API_ERROR', statusCode: options.statusCode || 500 });
  }
}

class ParseError extends BaseError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'PARSE_ERROR', statusCode: 422 });
  }
}

class ValidationError extends BaseError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'VALIDATION_ERROR', statusCode: 400 });
  }
}

class ConfigurationError extends BaseError {
  constructor(message, options = {}) {
    super(message, { ...options, code: 'CONFIGURATION_ERROR', statusCode: 500 });
  }
}

class ErrorHandler {
  constructor(loggerInstance) {
    this.logger = loggerInstance || logger;
  }

  handle(error, context = {}) {
    let handledError;

    if (error instanceof BaseError) {
      handledError = error;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      handledError = new NetworkError(error.message, { cause: error });
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      handledError = new TimeoutError(error.message, { cause: error });
    } else if (error.response) {
      handledError = new HttpError(
        error.message,
        error.response.status,
        { cause: error, details: { data: error.response.data } }
      );
    } else {
      handledError = new BaseError(error.message, { cause: error });
    }

    handledError.context = { ...handledError.context, ...context };

    this.logger.error(handledError.message, {
      code: handledError.code,
      statusCode: handledError.statusCode,
      details: handledError.details,
      context: handledError.context,
      stack: handledError.stack
    });

    return handledError;
  }

  isRetryable(error) {
    if (error instanceof BaseError) {
      return error.retryable === true;
    }
    return false;
  }
}

const errorHandler = new ErrorHandler();

module.exports = {
  BaseError,
  NetworkError,
  TimeoutError,
  HttpError,
  ApiError,
  ParseError,
  ValidationError,
  ConfigurationError,
  ErrorHandler,
  errorHandler
};
