import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Response } from 'express';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findAll(req: Request, res: Response) {
    return res.status(HttpStatus.OK).json({ message: 'All' });
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
