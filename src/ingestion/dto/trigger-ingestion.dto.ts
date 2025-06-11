import { IsNotEmpty, IsString } from 'class-validator';

export class TriggerIngestionDto {
  @IsString()
  @IsNotEmpty()
  source: string; // e.g., URL or identifier
}
