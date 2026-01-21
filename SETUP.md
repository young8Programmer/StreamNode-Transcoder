# StreamNode Transcoder - O'rnatish Qo'llanmasi

## Bosqichma-bosqich o'rnatish

### 1. Talablar

Quyidagi dasturlar o'rnatilgan bo'lishi kerak:

- **Node.js** (v18 yoki yuqori)
- **PostgreSQL** (v12 yoki yuqori)
- **Redis** (v6 yoki yuqori)
- **FFmpeg** (video qayta ishlash uchun)

### 2. FFmpeg o'rnatish

#### Windows:
```powershell
# Chocolatey orqali
choco install ffmpeg

# Yoki https://ffmpeg.org/download.html dan yuklab oling
```

#### macOS:
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

FFmpeg o'rnatilganligini tekshiring:
```bash
ffmpeg -version
```

### 3. Loyihani klonlash va o'rnatish

```bash
# Loyiha papkasiga kiring
cd "StreamNode Transcoder"

# Dependencies o'rnatish
npm install
```

### 4. Ma'lumotlar bazasini sozlash

PostgreSQL'da yangi ma'lumotlar bazasini yarating:

```sql
CREATE DATABASE streamnode;
```

Yoki psql orqali:
```bash
psql -U postgres
CREATE DATABASE streamnode;
\q
```

### 5. Redis serverini ishga tushirish

#### Windows:
Redis'ni yuklab oling va ishga tushiring: https://redis.io/download

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Linux:
```bash
sudo systemctl start redis
# Yoki
redis-server
```

### 6. Environment variables sozlash

`.env` faylini yarating:

```bash
cp env.example .env
```

`.env` faylini tahrirlang va quyidagilarni to'ldiring:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sizning_parolingiz
DB_DATABASE=streamnode

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3 (ixtiyoriy, lekin tavsiya etiladi)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sizning_key_id
AWS_SECRET_ACCESS_KEY=sizning_secret_key
AWS_S3_BUCKET_NAME=streamnode-transcoder

# Server
PORT=3000
NODE_ENV=development
```

### 7. Ilovani ishga tushirish

#### Development mode:
```bash
npm run start:dev
```

#### Production mode:
```bash
npm run build
npm run start:prod
```

Ilova `http://localhost:3000` da ishga tushadi.

### 8. Test qilish

1. Browser'da `examples/client-example.html` faylini oching
2. Yoki Postman/Insomnia orqali:
   - `POST http://localhost:3000/upload` endpoint'iga video fayl yuboring
   - `GET http://localhost:3000/upload/:id` orqali holatni kuzating

## Muammolarni hal qilish

### FFmpeg topilmayapti

FFmpeg o'rnatilganligini tekshiring:
```bash
ffmpeg -version
```

Agar topilmasa, PATH environment variable'ga qo'shing.

### PostgreSQL ulanish xatosi

- PostgreSQL ishlab turganligini tekshiring
- `.env` faylidagi ma'lumotlar to'g'riligini tekshiring
- Firewall sozlamalarini tekshiring

### Redis ulanish xatosi

- Redis ishlab turganligini tekshiring:
```bash
redis-cli ping
# PONG javobini olish kerak
```

### Port band

Agar 3000 port band bo'lsa, `.env` faylida `PORT` o'zgartiring.

## Keyingi qadamlar

1. **AWS S3 sozlash**: Video fayllarni bulutga yuklash uchun
2. **Production sozlamalari**: 
   - `NODE_ENV=production`
   - Database connection pooling
   - Redis cluster
3. **Monitoring**: Logging va monitoring tizimlarini qo'shing
