import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TranscoderService } from './transcoder.service';
import { TranscoderProcessor } from './transcoder.processor';
import { Video } from '../entities/video.entity';
import { NotificationModule } from '../notification/notification.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    BullModule.registerQueue({
      name: 'transcode',
    }),
    NotificationModule,
    S3Module,
  ],
  providers: [TranscoderService, TranscoderProcessor],
  exports: [TranscoderService],
})
export class TranscoderModule {}
