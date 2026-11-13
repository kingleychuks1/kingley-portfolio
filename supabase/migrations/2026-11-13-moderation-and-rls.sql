-- ════════════════════════════════════════════════════════════════════════
-- Run once in Supabase → SQL Editor (safe to run more than once).
-- 1. Review moderation: new reviews are hidden until approved in /admin.
-- 2. Tighten RLS: the site only talks to Supabase through /api with the
--    service-role key, so the public (anon) role needs no write access.
-- ════════════════════════════════════════════════════════════════════════

alter table reviews add column if not exists approved boolean not null default false;

-- Keep reviews that are already live visible.
update reviews set approved = true where approved = false and created_at < '2026-11-13';

create index if not exists idx_reviews_project_approved on reviews(project_id, approved);

-- Remove public write policies (anyone with the anon key could delete every like).
drop policy if exists "public insert reviews" on reviews;
drop policy if exists "public insert likes"   on likes;
drop policy if exists "public delete likes"   on likes;

-- Only approved reviews are readable with the anon key.
drop policy if exists "public read reviews" on reviews;
create policy "public read reviews" on reviews for select using (approved);

-- Visitor ids are not needed by anyone outside the API.
drop policy if exists "public read likes" on likes;
