import { IsArray, IsNumber, IsPositive, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductItemDto } from './add-cart-request.dto';

export class UpdateCartRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}