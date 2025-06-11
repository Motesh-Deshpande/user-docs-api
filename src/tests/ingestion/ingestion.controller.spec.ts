import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IngestionController } from '../../ingestion/ingestion.controller';
import { IngestionService } from '../../ingestion/ingestion.service';
import { AuthModule } from '../../auth/auth.module';
import { IngestionStatus } from '../../database/ingestion-status.entity';
import { createTestingModule } from '../setup';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let ingestionService: IngestionService;

  beforeAll(async () => {
    const { module, app: testApp } = await createTestingModule({
      imports: [AuthModule],
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            trigger: jest.fn(),
            status: jest.fn(),
          },
        },
      ],
      createApp: true,
    });

    if (!testApp) {
      throw new Error('Failed to create test application');
    }

    app = testApp;
    ingestionService = module.get<IngestionService>(IngestionService);

    // Register and login to get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'ingest@test.com', password: 'password', role: 'editor' });
      
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ingest@test.com', password: 'password' });
      
    token = login.body.token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('/ingestion (POST)', () => {
    const mockResult = { id: '1', status: 'in_progress' } as IngestionStatus;
    jest.spyOn(ingestionService, 'trigger').mockResolvedValue(mockResult);

    return request(app.getHttpServer())
      .post('/ingestion')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'unit-test' })
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.id).toBe('1');
        expect(res.body.status).toBe('in_progress');
      });
  });

  it('/ingestion/status/:id (GET)', async () => {
    const mockStatus = { id: '2', status: 'completed' } as IngestionStatus;
    jest.spyOn(ingestionService, 'status').mockResolvedValue(mockStatus);
    
    return request(app.getHttpServer())
      .get('/ingestion/status/2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('status');
        expect(res.body.status).toBe('completed');
        expect(res.body.id).toBe('2');
      });
  });
});