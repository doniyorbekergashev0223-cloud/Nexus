const express = require('express');
const db = require('../db/db');

const router = express.Router();

function rowToMember(r) {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    role: r.role,
    company: r.company,
    avatar: r.avatar || (r.name ? r.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '?'),
    rating: r.rating ?? 5,
    tags: r.tags ? JSON.parse(r.tags) : [],
  };
}

// GET /api/team?orgId=ORG-XXX — tashkilot uchun mentorlar (o'zining + umumiy org_id='ALL')
router.get('/', (req, res) => {
  try {
    const { orgId } = req.query;
    let rows;
    if (orgId) {
      rows = db.prepare('SELECT * FROM team WHERE org_id = ? OR org_id = ? ORDER BY org_id DESC, id').all(orgId, 'ALL');
    } else {
      rows = db.prepare('SELECT * FROM team ORDER BY id').all();
    }
    res.json(rows.map(rowToMember));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/team — tashkilot/davlat o'z mentorini qo'shadi (body: orgId, name, role, company, avatar?, tags?)
router.post('/', (req, res) => {
  try {
    const { orgId, name, role, company, avatar, tags } = req.body;
    if (!orgId || !name) return res.status(400).json({ error: 'orgId va name majburiy' });
    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : (tags ? JSON.stringify(String(tags).split(',').map(s => s.trim())) : '[]');
    const avatarVal = avatar || (name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?');
    const result = db.prepare(
      'INSERT INTO team (org_id, name, role, company, avatar, rating, tags) VALUES (?, ?, ?, ?, ?, 5, ?)'
    ).run(orgId, name, role || '', company || '', avatarVal, tagsStr);
    const row = db.prepare('SELECT * FROM team WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(rowToMember(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/team/:id — faqat o'sha tashkilot o'z mentorini tahrirlay oladi (body: orgId, name?, role?, company?, avatar?, tags?)
router.patch('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { orgId, name, role, company, avatar, tags } = req.body;
    const row = db.prepare('SELECT * FROM team WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Mentor topilmadi' });
    if (orgId && row.org_id !== orgId) return res.status(403).json({ error: 'Faqat o\'z tashkilotingiz mentorini tahrirlay olasiz' });
    if (row.org_id === 'ALL') return res.status(403).json({ error: 'Umumiy mentorlarni tahrirlash mumkin emas' });
    const tagsStr = tags !== undefined ? (Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify(String(tags).split(',').map(s => s.trim()))) : row.tags;
    db.prepare(
      'UPDATE team SET name = ?, role = ?, company = ?, avatar = ?, tags = ? WHERE id = ?'
    ).run(name ?? row.name, role ?? row.role, company ?? row.company, avatar ?? row.avatar, tagsStr, id);
    const updated = db.prepare('SELECT * FROM team WHERE id = ?').get(id);
    res.json(rowToMember(updated));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/team/:id — faqat o'sha tashkilot o'z mentorini o'chira oladi (body: orgId)
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { orgId } = req.body;
    const row = db.prepare('SELECT * FROM team WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Mentor topilmadi' });
    if (orgId && row.org_id !== orgId) return res.status(403).json({ error: 'Faqat o\'z tashkilotingiz mentorini o\'chira olasiz' });
    if (row.org_id === 'ALL') return res.status(403).json({ error: 'Umumiy mentorlarni o\'chirish mumkin emas' });
    db.prepare('DELETE FROM team WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
