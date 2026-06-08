const { supabase, isAdmin, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;

  try {
    // ─── GET: list testimonials ──────────────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ testimonials: data || [] });
    }

    // ─── POST: create testimonial (admin) ────────────────────────────────
    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { name, role, message, rating, avatar, sort_order } = req.body || {};
      if (!name || !message) return res.status(400).json({ error: 'name and message required' });
      const row = {
        name: String(name).slice(0, 80),
        role: role ? String(role).slice(0, 120) : '',
        message: String(message).slice(0, 600),
        rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
        avatar: avatar || '',
        sort_order: parseInt(sort_order) || 0
      };
      const { data, error } = await supabase.from('testimonials').insert(row).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // ─── PUT: update testimonial (admin) ?id= ─────────────────────────────
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      const b = req.body || {}, patch = {};
      ['name', 'role', 'message', 'rating', 'avatar', 'sort_order'].forEach(k => {
        if (b[k] !== undefined) patch[k] = b[k];
      });
      const { data, error } = await supabase.from('testimonials').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // ─── DELETE: remove testimonial (admin) ?id= ──────────────────────────
    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
