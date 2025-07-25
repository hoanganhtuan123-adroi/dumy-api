import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthRequest {
  @IsNotEmpty({ message: 'Username can not be empty' })
  @IsString({ message: 'Username must be string' })
  username: string;

  @IsNotEmpty({ message: 'Password can not be empty' })
  @MinLength(6, { message: 'Password must be greater than 6 chars' })
  password: string;
}
