import { HttpException } from '@nestjs/common';
import { ERROR_CODES } from '../common/constants/error-codes';
import { ERROR_CONFIGS } from '../config/error-config';
export class CustomException extends HttpException {
  public readonly code: number;
  constructor(code: number, message?: string, errors?: any) {
    const config = ERROR_CONFIGS[code];
    if (!config) {
      throw new Error(`Error code ${code} is not defined in ERROR_CONFIG`);
    }
    const finalMessage = message || config.message;
    super(
      {
        code,
        message: finalMessage,
        ...(errors && { errors }),
      },
      config.httpStatus,
    );
    this.code = code;
  }
}

export class ValidationException extends CustomException {
  constructor(
    code: number = ERROR_CODES.VALIDATION_ERROR,
    errors?: any,
  ) {
    super(code, undefined, errors);
  }
}

export class AuthException extends CustomException {
  constructor(code: number = ERROR_CODES.UNAUTHORIZED, message?: string) {
    super(code, message);
  }
}

export class ServerException extends CustomException {
  constructor(code: number = ERROR_CODES.SERVER_ERROR, message?: string) {
    super(code, message);
  }
}
