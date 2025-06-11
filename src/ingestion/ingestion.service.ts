import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IngestionStatus } from '../database/ingestion-status.entity';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';

@Injectable()
export class IngestionService {
  private processing = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectRepository(IngestionStatus)
    private statusRepo: Repository<IngestionStatus>,
  ) {}

  async trigger(dto: TriggerIngestionDto): Promise<IngestionStatus> {
    const record = this.statusRepo.create({ status: 'pending' });
    await this.statusRepo.save(record);

    // Simulate async processing
    const timeout = setTimeout(async () => {
      const rec = await this.statusRepo.findOne({ where: { id: record.id } });
      if (rec) {
        rec.status = 'completed';
        rec.updatedAt = new Date();
        await this.statusRepo.save(rec);
      }
      this.processing.delete(record.id);
    }, 5000);

    this.processing.set(record.id, timeout);
    record.status = 'in_progress';
    await this.statusRepo.save(record);
    return record;
  }

  async status(id: string): Promise<IngestionStatus> {
    const rec = await this.statusRepo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException('Ingestion record not found');
    return rec;
  }
}
