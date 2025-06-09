import {
    Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UploadedFile,
    UseInterceptors, Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
  
@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
    constructor(private readonly docsService: DocumentsService) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }))
    upload(@UploadedFile() file: Express.Multer.File & { path: string }, @Body() dto: CreateDocumentDto, @Req() req) {
      return this.docsService.create(file.path, dto, req.user);
    }
  
    @Get()
    findAll() {
      return this.docsService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.docsService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
      return this.docsService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.docsService.remove(id);
    }
}