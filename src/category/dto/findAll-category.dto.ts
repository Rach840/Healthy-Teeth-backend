import { JsonValue } from 'prisma/generated/client/runtime/library';
import { Services } from '../../../prisma/generated/client';

export class FindCategoryDto {
  name: string;
  id: number;
  image: string;
  description: JsonValue | null;
  services: Services[];
}
