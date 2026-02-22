const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/notifications?orgId=ORG-ITP-001
router.get('/', (req, res) => {
  try {
    const { orgId } = req.query;
    let rows;
    if (orgId) {
      rows = db.prepare('SELECT * FROM notifications WHERE org_id = ? OR org_id = ? ORDER BY id DESC').all(orgId, 'ALL');
    } else {
      rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC').all();
    }
    const list = rows.map((r) => ({
      id: r.id,
      orgId: r.org_id,
      type: r.type,
      text: r.text,
      unread: !!r.unread,
      time: r.created_at,
    }));
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/notifications — yangi bildirishnoma (masalan loyiha status o'zgaganda)
router.post('/', (req, res) => {
  try {
    const { orgId, type = 'info', text } = req.body;
    if (!orgId || !text) return res.status(400).json({ error: 'orgId va text majburiy' });
    const result = db.prepare('INSERT INTO notifications (org_id, type, text, unread) VALUES (?, ?, ?, 1)').run(orgId, type, text);
    const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      id: row.id,
      orgId: row.org_id,
      type: row.type,
      text: row.text,
      unread: true,
      time: row.created_at,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
