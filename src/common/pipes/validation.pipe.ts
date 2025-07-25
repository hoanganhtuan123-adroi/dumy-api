import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from '../bases/api.response';
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
     if (value === undefined || value === null) {
      throw new HttpException(
        ApiResponse.message(
          'Request body is empty or invalid',
          HttpStatus.BAD_REQUEST,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const object = plainToInstance(metatype, value, {enableImplicitConversion: true});
    const errors = await validate(object);
    const formatErrors = this.formatError(errors);

    if (errors.length > 0) {
      const response = ApiResponse.error(
        formatErrors,
        'Validation Failed',
        HttpStatus.BAD_REQUEST,
      );
      console.error('Validation failed:', response);
      throw new HttpException(response, HttpStatus.BAD_REQUEST);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatError(error: ValidationError[]) {
    const result = {};
    error.forEach((err) => {
      if (err.constraints) {
        result[err.property] = Object.values(err.constraints)[0];
      }
    });
    return result;
  }
}
