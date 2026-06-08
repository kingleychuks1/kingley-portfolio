const { supabase, isAdmin, setCors, requireDB } = require('./_supabase');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (requireDB(res)) return;

  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (key) {
        const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
        return res.status(200).json({ key, value: data ? data.value : '' });
      }
      const { data } = await supabase.from('settings').select('*');
      const out = {};
      (data || []).forEach(s => { out[s.key] = s.value; });
      return res.status(200).json(out);
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key required' });
      const { error } = await supabase.from('settings')
        .upsert({ key, value: value || '', updated_at: new Date().toISOString() });
      if (error) throw error;
      return res.status(200).json({ key, value });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
