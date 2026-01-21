import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { VideoStatus } from '../entities/video.entity';

@Injectable()
export class NotificationService {
  constructor(private notificationGateway: NotificationGateway) {}

  notifyProgress(videoId: string, progress: number, status: VideoStatus): void {
    this.notificationGateway.emitProgress(videoId, {
      videoId,
      progress: Math.round(progress),
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
