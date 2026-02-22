require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const projectsRouter = require('./routes/projects');
const notificationsRouter = require('./routes/notifications');
const teamRouter = require('./routes/team');
const organizationsRouter = require('./routes/organizations');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/team', teamRouter);
app.use('/api/organizations', organizationsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'NEXUS API ishlayapti' });
});

app.listen(PORT, () => {
  console.log(`NEXUS API: http://localhost:${PORT}`);
  console.log('  GET  /api/projects');
  console.log('  POST /api/projects');
  console.log('  PATCH /api/projects/:id');
  console.log('  GET  /api/notifications');
  console.log('  POST /api/notifications');
  console.log('  GET  /api/team');
  console.log('  GET  /api/organizations');
});
