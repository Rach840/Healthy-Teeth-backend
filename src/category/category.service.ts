import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Category, Services } from '../../prisma/generated/client';
import { FindCategoryDto } from './dto/findAll-category.dto';
import { Response } from 'express';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(res: Response): Promise<Response<FindCategoryDto[]>> {
    const categories: Category[] = await this.prisma.category.findMany();
    // Получаем все услуги
    const services: Services[] = await this.prisma.services.findMany();
    // Преобразуем массив категорий, добавляя к ним услуги по фильтру
    return res.status(HttpStatus.OK).json(
      categories.map((category) => {
        return {
          ...category, // Данные самой категории (картинка и название )
          services: services.filter(
            (item) => item.categoryName == category.name,
          ), // Если у услуги название родительской категории такое же что и у текущей категории то добавить массив принадлежаших категории услуг
        };
      }),
    );
    // Возвращаем категории вместе с услугами принадлежих ему
  }
  async findOne(id: number, res: Response): Promise<Response<FindCategoryDto>> {
    const categories: Category | null = await this.prisma.category.findFirst({
      where: {
        id: id,
      },
    });
    if (!categories) {
      return res.status(HttpStatus.NO_CONTENT);
    }
    const servicesByCategory: Services[] = await this.prisma.services.findMany({
      where: {
        categoryName: categories?.name,
      },
    });

    return res.status(HttpStatus.OK).json({
      ...categories,
      services: servicesByCategory,
    });
  }
}
