import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../common/bases/api.response';
import { ERROR_CODES } from '../common/constants/error-codes';
import { CustomException } from './custom-exception';
import { ERROR_CONFIGS } from '../config/error-config';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('Global exception call....', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // 500 default
    let message: string = 'Network Error';
    let errors: any = null;
    let code: number = ERROR_CODES.SERVER_ERROR;

    if (exception instanceof CustomException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      code = exceptionResponse.code;
      message = exceptionResponse.message;
      errors = exceptionResponse.errors || null;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        errors = res.errors || null;
      }

      code = this.mapHttpStatusToErrorCode(httpStatus);
    } else if (exception instanceof Error) {
      message = exception.message || 'An unexpected error occurred';
      code = this.mapHttpStatusToErrorCode(httpStatus);
      console.log(code)
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const config = ERROR_CONFIGS[code];
    if (config && !message) {
      message = config.message;
    }

    const apiResponse = errors ? ApiResponse.error(errors, message, code) : ApiResponse.message(message, code, 'error')
    return response.status(httpStatus).json(apiResponse);
  }

  private mapHttpStatusToErrorCode(httpStatus: HttpStatus): number {
    const mapping = {
      [HttpStatus.BAD_REQUEST]: ERROR_CODES.VALIDATION_ERROR,
      [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
      [HttpStatus.CONFLICT]: ERROR_CODES.DUPLICATE_ENTRY,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ERROR_CODES.SERVER_ERROR,
    };

    return mapping[httpStatus] || ERROR_CODES.SERVER_ERROR;
  }
}
