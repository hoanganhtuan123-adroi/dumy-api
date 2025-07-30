import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiResponse } from '../bases/api.response';
import 'reflect-metadata';
import { ValidationException } from '../../exception/custom-exception';
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    if (value === undefined || value === null) {
      throw new ValidationException(2002)
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });

    const errors = await validate(object);
    const formatErrors = this.formatError(errors);
    if (errors.length > 0) {
      console.error('Validation failed:', formatErrors);
      throw new ValidationException(2002 , formatErrors )
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
