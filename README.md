# 💰 Monetra

Aplikasi keuangan pribadi fullstack untuk mencatat pemasukan & pengeluaran, melihat statistik keuangan, dan menerapkan aturan budgeting 50/30/20.

![Login Page](client/public/logo.png)

## ✨ Fitur

- 🔐 Register & Login (JWT Authentication)
- 📝 Tambah, edit, hapus transaksi (pemasukan & pengeluaran)
- 🏷️ Kategori transaksi (18 kategori bawaan)
- 📊 Dashboard dengan grafik interaktif:
  - Total pemasukan, pengeluaran, dan saldo
  - Pie chart pengeluaran per kategori
  - Bar chart tren pemasukan vs pengeluaran bulanan
- 💰 Budget limit per kategori per bulan
- ⚠️ Notifikasi jika pengeluaran melebihi anggaran
- 📐 Analisis aturan 50/30/20 (Kebutuhan / Keinginan / Tabungan)
- 🌙 Dark theme premium dengan glassmorphism
- 📱 Responsive (mobile & desktop)

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS v3, Recharts, React Router |
| Backend | Node.js, Express, Sequelize ORM |
| Database | PostgreSQL |
| Auth | JSON Web Token (JWT), bcrypt |

## 📁 Struktur Project

```
Monetra/
├── client/          # Frontend React + Vite
│   ├── src/
│   │   ├── api/         # Axios API calls
│   │   ├── components/  # UI & layout components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Login, Register, Dashboard, Transaksi, Anggaran
│   │   └── utils/       # Format currency (IDR), date helpers
│   └── public/          # Logo & assets
│
└── server/          # Backend Node.js + Express
    ├── config/          # Database config
    ├── controllers/     # Route handlers
    ├── middleware/       # Auth JWT, validasi, error handler
    ├── models/          # Sequelize models
    ├── routes/          # API routes
    └── utils/           # Seed categories
```

## 🚀 Cara Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/download/)

### 1. Clone repository

```bash
git clone https://github.com/papatripat/Monetra.git
cd Monetra
```

### 2. Setup Database

- Buat database `monetra` di PostgreSQL (via pgAdmin atau CLI)
- Copy `.env.example` ke `.env` di folder `server/`:

```bash
cd server
cp .env.example .env
```

- Edit `.env` sesuai konfigurasi PostgreSQL Anda:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monetra
DB_USER=postgres
DB_PASSWORD=password_anda
JWT_SECRET=ganti_dengan_secret_key_anda
```

### 3. Jalankan Backend

```bash
cd server
npm install
npm run dev
```

Server berjalan di `http://localhost:5000`

### 4. Jalankan Frontend

```bash
cd client
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Profil user |
| GET | `/api/transactions` | Daftar transaksi (filter & pagination) |
| POST | `/api/transactions` | Tambah transaksi |
| PUT | `/api/transactions/:id` | Edit transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi |
| GET | `/api/categories` | Daftar kategori |
| GET/POST/DELETE | `/api/budgets` | Manajemen anggaran |
| GET | `/api/dashboard/summary` | Ringkasan keuangan |
| GET | `/api/dashboard/expense-by-category` | Pengeluaran per kategori |
| GET | `/api/dashboard/monthly-trend` | Tren bulanan |
| GET | `/api/dashboard/budget-status` | Status anggaran |
| GET | `/api/dashboard/fifty-thirty-twenty` | Analisis 50/30/20 |

## 🔒 Keamanan

- Password di-hash dengan **bcrypt** (salt rounds: 12)
- Autentikasi via **JWT** dengan expiration 24 jam
- Validasi input menggunakan **express-validator**
- **Helmet** untuk HTTP security headers
- **Rate limiting** pada route auth
- **CORS** dikonfigurasi khusus untuk frontend
- SQL injection dicegah via **Sequelize** parameterized queries

## 📄 Lisensi

MIT License
