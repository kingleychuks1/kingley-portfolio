// Shared Supabase admin client (service role — server-side only, never exposed to browser)
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

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kingley2024';

function isAdmin(req) {
  return req.headers['x-admin-key'] === ADMIN_PASSWORD;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
}

// Guard helper: handlers call `if (requireDB(res)) return;` at the top.
function requireDB(res) {
  if (!supabase) {
    res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.' });
    return true;
  }
  return false;
}

module.exports = { supabase, isAdmin, setCors, ADMIN_PASSWORD, requireDB };
