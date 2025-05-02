import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { DoctorsModule } from './doctors/doctors.module';

@Module({
  imports: [CategoryModule, DoctorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
