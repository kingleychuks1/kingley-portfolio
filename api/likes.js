const { supabase, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;

  const projectId = req.query.projectId;
  if (!projectId) return res.status(400).json({ error: 'projectId required' });

  try {
    if (req.method === 'GET') {
      const { count, error } = await supabase
        .from('likes').select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) throw error;
      return res.status(200).json({ count: count || 0 });
    }

    if (req.method === 'POST') {
      const visitorId = String((req.body && req.body.visitorId) || '');
      if (!/^v_[a-z0-9]{6,32}$/i.test(visitorId)) return res.status(400).json({ error: 'visitorId required' });

      // Check existing
      const { data: existing } = await supabase
        .from('likes').select('id')
        .eq('project_id', projectId).eq('visitor_id', visitorId).maybeSingle();

      let liked;
      if (existing) {
        const { error } = await supabase.from('likes').delete().eq('id', existing.id);
        if (error) throw error;
        liked = false;
      } else {
        const { error } = await supabase.from('likes').insert({ project_id: projectId, visitor_id: visitorId });
        if (error) throw error;
        liked = true;
      }

      const { count } = await supabase
        .from('likes').select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      return res.status(200).json({ liked, count: count || 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
