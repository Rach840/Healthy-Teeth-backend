import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Users } from '../../prisma/generated/client';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import UsersCreateInput = Prisma.UsersCreateInput;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  findOne(email: string): Promise<Users | null> {
    return this.prisma.users.findFirst({
      where: {
        email: email,
      },
    });
  }
  async createUser({ user }: { user: UsersCreateInput }, res: Response) {
    const userExist = await this.prisma.users.findFirst({
      where: {
        email: user.email,
      },
    });
    if (userExist) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({});
    }
    const password = await bcrypt.hash(user.password, 10);
    try {
      await this.prisma.users.create({
        data: {
          ...user,
          password: password,
        },
      });
      return res.status(HttpStatus.CREATED).json({});
    } catch {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({});
    }
  }
  async updatePassword(
    passwords: UpdatePasswordDto,
    user: Users,
    res: Response,
  ) {
    console.log(passwords);
    const userWithPassword =await  this.prisma.users.findFirst({
      where: {
        id: user?.sub,
      }
    })
    const passwordCompare = await bcrypt.compare(
      passwords.currentPassword,
      userWithPassword?.password,
    );

    if (!passwordCompare) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'Пароль не верный',
      });
    }
    console.log(passwords.newPassword);

    const newPasswordHash = await bcrypt.hash(passwords.newPassword, 10);
    try {
      await this.prisma.users.update({
        data: {
          password: newPasswordHash,
        },
        where: {
          id: user.id,
        },
      });

      return res.status(HttpStatus.OK).json({});
    } catch {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({});
    }
  }
  async updateUser(
    updateUserDto: UpdateUserDto,
    user: Users,
    res: Response,
  ) {
    try {
      console.log(updateUserDto, 'dasddasd');
      await this.prisma.users.update({
        data: {
          ...updateUserDto,
        },
        where: {
          id: user.sub,
        },
      });
      return res.status(HttpStatus.OK).json({});
    } catch {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({});
    }
  }
  async setOrder(
    user: Users,
    order: { time: Date; productId: number; doctorId: number },
    res: Response,
  ) {
    console.log('sdfsad', user);
    const { time, productId, doctorId } = order;
    const service = await this.prisma.services.findFirst({
      where: {
        id: productId,
      },
    });

    await this.prisma.orders.create({
      data: {
        serviceId: productId,
        userId: user.sub as number,
        date: time,
        doctorId: doctorId,
        price: service.price,
      },
    });
    res.status(HttpStatus.CREATED).send({ succes: true });
  }
  async getOrders(user, res: Response) {
    console.log('sdfsad');
    const ordersByUser = await this.prisma.orders.findMany({
      where: {
        userId: user.sub,
      }
    })
    const otherDoctors = await this.prisma.doctors.findMany({
      where: {
        id: { in: ordersByUser.map((item) => item.doctorId) },
      },
    });
    const otherServices = await this.prisma.services.findMany({
      where: {
        id: {
          in: ordersByUser.map((item) => item.serviceId),
        },
      },
    });
    const orderFullInfo = ordersByUser.map((order) => {
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
    console.log(orderFullInfo);
    return res.status(HttpStatus.OK).json(orderFullInfo);
  }
}
