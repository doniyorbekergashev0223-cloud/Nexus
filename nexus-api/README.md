# NEXUS API (Backend)

Node + Express + SQLite — real ma'lumotlar bazasiga ulash uchun lokal backend.

## O'rnatish

**Eslatma:** `nexus-api` papkasi `nexus-app` ning **ichida emas**, `nexus` papkasida uning **yonida**. Avval `nexus` (Desktop\nexus) ga chiqing.

```bash
cd C:\Users\User\Desktop\nexus\nexus-api
npm install
```

## Ishga tushirish

```bash
npm start
```

Server `http://localhost:3001` da ishga tushadi. DB fayl avtomatik yaratiladi: `db/nexus.db`.

## API endpointlar

| Metod | URL | Tavsif |
|-------|-----|--------|
| GET | /api/health | Server holati |
| GET | /api/projects | **Role bo'yicha:** ?role=organization\|student\|gov&orgId=ORG-XXX (tashkilotlar faqat o'zlariga yuborilgan loyihalarni oladi) |
| POST | /api/projects | Yangi loyiha |
| PATCH | /api/projects/:id | Status/feedback (body da orgId yuboriladi — faqat ushbu loyiha target_org_id ga teng bo'lsa yangilanadi) |
| GET | /api/notifications | Bildirishnomalar (?orgId=...) |
| POST | /api/notifications | Yangi bildirishnoma |
| GET | /api/team | Mentorlar ro'yxati |

**Tashkilotlar izolyatsiyasi:** GET /api/projects da `role=organization` va `orgId=ORG-ITP-001` yuborilsa — faqat `target_org_id = ORG-ITP-001` bo'lgan loyihalar qaytadi. Boshqa tashkilot loyihalari ko'rinmaydi.

## Frontend ulash

1. `nexus-app` da `.env` yarating: `VITE_API_URL=http://localhost:3001`
2. `src/api/client.js` dan `api.getProjects()`, `api.createProject()` va boshqalarni chaqiring.
3. Batafsil: `docs/REAL_DB_REJA_VA_QOLLANMA.md`
