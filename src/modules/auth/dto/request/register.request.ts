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

export class RegisterAccountRequest {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsInt()
  @IsOptional()
  age?: number;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsInt()
  @IsNotEmpty()
  height?: number;

  @IsNumber()
  @IsNotEmpty()
  weight?: number;

  @IsOptional()
  eyeColor?: string;

  @IsOptional()
  hairColor?: string;

  @IsOptional()
  hairType?: string;

  @IsOptional()
  address_address?: string;

  @IsOptional()
  address_city?: string;

  @IsOptional()
  address_state?: string;

  @IsOptional()
  address_stateCode?: string;

  @IsNumber()
  @IsOptional()
  address_lat?: number;

  @IsNumber()
  @IsOptional()
  address_lng?: number;

  @IsOptional()
  address_country?: string;

  @IsOptional()
  role?: string = 'user';
}
