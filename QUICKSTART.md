# Tez Boshlash Qo'llanmasi 🚀

## 5 daqiqada ishga tushirish

### 1. Talablar o'rnatish

```bash
# FFmpeg o'rnatish (Windows - Chocolatey)
choco install ffmpeg

# PostgreSQL va Redis Docker orqali
docker-compose up -d postgres redis
```

### 2. Loyihani sozlash

```bash
# Dependencies o'rnatish
npm install

# Environment variables
cp env.example .env
# .env faylini tahrirlang
```

### 3. Ishga tushirish

```bash
npm run start:dev
```

### 4. Test qilish

1. Browser'da `examples/client-example.html` faylini oching
2. Video fayl yuklang
3. Real-vaqtda progress kuzatib boring!

## Video yuklash (cURL)

```bash
curl -X POST http://localhost:3000/upload \
  -F "video=@/path/to/your/video.mp4"
```

## WebSocket orqali progress kuzatish

```javascript
const socket = io('http://localhost:3000/notifications');
socket.on('progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});
```

## Keyingi qadamlar

- [ ] AWS S3 sozlamalari
- [ ] Production environment
- [ ] Monitoring qo'shish

Batafsil ma'lumot: [SETUP.md](./SETUP.md) va [README.md](./README.md)
