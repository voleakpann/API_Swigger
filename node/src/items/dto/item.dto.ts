import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class ItemDto {
  id?: number;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(1, 100, { message: 'Name must be between 1 and 100 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  price?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}
