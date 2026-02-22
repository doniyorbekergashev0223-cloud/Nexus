const express = require('express');
const db = require('../db/db');

const router = express.Router();

// GET /api/organizations — loyiha yuborishda tanlash uchun tashkilotlar ro'yxati
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, region FROM organizations ORDER BY name').all();
    res.json(rows.map(r => ({ id: r.id, name: r.name, region: r.region || '' })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
