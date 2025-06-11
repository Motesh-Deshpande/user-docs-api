import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../common/decorators/roles.decorators';
import { RolesGuard } from '../common/gaurds/roles.gaurd';
import { UserRole } from '../auth/dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Post('role')
  @Roles(UserRole.ADMIN)
  updateRole(@Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(dto);
  }
}
