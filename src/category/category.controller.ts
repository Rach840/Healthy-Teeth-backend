import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { FindCategoryDto } from './dto/findAll-category.dto';
import { Response } from 'express';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(@Res() res: Response): Promise<Response<FindCategoryDto[]>> {
    return this.categoryService.findAll(res);
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() res: Response,
  ): Promise<Response<FindCategoryDto>> {
    return this.categoryService.findOne(id, res);
  }
}
