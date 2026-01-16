# StreamNode Transcoder 🚀

Professional video transcoding service built with NestJS. Transcodes videos to multiple qualities (480p, 720p, 1080p) with real-time progress tracking via WebSockets.

## Features

- ✅ **Multi-quality transcoding**: Automatically converts videos to 480p, 720p, and 1080p
- ✅ **Real-time progress tracking**: WebSocket-based progress updates
- ✅ **Thumbnail generation**: Automatic thumbnail extraction from video
- ✅ **Queue-based processing**: BullMQ for efficient job management
- ✅ **Resource management**: Configurable concurrency limits
- ✅ **Cloud storage**: AWS S3 integration for storing transcoded files
- ✅ **Error handling**: Robust error handling with retry mechanisms

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **BullMQ** - Job queue management
- **Redis** - Queue backend
- **FFmpeg** - Video processing engine
- **AWS S3** - Cloud storage
- **WebSockets** - Real-time notifications

## Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Redis** (v6 or higher)
4. **FFmpeg** installed on your system

### Installing FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd streamnode-transcoder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- PostgreSQL connection details
- Redis connection details
- AWS S3 credentials

4. Create PostgreSQL database:
```sql
CREATE DATABASE streamnode;
```

5. Start Redis server:
```bash
redis-server
```

## Running the Application

### Development mode:
```bash
npm run start:dev
```

### Production mode:
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Upload Video
```http
POST /upload
Content-Type: multipart/form-data

Body: video (file)
```

**Response:**
```json
{
  "message": "Video uploaded successfully",
  "video": {
    "id": "uuid",
    "fileName": "video.mp4",
    "status": "PENDING",
    "progress": 0
  }
}
```

### Get Video Status
```http
GET /upload/:id
```

**Response:**
```json
{
  "id": "uuid",
  "originalFileName": "video.mp4",
  "status": "PROCESSING",
  "progress": 45.5,
  "transcodedFiles": [
    {
      "quality": "480p",
      "url": "https://...",
      "size": 12345678
    }
  ],
  "thumbnailUrl": "https://..."
}
```

### Get All Videos
```http
GET /upload
```

## WebSocket Connection

Connect to WebSocket server for real-time progress updates:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/notifications');

// Listen to specific video progress
socket.on('video:VIDEO_ID', (data) => {
  console.log('Progress:', data.progress, '%');
  console.log('Status:', data.status);
});

// Listen to all progress updates
socket.on('progress', (data) => {
  console.log('Video:', data.videoId, 'Progress:', data.progress);
});
```

## Project Structure

```
src/
├── entities/
│   └── video.entity.ts          # Video database entity
├── upload/
│   ├── upload.module.ts          # Upload module
│   ├── upload.service.ts         # Upload service
│   └── upload.controller.ts      # Upload endpoints
├── transcoder/
│   ├── transcoder.module.ts      # Transcoder module
│   ├── transcoder.service.ts     # Queue service
│   └── transcoder.processor.ts   # FFmpeg worker
├── notification/
│   ├── notification.module.ts    # Notification module
│   ├── notification.service.ts   # Notification service
│   └── notification.gateway.ts  # WebSocket gateway
├── s3/
│   ├── s3.module.ts              # S3 module
│   └── s3.service.ts             # S3 upload service
├── app.module.ts                 # Root module
└── main.ts                       # Application entry point
```

## Configuration

### Concurrency Control

The number of simultaneous video transcoding jobs can be configured in `transcoder.processor.ts`:

```typescript
@Processor('transcode', {
  concurrency: 2, // Change this value
})
```

### Quality Settings

Video quality configurations can be modified in `transcoder.processor.ts`:

```typescript
private readonly qualityConfigs: QualityConfig[] = [
  {
    name: '480p',
    resolution: '854x480',
    videoBitrate: '1000k',
    audioBitrate: '128k',
  },
  // Add more qualities...
];
```

## Video Status Flow

1. **PENDING** - Video uploaded, waiting in queue
2. **PROCESSING** - Video is being transcoded
3. **COMPLETED** - All qualities transcoded and uploaded
4. **FAILED** - Error occurred during processing

## Error Handling

- Automatic retry mechanism (3 attempts with exponential backoff)
- Failed jobs are logged with error messages
- Video status is updated to `FAILED` on error

## File Cleanup

After successful upload to S3:
- Original uploaded file is deleted
- Local transcoded files are deleted
- Only files in S3 remain

## Production Considerations

1. **FFmpeg**: Ensure FFmpeg is properly installed and accessible
2. **Redis**: Use Redis Cluster for high availability
3. **PostgreSQL**: Set up proper connection pooling
4. **S3**: Configure proper bucket policies and CORS
5. **Monitoring**: Add logging and monitoring (e.g., Prometheus, Grafana)
6. **Security**: Use environment variables for sensitive data
7. **Rate Limiting**: Implement rate limiting for upload endpoints
8. **File Size Limits**: Adjust file size limits based on server capacity

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

<!-- Update 1 -->

<!-- Update 2 -->

<!-- Update 3 -->

<!-- Update 4 -->

<!-- Update 5 -->

<!-- Update 6 -->

<!-- Update 7 -->
