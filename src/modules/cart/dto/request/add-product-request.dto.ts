import { IsNumber, IsPositive, Min, Max } from 'class-validator';

export class addProductRequestDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @Min(1)
  @Max(99)
  quantity: number;
}
