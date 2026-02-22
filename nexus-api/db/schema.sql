-- NEXUS DB schema (SQLite)
-- Bir marta ishga tushiring: node -e "require('./db/initDb')" yoki server ilk ishga tushganda

-- Foydalanuvchilar (soddalashtirilgan — haqiqiy auth keyinroq)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  role TEXT NOT NULL CHECK(role IN ('student','organization','gov')),
  region TEXT DEFAULT 'Toshkent',
  org_id TEXT,
  org_name TEXT,
  plan TEXT DEFAULT 'free',
  school TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Loyihalar
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id TEXT NOT NULL,
  target_org_id TEXT NOT NULL DEFAULT 'ORG-ITP-001',
  title TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  author TEXT NOT NULL,
  phone TEXT,
  school TEXT,
  status TEXT NOT NULL DEFAULT 'Ko''rilmoqda' CHECK(status IN ('Ko''rilmoqda','Qabul qilindi','Rad etildi')),
  ai_score INTEGER DEFAULT 50,
  badges TEXT,
  feedback TEXT,
  ip_protected INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Bildirishnomalar
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK(type IN ('info','success','warning')),
  text TEXT NOT NULL,
  unread INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Mentorlar — org_id bo'yicha: har tashkilot/davlat o'z mentorlarini qo'shadi (org_id = 'ALL' — umumiy)
CREATE TABLE IF NOT EXISTS team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id TEXT NOT NULL DEFAULT 'ALL',
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar TEXT,
  rating REAL DEFAULT 5,
  tags TEXT
);
CREATE INDEX IF NOT EXISTS idx_team_org ON team(org_id);

-- Tashkilotlar — loyiha yuborishda tanlanadigan (investor/tashkilot)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexlar — tezroq so'rovlar uchun
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_target ON projects(target_org_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(org_id);
