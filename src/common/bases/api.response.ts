import { HttpStatus } from '@nestjs/common';
import { ApiResponseKey } from '../../enums/apiResponse.key';

export class ApiResponse {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }
  static success<T>(
    data: T,
    message: string,
    status: HttpStatus = HttpStatus.OK,
  ): Record<string, any> {
    return {
      [ApiResponseKey.STATUS]: status,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.DATA]: data,
      [ApiResponseKey.TIMESTAMP]: this.getTimestamp(),
    };
  }

  static error<T>(
    error: T,
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): Record<string, any> {
    return {
      [ApiResponseKey.STATUS]: status,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.ERRORS]: error,
      [ApiResponseKey.TIMESTAMP]: this.getTimestamp(),
    };
  }

  static message(
    message: string,
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): Record<string, any> {
    return {
      [ApiResponseKey.STATUS]: httpStatus,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.TIMESTAMP]: this.getTimestamp(),
    };
  }
}
