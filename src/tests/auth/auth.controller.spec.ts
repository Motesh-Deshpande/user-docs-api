import * as request from 'supertest';
import { INestApplication, ValidationPipe, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/user.entity';
import { AuthService } from '../../auth/auth.service';
import { createTestingModule } from '../setup';
import { UserRole } from '../../auth/dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let usersRepo: Repository<User>;

  beforeAll(async () => {
    const { module, app: testApp } = await createTestingModule({
      imports: [AuthModule],
      createApp: true,
    });
    
    if (!testApp) {
      throw new Error('Failed to create test application');
    }
    
    app = testApp;
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'password123', role: UserRole.VIEWER })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('token');
          expect(typeof res.body.token).toBe('string');
        });
    });

    it('should fail when registering with existing email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'duplicate@test.com', password: 'password123', role: UserRole.VIEWER });

      // Attempt to register with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'duplicate@test.com', password: 'password123', role: UserRole.VIEWER })
        .expect(409)
        .expect(res => {
          expect(res.body.message).toBe('User already exists');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid-email', password: 'password123', role: UserRole.VIEWER })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: '123', role: UserRole.VIEWER })
        .expect(400);
    });

    it('should fail with invalid role', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@test.com', password: 'password123', role: 'invalid-role' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const testUser = {
      email: 'login@test.com',
      password: 'password123',
      role: UserRole.VIEWER
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('token');
          expect(typeof res.body.token).toBe('string');
        });
    });

    it('should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrong-password' })
        .expect(401)
        .expect(res => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' })
        .expect(401)
        .expect(res => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'logout@test.com', password: 'password123', role: UserRole.VIEWER });
      
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'logout@test.com', password: 'password123' });
      
      authToken = loginResponse.body.token;
    });

    it('should logout successfully with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect(res => {
          expect(res.body.message).toBe('Logged out');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});