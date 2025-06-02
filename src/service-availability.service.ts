import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ServiceAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusyTimes(serviceId: number, date: string) {
    // Parse the date to get the start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Query Orders for the given serviceId and date
    const orders = await this.prisma.orders.findMany({
      where: {
        serviceId: Number(serviceId),
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        date: true,
      },
    });

    // Return the busy times (as ISO strings)
    return orders.map((order) => order.date.toISOString());
  }
}
