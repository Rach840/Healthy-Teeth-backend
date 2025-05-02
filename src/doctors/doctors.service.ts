import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';
import { Doctors, Services } from '../../prisma/generated/client';
import { GetDoctorDoctorsDto } from './dto/getDoctor-doctors.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

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
    id: number,
    res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    const doctor: Doctors | null = await this.prisma.doctors.findFirst({
      where: {
        id: id,
      },
    });
    if (!doctor) {
      return res.status(HttpStatus.NO_CONTENT);
    }
    const servicesByDoctor = await this.prisma.services.findMany({
      where: {
        doctorId: doctor?.id,
      },
    });

    return res.status(HttpStatus.OK).json({
      ...doctor,
      services: servicesByDoctor,
    });
  }
}
