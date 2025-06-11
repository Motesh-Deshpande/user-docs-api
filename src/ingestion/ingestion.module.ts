import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { IngestionStatus } from '../database/ingestion-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IngestionStatus])],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}