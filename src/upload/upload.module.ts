import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { Video } from '../entities/video.entity';
import { TranscoderModule } from '../transcoder/transcoder.module';

@Module({
  imports: [TypeOrmModule.forFeature([Video]), TranscoderModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
