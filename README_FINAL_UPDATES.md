# CodePath Learning - Professional Startup Update

This updated package includes the requested professional startup additions:

## Added / Updated

1. Certificate Policy page
   - URL: `/certificate-policy`
   - Explains certificate issued by partner computer center and training conducted by CodePath Learning.
   - Includes transparent disclaimer: private skill-based completion certificate, not Government/AICTE/UGC/University/Board certificate.

2. Partner Computer Center section
   - Added to About page.
   - Explains role of CodePath Learning and partner computer center.

3. Final certificate sample
   - File: `frontend/public/resources/certificates/partner-certificate-sample.png`
   - Website link available from Certificate Policy page.

4. Course-wise PDF syllabus
   - Folder: `frontend/public/resources/syllabus/`
   - Includes individual PDF for each course and combined syllabus pack.

5. First batch poster + WhatsApp message
   - Poster: `frontend/public/resources/posters/first-batch-poster.png`
   - Message: `frontend/public/resources/posters/whatsapp-message.txt`

## Important Environment Note

The backend `.env` has been sanitized in this zip for safety.
Before running backend, update:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string_here
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Build Frontend

```bash
cd frontend
npm run build
```

## Deploy Frontend

```bash
cd frontend
vercel --prod
```

## Run Backend

```bash
cd backend
npm install
npm start
```
