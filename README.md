<div align="center">

# 🌈 CodePath Learning

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=800&size=30&duration=2600&pause=700&color=6C63FF&center=true&vCenter=true&width=820&lines=Learn+%E2%9C%A6+Practice+%E2%9C%A6+Build;Turn+curiosity+into+real+projects;Courses+%7C+Mentorship+%7C+Career+guidance;English+%E2%86%94+%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80+learning+experience" alt="Animated CodePath Learning headline" />

<p><b>A colourful, practical learning platform for the next generation of builders.</b></p>

<a href="https://www.codepathlearning.co.in"><img src="https://img.shields.io/badge/EXPLORE%20LIVE%20SITE-6C63FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Explore live site" /></a>
<a href="https://codepath-learning-api.vercel.app/api/health"><img src="https://img.shields.io/badge/API-ONLINE-00C896?style=for-the-badge&logo=express&logoColor=white" alt="API online" /></a>

<br /><br />
<img src="https://img.shields.io/badge/React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=111827" alt="React and Vite" />
<img src="https://img.shields.io/badge/Express-111827?style=flat-square&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Vercel-F59E0B?style=flat-square&logo=vercel&logoColor=111827" alt="Vercel" />

</div>

> **CodePath Learning** helps students learn programming by building projects, accessing structured courses, joining verified mentorship and exploring real government-career pathways.

## ✨ The experience

| 🎨 Learn | 🧩 Build | 🚀 Grow |
|---|---|---|
| Practical programming courses, syllabus packs and bilingual content | Hands-on projects, assignments and protected student resources | Certificates, feedback, mentorship and career guidance |

## 🪄 Product highlights

<table>
<tr><td><b>🌐 Bilingual by design</b><br/>Switch the complete rendered experience between English and हिन्दी.</td><td><b>💳 Safe payments</b><br/>Server-side Razorpay verification, receipts and manual UPI review.</td></tr>
<tr><td><b>🔐 Secure accounts</b><br/>Bcrypt passwords, sessions and SHA-256 reset-token storage.</td><td><b>🎯 Career pathways</b><br/>Mentorship plus a 50-card Diploma Government Jobs guide.</td></tr>
<tr><td><b>📚 Protected learning</b><br/>Paid-course access controls, resources and certificates.</td><td><b>💬 Student voice</b><br/>Feedback and rating flow for continuous improvement.</td></tr>
</table>

## 🏗️ How it works

~~~mermaid
flowchart LR
  U((Student)) --> W[React + Vite]
  W -->|HTTPS REST + session| A[Express API]
  A --> DB[(MongoDB)]
  A --> P[Razorpay verification]
  A --> M[SMTP reset email]
  W --> V[Vercel CDN]
  A --> F[Vercel Functions]
~~~

## 🧰 Run locally

~~~bash
git clone https://github.com/khushisoni2004/codepath-learning.git
cd codepath-learning
cd backend && npm install && cp .env.example .env.local && npm run dev
# second terminal: cd frontend && npm install && cp .env.example .env.local && npm run dev
~~~

## ✅ Verify before release

~~~bash
cd frontend && npm run build
cd ../backend && npm test
~~~

## 🔒 Public repository safety

Only reusable source code, public assets and documentation belong in GitHub. Never commit .env, .env.local, MongoDB URLs, SMTP passwords, Razorpay secrets, admin keys, sessions, student records or private payment uploads. Production values belong in Vercel environment variables.

## 🌍 Production

- Frontend: [www.codepathlearning.co.in](https://www.codepathlearning.co.in)
- Backend health: [codepath-learning-api.vercel.app/api/health](https://codepath-learning-api.vercel.app/api/health)

<div align="center">

### ⭐ Learn something. Build something. Share something.

<img src="https://capsule-render.vercel.app/api?type=waving&color=6C63FF,00C896,F59E0B&height=110&section=footer" alt="Colourful animated footer" />

</div>
