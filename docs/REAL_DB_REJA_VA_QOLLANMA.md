# NEXUS platformasini real ma'lumotlar bazasiga ulash — Reja va 0 dan qo'llanma

Bu qo'llanmada platformani **real database** ga qanday ulashni bosqichma-bosqich o'rganasiz.

---

## 1-qism: Asosiy tushunchalar (0 dan)

### 1.1 Hozirgi holat (mock data)

- **Frontend** — brauzerda ishlaydigan React ilovangiz (`nexus-app`).
- Barcha ma'lumotlar **App.jsx** ichida: `initialProjects`, `mockTeam`, `initialNotifications`, `currentUser` — faqat xotira (state) da, sahifa yangilansa yo'qoladi.

### 1.2 Real DB nima va nima uchun kerak?

- **Ma'lumotlar bazasi (DB)** — ma'lumotlarni **doimiy** saqlaydigan joy (serverda). Sahifa yangilansa ham, kompyuter o'chsa ham ma'lumot qoladi.
- **Backend (server)** — brauzer bilan DB o'rtasidagi "tarjimon". Brauzer to'g'ridan-to'g'ri DB ga ulanmaydi; xavfsizlik va boshqaruv uchun backend kerak.

```
[Brauzer] ←→ [Backend API] ←→ [Ma'lumotlar bazasi]
  (React)        (Node/Express)      (PostgreSQL / SQLite / Supabase)
```

### 1.3 REST API qisqacha

- **API** — "so'rov–javob" qoidalari. Frontend **so'rov** yuboradi (masalan: "barcha loyihalarni ber"), backend **javob** qaytaradi (JSON).
- **REST** — URL va HTTP metodlari orqali:
  - `GET /api/projects` — loyihalar ro'yxati
  - `POST /api/projects` — yangi loyiha yaratish
  - `PATCH /api/projects/:id` — loyiha holatini o'zgartirish (qabul/rad)
  - `GET /api/notifications` — bildirishnomalar
  - `POST /api/auth/login` — kirish

---

## 2-qism: Texnologiya tanlash

Ikki yo'l (birini tanlang):

| Variant | Ustunliklari | Kamchiliklari |
|--------|----------------|----------------|
| **A) Supabase** | Bepul, PostgreSQL, tayyor Auth, real-time, tez ulash | Bulut xizmatiga bog'liqlik |
| **B) Node + Express + SQLite** | Hammasi sizning kompyuteringizda, to'liq nazorat, o'rganish uchun yaxshi | Auth va real-time ni o'zingiz yozasiz |

**Tavsiya:** Avval **Supabase** bilan boshlang (tez ishlatish), keyin ichki qismini tushunish uchun **B** variantini ham sinab ko'ring.

---

## 3-qism: Ma'lumotlar bazasi sxemasi (NEXUS uchun)

Platformangizdagi asosiy "ob'ektlar" va ularning jadval korinishi.

### 3.1 Jadvallar va ustunlar

**users** (foydalanuvchilar)

| Ustun       | Turi      | Izoh                    |
|------------|-----------|-------------------------|
| id         | UUID      | Yagona identifikator    |
| email      | string    | Kirish uchun            |
| password_hash | string | Shifrlangan parol       |
| full_name  | string    | To'liq ism              |
| role       | enum      | student / organization / gov |
| region     | string    | Hudud                   |
| org_id     | string    | Tashkilot ID (org uchun) |
| org_name   | string    | Tashkilot nomi          |
| plan       | string    | free / pro / enterprise  |
| school     | string    | Maktab/OTM (student)    |
| created_at | timestamp | Yaratilgan vaqt         |

**organizations** (ixtiyoriy — tashkilotlar alohida jadval bo'lishi mumkin)

| Ustun   | Turi   |
|--------|--------|
| id     | string (ORG-ITP-001) |
| name   | string |
| plan   | string |

**projects** (loyihalar)

| Ustun        | Turi      | Izoh                    |
|-------------|-----------|-------------------------|
| id          | UUID      |                         |
| org_id      | string    | Kim yubordi (maktab)    |
| target_org_id| string    | Kim ko'radi (investor)  |
| title       | string    | Loyiha nomi             |
| problem     | text      | Muammo                  |
| solution     | text      | Yechim                  |
| author      | string    | Muallif ismi            |
| phone       | string    |                         |
| school      | string    |                         |
| status      | string    | Ko'rilmoqda / Qabul qilindi / Rad etildi |
| ai_score    | integer   | 0–100                   |
| badges      | JSON array| ['Verified', ...]       |
| feedback    | text      | Ekspert xulosasi        |
| ip_protected | boolean  |                         |
| created_at  | timestamp |                         |

**notifications** (bildirishnomalar)

| Ustun   | Turi   |
|--------|--------|
| id     | UUID   |
| org_id | string |
| type   | info / success / warning |
| text   | string |
| unread | boolean |
| created_at | timestamp |

**mentorship_requests** (mentorlik so'rovlari, ixtiyoriy)

| Ustun    | Turi   |
|---------|--------|
| id      | UUID   |
| user_id | UUID   |
| mentor_id | UUID |
| project_id | UUID |
| created_at | timestamp |

Bu sxemadan **SQL** yoki **Supabase** da jadval yaratishda foydalanasiz.

---

## 4-qism: Supabase orqali ulash (A yo'l)

### 4.1 Supabase nima?

- PostgreSQL asosidagi bulut DB + tayyor **Auth** (email/parol, Google) + **Real-time** + REST API avtomatik.
- [supabase.com](https://supabase.com) — ro'yxatdan o'ting, yangi loyiha yarating.

### 4.2 Qadamlar

1. **Loyiha yarating:** Dashboard → New Project → nom (nexus), parol (DB uchun), region.
2. **Jadvallar:** SQL Editor da yuqoridagi sxemaga mos `CREATE TABLE` scriptlarini ishlating (keyingi qismda namuna beriladi).
3. **Auth:** Authentication → Providers da Email va (ixtiyoriy) Google yoqing.
4. **API kalitlari:** Settings → API — `project URL` va `anon public` key ni frontend da ishlatasiz.

### 4.3 Frontend da ulash

```bash
cd nexus-app
npm install @supabase/supabase-js
```

`.env` fayl yarating (root da):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`src/lib/supabase.js` (yoki `supabaseClient.js`):

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Keyin masalan loyihalarni olish:

```js
import { supabase } from './lib/supabase';

const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .eq('target_org_id', currentUser.orgId);
```

Kirish (Auth):

```js
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
// yoki ro'yxatdan o'tish:
await supabase.auth.signUp({ email, password, options: { data: { full_name, role, region } } });
```

Shu usulda `initialProjects` o'rniga Supabase dan olingan `projects` ni state ga yozasiz, yangi loyiha — `supabase.from('projects').insert(...)` qilasiz.

---

## 5-qism: Node + Express + SQLite (B yo'l — 0 dan backend)

Bu yo'l "backend nima va qanday ishlaydi" ni o'rganish uchun.

### 5.1 Loyiha tuzilishi

```
nexus/
  nexus-app/          ← React (frontend) — allaqachon bor
  nexus-api/          ← Backend (yangi)
    package.json
    server.js         ← Express server
    db/
      schema.sql      ← Jadval yaratish
      db.js           ← SQLite ulanish
    routes/
      projects.js
      auth.js
      notifications.js
```

### 5.2 Backend o'rnatish

```bash
mkdir nexus-api
cd nexus-api
npm init -y
npm install express cors better-sqlite3 dotenv
```

- **express** — server (API endpointlar).
- **cors** — brauzerdan kelgan so'rovlarni ruxsat berish.
- **better-sqlite3** — SQLite (bitta fayl DB, o'rnatish oson).
- **dotenv** — `.env` dan PORT va boshqa o'zgaruvchilarni o'qish.

### 5.3 server.js — minimal server

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);

app.listen(PORT, () => console.log(`NEXUS API http://localhost:${PORT}`));
```

### 5.4 DB sxemasi (schema.sql) va ulanish (db.js)

`db/schema.sql` — bir marta ishlatib jadvallarni yaratasiz.  
`db/db.js` — `better-sqlite3` bilan ulanish va kerak bo'lsa schema ni ishga tushirish.

Keyin `routes/projects.js` da:
- `GET /api/projects` — barcha loyihalar (yoki org_id bo'yicha filter).
- `POST /api/projects` — yangi loyiha qo'shish (body dan title, problem, solution, author, org_id, ...).

Frontend da:
- `useState(initialProjects)` o'rniga `useEffect` ichida `fetch('http://localhost:3001/api/projects')` qilib ma'lumotlarni olasiz.
- Loyiha yuborish: `fetch('http://localhost:3001/api/projects', { method: 'POST', body: JSON.stringify(formData), headers: { 'Content-Type': 'application/json' } })`.

Batafsil kod **nexus-api** papkada: `server.js`, `db/db.js`, `routes/projects.js`, `routes/notifications.js`, `routes/team.js`.  
Frontend da `nexus-app/src/api/client.js` — `api.getProjects()`, `api.createProject()` va hokazo.

---

## 6-qism: Frontend ni API ga ulash (umumiy qadamlar)

Qaysi backend bo'lishidan qat'iy nazar:

1. **API base URL** ni `.env` ga yozing (masalan `VITE_API_URL=http://localhost:3001` yoki Supabase URL).
2. **Bir xil API client** yarating: `src/api/client.js` — `fetch(VITE_API_URL + '/api/projects')` kabi.
3. **Mock ni almashtiring:**
   - `projects` — dastlab `[]`, `useEffect` da `GET /api/projects` chaqiring, javobni `setProjects` qiling.
   - Loyiha yuborish — form submit da `POST /api/projects`, keyin ro'yxatni qayta oling yoki javobni state ga qo'shing.
   - Bildirishnomalar — `GET /api/notifications`, status o'zgarganda `POST` qilish.
4. **Auth:** Hozirgi mock login o'rniga Supabase Auth yoki `POST /api/auth/login` dan token oling va keyingi so'rovlarda `Authorization: Bearer <token>` yuboring.

---

## 7-qism: Xavfsizlik (qisqacha)

- Parollarni **hech qachon** oddiy saqlamang — faqat hash (bcrypt).
- API da har bir so'rovda **kim kirgan** (user_id / org_id) ni tekshiring; faqat o'z ma'lumotlariga ruxsat bering.
- Production da HTTPS va yaxshi CORS sozlamalari ishlating.

---

## 8-qism: Tez boshlash (nexus-api bilan)

1. **Backend ishga tushiring:**
   ```bash
   cd nexus-api
   npm install
   npm start
   ```
   Browserda tekshiring: [http://localhost:3001/api/health](http://localhost:3001/api/health) → `{"ok":true}`.

2. **Frontend da .env:**  
   `nexus-app` papkada `.env` yarating, ichiga: `VITE_API_URL=http://localhost:3001`

3. **React da mock o'rniga API:**  
   `App.jsx` da loyihalarni `useEffect` ichida `api.getProjects()` chaqirib oling, yangi loyiha yuborishda `api.createProject(formData)` ishlating.  
   Namuna: `import api from './api/client';` keyin `const data = await api.getProjects(); setProjects(data);`

4. **Supabase** tanlasangiz: `docs/SUPABASE_SCHEMA.sql` ni SQL Editor da ishga tushiring, keyin `@supabase/supabase-js` o'rnatib, loyihalarni `supabase.from('projects').select('*')` orqali oling.

---

## 9-qism: Keyingi qadamlar (reja)

1. **Hafta 1:** Supabase loyiha + jadvallar + frontend da faqat loyihalarni o'qish/yozish (projects).
2. **Hafta 2:** Auth ni Supabase yoki Express ga ulash, kirish/chiqish.
3. **Hafta 3:** Notifications, loyiha holatini o'zgartirish (qabul/rad).
4. **Hafta 4:** Rol bo'yicha filter (student / org / gov), KPI uchun agregat so'rovlar.

Agar Node+SQLite yo'lini tanlasangiz — `nexus-api` papkadagi kodlarni ketma-ket ochib, serverni ishga tushirib, frontend dan `fetch` orqali sinab ko'ring.

---

**Xulosa:** Avval **Supabase** bilan tez ulang va loyihalarni real DB da ko'ring. Keyin **Node + Express + SQLite** bilan backend ni qatordan o'rganing. Sxema va qadamlar yuqorida — keyingi fayllar (`nexus-api` va `.env.example`) aniq kod bilan beriladi.
