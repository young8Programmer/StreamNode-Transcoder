import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const video = await this.uploadService.saveUploadedFile(file);
    return {
      message: 'Video uploaded successfully',
      video: {
        id: video.id,
        fileName: video.originalFileName,
        status: video.status,
        progress: video.progress,
      },
    };
  }

  @Get('all')
  async getAllVideos() {
    const videos = await this.uploadService.getAllVideos();
    return videos;
  }

  @Get(':id')
  async getVideo(@Param('id') id: string) {
    const video = await this.uploadService.getVideoById(id);
    return video;
  }
}
