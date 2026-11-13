const { isAdmin, setCors } = require('./_supabase');

// Lets the admin panel check a password without touching any data.
module.exports = async (req, res) => {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  return res.status(200).json({ ok: true });
};
