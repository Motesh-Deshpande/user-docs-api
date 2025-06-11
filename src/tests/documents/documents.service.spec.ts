import { Test } from '@nestjs/testing';
import { DocumentsService } from '../../documents/documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from '../../database/document.entity';
import { User } from '../../database/user.entity';
import { NotFoundException } from '@nestjs/common';
import { createTestingModule, resetMockRepository } from '../setup';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockRepository: any;

  const mockUser: User = { id: '1' } as User;
  const mockDocument: Document = {
    id: '1',
    title: 'Test Doc',
    description: 'Test Description',
    filePath: 'uploads/test.txt',
    uploadedBy: mockUser,
    deleted: false,
  } as Document;

  beforeEach(async () => {
    const { module, getMockRepository } = await createTestingModule({
      providers: [DocumentsService],
    });

    service = module.get<DocumentsService>(DocumentsService);
    // Get the Document-specific mock repository
    mockRepository = getMockRepository!(Document);

    // Reset all mocks to ensure clean state
    resetMockRepository(mockRepository);
  });

  describe('create', () => {
    it('should create a new document', async () => {
      // Arrange
      const dto = { title: 'Test Doc', description: 'Test Description' };
      const filePath = 'uploads/test.txt';

      const createdDoc = {
        ...dto,
        filePath,
        uploadedBy: { id: mockUser.id },
        id: '1',
        deleted: false,
      };

      mockRepository.create.mockReturnValue(createdDoc);
      mockRepository.save.mockResolvedValue(mockDocument);

      // Act
      const result = await service.create(filePath, dto, mockUser);

      // Assert
      expect(result).toEqual(mockDocument);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        filePath,
        uploadedBy: { id: mockUser.id },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdDoc);
    });
  });

  describe('findAll', () => {
    it('should return an array of non-deleted documents', async () => {
      // Arrange
      const mockDocuments = [mockDocument];
      mockRepository.find.mockResolvedValue(mockDocuments);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockDocuments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { deleted: false },
      });
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockDocument);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
    });

    it('should throw NotFoundException when document is not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      // Arrange
      const updateDto = { title: 'Updated Title' };
      const updatedDoc = { ...mockDocument, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue(updatedDoc);

      // Act
      const result = await service.update('1', updateDto);

      // Assert
      expect(result).toEqual(updatedDoc);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when document to update is not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('1', { title: 'New Title' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a document', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue({ ...mockDocument, deleted: true });

      // Act
      await service.remove('1');

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockDocument,
        deleted: true,
      });
    });

    it('should throw NotFoundException when document to remove is not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
