import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface TranscodingJob {
  videoId: string;
}

@Injectable()
export class TranscoderService {
  constructor(
    @InjectQueue('transcode')
    private transcodeQueue: Queue,
  ) {}

  async addTranscodingJob(videoId: string): Promise<void> {
    await this.transcodeQueue.add(
      'transcode-video',
      { videoId } as TranscodingJob,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
}
