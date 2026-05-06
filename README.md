# FiberMarket

A B2B marketplace connecting raw material suppliers (herders, farmers, small mills) directly with clothing manufacturers and fashion brands.

## Overview

FiberMarket enables:
- **Suppliers** to list raw materials (wool, alpaca, linen, silk, leather, cashmere, cotton) with full traceability
- **Buyers** to browse, filter, sample, and order directly — with escrow-protected payments
- **Multilingual UI** (EN, FR, AR, ES) with RTL support for Arabic
- **Stripe escrow flow** — funds are authorized but not captured until delivery is confirmed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS (TypeScript) |
| Backend | Node.js + Express (TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (7-day tokens) |
| Payments | Stripe (manual capture / escrow) |
| Maps | OpenStreetMap via Leaflet.js |
| i18n | react-i18next (EN, FR, AR, ES) |
| File storage | Local disk (multer) |

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 running locally (or a connection string)
- A Stripe account (test keys are fine)

---

## Installation

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# Backend
cp .env.example .env
# Edit .env and set DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, etc.

# Frontend
cp .env.example .env
# Set VITE_STRIPE_PUBLISHABLE_KEY
```

> **Root `.env.example`** shows all backend variables.
> **`frontend/.env.example`** shows the single frontend variable.

### 3. Database setup

```bash
cd backend

# Create and apply migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Seed the database

```bash
npm run db:seed
```

This creates:
- 3 supplier accounts with full profiles + realistic listings
- 3 buyer accounts
- 8 listings (alpaca, wool, linen)
- 3 orders, reviews, messages, sample requests

**Test credentials** (all use `password123`):

| Role | Email |
|---|---|
| Supplier | `alejandro@andes-alpaca.com` |
| Supplier | `fatima@atlas-wool.ma` |
| Supplier | `jean@lin-normand.fr` |
| Buyer | `nora@ecothreads.com` |
| Buyer | `kai@urbanweave.jp` |
| Buyer | `amara@labelamara.com` |

---

## Running the dev server

Open two terminals:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Then open **http://localhost:5173**

The Vite dev server proxies `/api` and `/uploads` to the backend automatically.

---

## Folder structure

```
FiberMarket/
├── .env.example              # Backend env template
├── README.md
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # All database models
│   │   └── seed.ts           # Realistic seed data
│   ├── src/
│   │   ├── index.ts          # Express app entry point
│   │   ├── lib/
│   │   │   ├── prisma.ts     # Prisma client singleton
│   │   │   └── stripe.ts     # Stripe client
│   │   ├── middleware/
│   │   │   ├── auth.ts       # JWT authentication
│   │   │   └── upload.ts     # Multer image upload
│   │   ├── routes/
│   │   │   ├── auth.ts       # /api/auth/*
│   │   │   ├── listings.ts   # /api/listings/*
│   │   │   ├── orders.ts     # /api/orders/*
│   │   │   ├── samples.ts    # /api/samples/*
│   │   │   ├── messages.ts   # /api/messages/*
│   │   │   ├── reviews.ts    # /api/reviews/*
│   │   │   └── users.ts      # /api/suppliers/:id, /api/profile
│   │   └── types/
│   │       └── index.ts      # AuthRequest interface
│   └── package.json
│
└── frontend/
    ├── .env.example          # VITE_STRIPE_PUBLISHABLE_KEY
    ├── index.html
    ├── src/
    │   ├── api/
    │   │   └── client.ts     # Axios API client (all endpoints)
    │   ├── components/
    │   │   ├── FilterSidebar.tsx
    │   │   ├── ImageGallery.tsx
    │   │   ├── ListingCard.tsx
    │   │   ├── MapEmbed.tsx   # Leaflet.js map
    │   │   ├── MaterialBadge.tsx
    │   │   ├── MessageThread.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── OrderStatusTimeline.tsx
    │   │   ├── SampleRequestModal.tsx
    │   │   ├── SourceCard.tsx # Traceability block
    │   │   ├── StarRating.tsx
    │   │   └── VerifiedBadge.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── i18n/
    │   │   ├── index.ts
    │   │   └── locales/      # en.json, fr.json, ar.json, es.json
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Listings.tsx
    │   │   ├── ListingDetail.tsx
    │   │   ├── SupplierProfile.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── Messages.tsx
    │   │   ├── OrderDetail.tsx
    │   │   └── dashboard/
    │   │       ├── SupplierDashboard.tsx
    │   │       └── BuyerDashboard.tsx
    │   └── types/
    │       └── index.ts      # Shared TypeScript types
    └── package.json
```

---

## Key features

### Stripe Escrow Flow
1. Buyer places order → `POST /api/orders` creates a `PaymentIntent` with `capture_method: "manual"`
2. Buyer pays via Stripe Elements on the listing detail page
3. Supplier marks order as `SHIPPED` in their dashboard
4. Buyer confirms delivery → `POST /api/orders/:id/confirm-delivery` calls `stripe.paymentIntents.capture()`
5. Funds are released to supplier

### Source Card (Traceability)
Every listing detail page shows a **Source Card** with:
- Supplier name, photo, farm name
- Location on an OpenStreetMap/Leaflet map (no API key required)
- Farming practice (Organic / Conventional / Free-range)
- Certifications (GOTS, RWS, Fairtrade, etc.)
- Member since, completed orders, average rating

### Multilingual (i18n)
- English, French, Arabic (with RTL layout), Spanish
- Language switcher in the navbar
- Browser language detection on first visit

### Mobile-first
- All pages responsive down to 375px
- Image upload supports camera capture on mobile
- Collapsible filter sidebar on mobile

---

## API reference (summary)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register supplier or buyer |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/listings | — | Browse listings (filterable) |
| GET | /api/listings/:id | — | Single listing |
| POST | /api/listings | SUPPLIER | Create listing |
| PUT | /api/listings/:id | owner | Update listing |
| DELETE | /api/listings/:id | owner | Delete listing |
| POST | /api/listings/:id/images | owner | Upload images |
| POST | /api/orders | BUYER | Create order + PaymentIntent |
| GET | /api/orders | JWT | My orders |
| GET | /api/orders/:id | JWT | Order detail |
| PATCH | /api/orders/:id/status | JWT | Update status |
| POST | /api/orders/:id/confirm-delivery | BUYER | Release escrow |
| POST | /api/samples | BUYER | Request sample |
| GET | /api/samples | JWT | My sample requests |
| PATCH | /api/samples/:id/status | JWT | Accept/ship/receive sample |
| GET | /api/messages | JWT | Conversation list |
| GET | /api/messages/:userId | JWT | Thread with user |
| POST | /api/messages | JWT | Send message |
| PATCH | /api/messages/read/:userId | JWT | Mark as read |
| POST | /api/reviews | JWT | Submit review |
| GET | /api/reviews/:userId | — | Reviews for user |
| GET | /api/suppliers/:id | — | Public supplier profile |
| PUT | /api/profile | JWT | Update profile |
| POST | /api/profile/avatar | JWT | Upload avatar |
