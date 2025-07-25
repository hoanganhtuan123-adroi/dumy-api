import { Type, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toString()?.trim())
  firstName?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toString()?.trim())
  lastName?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  age?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  gender: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toString()?.trim())
  email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  phone?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value?.toString()?.trim())
  password: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  birthDate?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  height?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  weight?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  eyeColor?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  hairColor?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  hairType?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  address_address?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  address_city?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  address_state?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  address_stateCode?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  address_lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : Number(value),
  )
  address_lng?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? undefined
      : value?.toString()?.trim(),
  )
  address_country?: string;

  @IsString()
  @Transform(({ value }) => value || 'user')
  role?: string = 'user';
}
