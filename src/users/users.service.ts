import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async updateRole(dto: UpdateRoleDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: dto.id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = dto.role;
    return this.usersRepo.save(user);
  }
}
