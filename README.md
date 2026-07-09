# Prept — AI-Powered Mock Interview Platform

Prept is a modern, premium SaaS platform that connects candidates with tech industry experts for 1:1 live mock interviews. The platform is boosted with AI-driven co-piloting, automated transcription processing, instant post-interview feedback analytics, and a secured token-credit checkout ecosystem.

---

## 🏗️ System Architecture & Technology Stack

The application is built on top of a highly responsive, modern stack utilizing the best cloud providers, server-side render paradigms, and AI pipelines:

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19, Server Actions)
*   **Database & ORM**: PostgreSQL database hosted on Supabase, accessed via [Prisma ORM](https://www.prisma.io/)
*   **Authentication**: [Clerk Core](https://clerk.com/) for profile management, authentication overlays, and user context syncing
*   **Real-time Communication**: [GetStream SDK](https://getstream.io/) (Video Call, screen sharing, automatic cloud recording, real-time live chat)
*   **AI Co-Pilot & Diagnostics**: [Google Gemini AI API](https://ai.google.dev/) (`gemini-flash-latest` model) for interview question drafting and automated candidate feedback reports
*   **Security & Gatekeeping**: [Arcjet Protection](https://arcjet.com/) (Token Bucket rate limiter, bot protection, and request security)
*   **Email Engine**: [Resend](https://resend.com/) with [React Email](https://react.email/) integrations
*   **UX Design**: Vanilla CSS controls over Tailwind CSS, Radix UI (shadcn/ui), and premium elements powered by Framer Motion (`motion`)

---

## 🎨 Visual Preview of Architecture Flowcharts

### 🕹️ 1. User Synchronization & Role Onboarding
Whenever a user authenticates, Prept syncs their record to the database, determines their active plan, and routes them to specify their role:

```mermaid
graph TD
    A[User Authenticated in Clerk] --> B{User Record Exists in DB?}
    B -- No --> C[Create DB User Profile & Sync Data]
    B -- Yes --> D{Current Plan Changed or New Month?}
    D -- Yes --> E[Update Plan & Allocate Monthly Credits]
    D -- No --> F[Fetch Existing User Profile]
    C --> G{Has Selected User Role?}
    F --> G
    G -- "Unassigned (Redirect to /onboarding)" --> H[User Selects Role: Interviewer vs. Interviewee]
    H -- Interviewer --> I[Submit Company, Title, Exp, Specialties, Set Initial Available Hours]
    H -- Interviewee --> J[Redirect to Explore Interviewers / Start Booking]
    G -- Assigned --> K[Redirect to Home/Dashboard based on Role]
```

### 📅 2. Slot Picker & Session Reservation Flow
```mermaid
sequenceDiagram
    autonumber
    actor Interviewee
    participant App as Web Frontend
    participant Server as Server Actions (booking.js)
    participant Direct as GetStream SDK
    participant DB as PostgreSQL (Supabase)

    Interviewee->>App: Visit Interviewer Profile & Select Slot
    App->>Server: Click Book Slot (interviewerId, startTime, endTime)
    Note over Server: Arcjet validates rate limiter for booking API
    Server->>DB: Check for double booking conflicts & balance
    alt Has insufficient credits or time conflict
        DB-->>Server: Error thrown back
        Server-->>App: Display booking error feedback
    else Has credits & slot is open
        Server->>Direct: Register users & initialize video call
        Direct-->>Server: Return StreamCallId
        Server->>DB: Start ACID Transaction
        Note over DB: Deduct interviewee credits
        Note over DB: Increment interviewer balance
        Note over DB: Insert Booking & Credit Transaction Records
        DB-->>Server: Commit Transaction
        Server-->>App: Confirm booking & Redirect to Appointments
    end
```

### 🎙️ 3. Webhook Integration & Gemini Feedback Pipeline
Once a call starts, Stream records and transcribes the conversation. When the call ends, Stream dispatches hook payloads to process the feedback:

```mermaid
sequenceDiagram
    autonumber
    participant Stream as Stream CDN Hook
    participant Webhook as API Route (/api/webhooks/stream)
    participant Gemini as Google Gemini API (gemini-flash-latest)
    participant DB as PostgreSQL

    Stream->>Webhook: Event: call.recording_ready (with URL)
    Webhook->>DB: Update Booking with raw recordingUrl
    Stream->>Webhook: Event: call.transcription_ready (with JSONL CDN link)
    Webhook->>Webhook: Fetch speech JSONL + parse dialogue exchanges
    Webhook->>Gemini: Send prompt, roles, specialties + final transcript text
    Note over Gemini: Gemini evaluates technical skills, communication, problem-solving
    Gemini-->>Webhook: Return structured JSON (scores, strengths, recommendation)
    Webhook->>DB: Upsert Feedback Report & update status to 'COMPLETED'
    Webhook->>DB: Generate 'BOOKING_EARNING' CreditTransaction
```

---

## 🗄️ Database Schema Design

The datastore structure defines how users, slot options, bookings, transactions, and payouts relate:

```prisma
enum UserRole {
  INTERVIEWEE
  INTERVIEWER
  UNASSIGNED
}

enum InterviewCategory {
  FRONTEND
  BACKEND
  FULLSTACK 
  DSA
  SYSTEM_DESIGN
  BEHAVIORAL
  PRODUCT_DESIGN
  DEVOPS
  MOBILE
}

model User {
  id                     String             @id @default(uuid())
  clerkUserId            String             @unique
  email                  String             @unique
  name                   String?
  imageUrl               String?
  role                   UserRole           @default(UNASSIGNED)
  createAt               DateTime           @default(now())
  updateAt               DateTime           @updatedAt

  // Interviewee Parameters
  credits                Int                @default(0)
  currentPlan            String             @default("free")
  creditsLastAllocatedAt DateTime?

  // Interviewer Parameters
  bio                    String?
  title                  String?
  company                String?
  yearsExp               String?
  categories             InterviewCategory[]
  creditRate             Int                @default(1)
  creditBalance          Int                @default(0)

  availabilities         Avaliability[]
  bookingAsInterviewer   Booking[]          @relation("InterviewerBookings")
  bookingAsInterviewee   Booking[]          @relation("IntervieweeBookings")
  transactions           CreditTransaction[]
  payouts                Payout[]
}

model Avaliability {
  id            String             @id @default(uuid())
  interviewerId String
  interviewer   User               @relation(fields: [interviewerId], references: [id], onDelete: Cascade)
  startTime     DateTime
  endTime       DateTime
  status        AvaliabilityStatus @default(AVAILABLE)

  @@index([interviewerId, startTime])
}

model Booking {
  id             String            @id @default(uuid())
  intervieweeId  String
  interviewee   User              @relation("IntervieweeBookings", fields: [intervieweeId], references: [id])
  interviewerId  String
  interviewer    User              @relation("InterviewerBookings", fields: [interviewerId], references: [id])
  startTime      DateTime
  endTime        DateTime
  status         BookingStatus     @default(SCHEDULED)
  creditsCharged Int
  streamCallId   String?           @unique
  recordingUrl   String?
  feedback       Feedback?
  transactions   CreditTransaction[]
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

model Feedback {
  id             String         @id @default(uuid())
  bookingId      String         @unique
  booking        Booking        @relation(fields:[bookingId], references:[id], onDelete: Cascade)
  summary        String         @db.Text
  technical      String         @db.Text
  communication  String         @db.Text
  problemSolving String         @db.Text
  recommendation String
  strengths      String[]
  improvements   String[]
  overallRating  FeedbackRating
  createdAt      DateTime       @default(now())
}
```

---

## 📂 Core Functional Modules & File Mapping

### 1. Booking Operations (`/actions/booking.js`)
*   Manages server processes behind checking interviewer schedules and locking in reservations.
*   Enforces concurrency checking to verify that no two candidates attempt to hook the same slot at the exact same millisecond.
*   Integrates Clerk accounts with `StreamClient` to instantiate host permissions and recording configs inside Stream.

### 2. Live Video Callroom (`/app/(main)/call/[callId]`)
*   Instantiates real-time chat hooks, call layouts, speaker detection cards, and screen sharing buttons via `@stream-io/video-react-sdk`.
*   Includes the **AI technical co-pilot panel** (`AIQuestions.jsx`), allowing interviewers to request live generated questions and answers specific to their selection.

### 3. Payout Management (`/actions/payout.js` & `/app/(main)/payout/[id]`)
*   Provides structured forms for interviewers to cash out accrued credits at a valuation of `$5 per credit` (after applying a standard 20% platform fee).
*   Requests trigger non-blocking admins notifications using Resend templates (`/emails/WithdrawalRequestEmail`).
*   Admin review portal enforces server-side password authentication checks to update payout statuses from `PROCESSING` to `PROCESSED`.

### 4. Security & Rate-Limiter (`/lib/arcjet.js`)
*   Applies token bucket algorithms using the candidate's unique Clerk user identifiers.
*   Defines limits on crucial endpoints (e.g. rate-limit bookings to 5 per hour, and withdrawals to 3 per hour).

---

## 🛠️ Installation & Setup Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and a running [PostgreSQL](https://www.postgresql.org/) database.

### 1. Clone the project and install package scripts
```bash
npm install
```

### 2. Set up environment variables
Create a `.env` file in the root directory:
```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database Connection Keys
DATABASE_URL="postgresql://username:password@host:port/dbname?pgbouncer=true"
DIRECT_URL="postgresql://username:password@host:port/dbname"

# Arcjet Security credentials
ARCJET_KEY=your_arcjet_key

# GetStream API Credentials
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Gemini Generative AI Credentials
GEMINI_API_KEY=your_gemini_api_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_PAYOUT_PASSWORD=your_secure_admin_approval_password
RESEND_API_KEY=your_resend_api_key
```

### 3. Seed Database & Generate Client
```bash
npx prisma db push
node prisma/seed.js
npx prisma generate
```

### 4. Run locally
```bash
npm run dev
```

The application will start running on [http://localhost:3000](http://localhost:3000).

---
*Created and maintained by [Shubham](https://github.com/Shubham).*
