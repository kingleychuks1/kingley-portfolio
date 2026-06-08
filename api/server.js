const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ─── Data Paths ────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '../src/data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');

// Ensure data files exist
async function initData() {
  await fs.ensureDir(DATA_DIR);
  await fs.ensureDir(path.join(__dirname, '../public/uploads'));

  if (!await fs.pathExists(PROJECTS_FILE)) {
    await fs.writeJson(PROJECTS_FILE, { projects: defaultProjects }, { spaces: 2 });
  }
  if (!await fs.pathExists(REVIEWS_FILE)) {
    await fs.writeJson(REVIEWS_FILE, { reviews: [] }, { spaces: 2 });
  }
  if (!await fs.pathExists(LIKES_FILE)) {
    await fs.writeJson(LIKES_FILE, { likes: {} }, { spaces: 2 });
  }
}

// ─── Default Project Data ──────────────────────────────────────────────────────
const defaultProjects = [
  {
    id: "web-001",
    category: "webdev",
    title: "FlexStaff",
    subtitle: "UK Temporary Staffing Platform",
    description: "Live employer-of-record platform competing in the UK temp staffing market. Full-stack Next.js with real-time shift management, HMRC PAYE integration, and dual mobile apps for workers and businesses.",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Expo", "EAS"],
    thumbnail: "/assets/images/placeholder-web.svg",
    media: [],
    colors: ["#1a1a2e", "#0066FF", "#ffffff"],
    year: "2024",
    link: "https://flexstaff.co.uk",
    featured: true
  },
  {
    id: "web-002",
    category: "webdev",
    title: "ShiftSettle",
    subtitle: "Autonomous On-Chain Payroll",
    description: "Hackathon project for Somnia Agentathon 2026. Autonomous on-chain payroll system chaining two Somnia agents to verify worker hours and calculate UK statutory deductions on Somnia Testnet.",
    tags: ["Solidity", "Somnia", "React", "Vercel"],
    thumbnail: "/assets/images/placeholder-web.svg",
    media: [],
    colors: ["#0a0a0a", "#6C63FF", "#00d4aa"],
    year: "2026",
    link: "https://shiftsettle.vercel.app",
    featured: true
  },
  {
    id: "web-003",
    category: "webdev",
    title: "ClearFlow",
    subtitle: "AI Financial Operations Agent",
    description: "HackLondon project — AI financial operations agent for cross-border SMEs covering FX optimisation, payment routing, and reconciliation. Built with Claude API tool use.",
    tags: ["React", "Claude API", "Node.js"],
    thumbnail: "/assets/images/placeholder-web.svg",
    media: [],
    colors: ["#0f2027", "#203a43", "#2c5364"],
    year: "2026",
    link: "#",
    featured: false
  },
  {
    id: "ux-001",
    category: "uiux",
    title: "Posiv",
    subtitle: "Gamified CBT Habit App",
    description: "Duolingo for mental fitness. Built at VibeHack London (UCL, £10k prize pool). Features streaks, XP, badges, and Claude API integration. Complete Next.js scaffold with full design system.",
    tags: ["Figma", "Next.js", "Claude API", "Gamification"],
    thumbnail: "/assets/images/placeholder-ux.svg",
    media: [],
    colors: ["#FF6B6B", "#4ECDC4", "#ffffff"],
    year: "2025",
    link: "#",
    featured: true
  },
  {
    id: "ux-002",
    category: "uiux",
    title: "DepositPass",
    subtitle: "UK Portable Tenancy Deposit Wallet",
    description: "Hackathon concept. UK portable tenancy deposit wallet with Freedom Score, Deposit Passport, and dispute handling. Aligns with Renters' Rights Act 2025.",
    tags: ["Figma", "React", "Firebase"],
    thumbnail: "/assets/images/placeholder-ux.svg",
    media: [],
    colors: ["#1B4332", "#40916C", "#D8F3DC"],
    year: "2025",
    link: "#",
    featured: false
  },
  {
    id: "ux-003",
    category: "uiux",
    title: "Jules Comfort Stays",
    subtitle: "Luxury Short-Stay Website",
    description: "Client project — navy/gold 6-page website for a luxury short-stay business. Full branding, booking integration, and payment agreement flow.",
    tags: ["UI Design", "Webflow", "Branding"],
    thumbnail: "/assets/images/placeholder-ux.svg",
    media: [],
    colors: ["#0A1628", "#C9A84C", "#F5F0E8"],
    year: "2024",
    link: "#",
    featured: true
  },
  {
    id: "graphics-001",
    category: "graphics",
    title: "Sipsmith Label Design",
    subtitle: "Premium Gin Label Concept",
    description: "Speculative rendered label concept submitted for Sipsmith contract. Detailed illustrated botanical label design with premium print finishing considerations.",
    tags: ["Illustrator", "Packaging", "Print"],
    thumbnail: "/assets/images/placeholder-graphics.svg",
    media: [],
    colors: ["#2C1810", "#D4A853", "#F0E6D3"],
    year: "2024",
    link: "#",
    featured: true
  },
  {
    id: "graphics-002",
    category: "graphics",
    title: "Rines Photography",
    subtitle: "Dark Luxury Event Brand",
    description: "Birthday gift website for a Lagos-based photographer/events business. Dark luxury aesthetic, filterable gallery, booking form, admin panel.",
    tags: ["HTML/CSS", "JavaScript", "Brand Design"],
    thumbnail: "/assets/images/placeholder-graphics.svg",
    media: [],
    colors: ["#0d0d0d", "#c9a84c", "#ffffff"],
    year: "2024",
    link: "#",
    featured: false
  },
  {
    id: "industrial-001",
    category: "industrial",
    title: "Card Holder",
    subtitle: "Product Design — CAD",
    description: "Industrial design project exploring precision-engineered card holder forms. Clean geometric language with considered material choices.",
    tags: ["CAD", "SolidWorks", "Rendering"],
    thumbnail: "/assets/images/placeholder-industrial.svg",
    media: [],
    colors: ["#E8E0D5", "#8C7B6B", "#2C2417"],
    year: "2025",
    link: "https://full-squircle-617172.framer.app/blog/card-holder",
    featured: true
  },
  {
    id: "industrial-002",
    category: "industrial",
    title: "Geneva Drive Engine Part",
    subtitle: "Mechanical Design — CAD",
    description: "Precision CAD model of a Geneva drive mechanism. Detailed engineering drawing with tolerance annotations.",
    tags: ["CAD", "Engineering Drawing", "Mechanism Design"],
    thumbnail: "/assets/images/placeholder-industrial.svg",
    media: [],
    colors: ["#C0C0C0", "#4A4A4A", "#1A1A1A"],
    year: "2025",
    link: "https://full-squircle-617172.framer.app/blog/gevena-drive-engine-part",
    featured: false
  },
  {
    id: "industrial-003",
    category: "industrial",
    title: "Ginger Shot Bottle",
    subtitle: "Packaging & Label Design",
    description: "Complete packaging design for a ginger shot product — bottle form, label design, and brand identity.",
    tags: ["Product Design", "Packaging", "Illustrator"],
    thumbnail: "/assets/images/placeholder-industrial.svg",
    media: [],
    colors: ["#F4A300", "#1A1A1A", "#FFFFFF"],
    year: "2025",
    link: "https://full-squircle-617172.framer.app/blog/ginger-shot-bottle-and-label-design",
    featured: true
  },
  {
    id: "blog-001",
    category: "blog",
    title: "Interactive Light Flute",
    subtitle: "Arduino Digital Media Project",
    description: "University project: an Arduino-powered interactive light instrument that responds to touch and breath. Digital Media Engineering coursework at Middlesex University.",
    tags: ["Arduino", "Physical Computing", "Digital Media"],
    thumbnail: "/assets/images/placeholder-blog.svg",
    media: [],
    colors: ["#0a0a2e", "#4d79ff", "#00ffcc"],
    year: "2024",
    link: "https://kingleychuks.blogspot.com/2024/04/digital-media-arduino-project.html",
    featured: true
  },
  {
    id: "blog-002",
    category: "blog",
    title: "VisualJockey",
    subtitle: "Real-Time Visual Performance Tool",
    description: "University project exploring real-time generative visuals synchronized to audio. Built for live performance contexts.",
    tags: ["Creative Coding", "Generative Art", "Performance"],
    thumbnail: "/assets/images/placeholder-blog.svg",
    media: [],
    colors: ["#1a0033", "#cc00ff", "#ff6600"],
    year: "2024",
    link: "https://kingleychuks.blogspot.com/2024/04/visualjockey.html",
    featured: false
  }
];

// ─── File Upload Config ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg|mp4|webm|mov|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  }
});

// Admin password (in production, use env var)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kingley2024';

function requireAdmin(req, res, next) {
  const auth = req.headers['x-admin-key'];
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── API Routes ────────────────────────────────────────────────────────────────

// GET all projects (with optional category filter)
app.get('/api/projects', async (req, res) => {
  try {
    const data = await fs.readJson(PROJECTS_FILE);
    const { category, featured } = req.query;
    let projects = data.projects;
    if (category) projects = projects.filter(p => p.category === category);
    if (featured === 'true') projects = projects.filter(p => p.featured);

    // Attach like counts
    const likesData = await fs.readJson(LIKES_FILE);
    projects = projects.map(p => ({
      ...p,
      likeCount: (likesData.likes[p.id] || []).length
    }));

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const data = await fs.readJson(PROJECTS_FILE);
    const project = data.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new project (admin)
app.post('/api/projects', requireAdmin, async (req, res) => {
  try {
    const data = await fs.readJson(PROJECTS_FILE);
    const project = {
      id: `${req.body.category}-${uuidv4().slice(0,6)}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    data.projects.push(project);
    await fs.writeJson(PROJECTS_FILE, data, { spaces: 2 });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update project (admin)
app.put('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const data = await fs.readJson(PROJECTS_FILE);
    const idx = data.projects.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    data.projects[idx] = { ...data.projects[idx], ...req.body, id: req.params.id };
    await fs.writeJson(PROJECTS_FILE, data, { spaces: 2 });
    res.json(data.projects[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE project (admin)
app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const data = await fs.readJson(PROJECTS_FILE);
    data.projects = data.projects.filter(p => p.id !== req.params.id);
    await fs.writeJson(PROJECTS_FILE, data, { spaces: 2 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload media for project (admin)
app.post('/api/upload', requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      name: f.originalname,
      type: f.mimetype,
      size: f.size
    }));

    // Optionally attach to project
    if (req.body.projectId) {
      const data = await fs.readJson(PROJECTS_FILE);
      const idx = data.projects.findIndex(p => p.id === req.body.projectId);
      if (idx !== -1) {
        if (!data.projects[idx].media) data.projects[idx].media = [];
        data.projects[idx].media.push(...files.map(f => f.url));
        if (!data.projects[idx].thumbnail || data.projects[idx].thumbnail.includes('placeholder')) {
          data.projects[idx].thumbnail = files[0].url;
        }
        await fs.writeJson(PROJECTS_FILE, data, { spaces: 2 });
      }
    }

    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload CV (admin)
app.post('/api/upload-cv', requireAdmin, upload.single('cv'), async (req, res) => {
  try {
    const cvPath = `/uploads/${req.file.filename}`;
    // Save cv reference
    await fs.writeJson(path.join(DATA_DIR, 'cv.json'), { path: cvPath, uploadedAt: new Date().toISOString() }, { spaces: 2 });
    res.json({ path: cvPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CV path
app.get('/api/cv', async (req, res) => {
  try {
    const cvFile = path.join(DATA_DIR, 'cv.json');
    if (await fs.pathExists(cvFile)) {
      const data = await fs.readJson(cvFile);
      res.json(data);
    } else {
      res.json({ path: '/assets/cv/kingley-cv.pdf' });
    }
  } catch (err) {
    res.json({ path: '/assets/cv/kingley-cv.pdf' });
  }
});

// ─── Likes ─────────────────────────────────────────────────────────────────────
app.post('/api/likes/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const visitorId = req.body.visitorId || req.ip;
    const data = await fs.readJson(LIKES_FILE);
    if (!data.likes[projectId]) data.likes[projectId] = [];

    const alreadyLiked = data.likes[projectId].includes(visitorId);
    if (alreadyLiked) {
      data.likes[projectId] = data.likes[projectId].filter(id => id !== visitorId);
    } else {
      data.likes[projectId].push(visitorId);
    }

    await fs.writeJson(LIKES_FILE, data, { spaces: 2 });
    res.json({ liked: !alreadyLiked, count: data.likes[projectId].length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/likes/:projectId', async (req, res) => {
  try {
    const data = await fs.readJson(LIKES_FILE);
    const count = (data.likes[req.params.projectId] || []).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Reviews ────────────────────────────────────────────────────────────────────
app.get('/api/reviews/:projectId', async (req, res) => {
  try {
    const data = await fs.readJson(REVIEWS_FILE);
    const reviews = data.reviews.filter(r => r.projectId === req.params.projectId);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews/:projectId', async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Name and message required' });

    const data = await fs.readJson(REVIEWS_FILE);
    const review = {
      id: uuidv4(),
      projectId: req.params.projectId,
      name: name.slice(0, 60),
      message: message.slice(0, 500),
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      createdAt: new Date().toISOString()
    };
    data.reviews.push(review);
    await fs.writeJson(REVIEWS_FILE, data, { spaces: 2 });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE review (admin)
app.delete('/api/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const data = await fs.readJson(REVIEWS_FILE);
    data.reviews = data.reviews.filter(r => r.id !== req.params.id);
    await fs.writeJson(REVIEWS_FILE, data, { spaces: 2 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reviews (admin)
app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const data = await fs.readJson(REVIEWS_FILE);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve SPA ─────────────────────────────────────────────────────────────────
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Start ─────────────────────────────────────────────────────────────────────
initData().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Kingley Portfolio running at http://localhost:${PORT}`);
  });
});
