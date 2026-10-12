# SafeGuard AI - Simple Step-by-Step Setup Guide

Welcome to **SafeGuard AI**! This guide walks you through connecting your Supabase cloud backend in just 5 simple steps.

> [!NOTE]
> **Zero Prior Setup Needed To Test**: You can run the app right now in **Preview Demo Mode** by running `npm run dev` and clicking **"Launch Quick Demo Account"**. Every single feature, SHA-256 hash calculator, risk assessment, and legal PDF generator works out of the box! Follow the steps below whenever you want to connect your live Supabase cloud database.

---

## Step 1: Create a Free Supabase Project

1. Visit [supabase.com](https://supabase.com) and click **"Start your project"** (free tier includes database, storage, and authentication).
2. Click **"New Project"**.
3. Choose a name (e.g. `safeguard-ai`) and set a strong database password.
4. Select the region nearest to you and click **"Create new project"**.

---

## Step 2: Run the SQL Schema (Tables + RLS Policies)

1. In your Supabase Dashboard, look at the left sidebar and click on **SQL Editor** (icon with `>_`).
2. Click **"New query"**.
3. Open the file `supabase/schema.sql` from this project folder.
4. Copy the entire contents and paste it into the Supabase SQL Editor.
5. Click the green **"Run"** button in the bottom right.

This single script will automatically:
- Create the `profiles`, `incidents`, `evidence_items`, and `timeline_events` tables.
- Enable **Row Level Security (RLS)** on all tables so users can only ever access their own records.
- Create the private `evidence-vault` storage bucket with strict user-folder security policies.

---

## Step 3: Copy Your API Keys into `.env`

1. In your Supabase Dashboard, click on **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click on **API** in the settings menu.
3. Find:
   - **Project URL**: (e.g. `https://xyzabcdefghijklm.supabase.co`)
   - **anon / public Key**: (starts with `eyJ...`)
4. In your project folder `safeguard-ai`, open `.env` in your editor and replace the placeholder text:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```
5. Save the `.env` file.

---

## Step 4: Verify the Private Storage Bucket

1. In the Supabase Dashboard, click **Storage** on the left menu.
2. Confirm you see the `evidence-vault` bucket.
3. It will display a padlock icon confirming it is **Private**.
4. Files uploaded by users are isolated inside their own unique folders: `<user_id>/<file_name>` and can only be viewed through temporary signed URLs.

---

## Step 5: (Optional) Deploy Edge Functions for Server-Side AI

If you wish to use server-side AI Edge Functions with a secret AI key (e.g., Google Gemini or OpenAI):
1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
2. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```
3. Set your server-side AI secret (this is **never** sent to the browser):
   ```bash
   supabase secrets set AI_API_KEY=your_gemini_or_openai_api_key
   ```
4. Deploy the two functions:
   ```bash
   supabase functions deploy classify-incident
   supabase functions deploy safety-assistant
   ```

---

## Running the Application Locally

1. Open your terminal in the `safeguard-ai` directory:
   ```bash
   npm install
   npm run dev
   ```
2. Open your browser to the local URL (usually `http://localhost:5173`).
3. You can either:
   - Click **"Launch Quick Demo Account"** to immediately inspect pre-configured evidence, SHA-256 hashes, and case reports.
   - Or click **"Sign up"** with your real email to create an authenticated account in your Supabase database!

---

## Summary of Completed Pages

| # | Page | Key Capabilities |
|---|---|---|
| 1 | **Login & Registration** | Supabase Auth, email confirmation, one-click Demo Mode |
| 2 | **Dashboard** | Active incident status, verified evidence counts, quick action shortcuts |
| 3 | **Incident Report Form** | Fact-based reporting wizard, perpetrator info, impact notes, auto risk analysis |
| 4 | **Secure Evidence Vault** | Client-side SHA-256 hashing, private Supabase Storage, screenshot OCR text extraction, permanent deletion modal |
| 5 | **Case Timeline** | Interactive chronological stream, severity filters, custom manual entry |
| 6 | **AI Incident Classification** | Categorization into 8 offense types, confidence score, statutory legal definitions |
| 7 | **Risk Indication** | Cautious Low/Medium/High assessment, objective danger flags, immediate steps |
| 8 | **AI Safety Assistant** | Confidential chat, prompt suggestions, stalkerware checks, de-escalation tips |
| 9 | **Emergency Help** | Verified national hotlines (US, UK, IN, CA), interactive safety plan, zero-auto-police guarantee |
| 10 | **PDF Report Generation** | Court- and police-ready PDF generation with SHA-256 chain-of-custody checksum table |
| 11 | **Privacy Settings** | Sovereign data control, global AI opt-in toggle, Esc x2 Quick Exit, full JSON export & permanent account wipe |
