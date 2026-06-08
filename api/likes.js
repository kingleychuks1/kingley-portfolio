const { supabase, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
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
      const visitorId = (req.body && req.body.visitorId) || 'anon';

      // Check existing
      const { data: existing } = await supabase
        .from('likes').select('id')
        .eq('project_id', projectId).eq('visitor_id', visitorId).maybeSingle();

      let liked;
      if (existing) {
        await supabase.from('likes').delete().eq('id', existing.id);
        liked = false;
      } else {
        await supabase.from('likes').insert({ project_id: projectId, visitor_id: visitorId });
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
