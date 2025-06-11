import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ingestion_status')
export class IngestionStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: 'pending' | 'in_progress' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;
}