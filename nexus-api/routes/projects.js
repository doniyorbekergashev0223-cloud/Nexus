const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/projects — role + orgId bo'yicha: tashkilotlar faqat o'zlariga yuborilgan loyihalarni ko'radi
// Query: role=organization|student|gov, orgId=ORG-XXX (organization va student uchun majburiy)
router.get('/', (req, res) => {
  try {
    const { role, orgId } = req.query;
    let sql = 'SELECT * FROM projects ORDER BY id DESC';
    const params = [];

    if (role === 'organization') {
      if (!orgId) return res.status(400).json({ error: 'organization uchun orgId majburiy' });
      sql = 'SELECT * FROM projects WHERE target_org_id = ? ORDER BY id DESC';
      params.push(orgId);
    } else if (role === 'student') {
      if (!orgId) return res.status(400).json({ error: 'student uchun orgId majburiy' });
      sql = 'SELECT * FROM projects WHERE org_id = ? ORDER BY id DESC';
      params.push(orgId);
    } else if (role === 'gov') {
      // Davlat: barcha loyihalar
      sql = 'SELECT * FROM projects ORDER BY id DESC';
    } else if (orgId) {
      // Eski format: faqat orgId berilsa — target_org_id bo'yicha (tashkilot rejimi)
      sql = 'SELECT * FROM projects WHERE target_org_id = ? ORDER BY id DESC';
      params.push(orgId);
    }
    const rows = db.prepare(sql).all(...params);
    const projects = rows.map((r) => ({
      id: r.id,
      orgId: r.org_id,
      targetOrgId: r.target_org_id,
      title: r.title,
      problem: r.problem,
      solution: r.solution,
      author: r.author,
      phone: r.phone,
      school: r.school,
      status: r.status,
      aiScore: r.ai_score,
      badges: r.badges ? JSON.parse(r.badges) : [],
      feedback: r.feedback || '',
      date: r.created_at ? r.created_at.slice(0, 10) : '',
      ipProtected: !!r.ip_protected,
    }));
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/projects — yangi loyiha
router.post('/', (req, res) => {
  try {
    const {
      orgId,
      targetOrgId = 'ORG-ITP-001',
      title,
      problem,
      solution,
      author,
      phone = '',
      school,
      ipProtected = false,
    } = req.body;
    if (!orgId || !title || !author) {
      return res.status(400).json({ error: 'orgId, title, author majburiy' });
    }
    const aiScore = Math.round(50 + Math.random() * 50);
    const badges = aiScore >= 85 ? '["Star Project"]' : aiScore >= 70 ? '["Verified"]' : aiScore >= 50 ? '["Developing"]' : '["Draft"]';
    const result = db
      .prepare(
        `INSERT INTO projects (org_id, target_org_id, title, problem, solution, author, phone, school, status, ai_score, badges, ip_protected)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Ko''rilmoqda', ?, ?, ?)`
      )
      .run(orgId, targetOrgId, title || '', problem || '', solution || '', author, phone || '', school || '', aiScore, badges, ipProtected ? 1 : 0);
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    const project = {
      id: row.id,
      orgId: row.org_id,
      targetOrgId: row.target_org_id,
      title: row.title,
      problem: row.problem,
      solution: row.solution,
      author: row.author,
      phone: row.phone,
      school: row.school,
      status: row.status,
      aiScore: row.ai_score,
      badges: row.badges ? JSON.parse(row.badges) : [],
      feedback: row.feedback || '',
      date: row.created_at ? row.created_at.slice(0, 10) : '',
    };
    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/projects/:id — status va feedback; faqat target_org_id = orgId bo'lgan tashkilot o'zgartira oladi
router.patch('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, feedback, orgId } = req.body;
    if (!status) return res.status(400).json({ error: 'status majburiy' });
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Loyiha topilmadi' });
    if (orgId && row.target_org_id !== orgId) return res.status(403).json({ error: 'Ushbu loyihani faqat uning tashkiloti o\'zgartira oladi' });
    db.prepare('UPDATE projects SET status = ?, feedback = ? WHERE id = ?').run(status, feedback || '', id);
    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.json({
      id: updated.id,
      orgId: updated.org_id,
      targetOrgId: updated.target_org_id,
      title: updated.title,
      status: updated.status,
      feedback: updated.feedback || '',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
