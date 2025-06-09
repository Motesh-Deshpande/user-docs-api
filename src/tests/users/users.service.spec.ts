import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../database/user.entity';
import { createTestingModule, resetMockRepository } from '../setup';
import { UserRole } from '../../auth/dto/register.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    const { module, getMockRepository } = await createTestingModule({
      providers: [UsersService],
    });

    service = module.get<UsersService>(UsersService);
    // Get the User-specific mock repository
    mockRepository = getMockRepository!(User);
    
    // Reset all mocks to ensure clean state
    resetMockRepository(mockRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [{ id: '1', email: 'test@test.com' }];
      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: UserRole.VIEWER };
      const updatedUser = { ...mockUser, role: UserRole.ADMIN };
      
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateRole({ id: '1', role: UserRole.ADMIN });
      
      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(service.updateRole({ id: '1', role: UserRole.ADMIN }))
        .rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should update role from editor to viewer', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: UserRole.EDITOR };
      const updatedUser = { ...mockUser, role: UserRole.VIEWER };
      
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateRole({ id: '1', role: UserRole.VIEWER });
      
      expect(result.role).toBe(UserRole.VIEWER);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should update role from viewer to editor', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: UserRole.VIEWER };
      const updatedUser = { ...mockUser, role: UserRole.EDITOR };
      
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateRole({ id: '1', role: UserRole.EDITOR });
      
      expect(result.role).toBe(UserRole.EDITOR);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser);
    });
  });
});
