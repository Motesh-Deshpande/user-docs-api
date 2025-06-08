import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../users/users.controller';
import { UsersService } from '../../users/users.service';
import { createTestingModule } from '../setup';
import { UserRole } from '../../auth/dto/register.dto';
import { User } from '../../database/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const { module } = await createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    });

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers: User[] = [{
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        role: UserRole.VIEWER
      }];
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(mockUsers);

      const result = await controller.findAll();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        role: UserRole.VIEWER
      };
      const dto = { id: '1', role: UserRole.ADMIN };
      jest.spyOn(service, 'updateRole').mockResolvedValueOnce({ ...mockUser, role: UserRole.ADMIN });

      const result = await controller.updateRole(dto);
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });
});
