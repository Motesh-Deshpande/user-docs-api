import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../database/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { User } from '../database/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private docsRepo: Repository<Document>,
  ) {}

  async create(filePath: string, dto: CreateDocumentDto, user: User): Promise<Document> {
    const doc = this.docsRepo.create({ ...dto, filePath, uploadedBy: {id: user.id} });
    return this.docsRepo.save(doc);
  }

  async findAll(): Promise<Document[]> {
    return this.docsRepo.find({ where: { deleted: false } });
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.docsRepo.findOne({ where: { id, deleted: false } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto): Promise<Document> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No update values provided');
    }
    const doc = await this.findOne(id);
    Object.assign(doc, dto);
    return this.docsRepo.save(doc);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findOne(id);
    doc.deleted = true;
    await this.docsRepo.save(doc);
  }
}