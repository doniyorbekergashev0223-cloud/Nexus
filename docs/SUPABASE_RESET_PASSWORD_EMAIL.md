# Parol tiklash email template (500 / "No API key" xatosini bartaraf etish)

Sabab: Emaildagi havola to‘g‘ridan-to‘g‘ri Supabase `recover` ga boradi, brauzerda `apikey` bo‘lmaydi → "No API key found".

Yechim: Havolani **sizning saytingizga** qiling; sayt `token_hash` ni Supabase’ga yuboradi (anon key bilan).

---

## Supabase Dashboard’da qilish

1. **Authentication** → **Email Templates** → **Reset password**.
2. **Body** (Source) da eski havolani olib tashlang va quyidagi **bitta** linkni qo‘ying.

### Variant A — Production (Vercel)

Havola faqat production’ga:

```html
<h2>Reset Password</h2>
<p>Parolni tiklash uchun quyidagi havolani bosing:</p>
<p><a href="https://nexus-delta-olive.vercel.app/?token_hash={{ .TokenHash }}&type=recovery#reset-password">Reset Password</a></p>
```

### Variant B — Site URL dan (barcha muhitlar)

Agar local yoki boshqa domen ham bo‘lsa, `{{ .SiteURL }}` ishlating:

```html
<h2>Reset Password</h2>
<p>Parolni tiklash uchun quyidagi havolani bosing:</p>
<p><a href="{{ .SiteURL }}/?token_hash={{ .TokenHash }}&type=recovery#reset-password">Reset Password</a></p>
```

**Muhim:** `{{ .ConfirmationURL }}` dan foydalanmang — u Supabase’ga boradi va "No API key" xatosini keltiradi.

3. **Save changes** bosing.

---

## Ilova qanday ishlaydi

1. Foydalanuvchi emaildagi havolani bosadi → sayt ochiladi: `.../?token_hash=...&type=recovery#reset-password`.
2. Ilova URL’dan `token_hash` va `type` ni oladi va `supabase.auth.verifyOtp({ token_hash, type: 'recovery' })` chaqiradi (anon key bor).
3. Sessiya ochiladi, yangi parol formasi ko‘rinadi, foydalanuvchi parolni yangilaydi.
