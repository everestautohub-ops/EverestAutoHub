# Everest Auto Hub 🏔

Full-stack website for Everest Auto Hub — auto workshop + clothing brand.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

## Setup

### 1. Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
npm run seed      # Seeds admin + sample data
npm run dev       # Starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:3000
```

## Admin Login
- Email: `admin@everestautohub.com`
- Password: `admin123`
- URL: `http://localhost:3000/admin`

## Features
### User Side
- Home page with hero, services, shop preview, reviews, CTA
- Services listing with booking
- Appointment booking form with time slots
- Clothing shop with filters, cart, checkout
- About & Contact pages
- Login / Register

### Admin Panel
- Dashboard with stats (revenue, users, appointments, orders)
- Manage Services (CRUD)
- Manage Appointments (status updates)
- Manage Products (CRUD)
- Manage Orders (status updates)
- Manage Users
- Manage Reviews (approve/reject)
