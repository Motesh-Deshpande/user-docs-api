import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/user.entity';
import { Document } from '../database/document.entity';
import { IngestionStatus } from '../database/ingestion-status.entity';
import {
  Provider,
  DynamicModule,
  Type,
  INestApplication,
} from '@nestjs/common';
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
  getMockRepository?: (entity: any) => any;
}

// Factory function to create fresh mock repositories
const createMockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// Create JWT service mock
const mockJwtService = {
  sign: jest.fn().mockReturnValue('token'),
  verify: jest.fn(),
  decode: jest.fn(),
};

export const createTestingModule = async (
  options: TestModuleOptions = {},
): Promise<TestModuleResult> => {
  const {
    providers = [],
    controllers = [],
    imports = [],
    createApp = false,
  } = options;

  // Create separate mock instances for each entity
  const userMockRepository = createMockRepository();
  const documentMockRepository = createMockRepository();
  const ingestionStatusMockRepository = createMockRepository();

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ...imports,
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            JWT_SECRET: 'test-secret',
            JWT_EXPIRES_IN: '1h',
          }),
        ],
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [User, Document, IngestionStatus],
        synchronize: true,
        dropSchema: true,
      }),
    ],
    providers: [
      ...providers,
      {
        provide: getRepositoryToken(User),
        useValue: userMockRepository,
      },
      {
        provide: getRepositoryToken(Document),
        useValue: documentMockRepository,
      },
      {
        provide: getRepositoryToken(IngestionStatus),
        useValue: ingestionStatusMockRepository,
      },
      // Only provide mock JWT service if not creating an app
      ...(createApp
        ? []
        : [
            {
              provide: JwtService,
              useValue: mockJwtService,
            },
          ]),
    ],
    controllers,
  }).compile();

  // Helper function to get mock repository for specific entity
  const getMockRepository = (entity: any) => {
    return module.get(getRepositoryToken(entity));
  };

  if (createApp) {
    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    return { module, app, getMockRepository };
  }

  return { module, getMockRepository };
};

// Utility function to reset all mocks in a repository
export const resetMockRepository = (mockRepo: any) => {
  // Recreating Jest mock functions instead of just resetting
  mockRepo.findOne = jest.fn();
  mockRepo.create = jest.fn();
  mockRepo.save = jest.fn();
  mockRepo.find = jest.fn();
  mockRepo.update = jest.fn();
  mockRepo.delete = jest.fn();
};
