import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';
import { Doctors, Services, Users } from '../../prisma/generated/client';
import { GetDoctorDoctorsDto } from './dto/getDoctor-doctors.dto';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private admin: AdminService
  ) {}

  async findAll(res: Response): Promise<Response<GetDoctorDoctorsDto[]>> {
    // Получаем все категории
    const doctors: Doctors[] = await this.prisma.doctors.findMany();
    // Получаем все услуги
    const services: Services[] = await this.prisma.services.findMany();

    // Преобразуем массив категорий, добавляя к ним услуги по фильтру
    return res.status(HttpStatus.OK).json(
      doctors.map((category) => {
        return {
          ...category, // Данные самой категории (картинка и название )
          services: services.filter((item) => item.doctorId == category.id), // Если у услуги название родительской категории такое же что и у текущей категории то добавить массив принадлежаших категории услуг
        };
      }),
    );
  }

  async findOne(
    user: Users,
    res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    console.log('findone', +user.sub);
    const doctorByUser = await this.prisma.doctors.findFirst({
      where: {
        userId: +user.sub,
      },
    });
    console.log(doctorByUser);
    return await this.admin.getDoctorOneInfo(doctorByUser?.id, res);
  }
  async getOrders(user: Users, res: Response) {
    console.log('sdfasdf', user);
    const doctorByUser = await this.prisma.doctors.findFirst({
      where: {
        userId: +user.sub,
      },
    });
    const orders = await this.prisma.orders.findMany({
      where: {
        doctorId: doctorByUser?.id,
      },
    });
    console.log(orders);
    const users = await this.prisma.users.findMany({
      where: {
        id: { in: orders.map((item) => item.userId) },
      },
    });
    const serviceIds = orders.map((item) => item.serviceId);
    const services = await this.prisma.services.findMany({
      where: {
        id: { in: serviceIds },
      },
    });
    const orderFullInfo = orders.map((order) => {
      const user = users.find((user) => user.id == order.userId)
      const service = services.find((service) => service.id == order.serviceId);
      return {
        id: order.id,
        userId: order.id,
        userFullName: `${user?.firstName} ${user?.lastName} ${user?.surName ? user?.surName : ''}`,
        userEmail: user?.email,
        userPhone: user?.phone,
        serviceName: service?.name,
        status: order.status,
        date: order.date,
        price: service?.price,
      };
    });

    return res.status(HttpStatus.OK).json(orderFullInfo);
  }
  async changeStatus(id: string, res: Response) {
    await this.prisma.orders.update({
      where: {
        id: +id,
      },
      data: {
        status: 'PROVIDED',
      },
    });
    return res.status(HttpStatus.OK).json({});
  }
  async getOrder(
    id: string,
    res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    return await this.admin.findOneOrder(+id, res);
  }
}
