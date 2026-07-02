# ElevateHours — Setup Guide

## Step 1: Set up Supabase Database

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open the file `schema.sql` from this project
5. Copy the entire contents and paste into the SQL editor
6. Click **"Run"** — this creates all tables, inserts all skills, and sets up triggers

## Step 2: Install the project

Open your terminal and run these commands one by one:

```bash
cd elevatehours
npm install
```

Wait for installation to complete (takes 1-2 minutes).

## Step 3: Run locally to test

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

## Step 4: Deploy to Vercel

### Option A: Via GitHub (recommended)
1. Create a GitHub account at github.com if you don't have one
2. Create a new repository called "elevatehours"
3. Upload all project files to that repository
4. Go to vercel.com and sign up with GitHub
5. Click "New Project" → select your elevatehours repository
6. Vercel will auto-detect Next.js
7. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://phyfopsduvjosrxqqqkr.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sb_publishable_7Y5a0ydsJX7GtxDctSuxRQ_vEwR5m49
8. Click "Deploy"

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts and add the environment variables when asked.

## Step 5: Enable Supabase Auth

1. Go to Supabase → Authentication → Settings
2. Under "Site URL" add your Vercel URL (e.g. https://elevatehours.vercel.app)
3. Under "Redirect URLs" add the same URL

## Project Structure

```
src/
├── app/
│   ├── page.js              ← Landing page (public)
│   ├── auth/
│   │   ├── login/page.js    ← Login page
│   │   └── signup/page.js   ← Signup page
│   ├── dashboard/page.js    ← Main dashboard
│   ├── marketplace/page.js  ← Browse opportunities
│   ├── post-request/page.js ← Post a new request
│   ├── transactions/page.js ← Track all transactions
│   ├── funding-requests/    ← Community funding
│   ├── buy-sparks/page.js   ← Purchase Sparks
│   ├── profile/page.js      ← User profiles
│   └── badges/page.js       ← Skill badges
├── components/
│   └── Navbar.js            ← Navigation bar
└── lib/
    └── supabase.js          ← Supabase client
```

## Pages Overview

| Page | URL | Access |
|------|-----|--------|
| Landing | / | Public |
| Sign Up | /auth/signup | Public |
| Login | /auth/login | Public |
| Dashboard | /dashboard | Logged in |
| Marketplace | /marketplace | Logged in |
| Post Request | /post-request | Logged in |
| Transactions | /transactions | Logged in |
| Funding Requests | /funding-requests | Logged in |
| Buy Sparks | /buy-sparks | Logged in |
| Profile | /profile | Logged in |
| Badges | /badges | Logged in |

## Spark Economy

- Work Tier 1: 150 SPK/hr
- Work Tier 2: 200 SPK/hr  
- Work Tier 3: 300 SPK/hr
- Education Tier 1: 90 SPK/hr
- Education Tier 2: 120 SPK/hr
- Education Tier 3: 180 SPK/hr
- 100 SPK = $10 USD
- Bundles: Starter (500/$40), Growth (1500/$110), Pro (3500/$240), Impact (7000/$450)
