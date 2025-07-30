import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../common/constants/error-codes';

export const ERROR_CONFIGS = {
  [ERROR_CODES.SUCCESS]: {
    // 1000
    message: 'Success',
    httpStatus: HttpStatus.OK,
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    // 2001
    message: 'Data is not valid',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODES.MISSING_FIELDS]: {
    // 2002
    message: 'Required fields are missing',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODES.INVALID_FORMAT]: {
    // 2003
    message: 'Data format is invalid',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODES.DUPLICATE_ENTRY]: {
    // 2004
    message: 'Resource already exists',
    httpStatus: HttpStatus.CONFLICT,
  },
  [ERROR_CODES.MISSING_REFRESH_TOKEN]: {
    // 2005
    message: 'Missing refresh token',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    // 4001
    message: 'You have not access yet',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_CODES.FORBIDDEN]: {
    // 4002
    message: "You don't have permission",
    httpStatus: HttpStatus.FORBIDDEN,
  },
  [ERROR_CODES.TOKEN_EXPIRED]: {
    // 4003
    message: 'Token has expired',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_CODES.INVALID_TOKEN]: {
    // 4004
    message: 'Invalid token provided',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_CODES.INVALID_REFRESH_TOKEN]: {
    // 4005
    message: 'Invalid refresh token',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },

  [ERROR_CODES.SERVER_ERROR]: {
    // 5001
    message: 'Internal server error',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  [ERROR_CODES.EXTERNAL_API_ERROR]: {
    // 5002
    message: 'External API error',
    httpStatus: HttpStatus.BAD_GATEWAY,
  },
  [ERROR_CODES.DB_CONNECTION_FAIL]: {
    // 5003
    message: 'Database connection failed',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
