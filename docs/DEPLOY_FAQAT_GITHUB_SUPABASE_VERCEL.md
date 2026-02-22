# Deploy — faqat GitHub, Supabase va Vercel

Platformani **faqat uchta xizmat** bilan deploy qilish: GitHub (kod), Supabase (ma’lumotlar bazasi), Vercel (veb-sayt). **Render yoki boshqa server kerak emas** — frontend to‘g‘ridan-to‘g‘ri Supabase bilan ishlaydi.

---

## 1. GitHub — kodni yuklash

1. [github.com](https://github.com) da akkaunt oching (agar yo‘q bo‘lsa).
2. **New repository** → nom: `nexus` (yoki ixtiyoriy) → **Create**.
3. Loyihangiz papkasida (masalan `Desktop\nexus`) terminal oching:

```bash
git init
git add .
git commit -m "NEXUS platform"
git branch -M main
git remote add origin https://github.com/SIZNING_LOGININGIZ/nexus.git
git push -u origin main
```

(SIZNING_LOGININGIZ o‘rniga GitHub username yozasiz.)

---

## 2. Supabase — ma’lumotlar bazasi

1. [supabase.com](https://supabase.com) → **Sign Up** (Google yoki email).
2. **New Project**:
   - **Name:** `nexus`
   - **Database Password:** parol yarating va saqlab qo‘ying
   - **Region:** yaqin mintaqa
3. **Create new project** → bir necha daqiqa kuting.

### 2.1 Jadvallar yaratish

1. Chap menyu → **SQL Editor** → **New query**.
2. Quyidagi SQL ni **to‘liq** nusxalab **Run** bosing:

```sql
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
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_target ON public.projects(target_org_id);

-- Bildirishnomalar
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning')),
  text TEXT NOT NULL,
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(org_id);

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

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all team" ON public.team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);
```

### 2.2 Kalitlarni olish

1. **Project Settings** (chap pastda) → **API**.
2. Nusxalab qo‘ying:
   - **Project URL** → keyinroq `VITE_SUPABASE_URL`
   - **anon public** key → keyinroq `VITE_SUPABASE_ANON_KEY`

---

## 3. Vercel — saytni deploy qilish

1. [vercel.com](https://vercel.com) → **Sign Up** (GitHub bilan ulash eng oson).
2. **Add New…** → **Project**.
3. **Import** orqali GitHub dan `nexus` reponi tanlang.

### 3.1 Sozlamalar

| Maydon | Qiymat |
|--------|--------|
| **Root Directory** | `nexus-app` (agar repo ildizida `nexus-app` papka bo‘lsa). |
| **Framework Preset** | Vite (yoki Auto). |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.2 Environment Variables

**Settings** → **Environment Variables** da ikkita o‘zgaruvchi qo‘shing (Production, Preview, Development uchun ham belgilang):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | Supabase dan nusxalagan **Project URL** (https://xxxxx.supabase.co) |
| `VITE_SUPABASE_ANON_KEY` | Supabase dan nusxalagan **anon public** key |

**Save** → **Redeploy** (yoki **Deploy**).

---

## 4. Tayyor

- Sayt manzili: `https://nexus-xxx.vercel.app` (Vercel beradi).
- Ma’lumotlar Supabase da saqlanadi.
- Keyingi o‘zgarishlarni GitHub ga push qilsangiz, Vercel avtomatik yangi versiya deploy qiladi.

**Eslatma:**  
- Render yoki boshqa server **kerak emas** — ma’lumotlar to‘g‘ridan-to‘g‘ri Supabase da saqlanadi.  
- Lokalda: `.env` da `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` bo‘lsa — Supabase ishlatiladi; bo‘lmasa — `VITE_API_URL` (localhost:3001) orqali Node API ishlatiladi.

---

## 5. Parolni unutdingizmi (Forgot password)

Agar platformada **Supabase Auth** (email/parol) ishlatilsa, "Parolni unutdingizmi?" quyidagicha sozlanadi.

### 5.1 Supabase sozlamalari

1. **Authentication → Providers**  
   - **Email** yoqilgan bo‘lishi kerak (Sign in with email).

2. **Authentication → URL Configuration**  
   - **Site URL:** sayt manzilingiz (masalan `https://nexus-xxx.vercel.app` yoki `http://localhost:5173`).  
   - **Redirect URLs** ga qo‘shing:  
     - `https://SIZNING_VERCEL_DOMENINGIZ.vercel.app/#reset-password`  
     - `http://localhost:5173/#reset-password`  
   (Supabase parol tiklash havolasini shu URL ga yo‘naltiradi.)

3. **Email Templates** (ixtiyoriy)  
   - **Reset password** shablonini matn/til bo‘yicha tahrirlashingiz mumkin.

### 5.2 Ilovada nima qilingan

- **Kirish** modali ichida "Parolni unutdingizmi?" linki bor.  
- Link bosilganda: email kiritish formasi ochiladi.  
- **Supabase ulangan** bo‘lsa: email yuboriladi → `supabase.auth.resetPasswordForEmail(email, { redirectTo: sayt/#reset-password })`.  
- Foydalanuvchi emaildagi havolani bosadi → sayt `#reset-password` sahifasiga keladi → **yangi parol** kiritadi → `supabase.auth.updateUser({ password })` orqali parol yangilanadi.  
- **Supabase ulanmagan** bo‘lsa (masalan faqat mock kirish): "Parolni tiklash faqat Supabase ulanganida ishlaydi" degan xabar chiqadi.

### 5.3 Qisqacha ketma-ketlik

| Qadam | Qayerda | Harakat |
|------|---------|---------|
| 1 | Kirish modali | "Parolni unutdingizmi?" bosiladi |
| 2 | Modal | Email kiritiladi, "Link yuborish" bosiladi |
| 3 | Supabase | `resetPasswordForEmail` → emailga havola yuboriladi |
| 4 | Email | Foydalanuvchi havolani ochadi → sayt `#reset-password` ga keladi |
| 5 | Sahifa | Yangi parol + takroriy parol kiritiladi, "Parolni o‘rnatish" |
| 6 | Supabase | `updateUser({ password })` → parol yangilanadi, keyin kirish sahifasiga qaytish |

Vercel da qo‘shimcha environment variable kerak emas — `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` yetarli.
