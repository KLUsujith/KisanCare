# KisanCare – Smart Crop Care & Direct Market Access (కిసాన్ కేర్)

> An integrated, multilingual platform for small and marginal farmers — from crop care to selling their produce — with separate **Farmer** and **Admin** portals.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://klusujith.github.io/KisanCare/)
[![Built with React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Express.js-000000?style=flat&logo=express)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Telugu & English](https://img.shields.io/badge/Language-Telugu%20%7C%20English-green)]()

🌐 **Live Deployment**: **[https://klusujith.github.io/KisanCare/](https://klusujith.github.io/KisanCare/)**

---

## 🎬 Sample Walkthrough Video (డెమో వీడియో)

Watch the 16-second HD overview of the KisanCare platform:

> 📹 **Sample Video File**: [`public/demo_sample.mp4`](public/demo_sample.mp4) • [`public/demo_sample.webm`](public/demo_sample.webm)  
> *In the live web application at `http://localhost:5001/`, click the glowing **"🎬 డెమో వీడియో / Demo"** button in the top navigation bar to watch the video with playback controls!*

| ⏱️ Timestamp | Feature Showcase | Key Highlights |
|---|---|---|
| **0:00 - 0:03** | **Platform Introduction** | Bilingual Telugu & English mobile-first UI for small & marginal farmers |
| **0:03 - 0:06** | **Role-Based Authentication** | Farmer OTP login with 1-click presets; Admin Dashboard strictly hidden for farmers |
| **0:06 - 0:09** | **AI Crop Doctor** | Active leaf scan, 94.8% Early Blight detection, organic recipes & knapsack sprayer dosage |
| **0:09 - 0:12** | **Income Estimator & Seeds** | Transparent 3-Scenario math (Low/Expected/High) per acre & certified NSC seeds |
| **0:12 - 0:16** | **Direct Market & Master Admin** | Live APMC Mandi rates, WhatsApp buyer connection, and Admin control panel |

---

## 🌾 Features

| Module | Description |
|---|---|
| 🩺 **Crop Doctor** | AI image-based crop disease diagnosis with organic & chemical treatment guidance |
| 🗺️ **Crop Advisory** | State / District / Mandal suitability engine with water & yield predictions |
| 💰 **Income Estimator** | 3-scenario (Low / Expected / High) income calculator per acre |
| 🌱 **Buy Seeds** | ICAR/NSC certified seed marketplace with seed-rate calculator |
| 📈 **Mandi Prices** | APMC live rates, 7-day trends, MSP comparison |
| 🤝 **Buyers & FPOs** | Direct WhatsApp & phone connection with verified buyers |
| 🏭 **Cold Storage** | Nearby cold storage discovery with capacity & temperature info |
| 🚛 **Logistics Hub** | Rural truck fleet with shared pooling (~40% cost savings) |
| 🏡 **My Farm** | Farmer profile: land, soil type, irrigation, crop history |
| 🛡️ **Admin Dashboard** | Manage mandi rates, certified seeds, buyers, facilities |

---

## 🔐 Login Roles

### Farmer Login
- Mobile number + OTP (demo: `9440177889` / OTP `123456`)
- Create new account with name, village, district, state, acres
- Demo default: K. Anjaneyulu Reddy — 4.5 Acres, Warangal, Telangana

### Admin Login  
- Email: `admin@kisancare.gov.in` or username: `admin`
- Password: `admin123` (or PIN `9999`)
- Admin Dashboard is **strictly hidden** from farmer accounts

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```
Opens backend API at `http://localhost:5001` and Vite dev server at `http://localhost:5173`.

### 3. Production Build & Run
```bash
npm run build
npm start
```
Full app runs at **http://localhost:5001**

---

## 🏗️ Architecture

```
kisan-setu/
├── src/
│   ├── components/     # React UI components
│   │   ├── LoginModal.jsx        # Farmer Login | Register | Admin Login
│   │   ├── Navbar.jsx            # Role-aware navigation (admin tab hidden for farmers)
│   │   ├── AdminPanel.jsx        # Admin Dashboard (route-guarded)
│   │   ├── CropDoctor.jsx        # Crop Disease Diagnosis
│   │   ├── CropRecommendation.jsx
│   │   ├── IncomeEstimator.jsx
│   │   ├── BuySeeds.jsx
│   │   ├── MandiPrices.jsx
│   │   ├── Marketplace.jsx
│   │   ├── ColdStorage.jsx
│   │   ├── LogisticsHub.jsx
│   │   └── MyFarm.jsx
│   ├── context/
│   │   └── AppContext.jsx        # Global state (user, role, farm profile, cart)
│   ├── i18n/                    # 8 language translation files
│   └── utils/                   # Speech, offline storage helpers
├── server/
│   ├── index.js                 # Express server (port 5001)
│   ├── routes/
│   │   ├── auth.js             # /api/auth (farmer-login, admin-login, register)
│   │   ├── market.js           # /api/market (buyers, FPOs)
│   │   ├── myfarm.js           # /api/myfarm
│   │   ├── seeds.js            # /api/seeds
│   │   ├── admin.js            # /api/admin (admin-only routes)
│   │   └── ...
│   └── data/                   # JSON data files (mandi, seeds, buyers, etc.)
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 📱 Design Philosophy

- **Mobile-first** — designed for basic Android smartphones
- **Low digital literacy** — large icons, simple Telugu + English labels  
- **Offline resilient** — PWA with local storage queue, auto-syncs when online
- **Voice-friendly** — Text-to-speech on all important guidance

---

## 🌐 Languages Supported

English, తెలుగు (Telugu), हिन्दी (Hindi), தமிழ் (Tamil), मराठी (Marathi), বাংলা (Bengali), ਪੰਜਾਬੀ (Punjabi), ಕನ್ನಡ (Kannada)

---

## 📋 Disclaimer

All income estimates and crop advisories are based on historical ICAR / APMC data and should be verified with your local Mandal Agricultural Officer (MAO) or Krishi Vigyan Kendra (KVK).

---

*Built for small and marginal farmers of Andhra Pradesh, Telangana, and pan-India.*
