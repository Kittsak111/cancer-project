# 🧬 Cancer Cell Analyzer - AI Detection System

AI-powered web application for cancer cell detection using **YOLO (Ultralytics)** and **FastAPI**, with a modern frontend built in **Next.js + Prisma + TailwindCSS**.

---

## 🚀 Features

- 🔬 Cancer cell detection using YOLOv8
- 🎭 Instance segmentation support
- 📡 FastAPI REST API backend
- 🌐 Modern Next.js frontend
- 🗄 MySQL database (Railway)
- ☁️ Fully deployable on Railway
- 📦 Dockerized services

---

## 🏗 System Architecture

User (Browser)
↓
Next.js Frontend
↓
FastAPI Backend (YOLO Inference)
↓
MySQL Database


---

## 📁 Project Structure

cancer-project/
├── backend/ # FastAPI + YOLO
│ ├── main.py # API entry point
│ ├── models/ # YOLO model weights (.pt)
│ ├── Dockerfile
│ └── requirements.txt
│
└── frontend/ # Next.js + Prisma
├── src/
├── prisma/
├── public/
├── Dockerfile
└── package.json


---

# 🛠 Local Development

## 1️⃣ Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
Backend runs at:

http://localhost:8000
2️⃣ Frontend
cd frontend
npm install
npx prisma db push
npm run dev
Frontend runs at:

http://localhost:3000
☁️ Deploy on Railway
Step 1 — Create MySQL
Railway → New → Database → MySQL

Copy DATABASE_URL

Step 2 — Deploy Backend
New → GitHub Repo → Select this repository

Set Root Directory = backend

Railway auto-detects Dockerfile

Generate Domain (e.g. https://backend.up.railway.app)

Step 3 — Deploy Frontend
New → GitHub Repo → Select this repository

Set Root Directory = frontend

Add Environment Variables:

DATABASE_URL = (Public MySQL URL)
NEXT_PUBLIC_API_URL = (Backend URL)
Generate Domain

🔐 Environment Variables
Backend
DATABASE_URL=...
Frontend
DATABASE_URL=...
NEXT_PUBLIC_API_URL=...
🧠 Model Information
Framework: Ultralytics YOLOv8

Task: Instance Segmentation

Metric: mAP@50

Inference Speed: ~17ms

📊 Performance Comparison
Model	Mask mAP@50	Speed
YOLOv8	88%	17ms
Mask R-CNN	60%	100ms
🐳 Docker Support
Both backend and frontend are containerized for production deployment.

📌 Tech Stack
Python

FastAPI

Ultralytics YOLO

Next.js 14

Prisma ORM

MySQL

Docker

Railway Cloud
