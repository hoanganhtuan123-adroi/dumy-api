import { Type, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({message: "First name can't be blank"})
  @Transform(({ value }) => value?.toString()?.trim())
  firstName: string;

  @IsString()
  @IsNotEmpty({message: "Last name can't be blank"})
  @Transform(({ value }) => value?.toString()?.trim())
  lastName: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : Number(value))
  age?: number;

  @IsNotEmpty({message: "Gender can't be blank"})
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  gender: string;

  @IsNotEmpty({message: "Email can't be blank"})
  @IsEmail()
  @Transform(({ value }) => value?.toString()?.trim())
  email: string;

  @IsNotEmpty({message: "Phone can't be blank"})
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  phone: string;

  @IsNotEmpty({message: "Username can't be blank"})
  @IsString()
  @Transform(({ value }) => value?.toString()?.trim())
  username: string;

  @IsNotEmpty({message: "Password can't be blank"})
  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value?.toString()?.trim())
  password: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  birthDate?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : Number(value))
  height?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : Number(value))
  weight?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  eyeColor?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  hairColor?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  hairType?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  address_address?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  address_city?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  address_state?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  address_stateCode?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : Number(value))
  address_lat?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : Number(value))
  address_lng?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' || value === null || value === undefined ? undefined : value?.toString()?.trim())
  address_country?: string;

  @IsString()
  @Transform(({ value }) => value || 'user')
  role?: string = 'user';
}