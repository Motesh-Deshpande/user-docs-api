import { IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '../../auth/dto/register.dto';

export class UpdateRoleDto {
  @IsUUID()
  id: string;

  @IsEnum(UserRole)
  role: UserRole;
}