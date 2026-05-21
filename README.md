***

```md
# 🏥 CareFlow - Full-Stack Healthcare Platform

CareFlow is a modern, full-stack healthcare appointment booking and telemedicine platform. It connects patients and doctors through a seamless cross-platform experience, featuring a React Native mobile app, a React web portal (for patients and admins), a robust Spring Boot backend, and a real-time Node.js chat server.

---

## ✨ Key Features

### 📱 Patient Features (Mobile & Web)
- 🔐 Secure authentication (Clerk OAuth + Custom JWT)
- 🔍 Search and filter doctors by specialty
- 🩺 View doctor profiles, metrics, and availability
- 📅 Book and manage appointments seamlessly
- 💳 Secure payment method selection (Stripe integration)
- 💬 Real-time chat with read receipts and typing indicators
- 🔔 Push notifications for appointments and messages

### 👨‍⚕️ Doctor Features (Mobile & Web)
- 📊 Doctor dashboard and analytics
- 📋 Appointment management (Approve/Cancel/Complete)
- 💬 Real-time patient interaction and chat support
- 👨‍⚕️ Profile and availability management

### 🏢 Admin Features (Web Dashboard)
- 👨‍💼 Admin login and secure dashboard
- 📈 Platform analytics and appointment tracking
- 🩺 Add, edit, and manage doctor profiles
- 📋 View and manage all system appointments

### ⚙️ Technical Highlights
- ⚡ **Optimized Real-time Chat:** Socket.io implementation with JWT authentication, auto-reconnection, and safe token-refresh interceptors to prevent 401 loops.
- 🔄 **Resilient API Layer:** Axios interceptors with queueing for concurrent silent JWT refreshes.
- 🛡️ **Security First:** Spring Boot Rate Limiting on auth endpoints, Input Sanitization, Security Headers, and secure token storage.
- 💳 **Payment Integration:** Stripe Checkout and Webhooks for automated appointment payment verification.
- ☁️ **Cloud Media Management:** Cloudinary integration for seamless doctor profile image uploads.

---

## 🛠 Tech Stack

### Mobile Application (Expo React Native)
- **Framework:** React Native (Expo)
- **Navigation:** Expo Router (File-based routing)
- **Styling:** NativeWind (Tailwind CSS) & Custom Responsive Stylesheet utility
- **State Management:** React Context API (Auth, Doctor, App Contexts)
- **Data Fetching:** TanStack React Query & Axios
- **Real-time:** Socket.io client

### Web Application (React.js)
- **Framework:** Vite + React
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State Management:** React Context API (Admin & App Context)

### Backend Server (Spring Boot)
- **Core:** Java, Spring Boot, Spring Security
- **Database:** MongoDB (Spring Data MongoDB)
- **Authentication:** JWT (Access + Refresh Tokens)
- **Media:** Cloudinary
- **Payments:** Stripe Java SDK
- **Security:** Rate Limiting Filters, JWT Filters, Security Headers

### Real-time Server (Node.js)
- **Core:** Express, Socket.io
- **Purpose:** Handles real-time chat, typing indicators, and online status
- **Security:** Validates JWT with Spring Boot API before allowing socket connections

---

## 🏗 System Architecture

```text
┌─────────────────────┐    ┌─────────────────────┐
│   CareFlow Mobile   │    │    CareFlow Web      │
│ (Expo React Native) │    │   (Vite + React)     │
│  - Patient App      │    │  - Patient Portal    │
│  - Doctor App       │    │  - Admin Dashboard   │
└─────────┬───────────┘    └─────────┬───────────┘
          │                          │
          │       REST APIs          │
          └──────────┬───────────────┘
                     │
           ┌─────────▼─────────┐
           │  Spring Boot API  │
           │  (Port 8080)      │
           │  - REST Logic     │
           │  - Auth & JWT     │
           │  - Stripe Webhook │
           │  - MongoDB        │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐      ┌────────────────┐
           │  Node Socket.io   │◄────►│  Spring Boot   │
           │  (Port 8082)      │ Auth │  /api/profile  │
           │  - Chat Rooms     │      └────────────────┘
           │  - Notifications  │
           └───────────────────┘
```

---

## 📁 Project Structure

### 1. Mobile App (`mobile/`)
```bash
mobile/
├── app/                    # Expo Router routes
│   ├── (auth)/             # Login, Onboarding
│   ├── (common)/           # Chat, Payments (Shared)
│   ├── (doctor)/           # Doctor Dashboard, Appointments
│   └── (patient)/          # Patient Home, Booking, Profile
├── api/                    # Standalone Node.js Socket.io Server
│   └── server.js
├── src/
│   ├── api/                # Axios instance & Interceptors
│   ├── components/         # Reusable UI (DoctorCard, Button, etc.)
│   ├── context/            # AuthContext, DoctorContext, AppProvider
│   ├── data/               # Static/Mock data
│   └── utils/              # Storage, Notification helpers
└── ...config files         # tailwind, eas, babel, app.json
```

### 2. Web App (`web/`)
```bash
web/
├── src/
│   ├── components/
│   │   ├── admin/          # AdminNavbar, Sidebar
│   │   ├── common/         # ConfirmDialog
│   │   └── user/           # Header, Footer, TopDoctors, Navbar
│   ├── context/            # AdminContext, AppContext, Layouts
│   ├── pages/
│   │   ├── admin/          # Dashboard, AddDoctor, AllAppointments, DoctorsList
│   │   └── user/           # Home, About, Contact, DoctorDetail
│   ├── App.jsx
│   └── main.jsx
└── ...config files         # vite, tailwind, postcss
```

### 3. Spring Boot Backend (`backend/`)
```bash
backend/src/main/java/com/medical/careflow/
├── config/                 # SecurityConfig, JWTFilter, RateLimitFilter, MongoConfig
├── controller/             # Auth, User, Doctor, Admin, Chat, Payment, Speciality
├── dto/                    # Data Transfer Objects for API requests/responses
├── exception/              # GlobalExceptionHandler, Custom Exceptions
├── model/                  # MongoDB Entities (User, Doctor, Appointment, ChatMessage)
├── repository/             # Spring Data MongoDB Repositories
├── service/                # Core Business Logic
└── util/                   # InputSanitizer, FileValidationUtil
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Java JDK 17+ & Maven
- MongoDB instance (Local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### 1. Backend Setup (Spring Boot)
```bash
cd backend
# Configure application.yml with MongoDB URI, Stripe keys, JWT secret, Cloudinary keys
mvn spring-boot:run
```

### 2. Socket Server Setup (Node.js)
```bash
cd mobile/api
npm install
# Create .env with SPRING_BOOT_URL=http://localhost:8080
npm start
```

### 3. Web App Setup (React + Vite)
```bash
cd web
npm install
# Create .env with VITE_API_URL=http://localhost:8080
npm run dev
```

### 4. Mobile App Setup (Expo)
```bash
cd mobile
npm install
# Create .env with EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SOCKET_URL, Clerk keys, etc.
npx expo start
```

---

## 🔒 Security Implementation

* **Authentication:** Clerk for initial OAuth/Google Login -> Custom JWT generation for API/Socket access.
* **Resilient Token Refresh:** Axios interceptors handle 401s gracefully, queueing concurrent requests while a single refresh token request is made.
* **Spring Boot Rate Limiting:** Custom `OncePerRequestFilter` limits login attempts per IP to prevent brute-force attacks.
* **Socket Auth:** Node.js Socket server validates JWT via Spring Boot API before allowing room joins or message emissions.
* **Input Sanitization:** Backend utilities strip malicious inputs before database insertion.

---

## 🔮 Future Enhancements

* 📹 Video consultation support (WebRTC)
* 🤖 AI-assisted doctor recommendations and symptom checker
* 📂 Medical report and prescription management
* ⏰ Smart appointment reminder system (Twilio/FCM)
* 🐳 Dockerization for seamless deployment

---

## 💼 Business Purpose

CareFlow is designed as a scalable, production-ready healthcare solution intended for real-world business environments, clinics, and telemedicine startups.

---

## 👨‍💻 Author

**Haritha Perera**

---

## 📄 License

All rights reserved. This project is developed for business and portfolio purposes.
```
