# 🚀 RoopShield Internship Portal — Free Hosting Guide

This guide explains how to host both the **frontend** (React) and **backend** (Node.js API) for free so your portal is accessible from anywhere on the internet.

---

## 📦 Project Structure

```
intenship portal/
├── src/              ← React frontend
├── backend/          ← Node.js + Express API
│   └── db.json       ← Your database (JSON file)
├── dist/             ← Built frontend (after npm run build)
└── .env              ← Frontend environment variables
```

---

## 🌐 OPTION 1 — Best Free Setup (Recommended)

### Frontend → **Netlify** (Free)
### Backend → **Render** (Free)

This is the best combination for a small company portal.

---

## STEP 1: Host the Backend on Render

**Render** gives you a free Node.js server that stays online.

### 1.1 — Push your code to GitHub

1. Go to [github.com](https://github.com) and create a free account
2. Create a new repository called `roopshield-portal`
3. Open CMD in your project folder and run:

```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/roopshield-portal.git
git push -u origin main
```

### 1.2 — Deploy backend on Render

1. Go to [render.com](https://render.com) → Sign up free
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your repository
4. Fill in these settings:

| Setting | Value |
|---------|-------|
| Name | roopshield-backend |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | **Free** |

5. Under **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | any long random string (e.g. `roopshield2026secretkey`) |
| `PORT` | `10000` |
| `FRONTEND_URL` | your Netlify URL (add after step 2) |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | your Gmail App Password |
| `EMAIL_FROM` | `RoopShield Portal <your@gmail.com>` |

6. Click **"Create Web Service"**
7. Wait 2-3 minutes. You'll get a URL like: `https://roopshield-backend.onrender.com`

> ⚠️ **Free tier note:** Render free servers sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Upgrade to Starter ($7/month) to avoid this.

---

## STEP 2: Host the Frontend on Netlify

### 2.1 — Update your .env file

Edit `d:\my comny\WEBSITE - Copy\intenship portal\.env`:

```
VITE_API_URL=https://roopshield-backend.onrender.com/api
```

### 2.2 — Build the frontend

```cmd
cd "D:\my comny\WEBSITE - Copy\intenship portal"
npm run build
```

This creates a `dist/` folder.

### 2.3 — Deploy to Netlify

**Method A — Drag & Drop (Easiest, no account needed for testing):**
1. Go to [netlify.com](https://netlify.com) → Sign up free
2. Go to **Sites** → drag your `dist/` folder onto the page
3. Done! You get a URL like `https://amazing-name-123.netlify.app`

**Method B — Connect GitHub (Auto-deploys on every push):**
1. Go to [netlify.com](https://netlify.com) → **"Add new site"** → **"Import from Git"**
2. Connect GitHub → select your repository
3. Set:
   - Base directory: *(leave empty)*
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable: `VITE_API_URL` = your Render backend URL
5. Click **Deploy**

### 2.4 — Fix page refresh (404 error)

In Netlify, go to **Site Settings → Build & Deploy → Post processing** and add a redirect rule.

Or the `public/_redirects` file already handles this (it's already in your project).

---

## 🌐 OPTION 2 — Railway (Backend + Frontend together)

[Railway.app](https://railway.app) lets you host both in one place.

1. Sign up at railway.app (free $5 credit/month)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repo
4. Add two services: one for `backend/`, one for the root (frontend)
5. Set environment variables same as above

---

## 🌐 OPTION 3 — Vercel (Frontend) + Cyclic (Backend)

| Service | URL | Free Tier |
|---------|-----|-----------|
| [Vercel](https://vercel.com) | Frontend | Unlimited |
| [Cyclic.sh](https://cyclic.sh) | Backend Node.js | Free |

---

## 🌐 OPTION 4 — Keep it Local (Current Setup)

If you only need it on your office network (not internet):

1. Find your computer's local IP:
   ```cmd
   ipconfig
   ```
   Look for `IPv4 Address` e.g. `192.168.1.5`

2. Run both servers:
   ```cmd
   REM Terminal 1 - Backend
   cd "D:\my comny\WEBSITE - Copy\intenship portal\backend"
   node server.js

   REM Terminal 2 - Frontend
   cd "D:\my comny\WEBSITE - Copy\intenship portal"
   npm run dev -- --host
   ```

3. Anyone on the same WiFi can access:
   - Frontend: `http://192.168.1.5:5173`
   - Backend: `http://192.168.1.5:5000`

4. Update `.env`:
   ```
   VITE_API_URL=http://192.168.1.5:5000/api
   ```

---

## 📧 Setting Up Gmail for Forgot Password Emails

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** → Select app: **Mail** → Select device: **Windows Computer**
4. Copy the 16-character password
5. Use that as `EMAIL_PASS` in your environment variables

---

## 🗄️ Database Backup

Your database is stored in `backend/db.json`. To back it up:

```cmd
copy "D:\my comny\WEBSITE - Copy\intenship portal\backend\db.json" "D:\backup\db-backup-%date%.json"
```

Run this daily or weekly to keep a backup.

---

## 📋 Quick Reference — Running Locally

```cmd
REM Start Backend (Terminal 1)
cd "D:\my comny\WEBSITE - Copy\intenship portal\backend"
node server.js

REM Start Frontend (Terminal 2)
cd "D:\my comny\WEBSITE - Copy\intenship portal"
npm run dev
```

Then open: **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roopshield.com | Admin@2025 |
| HR | hr@roopshield.com | HR@2025 |
| Intern | rahul.verma@roopshield.com | Rahul@123 |

---

## 💰 Cost Comparison

| Platform | Frontend | Backend | Database | Cost |
|----------|----------|---------|----------|------|
| Netlify + Render | ✅ Free | ✅ Free (sleeps) | JSON file | **₹0/month** |
| Railway | ✅ Free | ✅ Free | JSON file | **₹0–₹400/month** |
| Render Starter | ✅ Free | ✅ Always on | JSON file | **~₹600/month** |
| Local network | ✅ | ✅ | JSON file | **₹0** (office only) |

---

## ⚡ Recommended for RoopShield

**Best free option:** Netlify (frontend) + Render (backend)

- Total cost: **₹0/month**
- Setup time: ~30 minutes
- Accessible from anywhere with internet
- Automatic HTTPS (secure)
- Custom domain support (e.g. portal.roopshield.com)

For a custom domain, buy one from [GoDaddy](https://godaddy.com) or [Namecheap](https://namecheap.com) (~₹800/year) and point it to your Netlify site.
