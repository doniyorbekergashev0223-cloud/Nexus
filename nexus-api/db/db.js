const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname);
const dbPath = path.join(dir, 'nexus.db');

const db = new Database(dbPath);

// Schema ni bir marta ishga tushirish
function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(sql);
  // Demo ma'lumotlar (ixtiyoriy — birinchi marta)
  const cols = db.prepare("PRAGMA table_info(team)").all();
  if (cols.find(c => c.name === 'org_id') === undefined) {
    try { db.exec("ALTER TABLE team ADD COLUMN org_id TEXT NOT NULL DEFAULT 'ALL'"); } catch (e) {}
    db.prepare("UPDATE team SET org_id = 'ALL' WHERE org_id IS NULL OR org_id = ''").run();
  }
  const orgCount = db.prepare('SELECT COUNT(*) as c FROM organizations').get();
  if (orgCount.c === 0) {
    db.prepare(`
      INSERT INTO organizations (id, name, region) VALUES
      ('ORG-ITP-001', 'IT Park Uzbekistan', 'Toshkent'),
      ('ORG-UZVC-002', 'UzVC Fund', 'Toshkent'),
      ('ORG-AGRO-003', 'AgroBank', 'Toshkent'),
      ('ORG-YV-004', 'Yoshlar Ventures', 'Toshkent'),
      ('ORG-INNO-005', 'Innovatsiya Vazirligi', 'Toshkent')
    `).run();
  }
  const projectCount = db.prepare('SELECT COUNT(*) as c FROM projects').get();
  if (projectCount.c === 0) {
    db.prepare(`
      INSERT INTO projects (org_id, target_org_id, title, problem, solution, author, phone, school, status, ai_score, badges, feedback) VALUES
      ('ORG-SCH-007', 'ORG-ITP-001', 'AgroSmart - Qishloq xo''jaligida suvni tejash', 'Suv isrofi', 'IoT va AI', 'Aziz Rahimov', '+998901234567', '7-sonli maktab', 'Qabul qilindi', 92, '["Star Project","EXPERT_APPROVED"]', 'Dolzarb muammo.'),
      ('ORG-SCH-007', 'ORG-ITP-001', 'EduVR - Virtual laboratoriya', 'Lab yetishmasligi', 'VR platforma', 'Malika Tohirova', '+998999876543', 'IT Texnikum', 'Rad etildi', 42, '["Draft"]', 'Qimmat.'),
      ('ORG-SCH-012', 'ORG-ITP-001', 'EcoDrone - Yong''inni aniqlash', 'O''rmon yong''ini', 'Dron + AI', 'Sardor Rustamov', '+998933217654', 'Prezident maktabi', 'Ko''rilmoqda', 78, '["Verified"]', '')
    `).run();
    db.prepare(`
      INSERT INTO notifications (org_id, type, text, unread) VALUES
      ('ORG-ITP-001', 'info', 'Yangi AI Premium tahlil moduli ishga tushdi.', 1),
      ('ORG-SCH-007', 'success', 'Sardor Rustamov yangi loyiha yubordi.', 1),
      ('ALL', 'warning', 'Toshkent viloyati bo''yicha KPI yangilandi.', 0)
    `).run();
    db.prepare(`
      INSERT INTO team (org_id, name, role, company, avatar, rating, tags) VALUES
      ('ALL', 'Doniyor Ergashev', 'Startap Ekspert / Investor', 'UzVC', 'DE', 4.9, '["IT","FinTech"]'),
      ('ALL', 'Malika Azimova', 'Agrotexnologiyalar bo''yicha Mentor', 'AgroBank', 'MA', 4.8, '["Agro","Eco"]'),
      ('ALL', 'Rustam Qodirov', 'Texnik arxitektor (CTO)', 'EPAM', 'RQ', 5.0, '["AI","EduTech"]')
    `).run();
  }
}

initSchema();

module.exports = db;
