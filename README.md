# PT. Multistack Indonesia — Company Profile System

Sistem company profile full-stack untuk **PT. Multistack Indonesia**.  
Tema: **Hitam dominan · Merah aksen · Putih teks**

---

## Struktur Folder

```
multistack/
├── BE/     → Backend API (Node.js + Express + PostgreSQL)
├── FE/     → Website Publik (React + Vite + CSS Modules)
└── CMS/    → Panel Admin (React + Vite + TailwindCSS)
```

---

## Tech Stack

| Layer    | Teknologi                                         |
|----------|---------------------------------------------------|
| Backend  | Node.js, Express, PostgreSQL, JWT, Multer, Nodemailer |
| Frontend | React 18, Vite, React Router v6, Axios, CSS Modules   |
| CMS      | React 18, Vite, TailwindCSS, TanStack Query, React Quill |

---

## Persyaratan

- Node.js v18+
- PostgreSQL 14+
- npm

---

## Setup & Instalasi

### 1. Database

```bash
psql -U postgres
CREATE DATABASE multistack_db;
\q
```

### 2. Backend (BE)

```bash
cd BE
npm install
cp .env.example .env   # Edit sesuai konfigurasi Anda
npm run migrate        # Buat semua tabel
npm run seed           # Isi data awal
npm run dev            # Jalankan server
```

Server: `http://localhost:5000`

**Akun admin default:**
```
Email    : admin@multistack.co.id
Password : multistack2024
```

### 3. Frontend (FE)

```bash
cd FE
npm install
cp .env.example .env
npm run dev
```

Website: `http://localhost:5173`

### 4. CMS Admin Panel

```bash
cd CMS
npm install
cp .env.example .env
npm run dev
```

CMS: `http://localhost:5174`

---

## Variabel Environment

### BE/.env
```env
PORT=5000
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/multistack_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
ADMIN_EMAIL=admin@multistack.co.id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### FE/.env & CMS/.env
```env
VITE_API_URL=/api
```

---

## API Endpoints

### Publik
| Method | Endpoint             | Keterangan              |
|--------|----------------------|-------------------------|
| GET    | /api/settings        | Pengaturan perusahaan   |
| GET    | /api/banner          | Daftar banner aktif     |
| GET    | /api/categories      | Kategori produk/portfolio|
| GET    | /api/products        | Daftar produk           |
| GET    | /api/products/:slug  | Detail produk           |
| GET    | /api/services        | Daftar layanan          |
| GET    | /api/portfolio       | Daftar portfolio        |
| GET    | /api/portfolio/:slug | Detail portfolio        |
| GET    | /api/news            | Daftar berita           |
| GET    | /api/news/:slug      | Detail berita           |
| GET    | /api/testimonials    | Daftar testimoni        |
| GET    | /api/awards          | Penghargaan & sertifikasi|
| POST   | /api/contact         | Kirim pesan kontak      |
| POST   | /api/rfq             | Submit RFQ              |

### Admin (perlu Bearer Token)
| Method | Endpoint                      | Keterangan          |
|--------|-------------------------------|---------------------|
| POST   | /api/auth/login               | Login admin         |
| GET    | /api/auth/me                  | Data admin          |
| GET    | /api/admin/dashboard/metrics  | Statistik dashboard |
| GET    | /api/admin/rfq                | Daftar RFQ          |
| GET    | /api/admin/contact            | Daftar pesan masuk  |
| POST   | /api/admin/upload             | Upload file         |

---

## Build Production

```bash
# FE
cd FE && npm run build    # Output: dist/

# CMS
cd CMS && npm run build   # Output: dist/

# BE
cd BE && NODE_ENV=production node server.js
```

Serve FE & CMS via Nginx, Apache, atau Vercel.  
Pastikan `/uploads` dari BE diakses via subdomain atau proxy.

---

© 2026 PT. Multistack Indonesia. All rights reserved.
