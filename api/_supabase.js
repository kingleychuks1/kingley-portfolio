// Shared Supabase admin client (service role — server-side only, never exposed to browser)
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Only create the client if both env vars exist — otherwise supabase-js v2 throws
// at import time and crashes every function with a cryptic 500. When missing, we
// expose `supabase = null` and let handlers return a clean "not configured" error.
let supabase = null;
if (supabaseUrl && serviceKey) {
  supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  console.warn('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars — API will return 503 until set.');
}

// No fallback: if ADMIN_PASSWORD is not set, every admin request is refused.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
if (!ADMIN_PASSWORD) {
  console.warn('⚠️  ADMIN_PASSWORD is not set — the admin panel is locked until it is.');
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

function isAdmin(req) {
  const supplied = req.headers['x-admin-key'];
  if (!ADMIN_PASSWORD || !supplied) return false;
  // Hash both sides so lengths match, then compare in constant time.
  return crypto.timingSafeEqual(sha256(supplied), sha256(ADMIN_PASSWORD));
}

// The site calls its own API from the same origin, so no CORS headers are needed.
// Extra origins (e.g. a custom domain during migration) can be listed in
// ALLOWED_ORIGINS as a comma-separated list.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

function setCors(res, req) {
  const origin = req && req.headers && req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  }
}

// Guard helper: handlers call `if (requireDB(res)) return;` at the top.
function requireDB(res) {
  if (!supabase) {
    res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.' });
    return true;
  }
  return false;
}

// Postgres "undefined column" — used to stay compatible before a migration is run.
function isMissingColumn(error) {
  return !!error && (error.code === '42703' || /column .* does not exist/i.test(error.message || ''));
}

module.exports = { supabase, isAdmin, setCors, requireDB, isMissingColumn };
