const { supabase, isAdmin, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;

  try {
    // ─── GET reviews ──────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { projectId, all } = req.query;

      // Admin: all reviews
      if (all === 'true') {
        if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
        const { data, error } = await supabase
          .from('reviews').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const reviews = (data || []).map(r => ({ id: r.id, projectId: r.project_id, name: r.name, message: r.message, rating: r.rating, createdAt: r.created_at }));
        return res.status(200).json({ reviews });
      }

      if (!projectId) return res.status(400).json({ error: 'projectId required' });
      const { data, error } = await supabase
        .from('reviews').select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const reviews = (data || []).map(r => ({ id: r.id, projectId: r.project_id, name: r.name, message: r.message, rating: r.rating, createdAt: r.created_at }));
      return res.status(200).json({ reviews });
    }

    // ─── POST review (public) ─────────────────────────────────────────────
    if (req.method === 'POST') {
      const projectId = req.query.projectId;
      const { name, message, rating } = req.body || {};
      if (!projectId || !name || !message) {
        return res.status(400).json({ error: 'projectId, name and message required' });
      }
      const { data, error } = await supabase.from('reviews').insert({
        project_id: projectId,
        name: String(name).slice(0, 60),
        message: String(message).slice(0, 500),
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5))
      }).select().single();
      if (error) throw error;
      return res.status(200).json(data);
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
    return res.status(500).json({ error: err.message });
  }
};
