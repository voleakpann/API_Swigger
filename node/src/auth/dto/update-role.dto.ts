import { IsIn, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsIn(['ADMIN', 'EMPLOYEE', null])
  role!: 'ADMIN' | 'EMPLOYEE' | null;
}
