import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../database/user.entity';
import { createTestingModule } from '../setup';
import { UserRole } from '../../auth/dto/register.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: any;

  beforeEach(async () => {
    const { module } = await createTestingModule({
      providers: [UsersService],
    });

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [{ id: '1', email: 'test@test.com' }];
      jest.spyOn(usersRepo, 'find').mockResolvedValueOnce(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      jest.spyOn(usersRepo, 'find').mockResolvedValueOnce([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: UserRole.VIEWER };
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersRepo, 'save').mockResolvedValueOnce({ ...mockUser, role: UserRole.ADMIN });

      const result = await service.updateRole({ id: '1', role: UserRole.ADMIN });
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.updateRole({ id: '1', role: UserRole.ADMIN }))
        .rejects.toThrow(NotFoundException);
    });

    it('should update role from editor to viewer', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: UserRole.EDITOR };
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersRepo, 'save').mockResolvedValueOnce({ ...mockUser, role: UserRole.VIEWER });

      const result = await service.updateRole({ id: '1', role: UserRole.VIEWER });
      expect(result.role).toBe(UserRole.VIEWER);
    });

    it('should update role from viewer to editor', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: UserRole.VIEWER };
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersRepo, 'save').mockResolvedValueOnce({ ...mockUser, role: UserRole.EDITOR });

      const result = await service.updateRole({ id: '1', role: UserRole.EDITOR });
      expect(result.role).toBe(UserRole.EDITOR);
    });
  });
});
