import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'streamnode-transcoder';

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: this.getContentType(key),
        ACL: 'public-read', // Or use signed URLs for better security
      });

      await this.s3Client.send(command);

      // Construct public URL
      const region = process.env.AWS_REGION || 'us-east-1';
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded to S3: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Error uploading to S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getContentType(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      mp4: 'video/mp4',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}
