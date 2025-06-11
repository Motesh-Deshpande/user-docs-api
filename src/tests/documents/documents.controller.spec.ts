import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from '../../documents/documents.controller';
import { DocumentsService } from '../../documents/documents.service';
import { createTestingModule } from '../setup';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../../database/document.entity';
import { User } from '../../database/user.entity';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { Readable } from 'stream';
import { JwtService } from '@nestjs/jwt';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const { module } = await createTestingModule({
      imports: [
        TypeOrmModule.forFeature([Document, User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [DocumentsController],
      providers: [
        DocumentsService,
        JwtStrategy,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    });

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should create a document', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const dto = { title: 'Test Doc', description: 'Test Description' };
      const file = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        destination: './uploads',
        filename: 'test.txt',
        path: 'uploads/test.txt',
        size: 1024,
        buffer: Buffer.from('test content'),
        stream: new Readable(),
      };
      const mockDoc = {
        id: '1',
        ...dto,
        filePath: file.path,
        uploadedBy: user,
        deleted: false,
      } as Document;

      // Create a valid JWT token
      const token = jwtService.sign({ sub: user.id, email: user.email });

      // Mock the service method
      jest.spyOn(service, 'create').mockResolvedValue(mockDoc);

      const result = await controller.upload(file, dto, { user });
      expect(result).toEqual(mockDoc);
      expect(service.create).toHaveBeenCalledWith(file.path, dto, user);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const mockDocs = [
        {
          id: '1',
          title: 'Test Doc',
          description: 'Test Description',
          filePath: 'uploads/test.txt',
          uploadedBy: { id: '1', email: 'test@example.com' },
          deleted: false,
        },
      ] as Document[];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockDocs);

      const result = await controller.findAll();
      expect(result).toEqual(mockDocs);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      const mockDoc = {
        id: '1',
        title: 'Test Doc',
        description: 'Test Description',
        filePath: 'uploads/test.txt',
        uploadedBy: { id: '1', email: 'test@example.com' },
        deleted: false,
      } as Document;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockDoc);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockDoc);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });
});
