# Kingley Chukwudume — Portfolio (Vercel + Supabase)

A bold plum/coral portfolio inspired by gymduoo.com, with five discipline sections (Web Dev, UI/UX, Graphics, Industrial Design, Blog), a **testimonials / social-proof** section, visitor likes & reviews, downloadable CV, profile photo, a branded **social share image (OG)**, and a password-protected admin panel — all running on **Vercel** with a **Supabase** backend (Postgres + Storage).

---

## 📁 Folder Structure

```
kingley-portfolio/
├── api/
│   ├── index.js        ← Vercel serverless entry (wraps the Express app)
│   └── server.js       ← All API logic (projects, likes, reviews, uploads, settings)
├── public/
│   ├── index.html      ← The portfolio site
│   ├── admin.html      ← Password-protected CMS
│   └── assets/         ← Static images, icons, fallback CV
├── supabase/
│   └── schema.sql      ← Run this once in Supabase to create tables + seed data
├── vercel.json         ← Routes /api/* to the function, serves public/ statically
├── package.json
└── .env.example        ← Copy to .env for local dev
```

Clean split: **`/api`** is the backend, **`/public`** is everything the browser sees, **`/supabase`** holds your one-time database setup.

---

## 🚀 Deploy in 5 steps

### 1. Create a Supabase project
- Go to [supabase.com](https://supabase.com) → **New Project**. Pick a region near the UK (e.g. London / eu-west-2).
- Wait for it to provision.

### 2. Run the schema
- In Supabase: **SQL Editor → New query** → paste the entire contents of `supabase/schema.sql` → **Run**.
- This creates the `projects`, `reviews`, `likes`, `settings` tables, the public **`media`** storage bucket, and seeds your projects.

### 3. Grab your keys
- Supabase: **Settings → API**. Copy:
  - **Project URL** → `SUPABASE_URL`
  - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret — never put this in frontend code; it's only used server-side in the function)

### 4. Deploy to Vercel
- Your repo is already on GitHub. In [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
- Before deploying, add **Environment Variables**:
  | Name | Value |
  |---|---|
  | `SUPABASE_URL` | your project URL |
  | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
  | `ADMIN_PASSWORD` | a strong password of your choice |
- Click **Deploy**. Vercel auto-detects `vercel.json`, builds the function from `/api`, and serves `/public`.

### 5. Add your content
- Visit `https://your-site.vercel.app/admin` → log in with `ADMIN_PASSWORD`.
- Upload project media (images + short videos), your CV (PDF), and a profile photo.
- Add / edit / delete projects, toggle "featured", and moderate reviews.

---

## 🔌 How it works on Vercel

- **`vercel.json`** rewrites every `/api/*` request to `api/index.js`, which exports the Express app. Vercel runs it as a single serverless function (Node runtime, 30s max duration).
- **Static files** in `/public` are served directly by Vercel's CDN.
- **Uploads** are sent to the function as base64 JSON, then streamed into the Supabase `media` bucket — Vercel's filesystem is ephemeral, so nothing is stored on the function itself.
- **Likes / reviews / projects** all live in Supabase Postgres, so they persist and are shared across all visitors.

---

## 💻 Run locally

```bash
npm install
cp .env.example .env     # fill in your Supabase keys + admin password
npm run dev
```
Site: `http://localhost:3001` · Admin: `http://localhost:3001/admin`

---

## ✏️ API reference (all under /api)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/projects` `?category=` `?featured=true` `?id=` | List / filter / fetch projects |
| POST | `/api/projects` 🔒 | Create project |
| PUT | `/api/projects?id=` 🔒 | Update project |
| DELETE | `/api/projects?id=` 🔒 | Delete project |
| POST | `/api/upload` 🔒 | Upload media/CV/photo (base64) → `{url}` |
| GET / POST | `/api/settings?key=` / `{key,value}` 🔒 | Read/write CV URL, profile photo |
| GET / POST | `/api/likes?projectId=` | Get count / toggle like |
| GET | `/api/reviews?projectId=` `?all=true`🔒 | List reviews |
| POST | `/api/reviews?projectId=` | Post a review |
| DELETE | `/api/reviews?id=` 🔒 | Delete a review |
| GET | `/api/testimonials` | List curated testimonials |
| POST | `/api/testimonials` 🔒 | Add testimonial |
| PUT | `/api/testimonials?id=` 🔒 | Edit testimonial |
| DELETE | `/api/testimonials?id=` 🔒 | Delete testimonial |

🔒 = requires `x-admin-key` header (your `ADMIN_PASSWORD`).

---

## 🔧 Before going live
- [ ] Set a strong `ADMIN_PASSWORD` in Vercel.
- [ ] Replace the email in `index.html` (`hello@kingley.design`) with your real one.
- [ ] Confirm your LinkedIn URL.
- [ ] Upload CV, profile photo, and real project media via the admin panel.
- [ ] (Optional) Add a custom domain in Vercel → Settings → Domains once you buy one.

## ⚠️ Security note
The `service_role` key bypasses Row Level Security and must **only** live in Vercel's server-side env vars — never in `public/` or committed to git. The frontend never sees it; it only talks to your own `/api` routes.
