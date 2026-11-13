const { supabase, isAdmin, setCors, requireDB } = require('./_supabase');

// Uploads go straight from the browser to Supabase Storage using a one-time
// signed URL, so files are not limited by Vercel's ~4.5 MB request body cap.
//
//   1. POST { action: 'sign', filename, contentType }      → { uploadUrl, path }
//   2. Browser PUTs the file to uploadUrl
//   3. POST { action: 'attach', path, projectId?, filename } → { url }
//
// The legacy base64 body ({ filename, contentType, dataBase64 }) still works for
// small files (under ~3 MB) as a fallback.

const ALLOWED = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  pdf: 'application/pdf'
};

function extOf(filename) {
  return String(filename || '').split('.').pop().toLowerCase();
}

function newKey(ext) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

async function attachToProject(projectId, url) {
  if (!projectId) return;
  const { data: proj } = await supabase.from('projects').select('media,thumbnail').eq('id', projectId).single();
  if (!proj) return;
  const update = { media: [...(proj.media || []), url] };
  if (!proj.thumbnail) update.thumbnail = url;
  const { error } = await supabase.from('projects').update(update).eq('id', projectId);
  if (error) throw error;
}

module.exports = async (req, res) => {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = req.body || {};

    // ─── Step 1: signed upload URL ──────────────────────────────────────
    if (body.action === 'sign') {
      const ext = extOf(body.filename);
      if (!ALLOWED[ext]) return res.status(400).json({ error: `File type .${ext} is not allowed.` });
      const path = newKey(ext);
      const { data, error } = await supabase.storage.from('media').createSignedUploadUrl(path);
      if (error) throw error;
      return res.status(200).json({ uploadUrl: data.signedUrl, path: data.path || path, contentType: ALLOWED[ext] });
    }

    // ─── Step 3: confirm + attach ───────────────────────────────────────
    if (body.action === 'attach') {
      if (!body.path || !/^[\w.-]+$/.test(body.path)) return res.status(400).json({ error: 'path required' });
      const url = supabase.storage.from('media').getPublicUrl(body.path).data.publicUrl;
      await attachToProject(body.projectId, url);
      return res.status(200).json({ url, files: [{ url, name: body.filename || body.path }] });
    }

    // ─── Legacy: base64 in the request body (small files only) ──────────
    const { filename, dataBase64, projectId } = body;
    if (!dataBase64 || !filename) return res.status(400).json({ error: 'filename and dataBase64 required' });
    const ext = extOf(filename);
    if (!ALLOWED[ext]) return res.status(400).json({ error: `File type .${ext} is not allowed.` });
    const key = newKey(ext);
    const buffer = Buffer.from(dataBase64, 'base64');
    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(key, buffer, { contentType: ALLOWED[ext], upsert: false });
    if (upErr) throw upErr;
    const url = supabase.storage.from('media').getPublicUrl(key).data.publicUrl;
    await attachToProject(projectId, url);
    return res.status(200).json({ url, files: [{ url, name: filename, type: ALLOWED[ext] }] });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
};
