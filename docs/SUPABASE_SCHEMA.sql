-- NEXUS: Supabase (PostgreSQL) jadvallar
-- Supabase Dashboard → SQL Editor da ishga tushiring

-- Foydalanuvchilar (Supabase Auth bilan birga ishlatish mumkin — auth.users dan keyin profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','organization','gov')),
  region TEXT DEFAULT 'Toshkent',
  org_id TEXT,
  org_name TEXT,
  plan TEXT DEFAULT 'free',
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Loyihalar
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  target_org_id TEXT NOT NULL DEFAULT 'ORG-ITP-001',
  title TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  author TEXT NOT NULL,
  phone TEXT,
  school TEXT,
  status TEXT NOT NULL DEFAULT 'Ko''rilmoqda' CHECK (status IN ('Ko''rilmoqda','Qabul qilindi','Rad etildi')),
  ai_score INT DEFAULT 50,
  badges JSONB DEFAULT '[]',
  feedback TEXT,
  ip_protected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_org ON public.projects(org_id);
CREATE INDEX idx_projects_target ON public.projects(target_org_id);

-- Bildirishnomalar
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning')),
  text TEXT NOT NULL,
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_org ON public.notifications(org_id);

-- Mentorlar
CREATE TABLE IF NOT EXISTS public.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL DEFAULT 'ALL',
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar TEXT,
  rating REAL DEFAULT 5,
  tags TEXT
);
CREATE INDEX IF NOT EXISTS idx_team_org ON public.team(org_id);

-- Tashkilotlar
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO public.organizations (id, name, region) VALUES
  ('ORG-ITP-001', 'IT Park Uzbekistan', 'Toshkent'),
  ('ORG-UZVC-002', 'UzVC Fund', 'Toshkent'),
  ('ORG-AGRO-003', 'AgroBank', 'Toshkent'),
  ('ORG-YV-004', 'Yoshlar Ventures', 'Toshkent'),
  ('ORG-INNO-005', 'Innovatsiya Vazirligi', 'Toshkent')
ON CONFLICT (id) DO NOTHING;

-- RLS (Row Level Security)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Profiles: faqat o'z profilini o'qiydi/yozadi
CREATE POLICY "Profiles read own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Boshqa jadvallar: deploy da oddiy "Allow all" ham mumkin
CREATE POLICY "Projects read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Projects insert" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Projects update" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all team" ON public.team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);
