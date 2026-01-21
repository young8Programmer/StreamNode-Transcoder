# Docker Setup Guide

Bu loyihani Docker orqali ishga tushirish uchun qo'llanma.

## Docker Compose

Loyiha PostgreSQL, Redis va NestJS ilovasini Docker orqali ishga tushiradi.

### Talablar

- Docker
- Docker Compose

### Ishlatish

1. `.env` faylini yarating va sozlang:
```bash
cp env.example .env
```

2. Docker Compose orqali ishga tushiring:
```bash
docker-compose up -d
```

3. Ilova `http://localhost:3000` da ishga tushadi.

### To'xtatish

```bash
docker-compose down
```

## Dockerfile

Agar faqat NestJS ilovasini Docker orqali ishga tushirmoqchi bo'lsangiz:

```bash
docker build -t streamnode-transcoder .
docker run -p 3000:3000 streamnode-transcoder
```

**Eslatma:** FFmpeg Docker konteynerida o'rnatilgan bo'lishi kerak.
