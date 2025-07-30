import { ApiResponseKey } from '../../enums/apiResponse.key';

export class ApiResponse {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }
  static success<T>(
    data: T,
    message: string,
    code: number,
  ): Record<string, any> {
    return {
      [ApiResponseKey.STATUS]: 'success',
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.DATA]: data,
      [ApiResponseKey.CODE]: code,
      [ApiResponseKey.TIMESTAMP]: this.getTimestamp(),
    };
  }

  static error<T>(
    error: T,
    message: string,
    code: number,
  ): Record<string, any> {
    return {
      [ApiResponseKey.STATUS]: 'error',
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.ERRORS]: error,
      [ApiResponseKey.CODE]: code,
      [ApiResponseKey.TIMESTAMP]: this.getTimestamp(),
    };
  }

  static message(
    message: string,
    code: number,
    status: string = 'success',
  ): Record<string, any> {
    return {
      [ApiResponseKey.STATUS]: status,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.CODE]: code,
      [ApiResponseKey.TIMESTAMP]: this.getTimestamp(),
    };
  }
}
