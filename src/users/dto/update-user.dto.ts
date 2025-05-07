import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  surName: string;
  email: string;
  phone: string;
  snils: string;
  birth: Date;
}
export class UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}
