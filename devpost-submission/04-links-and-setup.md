# CandidateIQ — Submission Links & Local Setup Guide

## 1. Project Resource Links

* **GitHub Repository**: [https://github.com/sakthirithan/ai_interview_platform.git](https://github.com/sakthirithan/ai_interview_platform.git)
* **Live Demo**: `[INSERT VERIFIED DEPLOYMENT URL OR MARK UNAVAILABLE]`
* **Demo Video**: `[INSERT PUBLIC YOUTUBE/VIMEO DEMO VIDEO URL]`
* **Documentation**: Included in repository [`README.md`](file:///d:/Mini-Project/README.md) and [`SOFTWARE_REQUIREMENTS_SPECIFICATION.md`](file:///d:/Mini-Project/SOFTWARE_REQUIREMENTS_SPECIFICATION.md)

---

## 2. Verified Local Setup Instructions

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher
* **MongoDB**: Active MongoDB Atlas connection URI or local MongoDB daemon
* **API Keys**:
  * Google Gemini API Key (`GEMINI_API_KEY`)
  * Groq API Key (`GROQ_API_KEY`)
  * Resend Email API Key (`RESEND_API_KEY`) *(Optional for email dispatch)*

---

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/sakthirithan/ai_interview_platform.git
cd ai_interview_platform
```

#### 2. Configure Server Environment Variables
Navigate to the `server/` directory and create a `.env` file based on `.env.example`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/candidateiq
JWT_SECRET=super_secret_jwt_key_for_ai_recruitment_platform_2026

# AI LLM Provider Keys
GEMINI_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Notification Provider
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM_NAME=CandidateIQ Interviews
EMAIL_FROM_ADDRESS=onboarding@resend.dev
```

> ⚠️ **Security Warning**: Never commit actual API keys, JWT secrets, or database password strings to Git or public documentation.

#### 3. Install Server Dependencies & Start Backend
```bash
npm install
npm run dev
```
*(Backend server runs at `http://localhost:5000`)*

#### 4. Configure & Start Frontend (Client)
In a separate terminal, navigate to the `client/` directory:

```bash
cd ../client
npm install
npm run dev
```
*(Frontend React application runs at `http://localhost:5173` or `http://localhost:3000`)*

---

## 3. Production Build Verification

To verify that the frontend compiles cleanly for production:

```bash
cd client
npm run build
```

Expected output:
```text
vite v5.4.21 building for production...
✓ built in ~4s
dist/index.html
dist/assets/index.js
```

---

## 4. Troubleshooting Common Setup Errors

* **Port 5000 / 5173 Already in Use**: Change `PORT` in `server/.env` or update Vite port in `client/vite.config.js`.
* **MongoDB Connection Refused**: Verify your `MONGO_URI` connection string and ensure IP whitelist rules in Atlas permit access.
* **LLM API Rate Limit / 503 Capacity Error**: The backend includes failover logic. Ensure at least one valid API key (`GEMINI_API_KEY` or `GROQ_API_KEY`) is populated.
