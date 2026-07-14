# CodePath Learning Frontend

React + Vite frontend with backend Email/Password Authentication. Password hashes, sessions, reset tokens, Razorpay verification, enrollment, receipts, paid-course status, certificates, and database operations remain on the backend.

## Local setup

1. Copy `.env.example` to `.env` and add the backend URL.
2. Run:

```bash
npm install
npm run dev
```

## Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add all `VITE_*` values from `.env.example`.
- Set `VITE_API_URL` to the deployed `codepath-learning-api` Vercel URL. Do not use localhost in production.
