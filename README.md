# Cancer Cell Analyzer - AI System

ระบบวิเคราะห์เซลล์มะเร็งด้วย AI (YOLO + Next.js)

## โครงสร้างโปรเจกต์

```
cancer-project/
├── backend/          # Python FastAPI + YOLO Model
│   ├── main.py       # API Server
│   ├── models/       # YOLO Model (.pt)
│   ├── Dockerfile
│   └── requirements.txt
└── frontend/         # Next.js + Prisma + TailwindCSS
    ├── src/
    ├── prisma/
    ├── Dockerfile
    └── package.json
```

## Deploy บน Railway

### 1. สร้าง MySQL Database
- ไปที่ Railway Dashboard → New → Database → MySQL
- คัดลอก `DATABASE_URL`

### 2. Deploy Backend
- New → GitHub Repo → เลือก repo นี้
- ตั้ง Root Directory = `backend`
- Railway จะ detect Dockerfile อัตโนมัติ

### 3. Deploy Frontend
- New → GitHub Repo → เลือก repo นี้
- ตั้ง Root Directory = `frontend`
- ตั้ง Environment Variables:
  - `DATABASE_URL` = URL จาก MySQL
  - `NEXT_PUBLIC_API_URL` = URL ของ Backend service

## พัฒนาแบบ Local

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npx prisma db push
npm run dev
```
