import { IsNotEmpty } from 'class-validator';

export class UploadRequestDto {
  @IsNotEmpty()
  url: string;
  @IsNotEmpty()
  filename: string;
  @IsNotEmpty()
  imageable_id: number;
  @IsNotEmpty()
  imageable_type: string;
}
