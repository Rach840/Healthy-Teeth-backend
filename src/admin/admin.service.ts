import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Response } from 'express';
import { PrismaService } from '../prisma.service';
import { orders, Services } from '../../prisma/generated/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async findAllUsers(req: Request, res: Response) {
    const users = await this.prisma.users.findMany();
    return res.status(HttpStatus.OK).json(users);
  }

  async getDashboardInfo(req: Request, res: Response) {
    const popularOrders = await this.prisma.orders.groupBy({
      by: ['serviceId'],
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: 5,
    });

    const serviceIds = popularOrders.map((item) => item.serviceId);
    const services = await this.prisma.services.findMany({
      where: {
        id: { in: serviceIds },
      },
    });

    const popularServices = services
      .map((service) => {
        const count =
          popularOrders.find((item) => item.serviceId === service.id)?._count
            .serviceId || 0;
        return {
          ...service,
          ordersCount: count,
        };
      })
      .sort((a, b) => b.ordersCount - a.ordersCount);
    const users = await this.prisma.users.findMany();
    const orders = await this.prisma.orders.count();

    const ordersByLastMonth = await this.prisma.orders.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    const ordersRevenue = ordersByLastMonth.reduce(
      (acc, item) => item.price + acc,
      0,
    );
    const lastOrdersFullInfo = ordersByLastMonth.map((order) => {
      const service = services.find((item) => item.id == order.serviceId);
      const user = users.find((item) => item.id == order.userId);
      return {
        ...order,
        serviceName: service?.name,
        userFullName:
          user?.lastName + ' ' + user?.firstName + ' ' + user?.surName,
      };
    });

    return res.status(HttpStatus.OK).json({
      popularServices: popularServices,
      ordersRevenue: ordersRevenue,
      ordersCount: orders,
      usersCount: users.length,
      lastOrders: lastOrdersFullInfo,
    });
  }
  async findAllOrders(req: Request, res: Response) {
    const orders = await this.prisma.orders.findMany();
    const users = await this.prisma.users.findMany({
      where: {
        id: { in: orders.map((item) => item.userId) },
      },
    });
    const doctors = await this.prisma.doctors.findMany({
      where: {
        id: { in: orders.map((item) => item.doctorId) },
      },
    });
    const services = await this.prisma.services.findMany({
      where: {
        id: {
          in: orders.map((item) => item.serviceId),
        },
      },
    });
    const orderFullInfo = orders.map((order) => {
      const user = users.find((user) => user.id == order.userId);
      const doctor = doctors.find((doctor) => doctor.id == order.doctorId);
      const service = services.find((service) => service.id == order.serviceId);
      return {
        id: order.id,
        userId: order.id,
        userFullName: `${user?.firstName} ${user?.lastName} ${user?.surName ? user?.surName : ''}`,
        userEmail: user?.email,
        userPhone: user?.phone,
        serviceName: service?.name,
        status: order.status,
        doctorFullName: `${doctor?.firstName} ${doctor?.lastName} ${doctor?.surName}`,
        date: order.date,
        price: service?.price,
      };
    });

    return res.status(HttpStatus.OK).json(orderFullInfo);
  }

  async findOneOrder(id: number, res: Response) {
    const order = await this.prisma.orders.findFirst({
      where: {
        id: id,
      },
    });
    const user = await this.prisma.users.findFirst({
      where: {
        id: order?.userId,
      },
    });
    const doctor = await this.prisma.doctors.findFirst({
      where: {
        id: order?.doctorId,
      },
    });
    const service = await this.prisma.services.findFirst({
      where: {
        id: order?.serviceId,
      },
    });
    const otherOrders = await this.prisma.orders.findMany({
      where: {
        userId: user?.id,
      },
    });
    const otherDoctors = await this.prisma.doctors.findMany({
      where: {
        id: { in: otherOrders.map((item) => item.doctorId) },
      },
    });
    const otherServices = await this.prisma.services.findMany({
      where: {
        id: {
          in: otherOrders.map((item) => item.serviceId),
        },
      },
    });
    const otherOrderFullInfo = otherOrders.map((order) => {
      const doctor = otherDoctors.find((doctor) => doctor.id == order.doctorId);
      const service = otherServices.find(
        (service) => service.id == order.serviceId,
      );
      return {
        id: order.id,
        serviceName: service?.name,
        status: order.status,
        doctorFullName: `${doctor?.firstName} ${doctor?.lastName} ${doctor?.surName}`,
        date: order.date,
        price: service?.price,
      };
    });
    const orderFullInfo = {
      id: order?.id,
      status: order?.status,
      date: order?.date,
      service: service,
      user: user,
      doctor: doctor,
      userOtherOrders: otherOrderFullInfo,
    };
    return res.status(HttpStatus.OK).json(orderFullInfo);
  }

  // update(id: number, updateAdminDto: UpdateAdminDto) {
  //   return `This action updates a #${id} admin`;
  // }
  async findAllCategories(req: Request, res: Response) {
    const orders = await this.prisma.orders.findMany();
    const categories = await this.prisma.category.findMany();
    const doctorsAll = await this.prisma.doctors.findMany();
    const servicesAll = await this.prisma.services.findMany({
      select: {
        description: true,
        name: true,
        categoryName: true,
        price: true,
        id: true,
        doctorId: true,
      },
    });
    const categoriesFullInfo = categories.map((category) => {
      const doctor = doctorsAll.find(
        (doctor) => doctor.categoryId == category.id,
      );
      const services: Services[] = servicesAll
        .filter((service) => service.categoryName == category.name)
        .map((serviceByCategory) => {
          const ordersByService = orders.filter(
            (item) => item.serviceId == serviceByCategory.id,
          );
          return {
            ...serviceByCategory,
            orders: ordersByService,
            ordersActiveByService: ordersByService.filter(
              (item) => item.status == 'WAITING',
            ).length,
          };
        });
      const ordersByCategory: orders[] = orders.filter((order) =>
        services.map((item) => item.id).includes(order.serviceId),
      );
      const ordersActive = ordersByCategory.filter(
        (order) => order.status == 'WAITING',
      ).length;
      return {
        ...category,
        ordersByCategory: ordersByCategory.length,
        ordersActive: ordersActive,
        services: services,
        doctor: doctor,
      };
    });

    return res.status(HttpStatus.OK).json(categoriesFullInfo);
  }
  async findAllDoctors(req: Request, res: Response) {
    const orders = await this.prisma.orders.findMany();
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    const doctorsAll = await this.prisma.doctors.findMany();

    const doctorFullInfo = doctorsAll.map((doctor) => {
      const categoryName = categories.find(
        (category) => doctor.categoryId == category.id,
      );

      const ordersByDoctor: orders[] = orders.filter(
        (order) => order.doctorId == doctor.id,
      );
      const ordersAmount = ordersByDoctor.reduce(
        (acc, item) => item.price + acc,
        0,
      );
      const ordersActive = ordersByDoctor.filter(
        (order) => order.status == 'WAITING',
      ).length;
      const doctorDescription: {
        description: string;
        education: string[];
        quotes: string;
      } = JSON.parse(doctor.description);

      return {
        ...doctor,
        description: doctorDescription?.description,
        education: doctorDescription?.education,
        quotes: doctorDescription?.quotes,
        ordersByDoctor: ordersByDoctor.length,
        ordersActive: ordersActive,
        categoryName: categoryName?.name,
        ordersAmount: ordersAmount,
      };
    });

    return res.status(HttpStatus.OK).json(doctorFullInfo);
  }

  async getDoctorOneInfo(id: number, res: Response) {
    const doctor = await this.prisma.doctors.findFirst({
      where: {
        id: id,
      },
    });
    const ordersLastMonth = await this.prisma.orders.count({
      where: {
        doctorId: id,
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
    });
    const ordersByDoctor = await this.prisma.orders.findMany({
      where: {
        doctorId: id,
      },
    });

    const doctorDescription: {
      description: string;
      education: string[];
      quotes: string;
    } = JSON.parse(doctor.description);

    return res.status(HttpStatus.OK).json({
      ...doctor,
      description: doctorDescription?.description,
      education: doctorDescription?.education,
      quotes: doctorDescription?.quotes,
      ordersByDoctor: ordersByDoctor,
      ordersLastMonth: ordersLastMonth,
    });
  }

  async removeOrder(id: number, res: Response) {
    await this.prisma.orders.delete({
      where: {
        id: id,
      },
    });
    return res.status(HttpStatus.OK).json({});
  }
  async getServiceOneInfo(id: number, res: Response) {
    console.log('sdfasdf');
    const service = await this.prisma.services.findFirst({
      where: {
        id: id,
      },
    });
    const doctor = await this.prisma.doctors.findFirst({
      where: {
        id: service?.doctorId,
      },
    });
    const lastOrder = await this.prisma.orders.findFirst({
      where: {
        serviceId: id,
      },
      orderBy: {
        date: 'desc',
      },
    });
    const ordersByService = await this.prisma.orders.findMany({
      where: {
        serviceId: id,
      },
    });
    const userByOrders = await this.prisma.users.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        surName: true,
        gender: true,
        phone: true,
        email: true,
        birth: true,
      },
      where: {
        id: {
          in: ordersByService.map((item) => item.id),
        },
      },
    });
    console.log('последний', lastOrder);

    return res.status(HttpStatus.OK).json({
      service: service,
      ordersByService: ordersByService.map((order) => {
        return {
          ...userByOrders.find((user) => user?.id == order.userId),
          ...order,
        };
      }),
      doctor: doctor,
      lastOrder: lastOrder?.date,
      ordersSum: ordersByService.length * service.price,
    });
  }
}
