import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IngestionService } from './ingestion.service';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';

@Controller('ingestion')
@UseGuards(AuthGuard('jwt'))
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  trigger(@Body() dto: TriggerIngestionDto) {
    return this.ingestionService.trigger(dto);
  }

  @Get('status/:id')
  status(@Param('id') id: string) {
    return this.ingestionService.status(id);
  }
}
