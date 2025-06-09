import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../database/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTestingModule, resetMockRepository } from '../setup';
import { AuthModule } from '../../auth/auth.module';
import { UserRole } from '../../auth/dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const { module, getMockRepository } = await createTestingModule({
      providers: [AuthService],
      imports: [AuthModule],
    });
    
    service = module.get<AuthService>(AuthService);
    // Get the User-specific mock repository
    mockRepository = getMockRepository!(User);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks to ensure clean state
    resetMockRepository(mockRepository);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: '1', email: 'a' } as User);
      
      await expect(service.register({ email: 'a', password: 'p', role: UserRole.VIEWER }))
        .rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'a' } });
    });

    it('should hash password, save user, and return token', async () => {
      const mockUser = { id: '1', email: 'a', password: 'hashed', role: UserRole.VIEWER } as User;
      
      mockRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.register({ email: 'a', password: 'p', role: UserRole.VIEWER });

      expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'a' } });
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'a',
        password: 'hashed',
        role: UserRole.VIEWER
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1', role: UserRole.VIEWER });
      expect(result).toEqual({ token: 'token' });
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(service.validateUser('a', 'b')).rejects.toThrow(UnauthorizedException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'a' } });
    });

    it('should throw if password does not match', async () => {
      const mockUser = { password: 'h' } as User;
      
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      await expect(service.validateUser('a', 'b')).rejects.toThrow(UnauthorizedException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'a' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('b', 'h');
    });

    it('should return user if credentials valid', async () => {
      const user = { id: '1', password: 'h', role: UserRole.VIEWER } as User;
      
      mockRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await service.validateUser('a', 'b');
      
      expect(result).toBe(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'a' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('b', 'h');
    });
  });

  describe('login', () => {
    it('should call validateUser and return token', async () => {
      const mockUser = { id: '1', role: UserRole.VIEWER } as User;
      
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      
      const result = await service.login({ email: 'a', password: 'b' });
      
      expect(service.validateUser).toHaveBeenCalledWith('a', 'b');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1', role: UserRole.VIEWER });
      expect(result).toEqual({ token: 'token' });
    });
  });
});