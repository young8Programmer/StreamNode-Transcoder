import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, VideoStatus } from '../entities/video.entity';
import { TranscoderService } from '../transcoder/transcoder.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private transcoderService: TranscoderService,
  ) {
    // Create necessary directories
    const uploadDir = path.join(process.cwd(), 'uploads');
    const tempDir = path.join(process.cwd(), 'temp');
    const outputDir = path.join(process.cwd(), 'output');

    [uploadDir, tempDir, outputDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async saveUploadedFile(file: Express.Multer.File): Promise<Video> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file type
    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only video files are allowed.');
    }

    // Validate file size (max 5GB)
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds maximum limit of 5GB');
    }

    // Save video record to database with PENDING status
    const video = this.videoRepository.create({
      originalFileName: file.originalname,
      originalFilePath: file.path,
      originalFileSize: file.size,
      status: VideoStatus.PENDING,
      progress: 0,
    });

    const savedVideo = await this.videoRepository.save(video);

    // Add transcoding job to queue
    await this.transcoderService.addTranscodingJob(savedVideo.id);

    return savedVideo;
  }

  async getVideoById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new BadRequestException('Video not found');
    }
    return video;
  }

  async getAllVideos(): Promise<Video[]> {
    return this.videoRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
