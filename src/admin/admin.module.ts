import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [forwardRef(() => AuthModule)],
})
export class AdminModule {}
