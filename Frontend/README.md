# QuickBite

QuickBite is a full-stack food delivery platform built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

## Highlights

- Fast restaurant discovery and category-based browsing
- Cart, checkout, coupons, and Razorpay payment integration
- Live order flow with OTP delivery verification
- Role-based dashboards for User, Vendor, Admin, and Delivery Partner
- Profile management and location-aware serviceability checks

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Payments: Razorpay

## Project Structure

- Frontend: UI app and role dashboards
- Backend: REST APIs, models, controllers, middlewares

## Local Setup

### 1. Clone and install

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 2. Configure environment variables

Frontend example `.env`:

```bash
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_key_id
```

Backend example `.env`:

```bash
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Run the apps

```bash
cd Backend
npm run dev

cd ../Frontend
npm run dev
```

## Deployment Notes

- Update frontend API URL to your deployed backend using `VITE_API_URL`.
- Keep backend CORS origins aligned with frontend deployment URL.

## Branding

This repository is branded as QuickBite.
