const { supabase, isAdmin, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;

  try {
    // ─── GET: list projects (with like counts) ───────────────────────────
    if (req.method === 'GET') {
      const { category, featured } = req.query;
      let query = supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (category) query = query.eq('category', category);
      if (featured === 'true') query = query.eq('featured', true);

      const { data: projects, error } = await query;
      if (error) throw error;

      // Attach like counts
      const { data: likes } = await supabase.from('likes').select('project_id');
      const counts = {};
      (likes || []).forEach(l => { counts[l.project_id] = (counts[l.project_id] || 0) + 1; });

      const withCounts = projects.map(p => ({ ...p, likeCount: counts[p.id] || 0 }));
      return res.status(200).json({ projects: withCounts });
    }

    // ─── POST: create (admin) ─────────────────────────────────────────────
    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const body = req.body;
      const id = `${body.category}-${Math.random().toString(36).slice(2, 8)}`;
      const { data, error } = await supabase.from('projects').insert({
        id,
        category: body.category,
        title: body.title,
        subtitle: body.subtitle || '',
        description: body.description || '',
        tags: body.tags || [],
        thumbnail: body.thumbnail || '',
        media: body.media || [],
        colors: body.colors || [],
        year: body.year || '',
        link: body.link || '',
        featured: !!body.featured
      }).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // ─── PUT: update (admin) ──────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query.id;
      const body = { ...req.body };
      delete body.id; delete body.likeCount; delete body.created_at;
      const { data, error } = await supabase.from('projects').update(body).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // ─── DELETE (admin) ───────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query.id;
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
