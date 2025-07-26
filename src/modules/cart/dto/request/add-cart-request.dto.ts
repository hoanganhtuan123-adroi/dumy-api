import { IsArray, IsNumber, IsPositive, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductItemDto {
  @IsNumber()
  @IsPositive()
  id: number;

  @IsNumber()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class AddCartRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}