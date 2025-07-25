import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class ReviewRequestDto {
  @IsString()
  @MinLength(10)
  @IsNotEmpty({
    message: 'Comment must not be empty and at least 10 characters long.',
  })
  comment: string;

  @IsNumber()
  @IsNotEmpty({
    message: 'Rating must be a number and cannot be empty.',
  })
  rating: number;

  @IsString()
  @IsNotEmpty({
    message: 'Please provide reviewer name.',
  })
  reviewer_name: string;

  @IsString()
  @IsNotEmpty({
    message: 'Reviewer email can not be empty.',
  })
  @IsEmail({}, { message: 'Reviewer email must be a valid email format.' })
  reviewer_email: string;

  @IsNumber()
  @IsNotEmpty({
    message: 'Product ID cannot be empty.',
  })
  productID: number;
}
