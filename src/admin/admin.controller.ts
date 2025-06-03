import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Roles as Role } from '../../prisma/generated/client';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('admin')
@Roles(Role.ADMIN)
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }
  @Get('dashboard')
  async getDashboardInfo(@Request() req: Request, @Res() res: Response) {
    return this.adminService.getDashboardInfo(req, res);
  }

  @Get('serviceOne/:id')
  async getServiceOneInfo(@Param('id') id: string, @Res() res: Response) {
    return this.adminService.getServiceOneInfo(+id, res);
  }
  @Get('users')
  async findAllUsers(@Request() req: Request, @Res() res: Response) {
    return this.adminService.findAllUsers(req, res);
  }
  @Get('orders')
  async findAllOrders(@Request() req: Request, @Res() res: Response) {
    return this.adminService.findAllOrders(req, res);
  }
  @Get('categories')
  async findAllCategories(@Request() req: Request, @Res() res: Response) {
    return this.adminService.findAllCategories(req, res);
  }
  @Get('doctors')
  async findAllDoctors(@Request() req: Request, @Res() res: Response) {
    return this.adminService.findAllDoctors(req, res);
  }
  @Roles(Role.ADMIN )
  @Get('doctors/:id')
  async getDoctorOneInfo(@Param('id') id: string, @Res() res: Response) {
    return this.adminService.getDoctorOneInfo(+id, res);
  }
  @Get('orders/:id')
  findOne(@Param('id') id: string, @Res() res: Response) {
    return this.adminService.findOneOrder(+id, res);
  }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //   return this.adminService.update(+id, updateAdminDto);
  // }

  @Delete('orders/delete/:id')
  async removeOrder(@Param('id') id: string, @Res() res: Response) {
    return this.adminService.removeOrder(+id, res);
  }
}
