import { IsEnum } from 'class-validator';
import { RoleEnum } from '../../enums/role.enum';

export class CreateRolDto {
  @IsEnum(RoleEnum, { message: 'el rol sólo puede ser admin, user' })
  nombre: RoleEnum;
}
