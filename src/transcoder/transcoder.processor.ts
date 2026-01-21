import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, VideoStatus } from '../entities/video.entity';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { NotificationService } from '../notification/notification.service';
import { S3Service } from '../s3/s3.service';

interface TranscodingJob {
  videoId: string;
}

interface QualityConfig {
  name: string;
  resolution: string;
  videoBitrate: string;
  audioBitrate: string;
}

@Processor('transcode', {
  concurrency: 2, // Maximum 2 videos processed simultaneously
})
export class TranscoderProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscoderProcessor.name);

  private readonly qualityConfigs: QualityConfig[] = [
    {
      name: '480p',
      resolution: '854x480',
      videoBitrate: '1000k',
      audioBitrate: '128k',
    },
    {
      name: '720p',
      resolution: '1280x720',
      videoBitrate: '2500k',
      audioBitrate: '192k',
    },
    {
      name: '1080p',
      resolution: '1920x1080',
      videoBitrate: '5000k',
      audioBitrate: '256k',
    },
  ];

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private notificationService: NotificationService,
    private s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job<TranscodingJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`Starting transcoding for video ${videoId}`);

    const video = await this.videoRepository.findOne({ where: { id: videoId } });
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    try {
      // Update status to PROCESSING
      video.status = VideoStatus.PROCESSING;
      video.progress = 0;
      await this.videoRepository.save(video);
      await this.notificationService.notifyProgress(videoId, 0, VideoStatus.PROCESSING);

      // Create output directory
      const outputDir = path.join(process.cwd(), 'output', videoId);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate thumbnail first (faster, gives immediate feedback)
      await this.generateThumbnail(video, outputDir);
      await this.notificationService.notifyProgress(videoId, 10, VideoStatus.PROCESSING);

      // Transcode to multiple qualities
      const transcodedFiles = [];
      const totalQualities = this.qualityConfigs.length;
      const progressPerQuality = 80 / totalQualities; // 80% for transcoding (10% thumbnail, 10% upload)

      for (let i = 0; i < this.qualityConfigs.length; i++) {
        const config = this.qualityConfigs[i];
        const outputPath = await this.transcodeToQuality(
          video,
          config,
          outputDir,
          (qualityProgress: number) => {
            const baseProgress = 10 + i * progressPerQuality;
            const currentProgress = baseProgress + (qualityProgress * progressPerQuality) / 100;
            video.progress = Math.min(currentProgress, 90);
            this.notificationService.notifyProgress(videoId, video.progress, VideoStatus.PROCESSING);
          },
        );

        const stats = fs.statSync(outputPath);
        transcodedFiles.push({
          quality: config.name,
          path: outputPath,
          url: null, // Will be set after S3 upload
          size: stats.size,
        });
      }

      // Upload to S3
      this.logger.log(`Uploading files to S3 for video ${videoId}`);
      await this.notificationService.notifyProgress(videoId, 90, VideoStatus.PROCESSING);

      // Upload thumbnail
      if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
        const thumbnailUrl = await this.s3Service.uploadFile(
          video.thumbnailPath,
          `videos/${videoId}/thumbnail.jpg`,
        );
        video.thumbnailUrl = thumbnailUrl;
      }

      // Upload transcoded videos
      for (const file of transcodedFiles) {
        const s3Key = `videos/${videoId}/${path.basename(file.path)}`;
        const url = await this.s3Service.uploadFile(file.path, s3Key);
        file.url = url;
      }

      // Update video record
      video.transcodedFiles = transcodedFiles;
      video.status = VideoStatus.COMPLETED;
      video.progress = 100;
      await this.videoRepository.save(video);

      await this.notificationService.notifyProgress(videoId, 100, VideoStatus.COMPLETED);
      this.logger.log(`Transcoding completed for video ${videoId}`);

      // Cleanup local files after successful upload
      this.cleanupLocalFiles(video, outputDir);
    } catch (error) {
      this.logger.error(`Error transcoding video ${videoId}: ${error.message}`, error.stack);
      video.status = VideoStatus.FAILED;
      video.errorMessage = error.message;
      await this.videoRepository.save(video);
      await this.notificationService.notifyProgress(videoId, 0, VideoStatus.FAILED);
      throw error;
    }
  }

  private async generateThumbnail(
    video: Video,
    outputDir: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');

      ffmpeg(video.originalFilePath)
        .screenshots({
          timestamps: ['50%'], // Middle of video
          filename: 'thumbnail.jpg',
          folder: outputDir,
          size: '640x360',
        })
        .on('end', () => {
          video.thumbnailPath = thumbnailPath;
          this.videoRepository.save(video);
          this.logger.log(`Thumbnail generated for video ${video.id}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.warn(`Thumbnail generation failed: ${err.message}`);
          // Don't fail the whole process if thumbnail fails
          resolve();
        });
    });
  }

  private async transcodeToQuality(
    video: Video,
    config: QualityConfig,
    outputDir: string,
    onProgress: (progress: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFileName = `${config.name}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);

      let lastProgress = 0;

      ffmpeg(video.originalFilePath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(config.resolution)
        .videoBitrate(config.videoBitrate)
        .audioBitrate(config.audioBitrate)
        .format('mp4')
        .outputOptions([
          '-preset medium',
          '-crf 23',
          '-movflags +faststart',
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.log(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            const currentProgress = Math.min(progress.percent, 100);
            if (currentProgress > lastProgress) {
              lastProgress = currentProgress;
              onProgress(currentProgress);
            }
          }
        })
        .on('end', () => {
          this.logger.log(`Transcoding to ${config.name} completed for video ${video.id}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          this.logger.error(`Transcoding error for ${config.name}: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  private cleanupLocalFiles(video: Video, outputDir: string): void {
    try {
      // Delete original uploaded file
      if (fs.existsSync(video.originalFilePath)) {
        fs.unlinkSync(video.originalFilePath);
      }

      // Delete output directory
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }

      this.logger.log(`Cleaned up local files for video ${video.id}`);
    } catch (error) {
      this.logger.warn(`Error cleaning up files: ${error.message}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
