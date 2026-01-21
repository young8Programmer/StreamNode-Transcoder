# API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Upload Video

Video faylni yuklash va transkodlash jarayonini boshlash.

**Endpoint:** `POST /upload`

**Content-Type:** `multipart/form-data`

**Request:**
- Field name: `video`
- Type: File (video file)

**Response:**
```json
{
  "message": "Video uploaded successfully",
  "video": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "my-video.mp4",
    "status": "PENDING",
    "progress": 0
  }
}
```

**Status Codes:**
- `201 Created` - Video muvaffaqiyatli yuklandi
- `400 Bad Request` - Fayl yuborilmagan yoki noto'g'ri format
- `413 Payload Too Large` - Fayl hajmi 5GB dan katta

---

### 2. Get Video by ID

Video holatini va ma'lumotlarini olish.

**Endpoint:** `GET /upload/:id`

**Parameters:**
- `id` (UUID) - Video ID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalFileName": "my-video.mp4",
  "originalFilePath": "./uploads/1234567890-123456789.mp4",
  "originalFileSize": 104857600,
  "status": "COMPLETED",
  "progress": 100,
  "thumbnailPath": "./output/550e8400.../thumbnail.jpg",
  "thumbnailUrl": "https://bucket.s3.amazonaws.com/videos/550e8400.../thumbnail.jpg",
  "transcodedFiles": [
    {
      "quality": "480p",
      "path": "./output/550e8400.../480p.mp4",
      "url": "https://bucket.s3.amazonaws.com/videos/550e8400.../480p.mp4",
      "size": 15728640
    },
    {
      "quality": "720p",
      "path": "./output/550e8400.../720p.mp4",
      "url": "https://bucket.s3.amazonaws.com/videos/550e8400.../720p.mp4",
      "size": 31457280
    },
    {
      "quality": "1080p",
      "path": "./output/550e8400.../1080p.mp4",
      "url": "https://bucket.s3.amazonaws.com/videos/550e8400.../1080p.mp4",
      "size": 62914560
    }
  ],
  "errorMessage": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Video topildi
- `404 Not Found` - Video topilmadi

---

### 3. Get All Videos

Barcha videolarni ro'yxatini olish.

**Endpoint:** `GET /upload/all`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalFileName": "video1.mp4",
    "status": "COMPLETED",
    "progress": 100,
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "originalFileName": "video2.mp4",
    "status": "PROCESSING",
    "progress": 45.5,
    "createdAt": "2024-01-01T13:00:00.000Z"
  }
]
```

**Status Codes:**
- `200 OK` - Muvaffaqiyatli

---

## WebSocket API

### Connection

WebSocket server'ga ulanish:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/notifications');
```

### Events

#### Listen to Specific Video Progress

```javascript
socket.on('video:VIDEO_ID', (data) => {
  console.log(data);
  // {
  //   videoId: "550e8400-e29b-41d4-a716-446655440000",
  //   progress: 45.5,
  //   status: "PROCESSING",
  //   timestamp: "2024-01-01T12:02:30.000Z"
  // }
});
```

#### Listen to All Progress Updates

```javascript
socket.on('progress', (data) => {
  console.log(`Video ${data.videoId}: ${data.progress}%`);
});
```

### Status Values

- `PENDING` - Video yuklandi, navbatda kutmoqda
- `PROCESSING` - Video transkodlanmoqda
- `COMPLETED` - Transkodlash yakunlandi
- `FAILED` - Xatolik yuz berdi

---

## Example Usage

### cURL

```bash
# Upload video
curl -X POST http://localhost:3000/upload \
  -F "video=@/path/to/video.mp4"

# Get video status
curl http://localhost:3000/upload/550e8400-e29b-41d4-a716-446655440000

# Get all videos
curl http://localhost:3000/upload/all
```

### JavaScript (Fetch API)

```javascript
// Upload
const formData = new FormData();
formData.append('video', fileInput.files[0]);

const response = await fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Video ID:', data.video.id);

// Get status
const statusResponse = await fetch(
  `http://localhost:3000/upload/${data.video.id}`
);
const video = await statusResponse.json();
console.log('Status:', video.status);
console.log('Progress:', video.progress);
```

### Python

```python
import requests

# Upload
with open('video.mp4', 'rb') as f:
    files = {'video': f}
    response = requests.post('http://localhost:3000/upload', files=files)
    video_id = response.json()['video']['id']

# Get status
status_response = requests.get(f'http://localhost:3000/upload/{video_id}')
video = status_response.json()
print(f"Status: {video['status']}, Progress: {video['progress']}%")
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "File is required",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Video not found",
  "error": "Not Found"
}
```

### 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "File size exceeds maximum limit of 5GB",
  "error": "Payload Too Large"
}
```
