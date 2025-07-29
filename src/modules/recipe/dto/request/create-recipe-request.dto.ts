import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateRecipeRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ingredients: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  prepTimeMinutes: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cookTimeMinutes: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  serving: number;

  @IsString()
  @IsNotEmpty()
  difficult: string;

  @IsString()
  @IsNotEmpty()
  cuisine: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  caloriesPerServing: number;

  @IsString()
  @IsNotEmpty()
  tags: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  reviewCount?: number;

  @IsString()
  @IsNotEmpty()
  mealType: string;
}
