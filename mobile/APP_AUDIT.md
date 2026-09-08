# CodePath Learning product audit

Audit date: 8 September 2026. The audit was read-only. No website or backend files were changed.

## Existing architecture

The production product is a React/Vite SPA in `frontend`, backed by an Express/Mongoose API in `backend` and deployed separately on Vercel. The web client uses `VITE_API_URL`; production documentation identifies `https://codepath-learning-api.vercel.app/api`. MongoDB is accessed only by Express. Razorpay and manual UPI verification are server-owned.

The website brand uses indigo/violet gradients, white cards, dark slate headings, rounded controls and a beginner-friendly Hindi/English experience. The live home page presents practical courses, live Google Meet classes, notes/assignments, certificates, mentorship, achievements and a Diploma CS/IT government-career guide.

## API and authentication contracts

| Area | Existing API | Mobile use |
|---|---|---|
| Account | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Native account creation, login and session restore |
| Password | `POST /auth/forgot-password`, `POST /auth/reset-password` | Native request; email currently points to the secure website reset page |
| Registration | `POST /registrations`, `GET /registrations/verify/:id` | Website registration retained as the safe purchase entry point |
| Enrolment | `GET /payments/my-courses` | Real active paid-course slugs |
| Resources | `GET /payments/student-resource/:resource` | Server-authorized classroom/WhatsApp/enrolment links |
| Payments | `POST /payments/create-order`, `POST /payments/verify`, manual payment/status and receipt routes | Not embedded in store build; see payment decision below |
| Certificate | `GET /certificates/verify/:certificateId` | Public, genuine verification |
| Achievements | `GET /achievements` | Published achievement posters |
| Feedback | `GET /feedback/me`, `POST /feedback` | Authenticated load/save using backend validation |
| Mentorship | `GET /mentorship/status`, `POST /mentorship/bookings` | Authenticated status/request; 12-digit UTR and server approval rules preserved |
| MSME | `GET /msme` | Public organisation facts (profile currently shows the verified identifier) |

JWTs are signed by the backend, sent as `Authorization: Bearer <token>`, checked by middleware against the user's session version, and restored through `/auth/me`. Mobile stores only the JWT in platform secure storage. Passwords are never persisted by the app.

## Data sources and protected access

The course catalog and syllabi are source-controlled in `frontend/src/data`; there is no public catalog endpoint. Mobile therefore carries a native, reviewed catalog snapshot with the same canonical slugs. Entitlement is never inferred from that catalog: `/payments/my-courses` is authoritative. Protected resource URLs are requested only through `/payments/student-resource/:resource`, whose backend checks active enrolment.

The government-career guide is informational repository data, not a live vacancy feed. Mobile repeats that official notifications must be verified and does not invent vacancies. Achievement posters are loaded from the API. Certificates can be publicly verified, but the backend does not currently expose an authenticated `my certificates` listing.

## Required native screens

Splash/session restore; three-page onboarding; login, account registration and forgot password; student dashboard; course list/details and enrolled learning; authorized resources; certificate verification/details/share/open; careers list/search/detail; mentorship request; achievements; feedback; profile, support, about/policy links and logout; English/Hindi language switching.

## Payment decision

The existing website checkout is unchanged. Digital course purchasing is deliberately isolated from the store build because Apple/Google billing policy review is required. The app opens the official HTTPS registration page for enrolment rather than embedding Razorpay or treating a client callback as payment success. The API remains the only authority for paid access.

## Website-only/admin functionality

Payment and certificate administration, placement approval, achievement management, full receipt administration, MSME certificate documents, and the existing web checkout remain website-only. There is no WebView. External browser use is limited to secure enrolment, policy/about/support, certificate PDFs and authorized external learning resources.

## Known API gaps

There is no API for catalog delivery, announcements, lesson progress, assignments as structured records, or a user's certificate list. The app avoids fake progress and displays only real entitlement/availability. Adding those experiences later should use new backward-compatible endpoints.

