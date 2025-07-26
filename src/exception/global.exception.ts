import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../common/bases/api.response';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('Global exception call....', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // 500 default
    let message: string = 'Network Error';
    let errors: any = null;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        console.log('exceptionResponse', exceptionResponse);
        const res = exceptionResponse as { message: string; errors?: any };
        message = res.message || 'Network Error';
        errors = res.errors || null; // Lấy trường errors nếu có
      }
      if (!errors) {
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            message = message || 'Data is not valid';
            break;
          case HttpStatus.UNAUTHORIZED:
            message = message || "You don't have permission";
            break;
          case HttpStatus.INTERNAL_SERVER_ERROR:
            message = message || 'Server Error - INTERNAL_SERVER_ERROR';
            break;
          default:
            break;
        }
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'An unexpected error occurred';
    } else {
      message = 'Unknown error';
    }

    const apiResponse = errors
      ? ApiResponse.error(errors, message, status)
      : ApiResponse.message(message, status);
    return response.status(status).json(apiResponse);
  }
}
