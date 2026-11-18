const { supabase, isAdmin, setCors, requireDB, isMissingColumn } = require('./_supabase');

// Reviews are moderated: new public reviews are stored with approved = false
// and only appear on the site once approved in the admin panel.
// If the `approved` column has not been added yet (see supabase/migrations),
// the API falls back to the old behaviour so nothing breaks before the migration.

function shape(r) {
  return {
    id: r.id, projectId: r.project_id, name: r.name, message: r.message,
    rating: r.rating, createdAt: r.created_at,
    approved: r.approved === undefined ? true : !!r.approved
  };
}

module.exports = async (req, res) => {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;

  try {
    // ─── GET reviews ──────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { projectId, all } = req.query;

      // Admin: all reviews, pending ones included
      if (all === 'true') {
        if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
        const { data, error } = await supabase
          .from('reviews').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ reviews: (data || []).map(shape) });
      }

      if (!projectId) return res.status(400).json({ error: 'projectId required' });
      const base = () => supabase.from('reviews').select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      let { data, error } = await base().eq('approved', true);
      if (isMissingColumn(error)) ({ data, error } = await base());
      if (error) throw error;
      return res.status(200).json({ reviews: (data || []).map(shape) });
    }

    // ─── POST review (public, held for moderation) ────────────────────────
    if (req.method === 'POST') {
      const projectId = req.query.projectId;
      const { name, message, rating, website } = req.body || {};
      // Honeypot: real visitors never see or fill the "website" field.
      if (website) return res.status(200).json({ pending: true });
      const cleanName = String(name || '').trim();
      const cleanMsg = String(message || '').trim();
      if (!projectId || !cleanName || !cleanMsg) {
        return res.status(400).json({ error: 'projectId, name and message required' });
      }
      if (cleanMsg.length < 10) return res.status(400).json({ error: 'Please write a little more (10+ characters).' });
      if (/https?:\/\//i.test(cleanName) || (cleanMsg.match(/https?:\/\//gi) || []).length > 1) {
        return res.status(400).json({ error: 'Links are not allowed in reviews.' });
      }
      const row = {
        project_id: projectId,
        name: cleanName.slice(0, 60),
        message: cleanMsg.slice(0, 500),
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5))
      };
      let { error } = await supabase.from('reviews').insert({ ...row, approved: false });
      let pending = true;
      if (isMissingColumn(error)) {
        ({ error } = await supabase.from('reviews').insert(row));
        pending = false;
      }
      if (error) throw error;
      return res.status(200).json({ pending });
    }

    // ─── PUT ?id= approve / unapprove (admin) ─────────────────────────────
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      const approved = !!(req.body && req.body.approved);
      const { error } = await supabase.from('reviews').update({ approved }).eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, approved });
    }

    // ─── DELETE review (admin) ────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query.id;
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('reviews error', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};
