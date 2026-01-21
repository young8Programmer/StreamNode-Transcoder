import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VideoStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalFileName: string;

  @Column()
  originalFilePath: string;

  @Column('bigint')
  originalFileSize: number;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.PENDING,
  })
  status: VideoStatus;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column('json', { nullable: true })
  transcodedFiles: {
    quality: string;
    path: string;
    url: string;
    size: number;
  }[];

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
