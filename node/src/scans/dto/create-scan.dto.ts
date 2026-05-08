import { IsIn } from 'class-validator';

export class CreateScanDto {
  @IsIn(['IN', 'OUT'])
  type!: 'IN' | 'OUT';
}
