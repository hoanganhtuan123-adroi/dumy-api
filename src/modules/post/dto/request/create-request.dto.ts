import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty({ message: "Title can't be empty" })
  title: string;
  @IsNotEmpty({ message: "Body can't be empty" })
  body: string;

  @Transform(({ value }) => (value === undefined ? "" : value))
  tags: string;

}
