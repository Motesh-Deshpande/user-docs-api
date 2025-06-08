import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../database/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTestingModule } from '../setup';
import { AuthModule } from '../../auth/auth.module';
import { UserRole } from '../../auth/dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const { module } = await createTestingModule({
      providers: [AuthService],
      imports: [AuthModule],
    });
    
    service = module.get<AuthService>(AuthService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce({ id: '1', email: 'a' } as User);
      await expect(service.register({ email: 'a', password: 'p', role: UserRole.VIEWER }))
        .rejects.toThrow(ConflictException);
    });

    it('should hash password, save user, and return token', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed');
      const mockUser = { id: '1', email: 'a', password: 'hashed', role: UserRole.VIEWER } as User;
      jest.spyOn(usersRepo, 'create').mockReturnValueOnce(mockUser);
      jest.spyOn(usersRepo, 'save').mockResolvedValueOnce(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('token');

      const result = await service.register({ email: 'a', password: 'p', role: UserRole.VIEWER });

      expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
      expect(usersRepo.create).toHaveBeenCalledWith({
        email: 'a',
        password: 'hashed',
        role: UserRole.VIEWER
      });
      expect(usersRepo.save).toHaveBeenCalledWith(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1', role: UserRole.VIEWER });
      expect(result).toEqual({ token: 'token' });
    });
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.validateUser('a', 'b')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce({ password: 'h' } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.validateUser('a', 'b')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if credentials valid', async () => {
      const user = { id: '1', password: 'h', role: UserRole.VIEWER } as User;
      jest.spyOn(usersRepo, 'findOne').mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      const result = await service.validateUser('a', 'b');
      expect(result).toBe(user);
    });
  });

  describe('login', () => {
    it('should call validateUser and return token', async () => {
      const mockUser = { id: '1', role: UserRole.VIEWER } as User;
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('token');
      
      const result = await service.login({ email: 'a', password: 'b' });
      
      expect(service.validateUser).toHaveBeenCalledWith('a', 'b');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1', role: UserRole.VIEWER });
      expect(result).toEqual({ token: 'token' });
    });
  });
});