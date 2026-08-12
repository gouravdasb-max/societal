# Societal — Society Management Platform

A full-stack society management web application that empowers residential communities with digital tools for communication, administration, security, and billing. Built with a modern **React + Vite** frontend and a robust **Node.js + Express** REST API backend, connected by **MongoDB** and real-time **Socket.IO** chat.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [User Roles](#-user-roles)
- [Security](#-security)
- [UI / Design System](#-ui--design-system)
- [License](#-license)

---

## Features

### Progressive Web App (PWA)
- **Installable** — The platform functions purely natively as an installable Progressive Web App on mobile (iOS/Android) and Desktop (macOS/Windows).
- **Service Workers** — Caches critical UI shell architecture for remarkably fast loading speeds.
- **Custom Install Hook** — Utilizes a dedicated `usePWA.js` React hook to intercept browser installation mechanics, allowing users to install the app natively via a persistent, elegant sidebar button (`Install App`) rather than intrusive popups.

### Authentication & Authorization
- **Email/Password Registration** with email verification (token-based via Brevo).
- **JWT dual-token auth** — short-lived access tokens + long-lived refresh tokens stored in HTTP-only cookies.
- **Role-based access control** — Admin, Resident, and Guard roles with dedicated dashboards.
- **Admin approval gate** — new resident accounts require admin approval before login.
- **Forgot/Reset password** using OTP sent via email (rate-limited to prevent brute force).
- **Admin Multi-Factor Auth (MFA)** — OTP cryptographically enforces safety sequentially during Admin Logins and Destroy Society actions.
- **Admin can create Guard accounts** directly without self-registration.

### User Profile Management
- **Edit Profile** — update name, phone number, and avatar.
- **Cloudinary avatar uploads** via `multer` + Cloudinary SDK.
- **Immutable flat number** — only admin can change a resident's flat assignment.
- **Leave Society** — residents can delete their own account.
- **Data Snapshotting** — Employs intelligent Mongoose Interceptors to retain historic gate passes and bills for leaving residents, gracefully wiping their primary PII references.
- **Destroy Society (Admin)** — secured by OTP MFA, admins can irreversibly delete the entire society and cascade-wipe all related data (users, bills, passes, polls, messages, events, etc).

### Announcements
- **Admin creates** society-wide announcements.
- **Residents view** a chronological announcements feed.

### Venue Booking
- **Admin manages venues** (create, update, delete community facilities).
- **Residents browse venues** and submit booking requests with date/time.
- **Admin approval workflow** — approve or reject bookings.
- **Residents can cancel** their own pending bookings.

### Gate Pass System
- **QR-code-powered** digital gate passes with Cloudinary-hosted QR images.
- **Validity date range** — `validFrom` / `validTo` with a max limit of **30 days**.
- **Server-side validation** — no past dates, automatic expiry detection.
- **Guard verification** — guards scan QR codes via camera or upload a QR image, or manually enter the pass ID.
- **Status tracking** — active → used / expired / cancelled.
- **Guard scan history** with date filtering.

### Real-Time Community Chat
- **Socket.IO-powered** live messaging scoped per society.
- **JWT-authenticated WebSocket** connections (cookie or header token).
- **Interactive Multi-User Typing** — Custom animated real-time tracking when several users are actively composing messages (e.g. "Alice and Bob are typing...").
- **Day dividers** and chronological message history.
- **Avatar support** — user avatars render next to messages.

### Complaints
- **Residents file complaints** categorized by type (plumbing, electrical, security, cleanliness, other).
- **Image attachments** via Cloudinary.
- **Admin manages** complaint status (open → in_progress → resolved) and can respond.

### Community Polls
- **Admin creates polls** with multiple options and optional expiry dates.
- **Residents vote** (one vote per user, enforced server-side).
- **Live vote counts** with animated progress bars.
- **Admin can close** polls manually.

### Events & Calendar
- **Admin creates** community events (festivals, meetings, maintenance schedules).
- **Calendar view** with interactive date cells showing event indicators.
- **Category-based** color coding.

### Billing & Payments
- **Admin generates bills** per resident (maintenance fees, utilities, etc).
- **Native UPI Integration** — Admins configure a society-specific UPI ID. Residents pay externally and submit their UTR/Transaction ID for manual admin approval.
- **Status tracking** — pending / verification_pending / paid / overdue with color-coded pills.
- **Expense tracking** — admin logs society expenses for transparency.

### Resident Directory
- **Searchable directory** of all approved residents.
- **Shows** name, flat number, phone, and avatar.
- **Sanitized search** — regex-escaped queries to prevent injection.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component library |
| **Vite 5** | Build tool & dev server (HMR) |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client with interceptors for token refresh |
| **Socket.IO Client** | Real-time WebSocket communication |
| **QRCode** | Client-side QR code generation |
| **jsQR** | Client-side QR code decoding (guard scanner) |
| **Vite PWA** | Progressive Web App manifest & service worker |
| **Vanilla CSS** | Custom design system (no Tailwind until now; would be replaced with tailwind  in future) |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB + Mongoose 9** | Database & ODM |
| **Socket.IO** | Real-time bidirectional communication |
| **JSON Web Tokens** | Authentication (access + refresh tokens) |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Cloudinary** | Cloud image storage (avatars, QR codes, complaint images) |
| **Brevo REST API** | HTTP-based Email delivery (verification, passwords, MFA) — bypassing cloud provider SMTP firewalls |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | Brute force protection |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **QRCode** | Server-side QR code generation |

---

## Architecture

```
┌─────────────────┐        ┌─────────────────┐        ┌──────────────┐
│   React + Vite  │◄──────►│  Express API    │◄──────►│   MongoDB    │
│   (Port 5173)   │  REST  │  (Port 8000)    │        │              │
│                 │◄──────►│                 │        └──────────────┘
│                 │  WS    │  Socket.IO      │
└─────────────────┘        │                 │◄──────►┌──────────────┐
                           │  Multer         │        │  Cloudinary  │
                           └─────────────────┘        └──────────────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │ Brevo REST   │
                           │ API (HTTP)   │
                           └──────────────┘
```

---

## Project Structure

```
societal/
├── backend/
│   ├── .env.sample
│   ├── package.json
│   ├── public/                     # Static file directory
│   └── src/
│       ├── index.js                # HTTP + Socket.IO server bootstrap
│       ├── app.js                  # Express app configuration & route mounting
│       ├── constants.js
│       ├── db/                     # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js          # Register, login, verify, reset, guard creation
│       │   ├── user.controller.js          # Profile CRUD, avatar, directory, delete/cascade
│       │   ├── announcement.controller.js
│       │   ├── bill.controller.js
│       │   ├── booking.controller.js
│       │   ├── chat.controller.js
│       │   ├── complaint.controller.js
│       │   ├── event.controller.js
│       │   ├── expense.controller.js
│       │   ├── gatepass.controller.js      # Create, scan, cancel, guard history
│       │   ├── poll.controller.js
│       │   └── venue.controller.js
│       ├── models/
│       │   ├── user.model.js               # User schema (roles, JWT methods, bcrypt)
│       │   ├── society.model.js            # Society with invite code
│       │   ├── announcement.model.js
│       │   ├── bill.model.js
│       │   ├── booking.model.js
│       │   ├── complaint.model.js
│       │   ├── event.model.js
│       │   ├── expense.model.js
│       │   ├── gatepass.model.js           # Validity range + 30-day max validation
│       │   ├── message.model.js
│       │   ├── poll.model.js
│       │   └── venue.model.js
│       ├── middlewares/
│       │   ├── auth.middleware.js           # JWT verification
│       │   ├── admin.middleware.js          # Admin role guard
│       │   ├── guard.middleware.js          # Guard role guard
│       │   ├── rateLimiter.middleware.js    # Auth, OTP, and general rate limiters
│       │   ├── multer.middleware.js         # File upload config
│       │   └── error.middleware.js          # Centralized error handler
│       ├── routes/                          # 12 route files mirroring controllers
│       ├── sockets/
│       │   └── chat.socket.js              # Real-time chat with JWT auth
│       └── utils/
│           ├── asyncHandler.js
│           ├── ApiError.js
│           ├── ApiResponse.js
│           ├── cloudinary.js
│           ├── email.js                    # Brevo API automated HTTP fetcher
│           └── qrCode.js                   # QR generation + Cloudinary upload
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                         # Router with role-based route guards
│       ├── index.css                       # Complete design system (~2400 lines)
│       ├── context/
│       │   └── AuthContext.jsx             # Global auth state, login/logout/register
│       ├── hooks/
│       │   └── usePWA.js                   # Intercepts beforeinstallprompt for persistent App Install
│       ├── services/
│       │   ├── api.js                      # Axios instance with token interceptors
│       │   └── socket.js                   # Socket.IO client connection manager
│       ├── components/
│       │   ├── AppLayout.jsx               # Sidebar + mobile nav + app install trigger
│       │   ├── MobileSidebar.jsx           # Responsive mobile navigation drawer
│       │   ├── ProtectedRoute.jsx          # Auth + role guards for routes
│       │   ├── ImageModal.jsx              # Global React Portal for full-screen photo zooming
│       │   ├── BookingCard.jsx
│       │   ├── AnnouncementCard.jsx
│       │   ├── VenueCard.jsx
│       │   └── Loader.jsx
│       └── pages/                          # 31 page components
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── VerifyEmail.jsx
│           ├── ForgotPassword.jsx
│           ├── ChangePassword.jsx
│           ├── EditProfile.jsx             # Profile + avatar + leave/destroy society
│           ├── ResidentDashboard.jsx
│           ├── Announcements.jsx
│           ├── Venues.jsx
│           ├── MyBookings.jsx
│           ├── MyBills.jsx                 # Payment simulation flow
│           ├── Complaints.jsx
│           ├── Chat.jsx                    # Real-time Socket.IO chat
│           ├── Polls.jsx
│           ├── Events.jsx
│           ├── GatePasses.jsx              # QR code display + date range validity
│           ├── Directory.jsx               # Searchable resident directory
│           ├── AdminDashboard.jsx
│           ├── AdminResidents.jsx
│           ├── AdminAnnouncements.jsx
│           ├── AdminVenues.jsx
│           ├── AdminBookings.jsx
│           ├── AdminComplaints.jsx
│           ├── AdminPolls.jsx
│           ├── AdminEvents.jsx
│           ├── AdminGatePasses.jsx
│           ├── AdminExpenses.jsx
│           ├── AdminBilling.jsx
│           ├── GuardDashboard.jsx
│           ├── GuardScanPass.jsx           # Camera / image / manual QR verification
│           └── NotFound.jsx
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **Cloudinary** account (free tier works)
- **Gmail** account with an [App Password](https://myaccount.google.com/apppasswords) for email functionality

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd societal
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.sample .env
# Fill in all values in .env (see "Environment Variables" section below)
npm run dev
```

The backend starts on **http://localhost:8000**.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**.

---

## Environment Variables

Create a `backend/.env` file based on `.env.sample`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `8000` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017` |
| `ACCESS_TOKEN_SECRET` | JWT signing secret (access) | Random 64+ char string |
| `ACCESS_TOKEN_EXPIRY` | Access token TTL | `1d` |
| `REFRESH_TOKEN_SECRET` | JWT signing secret (refresh) | Random 64+ char string |
| `REFRESH_TOKEN_EXPIRY` | Refresh token TTL | `10d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdef...` |
| `ADMIN_SIGNUP_CODE` | Secret code required for admin registration | `MY_SECRET_CODE` |
| `BREVO_API_KEY` | Brevo REST API Key | `xkeysib-123456...` |
| `GMAIL_USER` | Verified Brevo sender email address | `you@gmail.com` |
| `CLIENT_URL` | Frontend URL (used in email links) | `http://localhost:5173` |

Frontend `.env`:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## API Reference

All routes are prefixed with `/api/v1`.

### Auth (`/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register resident or admin |
| POST | `/login` | — | Login and receive tokens |
| POST | `/refresh-token` | — | Refresh access token |
| POST | `/verify-email` | — | Verify email with token |
| POST | `/resend-verification` | — | Resend verification email |
| POST | `/forgot-password` | — | Request password reset OTP |
| POST | `/reset-password` | — | Reset password using OTP |
| POST | `/logout` | JWT | Invalidate refresh token |
| GET | `/me` | JWT | Get current user info |
| POST | `/create-guard` | JWT + Admin | Create a guard account |

### Users (`/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | JWT | Get own profile |
| PATCH | `/profile` | JWT | Update name & phone |
| DELETE | `/profile` | JWT | Leave/destroy society |
| PATCH | `/avatar` | JWT | Upload profile picture |
| GET | `/directory` | JWT | Search resident directory |
| GET | `/residents` | JWT + Admin | List all residents |
| PATCH | `/residents/:userId/approve` | JWT + Admin | Approve resident |
| DELETE | `/residents/:userId` | JWT + Admin | Remove resident |

### Gate Passes (`/gatepasses`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Create gate pass with QR |
| GET | `/mine` | JWT | Get your passes |
| PATCH | `/mine/:id/cancel` | JWT | Cancel your pass |
| GET | `/all` | JWT + Admin | All society passes |
| PATCH | `/:id/status` | JWT + Admin | Update pass status |
| POST | `/scan/pass` | JWT + Guard | Verify & mark pass as used |
| GET | `/scan/history` | JWT + Guard | Guard's scan history |

### Announcements, Venues, Bookings, Complaints, Polls, Events, Expenses, Bills, Chat
Each follows standard REST patterns — see source route files in `backend/src/routes/`.

---

## User Roles

| Role | Dashboard | Key Capabilities |
|---|---|---|
| **Admin** | `/admin` | Full CRUD on all modules, approve/remove residents, create guards, generate bills, manage polls/events/venues, destroy entire society |
| **Resident** | `/dashboard` | View announcements, book venues, file complaints, vote on polls, request gate passes, pay bills, chat |
| **Guard** | `/guard` | Scan and verify gate passes (QR / camera / manual), view scan history |

---

## Security

| Measure | Details |
|---|---|
| **Helmet** | Strict CSP, XSS protection, no `X-Powered-By` |
| **Rate Limiting** | Auth routes: 20 req/15 min · OTP routes: 5 req/10 min · General API: 120 req/min |
| **Password Hashing** | bcrypt with 10 salt rounds |
| **JWT Authentication** | Access tokens (1d) + Refresh tokens (10d) in HTTP-only cookies |
| **NoSQL Injection** | Sanitized via `express-mongo-sanitize` |
| **Input Sanitization** | Regex-escaped search queries, trimmed inputs, field whitelisting |
| **CORS** | Restricted to frontend origin only |
| **File Uploads** | Multer with file type validation |

---

## UI / Design System

The application uses a fully custom CSS design system (**~2400 lines**) with:

- **Theme**: Dark green aesthetic with neon green accents (`#59ff8a`), golden yellows (`#ffbe0b`), and soft pastels.
- **Typography**: Space Grotesk (display) + Inter (body) + IBM Plex Mono (code/data) via Google Fonts.
- **Cards**: Glassmorphic surfaces with subtle shimmer overlays.
- **Buttons**: Gradient primary CTAs with glow effects and micro-animations.
- **Forms**: Styled inputs with inset shadows, 3D-style bottom borders, and animated focus states.
- **Dropdowns**: Custom-styled `<select>` with SVG chevron arrow matching the theme.
- **Status Pills**: Color-coded badges  — green (success/active), yellow (pending/warning), red (rejected/danger).
- **Responsive**: Full mobile support with a hamburger-triggered sidebar drawer.
- **Animations**: `float-in` entrance, `spin` loader, `pulse` live indicator.

---

## License

This project is provided as-is for educational and personal use.
