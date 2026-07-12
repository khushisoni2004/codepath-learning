# CodePath Learning - Registration, UPI Payment and Verification

## What works

- Auto registration IDs such as `CPL-REG-2026-00001`
- Single complete learning plan: ₹599
- Your own static payment QR image
- Student UTR submission
- Duplicate UTR protection
- Private admin approval/rejection page
- Public registration verification page
- Local JSON storage, so MongoDB is not required

## 1. Add your payment QR

Keep your payment QR in Downloads with this exact name:

`QR.jpg`

Then double-click `setup-payment-qr.command`, or run:

```bash
cp ~/Downloads/QR.jpg frontend/public/QR.jpg
```

## 2. Start backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and replace the admin key. Then:

```bash
npm run dev
```

Backend: `http://localhost:5001`

## 3. Start frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev -- --port 5174
```

Website: `http://localhost:5174`

## Pages

- Registration: `http://localhost:5174/register`
- Public verification: `http://localhost:5174/verify`
- Private admin payment verification: `http://localhost:5174/admin/verification`

## Correct payment-verification logic

A static UPI QR cannot confirm payment automatically. The student submits a UTR. You check that UTR and amount in your UPI/bank app, then approve it in the private admin page. After approval, the public verification page shows the registration as verified.

Do not approve a payment only because a UTR was entered. Match the UTR, amount and received payment in your own UPI/bank account first.

## Certificate linkage

Keep the registration ID in the backend record. After course completion, issue a separate certificate ID, for example:

- Registration ID: `CPL-REG-2026-00001`
- Certificate ID: `CPL-PY-2026-00001`

The same five-digit serial can link both records.


## Certificate Policy

This is a private course completion certificate issued by CodePath Learning after completion of classes, assignments, practical exercises and final assessment. It is not claimed as a Government, AICTE, University or College-affiliated certificate.

## Current Fee

Complete Learning Plan: ₹599. Includes live Google Meet classes, notes, assignments, practical coding exercises, final assessment and CodePath Learning completion certificate.
