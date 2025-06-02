import { Controller, Get, Query } from '@nestjs/common';
import { ServiceAvailabilityService } from './service-availability.service';

@Controller('service-availability')
export class ServiceAvailabilityController {
  constructor(
    private readonly serviceAvailabilityService: ServiceAvailabilityService,
  ) {}

  @Get('busy-times')
  async getBusyTimes(
    @Query('serviceId') serviceId: number,
    @Query('date') date: string,
  ) {
    return this.serviceAvailabilityService.getBusyTimes(serviceId, date);
  }
}
