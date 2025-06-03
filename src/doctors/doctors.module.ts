import { forwardRef, Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { PrismaService } from '../prisma.service';
import { AdminService } from '../admin/admin.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [DoctorsController],
  providers: [AdminService, DoctorsService, PrismaService],
})
export class DoctorsModule {}
