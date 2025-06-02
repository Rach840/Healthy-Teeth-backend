import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ServiceAvailabilityController } from './service-availability.controller';
import { ServiceAvailabilityService } from './service-availability.service';

@Module({
  imports: [
    CategoryModule,
    DoctorsModule,
    AuthModule,
    UsersModule,
    AdminModule,
  ],
  controllers: [AppController, ServiceAvailabilityController],
  providers: [AppService, ServiceAvailabilityService],
})
export class AppModule {}
