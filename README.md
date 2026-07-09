# Prept — AI-Powered Mock Interview Platform

Prept is a modern web application that connects software engineering candidates with senior experts for live, 1:1 mock interviews. The platform features an AI co-pilot, automatic call recording & transcriptions, and automated evaluation reports to accelerate interview preparation.

---

## 🚀 Key Features

*   **Dual-Role Dashboard**: Users onboard as either **Interviewees** (candidates preparing for calls) or **Interviewers** (experts hosting sessions).
*   **Availability & Slot Booking**: Interviewers set their open schedules, and candidates can easily browse and book slots.
*   **Virtual Zoom-like Call Rooms**: Integrated audio, video, screen sharing, and recording powered by **GetStream Video SDK**.
*   **Live AI Co-pilot**: Interviewers can generate tailored technical questions and model answers on demand during the interview using **Google Gemini AI**.
*   **Automated AI Feedback Report**: Once the call concludes, an automated transcript is parsed and analyzed by Gemini to generate structured feedback scoring candidate technical abilities and communication styles.
*   **Credit System**: Features monthly subscription plans (Free, Starter, Pro) with automated balance updates and cash-out payout requests for interviewers.
*   **Security Controls**: Rate-limiting and route protection secured by **Arcjet**.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 16 (App Router, Turbopack, React 19)
*   **Backend**: Server Actions & Next.js API Routes
*   **Database**: PostgreSQL with Prisma ORM
*   **Auth**: Clerk (User accounts and plan state hooks)
*   **Communication**: GetStream (Video & Chat)
*   **AI Engine**: Google Gemini AI API (`gemini-flash-latest`)
*   **Notifier**: Resend Email Delivery

---

## ⚙️ Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database Connection
DATABASE_URL="postgresql://username:password@host:port/dbname?pgbouncer=true"
DIRECT_URL="postgresql://username:password@host:port/dbname"

# Arcjet Key
ARCJET_KEY=ajkey_...

# GetStream Video
NEXT_PUBLIC_STREAM_API_KEY=...
STREAM_SECRET_KEY=...

# Gemini AI API
GEMINI_API_KEY=...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PAYOUT_PASSWORD=your_secure_password
```

### 3. Initialize the Database
Run migration files and seed initial records:
```bash
npx prisma db push
node prisma/seed.js
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```

Visit the application at `http://localhost:3000`.
