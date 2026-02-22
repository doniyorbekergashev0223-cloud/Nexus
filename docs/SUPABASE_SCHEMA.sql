-- NEXUS: Supabase (PostgreSQL) jadvallar
-- Supabase Dashboard → SQL Editor da ishga tushiring

-- Foydalanuvchilar (Supabase Auth bilan birga ishlatish mumkin — auth.users dan keyin profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student','organization','gov')),
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

-- RLS (Row Level Security) — har bir jadval uchun
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Masalan: projects — o'qish hammaga, yozish faqat autentifikatsiya qilingan
CREATE POLICY "Projects read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Projects insert" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Projects update" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
