const { supabase, isAdmin, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { filename, contentType, dataBase64, projectId } = req.body || {};
    if (!dataBase64 || !filename) return res.status(400).json({ error: 'filename and dataBase64 required' });

    const ext = (filename.split('.').pop() || 'bin').toLowerCase();
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(dataBase64, 'base64');

    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(key, buffer, { contentType: contentType || 'application/octet-stream', upsert: false });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from('media').getPublicUrl(key);
    const url = pub.publicUrl;

    // Optionally attach to a project
    if (projectId) {
      const { data: proj } = await supabase.from('projects').select('media,thumbnail').eq('id', projectId).single();
      if (proj) {
        const media = [...(proj.media || []), url];
        const update = { media };
        if (!proj.thumbnail) update.thumbnail = url;
        await supabase.from('projects').update(update).eq('id', projectId);
      }
    }

    return res.status(200).json({ url, files: [{ url, name: filename, type: contentType }] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Allow larger JSON bodies for base64 uploads (must be a separate named export)
module.exports.config = { api: { bodyParser: { sizeLimit: '25mb' } } };
