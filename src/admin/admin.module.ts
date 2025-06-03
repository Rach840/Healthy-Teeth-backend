import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AdminController],

  providers: [AdminService, PrismaService],
  exports: [AdminModule],
  imports: [forwardRef(() => AuthModule)],
})
export class AdminModule {}
