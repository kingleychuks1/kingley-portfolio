-- ════════════════════════════════════════════════════════════════════════
-- Kingley Portfolio — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════════

-- ─── PROJECTS ───────────────────────────────────────────────────────────
create table if not exists projects (
  id          text primary key,
  category    text not null,            -- webdev | uiux | graphics | industrial | blog
  title       text not null,
  subtitle    text,
  description text,
  tags        text[] default '{}',
  thumbnail   text,
  media       text[] default '{}',
  colors      text[] default '{}',
  year        text,
  link        text,
  featured    boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ─── REVIEWS ────────────────────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null references projects(id) on delete cascade,
  name        text not null,
  message     text not null,
  rating      int  default 5 check (rating between 1 and 5),
  created_at  timestamptz default now()
);

-- ─── LIKES ──────────────────────────────────────────────────────────────
create table if not exists likes (
  id          uuid primary key default gen_random_uuid(),
  project_id  text not null references projects(id) on delete cascade,
  visitor_id  text not null,
  created_at  timestamptz default now(),
  unique (project_id, visitor_id)
);

-- ─── SITE SETTINGS (CV path, profile photo, etc) ────────────────────────
create table if not exists settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz default now()
);

-- ─── TESTIMONIALS (curated social proof, admin-managed) ─────────────────
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  message     text not null,
  rating      int default 5 check (rating between 1 and 5),
  avatar      text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ─── INDEXES ────────────────────────────────────────────────────────────
create index if not exists idx_projects_category on projects(category);
create index if not exists idx_reviews_project on reviews(project_id);
create index if not exists idx_likes_project on likes(project_id);

-- ════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Public can READ projects/reviews/likes/settings and INSERT reviews/likes.
-- All writes to projects + deletes are done server-side with the SERVICE
-- ROLE key (bypasses RLS), so no admin policy is needed here.
-- ════════════════════════════════════════════════════════════════════════
alter table projects enable row level security;
alter table reviews  enable row level security;
alter table likes    enable row level security;
alter table settings enable row level security;
alter table testimonials enable row level security;

-- Public read
create policy "public read projects" on projects for select using (true);
create policy "public read reviews"  on reviews  for select using (true);
create policy "public read likes"    on likes    for select using (true);
create policy "public read settings" on settings for select using (true);
create policy "public read testimonials" on testimonials for select using (true);

-- Public can post reviews + toggle likes
create policy "public insert reviews" on reviews for insert with check (true);
create policy "public insert likes"   on likes   for insert with check (true);
create policy "public delete likes"   on likes   for delete using (true);

-- ════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET (run after creating tables)
-- Creates a public bucket called "media" for images + short videos.
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- ════════════════════════════════════════════════════════════════════════
-- SEED DATA — your real projects
-- ════════════════════════════════════════════════════════════════════════
insert into projects (id, category, title, subtitle, description, tags, colors, year, link, featured) values
('web-001','webdev','FlexStaff','UK Temporary Staffing Platform','Live employer-of-record platform competing in the UK temp staffing market. Full-stack Next.js with real-time shift management, HMRC PAYE integration, and dual mobile apps for workers and businesses.','{Next.js,Node.js,PostgreSQL,Expo,EAS}','{#1f001d,#74cff4,#fff8f3}','2024','https://flexstaff.co.uk',true),
('web-002','webdev','ShiftSettle','Autonomous On-Chain Payroll','Somnia Agentathon 2026 project. Autonomous on-chain payroll chaining two Somnia agents to verify worker hours and calculate UK statutory deductions on Somnia Testnet.','{Solidity,Somnia,React,Vercel}','{#0a0a0a,#edadf9,#74cff4}','2026','https://shiftsettle.vercel.app',true),
('web-003','webdev','ClearFlow','AI Financial Operations Agent','HackLondon project — AI financial operations agent for cross-border SMEs covering FX optimisation, payment routing, and reconciliation. Built with Claude API tool use.','{React,"Claude API",Node.js}','{#3f0537,#74cff4,#ff6370}','2026','#',false),
('ux-001','uiux','Posiv','Gamified CBT Habit App','Duolingo for mental fitness. Built at VibeHack London (UCL, £10k prize pool). Streaks, XP, badges, and Claude API integration with a full design system.','{Figma,Next.js,"Claude API",Gamification}','{#ff6370,#74cff4,#fff8f3}','2025','#',true),
('ux-002','uiux','DepositPass','UK Portable Tenancy Deposit Wallet','UK portable tenancy deposit wallet with Freedom Score, Deposit Passport, and dispute handling. Aligns with the Renters Rights Act 2025.','{Figma,React,Firebase}','{#3f0537,#52B788,#edadf9}','2025','#',false),
('ux-003','uiux','Jules Comfort Stays','Luxury Short-Stay Website','Client project — navy/gold 6-page website for a luxury short-stay business. Full branding, booking integration, and payment agreement flow.','{"UI Design",Webflow,Branding}','{#0A1628,#f57a2f,#fff8f3}','2024','#',true),
('graphics-001','graphics','Sipsmith Label Design','Premium Gin Label Concept','Speculative rendered label concept submitted for a Sipsmith contract. Detailed illustrated botanical label with premium print finishing.','{Illustrator,Packaging,Print}','{#2C1810,#f57a2f,#fef549}','2024','#',true),
('graphics-002','graphics','Rines Photography','Dark Luxury Event Brand','Birthday gift website for a Lagos-based photographer and events business. Dark luxury aesthetic, filterable gallery, booking form, admin panel.','{HTML/CSS,JavaScript,"Brand Design"}','{#0d0d0d,#ff6370,#fff8f3}','2024','#',false),
('industrial-001','industrial','Card Holder','Product Design — CAD','Industrial design project exploring precision-engineered card holder forms. Clean geometric language with considered material choices.','{CAD,SolidWorks,Rendering}','{#fef549,#f57a2f,#1f001d}','2025','https://full-squircle-617172.framer.app/blog/card-holder',true),
('industrial-002','industrial','Geneva Drive Engine Part','Mechanical Design — CAD','Precision CAD model of a Geneva drive mechanism. Detailed engineering drawing with tolerance annotations.','{CAD,"Engineering Drawing","Mechanism Design"}','{#74cff4,#edadf9,#1f001d}','2025','https://full-squircle-617172.framer.app/blog/gevena-drive-engine-part',false),
('industrial-003','industrial','Ginger Shot Bottle','Packaging & Label Design','Complete packaging design for a ginger shot product — bottle form, label design, and brand identity.','{"Product Design",Packaging,Illustrator}','{#f57a2f,#fef549,#fff8f3}','2025','https://full-squircle-617172.framer.app/blog/ginger-shot-bottle-and-label-design',true),
('blog-001','blog','Interactive Light Flute','Arduino Digital Media Project','University project: an Arduino-powered interactive light instrument responding to touch and breath. Digital Media Engineering coursework.','{Arduino,"Physical Computing","Digital Media"}','{#3f0537,#74cff4,#edadf9}','2024','https://kingleychuks.blogspot.com/2024/04/digital-media-arduino-project.html',true),
('blog-002','blog','VisualJockey','Real-Time Visual Performance Tool','University project exploring real-time generative visuals synchronised to audio. Built for live performance contexts.','{"Creative Coding","Generative Art",Performance}','{#1a0033,#edadf9,#f57a2f}','2024','https://kingleychuks.blogspot.com/2024/04/visualjockey.html',false)
on conflict (id) do nothing;

-- Default CV setting placeholder
insert into settings (key, value) values ('cv_url', '') on conflict (key) do nothing;
insert into settings (key, value) values ('profile_photo', '') on conflict (key) do nothing;

-- ════════════════════════════════════════════════════════════════════════
-- SEED TESTIMONIALS (edit/replace with real ones via the admin panel)
-- ════════════════════════════════════════════════════════════════════════
insert into testimonials (name, role, message, rating, sort_order) values
('Christian Jules', 'Founder, Jules Comfort Stays', 'Kingley delivered a polished, professional website that exceeded what we imagined. Fast turnaround, clear communication, and a real eye for detail. Our bookings have never looked better.', 5, 1),
('Parm', 'Teammate, VibeHack London', 'One of the sharpest builders I have worked alongside. Kingley shipped a complete, working product under hackathon pressure and made it look effortless. A genuine full-stack force.', 5, 2),
('Nigel', 'Referral Partner', 'I keep sending clients Kingley''s way because he simply gets it done — design, build, and the small touches that make work feel premium. Reliable every single time.', 5, 3)
on conflict do nothing;
