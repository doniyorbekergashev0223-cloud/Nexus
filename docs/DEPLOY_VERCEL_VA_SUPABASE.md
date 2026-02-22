# NEXUS platformani Vercel va Supabase da deploy qilish — bosqichma-bosqich

Bu qo‘llanma professional bo‘lmaganlar uchun: **nimalar yaratish** va **qanday sozlash** kerakligi aniq yozilgan.

---

## Umumiy tushuncha

| Xizmat      | Vazifasi |
|------------|----------|
| **Vercel** | Frontend (React ilova — nexus-app) ni internetda ochish. |
| **Supabase** | Ma’lumotlar bazasi (loyihalar, tashkilotlar, mentorlar va hokazo). Keyinchalik kirish (Auth) ham qo‘shish mumkin. |
| **Backend (API)** | Hozircha loyihangizda Node (nexus-api) + SQLite bor. Deployda ikkita yo‘l: (1) API ni **Render** da deploy qilish (bepul), (2) Keyinroq ma’lumotlarni to‘g‘ridan-to‘g‘ri **Supabase** dan o‘qish/yozish (frontendda Supabase client). Birinchi marta (1) yo‘lini tavsiya qilamiz. |

**Natija:**  
- Vercel: `https://nexus-xxx.vercel.app` — platforma.  
- Render: `https://nexus-api.onrender.com` — API.  
- Supabase: ma’lumotlar (keyinroq API ni Supabase ga ulashing yoki frontenddan Supabase ishlating).

---

**Loyiha struktura (GitHub):** Repo ildizi `nexus` (ichida `nexus-app` va `nexus-api`). Vercel da Root = `nexus-app`, Render da Root = `nexus-api`.

---

# QISM 1: Supabase da nimalar yaratish

## 1.1 Akkaunt va loyiha

1. [supabase.com](https://supabase.com) ga kiring.
2. **Sign Up** (Google yoki email orqali).
3. **New Project** bosing.
4. To‘ldiring:
   - **Name:** `nexus` (yoki xohlagan nom).
   - **Database Password:** mustaqil parol yarating va **saqlab qo‘ying** (keyinroq kerak bo‘ladi).
   - **Region:** yaqin mintaqa (masalan Central Asia yoki Europe).
5. **Create new project** bosing va bir necha daqiqa kuting.

## 1.2 Ma’lumotlar bazasi jadvallari (SQL)

1. Supabase Dashboard da chap tomonda **SQL Editor** ni oching.
2. **New query** bosing.
3. Quyidagi SQL ni **to‘liq** nusxalab yopishtiring va **Run** bosing.

```sql
-- NEXUS: asosiy jadvallar
-- 1) Loyihalar
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
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_target ON public.projects(target_org_id);

-- 2) Bildirishnomalar
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning')),
  text TEXT NOT NULL,
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(org_id);

-- 3) Mentorlar
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

-- 4) Tashkilotlar (loyiha yuborishda tanlash)
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

-- 5) RLS (xavfsizlik) — hozircha oddiy: barcha o‘qish/yozish ochiq (keyinroq Auth qo‘shganda qat’iylashtirasiz)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all team" ON public.team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);
```

4. Xato bo‘lmasa, barcha jadvallar yaratilgan bo‘ladi. **Table Editor** da `projects`, `notifications`, `team`, `organizations` ko‘rinadi.

## 1.3 API kalitlari olish

1. Chap menyuda **Project Settings** (eng pastida) → **API**.
2. Quyidagilarni **nusxalab** xavfsiz joyga yozing:
   - **Project URL** (masalan `https://xxxxx.supabase.co`) — bu **VITE_SUPABASE_URL** bo‘ladi.
   - **anon public** key (uzun matn) — bu **VITE_SUPABASE_ANON_KEY** bo‘ladi.

Keyinchalik frontend ni Supabase ga ulashda shu ikki qiymatni `.env` va Vercel da ishlatasiz.

---

# QISM 2: Vercel da frontend (nexus-app) deploy qilish

## 2.1 Akkaunt va loyiha

1. [vercel.com](https://vercel.com) ga kiring.
2. **Sign Up** (GitHub bilan ulash eng qulay).
3. **Add New…** → **Project** bosing.

## 2.2 Kodni Vercel ga yetkazish

**Variant A — GitHub orqali (tavsiya etiladi):**

1. Loyihangizni GitHub ga yuklang (agar qilmagan bo‘lsangiz):
   - [github.com](https://github.com) → **New repository** (masalan `nexus`).
   - Lokal papkada (masalan `Desktop\nexus`) terminalda:
     ```bash
     git init
     git add .
     git commit -m "Initial"
     git remote add origin https://github.com/SIZNING_LOGININGIZ/nexus.git
     git push -u origin main
     ```
2. Vercel da **Import Git Repository** → GitHub ni tanlang → `nexus` reponi tanlang → **Import**.

**Variant B — Vercel CLI orqali:**

1. [vercel.com/download](https://vercel.com/download) dan CLI o‘rnating.
2. Terminalda `nexus-app` papkasiga kiring va: `vercel` (login qiling, savollarga javob bering).

## 2.3 Vercel da sozlamalar (muhim)

Import qilganda yoki loyiha yaratganda quyidagilarni tekshiring:

| Maydon            | Qiymat |
|-------------------|--------|
| **Root Directory** | `nexus-app` (agar repo ildizida `nexus-app` papka bo‘lsa). Agar faqat frontend kod bir papkada bo‘lsa, **.** qoldiring. |
| **Framework Preset** | Vite (yoki Auto). |
| **Build Command**    | `npm run build` (odatda avtomatik). |
| **Output Directory** | `dist` (Vite uchun). |
| **Install Command**  | `npm install`. |

**Environment Variables (Build va Production uchun):**

- **Name:** `VITE_API_URL`  
  **Value:** Backend API manzili.  
  - Hozircha test uchun: `https://nexus-api-xxxx.onrender.com` (Render da API deploy qilgach shu manzilni yozasiz).  
  - Lokal tekshirish uchun: `http://localhost:3001` qo‘yishingiz mumkin (faqat o‘zingizda ishlaydi).

Agar keyinchalik frontend to‘g‘ridan-to‘g‘ri Supabase ga ulansa:

- **VITE_SUPABASE_URL** = Supabase Project URL  
- **VITE_SUPABASE_ANON_KEY** = Supabase anon key  

**Save** → **Deploy** bosing.

## 2.4 Natija

- Build muvaffaqiyatli bo‘lsa, sizga **https://nexus-xxx.vercel.app** kabi manzil beriladi.
- Har safar `main` branch ga push qilsangiz, Vercel avtomatik qayta deploy qiladi.

---

# QISM 3: Backend API ni Render da deploy qilish (bepul)

Hozirgi **nexus-api** (Node + Express + SQLite) ni internetda ishlatish uchun Render bepul xizmatiga qo‘yish mumkin.

## 3.1 Render da nima yaratish kerak

1. [render.com](https://render.com) ga kiring, **Get Started** (GitHub bilan).
2. **Dashboard** → **New +** → **Web Service**.
3. GitHub reponi ulang (agar ulangan bo‘lmasa) va **nexus** (yoki kod joylashgan repo) ni tanlang.

## 3.2 Web Service sozlamalari

| Maydon           | Qiymat |
|------------------|--------|
| **Name**         | `nexus-api` (yoki xohlagan nom). |
| **Region**       | Singapore yoki Yaqin sharq (qolganlar uchun). |
| **Root Directory** | `nexus-api` (agar repo ildizida `nexus-app` va `nexus-api` bo‘lsa). |
| **Runtime**      | Node. |
| **Build Command** | `npm install`. |
| **Start Command** | `npm start`. |
| **Instance Type** | **Free** (bepul). |

**Environment:**

- **Key:** `PORT`  
  **Value:** `3001` (yoki Render o‘zi beradi — bo‘sh qoldirish ham mumkin).

**Create Web Service** bosing.

## 3.3 Natija va muhim eslatma

- Render sizga manzil beradi: `https://nexus-api-xxxx.onrender.com`.
- **Bepul instanseda:** bir vaqtning o‘zida ishlamasa, birinchi so‘rovda 1–2 daqiqa “uyqudan uyg‘onishi” mumkin.
- **SQLite** Render da vaqtincha fayl saqlaydi; bepul konteyner qayta ishga tushsa ma’lumotlar yo‘qolishi mumkin. Barqaror ishlatish uchun keyinroq API ni **Supabase PostgreSQL** ga ulash tavsiya etiladi.

## 3.4 Frontend ni API ga ulash

Vercel da **nexus-app** loyihasiga kirib, **Settings** → **Environment Variables** da:

- **VITE_API_URL** = `https://nexus-api-xxxx.onrender.com` (Render dagi haqiqiy manzil).

Keyin **Redeploy** (yoki yangi commit push) qiling.

---

# QISM 4: Tekshirish va keyingi qadamlar

## 4.1 Tekshirish

1. **Frontend:** `https://sizning-nexus.vercel.app` — sahifa ochiladi, platforma ko‘rinadi.
2. **API:** Brauzerda `https://nexus-api-xxxx.onrender.com/api/health` oching — `{"ok":true,...}` chiqishi kerak.
3. Platformada loyiha yuborish, tashkilot tanlash, mentorlar — barchasi API orqali ishlashi kerak (agar `VITE_API_URL` to‘g‘ri bo‘lsa).

## 4.2 Xavfsizlik (keyinroq)

- Supabase da **Authentication** yoqib, kirishni faqat ro‘yxatdan o‘tgan foydalanuvchilarga cheklashingiz mumkin.
- **RLS** (Row Level Security) siyosatlarini qat’iylashtirib, har bir jadvalda kim nima ko‘rishi va o‘zgartirishi mumkinligini sozlang.

## 4.3 Keyinchalik: API ni Supabase PostgreSQL ga ulash

Ma’lumotlarni doimiy saqlash va barqaror ishlatish uchun:

1. Supabase **Project Settings** → **Database** da **Connection string** (URI) ni oling.
2. **nexus-api** da SQLite o‘rniga **PostgreSQL** (masalan `pg` paketi) ishlatadigan qilib o‘zgartiring va `DATABASE_URL` ni Render **Environment** ga qo‘ying.

Buning batafsil qadamlari alohida qo‘llanmada berilishi mumkin; hozircha Render + SQLite yetarli bo‘ladi.

---

# Qisqacha ro‘yxat: nimalar yaratish kerak

| Qayerda    | Nima qilish |
|------------|-------------|
| **Supabase** | 1) Yangi project. 2) SQL Editor da jadvallar (projects, notifications, team, organizations) + RLS. 3) API → Project URL va anon key ni olish. |
| **Vercel**   | 1) GitHub dan import (yoki CLI). 2) Root = `nexus-app`, Build = `npm run build`. 3) Env: `VITE_API_URL` = Render API manzili. |
| **Render**   | 1) Web Service, repo = nexus. 2) Root = `nexus-api`, Start = `npm start`. 3) Env: `PORT` = 3001 (ixtiyoriy). |

Shu uchta joyda bularni yaratib, sozlasangiz — platformangiz internetda ishlaydi.
