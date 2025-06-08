import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/user.entity';
import { Provider, DynamicModule, Type, INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';

interface TestModuleOptions {
  providers?: Provider[];
  controllers?: any[];
  imports?: (Type<any> | DynamicModule)[];
  createApp?: boolean;
}

interface TestModuleResult {
  module: TestingModule;
  app?: INestApplication;
}

// Create repository mock
const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Create JWT service mock
const mockJwtService = {
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn(),
  decode: jest.fn(),
};

export const createTestingModule = async (options: TestModuleOptions = {}): Promise<TestModuleResult> => {
  const {
    providers = [],
    controllers = [],
    imports = [],
    createApp = false,
  } = options;

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ...imports,
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => ({
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '1h',
        })],
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [User],
        synchronize: true,
        dropSchema: true,
      }),
    ],
    providers: [
      ...providers,
      {
        provide: getRepositoryToken(User),
        useValue: mockRepository,
      },
      {
        provide: JwtService,
        useValue: mockJwtService,
      },
    ],
    controllers,
  }).compile();

  if (createApp) {
    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    return { module, app };
  }

  return { module };
};