import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from '../../ingestion/ingestion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngestionStatus } from '../../database/ingestion-status.entity';

describe('IngestionService', () => {
  let service: IngestionService;
  let mockRepository: any;

  beforeEach(async () => {
    // Use direct test setup to avoid SQLite issues with IngestionStatus
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(IngestionStatus),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    mockRepository = module.get(getRepositoryToken(IngestionStatus));

    // Reset all mocks to ensure clean state
    Object.keys(mockRepository).forEach(key => {
      if (typeof mockRepository[key] === 'function') {
        mockRepository[key] = jest.fn();
      }
    });
  });

  it('should trigger ingestion and return in_progress status', async () => {
    const dto = { source: 'test' };
    const record = { id: '1', status: 'pending' } as IngestionStatus;
    const inProgressRecord = { ...record, status: 'in_progress' } as IngestionStatus;
    
    mockRepository.create.mockReturnValue(record);
    mockRepository.save
      .mockResolvedValueOnce(record) // First save after create
      .mockResolvedValueOnce(inProgressRecord); // Second save for in_progress
    
    const res = await service.trigger(dto);
    
    expect(res.status).toBe('in_progress');
    expect(mockRepository.create).toHaveBeenCalledWith({ status: 'pending' });
    expect(mockRepository.save).toHaveBeenCalledWith(record); // First save
    expect(mockRepository.save).toHaveBeenCalledWith(inProgressRecord); // Second save
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
  });

  it('should return status record', async () => {
    const rec = { id: '2', status: 'completed' } as IngestionStatus;
    mockRepository.findOne.mockResolvedValue(rec);
    
    const res = await service.status('2');
    
    expect(res).toBe(rec);
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
  });

  it('should throw NotFoundException when status record not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    
    await expect(service.status('nonexistent')).rejects.toThrow('Ingestion record not found');
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'nonexistent' } });
  });
});
