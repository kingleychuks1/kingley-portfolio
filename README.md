# Kingley Chukwudume — Portfolio

A bold, full-stack portfolio site with a plum/coral aesthetic inspired by gymduoo.com and bevel.health. Showcases Web Development, UI/UX, Graphics, and Industrial Design in dedicated sections, each with its own accent colour and identity. Visitors can like projects and leave reviews; you manage everything through a password-protected admin panel.

---

## ✨ Features

- **Five discipline sections** — Web Dev (sky blue), UI/UX (orange), Graphics (coral), Industrial Design (yellow), Blog & Lab (lavender), each with unique ghost-text branding and accent.
- **Gymduoo-style background** — deep plum → black gradient with floating coral/sky/lavender glow orbs.
- **Likes & Reviews** — visitors can like any project and post star-rated reviews. Stored server-side.
- **Admin panel** (`/admin.html`) — add/edit/delete projects, toggle "featured", drag-and-drop upload images & short videos, upload a downloadable CV, and moderate reviews.
- **Downloadable CV** + **LinkedIn** links throughout.
- **Blog links** to your Blogger (Media Engineering) and Framer portfolio blogs.
- **Fully responsive**, custom cursor, scroll-reveal animations, project detail modals.

---

## 📁 Folder Structure

```
kingley-portfolio/
├── api/
│   └── server.js          ← Express backend (projects, likes, reviews, uploads, CV)
├── public/
│   ├── index.html         ← Main portfolio site
│   ├── admin.html         ← Password-protected CMS
│   ├── assets/            ← Static assets (cv/, images/, videos/, icons/)
│   └── uploads/           ← Uploaded media lands here (auto-created)
├── src/
│   └── data/              ← JSON data store (projects, reviews, likes) — auto-created
├── package.json
├── render.yaml            ← One-click Render deployment config
├── .env.example           ← Copy to .env and set your password
└── README.md
```

This is intentionally flat and readable: **backend in `/api`, everything the browser sees in `/public`, your data in `/src/data`.**

---

## 🚀 Running Locally

```bash
npm install
cp .env.example .env        # then edit ADMIN_PASSWORD
npm start
```

Open `http://localhost:3001` for the site, `http://localhost:3001/admin.html` for the panel.
Default admin password is `kingley2024` — **change it** via the `ADMIN_PASSWORD` env variable.

---

## 🌐 Deployment — IMPORTANT

This site has a **live Node backend** with file uploads, so it needs a host that runs a persistent server with disk storage. **Plain Vercel/Netlify (static/serverless) will not persist uploads or data between requests.**

### ✅ Recommended: Render (free tier, supports this as-is)
1. Push this folder to a GitHub repo.
2. On [render.com](https://render.com), create a **New Web Service** from the repo.
3. It auto-detects `render.yaml`. Set the `ADMIN_PASSWORD` env var to a strong password.
4. The attached 1GB persistent disk keeps your uploads and data safe across restarts.
5. Deploy. Done.

Other good fits: **Railway**, **Fly.io**, **DigitalOcean App Platform** — all run persistent Node servers.

### Using Vercel or Netlify anyway?
You'd need to split the architecture:
- Host `public/` as the static frontend on Vercel/Netlify.
- Move the backend's data + uploads to a managed service (e.g. **Supabase** or **Firebase** for likes/reviews/projects, and **Cloudinary** or **Supabase Storage** for media).
- Update the `API` constant at the top of the `<script>` in `index.html` and `admin.html` to point at your backend URL.

If you want, I can produce a Supabase/Firebase version that deploys cleanly to Vercel — just ask.

### Custom domain
Any of the above hosts let you add a custom domain in their dashboard once you buy one (e.g. `kingley.design`). Point your domain's DNS to the host per their instructions.

---

## ✏️ Editing Content

**Easiest way:** use the admin panel at `/admin.html`. No code needed.
- **Add a project:** Dashboard → quick-action button, or any section's "+ Add Project".
- **Upload media:** Upload Media tab → drag files in, optionally attach to a project (first image becomes the thumbnail).
- **Upload your CV:** CV / Resume tab → drop a PDF. The Download CV buttons update automatically.
- **Manage reviews:** Reviews tab → delete spam.

**Power way:** edit `src/data/projects.json` directly and restart.

---

## 🔧 Things to customise before going live

- [ ] Set a strong `ADMIN_PASSWORD`.
- [ ] Replace the email `hello@kingley.design` in `index.html` with your real email.
- [ ] Confirm your LinkedIn URL (currently `linkedin.com/in/kingley-chukwudume`).
- [ ] Upload your CV and a profile photo via the admin panel.
- [ ] Swap placeholder thumbnails for real project media.
- [ ] (Optional) add an `og.png` to `public/assets/images/` for nice link previews.
