import { IsNotEmpty } from 'class-validator';

export class CreateCategoryRequestDto {
  @IsNotEmpty()
  slug: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  url: string;
}
