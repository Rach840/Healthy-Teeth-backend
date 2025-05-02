import { JsonValue } from 'prisma/generated/client/runtime/library';
import { Services } from '../../../prisma/generated/client';

export class GetDoctorDoctorsDto {
  id: number;
  firstName: string;
  image: string;
  surName: string | null;
  lastName: string;
  password: string;
  email: string;
  description: JsonValue;
  categoryId: number;
  services: Services[];
}
