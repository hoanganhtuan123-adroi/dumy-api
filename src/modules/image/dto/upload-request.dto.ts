import { IsNotEmpty, IsOptional } from 'class-validator';

export class UploadRequestDto {
  @IsOptional()
  url?: string;
  @IsNotEmpty()
  filename: string;
  @IsNotEmpty()
  imageable_id: number;
  @IsNotEmpty()
  imageable_type: string;
}
