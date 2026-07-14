# CodePath Learning Backend

Node/Express backend with MongoDB authentication, Razorpay order creation and signature verification, enrollment, receipts, paid-course status, registration verification, and admin routes.

## Local setup

1. Copy `.env.example` to `.env` and add your own private values.
2. Set a strong `JWT_SECRET` and the SMTP variables from `.env.example`.
3. Run:

```bash
npm install
npm run dev
```

## Vercel

- Project: `codepath-learning-api`
- Add every variable from `.env.example` in Vercel Environment Variables.
- Put the exact Vercel frontend URL in `FRONTEND_URL` and `CLIENT_URL`.
- Add the SMTP values from `.env.example` so password reset emails can be sent.

Never expose `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, SMTP credentials, or password hashes in the frontend.
