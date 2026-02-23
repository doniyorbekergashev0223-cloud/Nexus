import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  LayoutDashboard, Send, Folder, Users, 
  Bell, CheckCircle, AlertTriangle, ShieldCheck, 
  Cpu, Award, MapPin, Building, TrendingUp,
  LogOut, PlayCircle, Star, Sparkles, Activity, ArrowRight, ArrowLeft,
  Briefcase, MessageSquare, Globe,
  FileText, Lock, X, QrCode, Ticket, Phone, Mail, Play,
  Menu, Settings, Loader, CreditCard, LogIn, UserPlus, Server,
  Target, Rocket, Lightbulb, GraduationCap, BookOpen, Landmark
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import api, { ensurePublicStorageUrl } from './api/client';
import { supabase } from './lib/supabase';

// --- TRANSLATION DICTIONARY (i18n) ---
const translations = {
  uz: {
    nav: { about: "Loyiha haqida", contact: "Bog'lanish", gov: "Davlat KPI", orgLogin: "Tashkilot Kirish", studentLogin: "Maktab Paneli", login: "Kirish", dashboard: "Boshqaruv paneli", submit: "Loyiha yuborish", projects: "Loyihalar holati", kpi: "KPI va Monitoring", team: "Jamoa va Ekspertlar", settings: "Sozlamalar", logout: "Tizimdan chiqish", payments: "Hisob va To'lovlar" },
    hero: { badge: "AI Premium Tahlil V2", title1: "Iste'dodlar hamma joyda,", title2: "imkoniyatlar ham shunday bo'lishi kerak.", desc: "Rivojlanayotgan hududlardagi iqtidorlar va yirik investorlar o'rtasidagi raqamli ko'prik. G'oyangizni bepul baholang va MVP ga aylantiring.", startFree: "Bepul boshlash", video: "Video qo'llanma" },
    stats: { users: "Foydalanuvchilar", startups: "Startaplar", orgs: "Tashkilotlar", regions: "Hududlar" },
    dashboard: { title: "Tashkilot Paneli", desc: "Umumiy statistika va AI tahlil xulosalari", totalUsers: "Foydalanuvchilar", received: "Kelib Tushgan", rejected: "Rad Etilgan", approved: "Qabul Qilingan", growth: "Loyihalar dinamikasi", statusDist: "Loyiha holati" },
    submit: { title: "Yangi loyiha yaratish", desc: "G'oyangizni kiriting. Bizning AI Premium tizimimiz uni avtomatik baholaydi.", projName: "Loyiha Nomi", problem: "Muammo", solution: "Yechim (MVP)", ip: "IP Himoyalangan", next: "Keyingi qadam", selectOrg: "Loyihani yuborish tashkiloti", attachFile: "Loyiha fayli (ixtiyoriy)", attachHint: "Faqat PDF, PPTX, Word (doc, docx)", ownerSection: "Loyiha egasi ma'lumotlari", ownerName: "To'liq ism (muallif)", ownerPhone: "Telefon raqam", ownerSchool: "Maktab / Tashkilot",
      projNameEx: "Masalan: SmartAgro - Suvni tejash tizimi",
      problemEx: "Masalan: Qishloq xo'jaligida eski usullar sababli suvning 40% ortiqcha isrof bo'lishi va ekinlarning vaqtida sug'orilmasligi.",
      solutionEx: "Masalan: IoT datchiklar orqali tuproq namligini aniqlab, avtomatik ravishda sug'orishni yo'lga qo'yuvchi arzon AI platforma.",
      fillAll: "Iltimos, barcha maydonlarni to'ldiring!", freeAttemptMsg: "1 ta bepul tahlil imkoniyatingiz ishlatilmoqda..."
    },
    payment: { title: "Premium AI Tahlil", desc: "Loyihangizni baholash uchun to'lovni amalga oshiring yoki maktab vaucheridan foydalaning.", price: "32,000 UZS", payBtn: "To'lov qildim", voucherTitle: "Maktab Vaucheri", applyVoucher: "Vaucherni qo'llash", back: "Orqaga qaytish" },
    auth: { loginTitle: "Tizimga kirish", regTitle: "Ro'yxatdan o'tish", name: "To'liq ism", emailOrId: "Elektron pochta yoki ID", pass: "Parol", loginBtn: "Tizimga Kirish", regBtn: "Ro'yxatdan O'tish", or: "Yoki", google: "Google bilan davom etish", roleSelect: "Kim sifatida kirish", regionSelect: "Hudud", roles: { student: "O'quvchi / Talaba", organization: "Tashkilot / Investor", gov: "Davlat Nazorati" }, regions: ["Toshkent", "Andijon", "Buxoro", "Farg'ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", "Samarqand", "Sirdaryo", "Surxondaryo", "Qoraqalpog'iston"], schoolSelect: "Ta'lim muassasasi (Maktab / OTM)", schoolPlaceholder: "Masalan: TATU yoki 7-maktab", orgNameSelect: "Tashkilot nomi", forgotLink: "Parolni unutdingizmi?", forgotTitle: "Parolni tiklash", forgotEmailHint: "Ro'yxatdan o'tgan email manzilingizni kiriting", sendResetLink: "Link yuborish", backToLogin: "Kirish sahifasiga qaytish", newPassword: "Yangi parol", confirmPassword: "Parolni takrorlang", setNewPassword: "Parolni o'rnatish", resetSuccess: "Parol yangilandi. Endi tizimga kirishingiz mumkin.", forgotOnlySupabase: "Parolni tiklash faqat Supabase ulanganida ishlaydi.", resetEmailSent: "Agar bu email ro'yxatdan o'tgan bo'lsa, parol tiklash havolasi yuborildi." },
    about: { title: "Loyiha Maqsadi va Mohiyati", subtitle: "Nega aynan NEXUS?", text1: "Nega imkoniyatlar faqat yirik shaharlarda bo‘lishi kerak? Iqtidorlar hamma joyda bor, lekin imkoniyatlar teng taqsimlanmagan — buni o‘zgartirishimiz kerak.", text2: "NEXUS — bu oliy ta'lim muassasalari, texnikumlar va chekka qishloqlardagi maktablarda ta'lim olayotgan iqtidorli yoshlarning innovatsion startap tashabbuslarini aniqlash, ularni rivojlantirish va MVP darajasidagi real raqamli mahsulotlarga aylantirish uchun mo'ljallangan ko'prikdir.", card1Title: "Aniqlash", card1Desc: "Chekka hududlardagi yashirin iqtidorlarni va ularning noyob g'oyalarini platforma orqali aniqlash.", card2Title: "Rivojlantirish", card2Desc: "Premium AI tahlili va kuchli mentorlar yordamida oddiy g'oyani real biznes modelga aylantirish.", card3Title: "Investitsiya (MVP)", card3Desc: "Tayyor va tasdiqlangan loyihalarni investorlarga taqdim etish va to'g'ridan-to'g'ri moliyalashtirish." },
    contact: { desc: "Iste'dod va kapital o'rtasidagi raqamli ko'prik. Biz bilan kelajak innovatsiyalarini birga quring.", quickLinks: "Tezkor Havolalar", contactUs: "Biz bilan bog'lanish", address: "Jizzax shahar SAMBHRAM Universiteti", rights: "NEXUS Platformasi. Barcha huquqlar himoyalangan." },
    kpi: { title: "Hududiy KPI tahlili", desc: "Davlat organlari uchun maktablar va hududlar kesimidagi monitoring", activeRegion: "Eng Aktiv Viloyat", topSchool: "Eng Ko'p Startap", totalInv: "Jami Investitsiya", chartTitle: "Hududlar bo'yicha startap aktivligi" },
    team: { title: "Mentorlar va Ekspertlar", desc: "Loyiha uchun yordam, tajriba va investitsiya topish", askMentor: "Mentorlik So'rash", reqSent: "Mentorlik so'rovi muvaffaqiyatli yuborildi!", addMentor: "Mentor qo'shish", mentorName: "Ism", mentorRole: "Lavozim", mentorCompany: "Tashkilot / Kompaniya", mentorTags: "Texnologiyalar (vergul bilan)", yourMentors: "Sizning mentorlaringiz", generalMentors: "Umumiy mentorlar", deleteMentor: "O'chirish", editMentor: "Tahrirlash" },
    settings: { title: "Tizim Sozlamalari", desc: "Profil va SaaS ta'riflarini boshqarish", editProfile: "Profilni tahrirlash", uploadImg: "Yangi rasm yuklash", save: "O'zgarishlarni Saqlash", planTitle: "Ta'rif rejasi (SaaS Plans)", current: "Joriy:", saved: "Ma'lumotlar muvaffaqiyatli saqlandi!" },
    plans: { freeTitle: "Maktab (Free)", proTitle: "Pro Tashkilot", entTitle: "Davlat (Enterprise)", popular: "Tavsiya etiladi", select: "Tanlash", active: "Faol", buy: "Xarid qilish", contact: "Bog'lanish",
      freeFeatures: ["1 ta bepul loyiha yuborish", "Boshlang'ich AI tahlil (Score)", "Umumiy reytingda qatnashish"],
      proFeatures: ["Cheksiz loyihalar yuborish", "Premium AI va tavsiyalar", "Investorlar bilan aloqa", "NDA shartnoma himoyasi"],
      entFeatures: ["Davlat miqyosida KPI tahlil", "Maxsus Organization ID", "Cheksiz o'quvchilar tarmog'i", "24/7 Texnik yordam va server"]
    },
    projectList: { title: "Loyiha monitoringi", desc: "Barcha izolyatsiya qilingan premium loyihalar va ularning holati", empty: "Sizning tashkilotingizda hozircha loyihalar mavjud emas." },
    modal: { problem: "Muammo mohiyati", solution: "Innovatsion Yechim & MVP", ipProtected: "Intellektual Mulk Himoyalangan", signNda: "NDA ni imzolash", score: "AI Tahlil Balli", invAttr: "Investitsion Jozibadorlik", summary: "Loyiha xulosasi", stage: "Bosqich", request: "Talab", expertFeedback: "Ekspert Xulosasi va Qaror", accept: "Qabul Qilish", reject: "Rad Etish", contactAuthor: "Muallif bilan aloqa", writeMsg: "Xabar yozish" },
    payments: { title: "Hisob va To'lovlar", desc: "Balansni boshqarish va tranzaksiyalar tarixi", balance: "Joriy balans", topup: "Balansni to'ldirish", amount: "Summa (UZS)", history: "To'lovlar tarixi", payme: "Payme", click: "Click", success: "orqali to'lov oynasiga yo'naltirilmoqda...", invalidAmount: "Iltimos, to'g'ri summa kiriting!", empty: "Tranzaksiyalar mavjud emas.", enterAmountFirst: "To'lovni amalga oshirish uchun summani kiriting.", cardNumber: "Karta Raqami", expiry: "Muddat (MM/YY)", payWithCard: "Karta orqali to'lash", smsSent: "SMS kod yuborildi!", smsCode: "SMS Kod", verify: "Tasdiqlash", invalidCard: "Karta ma'lumotlari xato!", invalidSms: "SMS kod kamida 4 ta belgi bo'lishi kerak!", smsSentDesc: "Telefon raqamingizga tasdiqlash kodi yuborildi. Iltimos, quyida kiriting." }
  },
  ru: {
    nav: { about: "О проекте", contact: "Контакты", gov: "Гос. KPI", orgLogin: "Вход для организаций", studentLogin: "Школьная панель", login: "Войти", dashboard: "Панель управления", submit: "Отправить проект", projects: "Статус проектов", kpi: "KPI и Мониторинг", team: "Команда и Эксперты", settings: "Настройки", logout: "Выйти", payments: "Счет и Оплата" },
    hero: { badge: "AI Premium Анализ V2", title1: "Таланты есть везде,", title2: "возможности тоже должны быть такими.", desc: "Цифровой мост между талантами в развивающихся регионах и крупными инвесторами. Оцените свою идею бесплатно и превратите в MVP.", startFree: "Начать бесплатно", video: "Видеоинструкция" },
    stats: { users: "Пользователи", startups: "Стартапы", orgs: "Организации", regions: "Регионы" },
    dashboard: { title: "Панель Организации", desc: "Общая статистика и выводы AI анализа", totalUsers: "Пользователи", received: "Поступило", rejected: "Отклонено", approved: "Одобрено", growth: "Динамика проектов", statusDist: "Статус проектов" },
    submit: { title: "Создать новый проект", desc: "Введите вашу идею. Наша система AI Premium автоматически оценит ее.", projName: "Название проекта", problem: "Проблема", solution: "Решение (MVP)", ip: "IP Защищено", next: "Следующий шаг", selectOrg: "Организация для отправки", attachFile: "Файл проекта (необязательно)", attachHint: "Только PDF, PPTX, Word (doc, docx)", ownerSection: "Данные владельца проекта", ownerName: "Полное имя (автор)", ownerPhone: "Номер телефона", ownerSchool: "Школа / Организация",
      projNameEx: "Например: SmartAgro - Система экономии воды",
      problemEx: "Например: 40% воды тратится впустую в сельском хозяйстве из-за устаревших методов полива...",
      solutionEx: "Например: Дешевая платформа ИИ, измеряющая влажность почвы с помощью датчиков IoT...",
      fillAll: "Пожалуйста, заполните все поля!", freeAttemptMsg: "Используется 1 бесплатный анализ..."
    },
    payment: { title: "Premium AI Анализ", desc: "Ваш бесплатный лимит исчерпан. Оплатите для продолжения.", price: "32,000 UZS", payBtn: "Я оплатил", voucherTitle: "Школьный ваучер", applyVoucher: "Применить ваучер", back: "Вернуться назад" },
    auth: { loginTitle: "Войти в систему", regTitle: "Регистрация", name: "Полное имя", emailOrId: "Email или ID", pass: "Пароль", loginBtn: "Войти", regBtn: "Зарегистрироваться", or: "Или", google: "Продолжить с Google", roleSelect: "Тип профиля", regionSelect: "Регион", roles: { student: "Ученик / Студент", organization: "Организация / Инвестор", gov: "Гос. контроль" }, regions: ["Ташкент", "Андижан", "Бухара", "Фергана", "Джизак", "Хорезм", "Наманган", "Навои", "Кашкадарья", "Самарканд", "Сырдарья", "Сурхандарья", "Каракалпакстан"], schoolSelect: "Учебное заведение (Школа / ВУЗ)", schoolPlaceholder: "Например: ТУИТ или Школа №7", orgNameSelect: "Название организации", forgotLink: "Забыли пароль?", forgotTitle: "Восстановление пароля", forgotEmailHint: "Введите email, указанный при регистрации", sendResetLink: "Отправить ссылку", backToLogin: "Вернуться к входу", newPassword: "Новый пароль", confirmPassword: "Повторите пароль", setNewPassword: "Установить пароль", resetSuccess: "Пароль обновлён. Теперь можно войти.", forgotOnlySupabase: "Восстановление пароля работает только при подключённом Supabase.", resetEmailSent: "Если этот email зарегистрирован, ссылка для сброса пароля отправлена." },
    about: { title: "Цель и суть проекта", subtitle: "Почему именно NEXUS?", text1: "Почему возможности должны быть только в крупных городах? Таланты есть везде, но возможности распределены неравномерно — мы должны это изменить.", text2: "NEXUS — это мост для выявления инновационных стартап-инициатив талантливой молодежи, обучающейся в отдаленных школах, и превращения их в реальные цифровые продукты на уровне MVP.", card1Title: "Выявление", card1Desc: "Выявление скрытых талантов и их уникальных идей в отдаленных регионах через платформу.", card2Title: "Развитие", card2Desc: "Превращение простой идеи в реальную бизнес-модель с помощью AI анализа и сильных менторов.", card3Title: "Инвестиции (MVP)", card3Desc: "Представление готовых проектов инвесторам и прямое финансирование." },
    contact: { desc: "Цифровой мост между талантом и капиталом. Стройте будущие инновации вместе с нами.", quickLinks: "Быстрые ссылки", contactUs: "Свяжитесь с нами", address: "город Джизак, Университет САМБХРАМ", rights: "Платформа NEXUS. Все права защищены." },
    kpi: { title: "Региональный KPI", desc: "Мониторинг в разрезе школ и регионов для государственных органов", activeRegion: "Активный Регион", topSchool: "Топ Стартапов", totalInv: "Общие Инвестиции", chartTitle: "Активность стартапов по регионам" },
    team: { title: "Менторы и Эксперты", desc: "Поиск помощи, опыта и инвестиций для проекта", askMentor: "Запросить Менторство", reqSent: "Запрос на менторство успешно отправлен!" },
    settings: { title: "Настройки Системы", desc: "Управление профилем и тарифами SaaS", editProfile: "Редактировать профиль", uploadImg: "Загрузить новое фото", save: "Сохранить изменения", planTitle: "Тарифный план (SaaS Plans)", current: "Текущий:", saved: "Данные успешно сохранены!" },
    plans: { freeTitle: "Школа (Free)", proTitle: "Pro Организация", entTitle: "Гос. (Enterprise)", popular: "Рекомендуется", select: "Выбрать", active: "Активен", buy: "Купить", contact: "Связаться",
      freeFeatures: ["1 бесплатный проект", "Базовый AI анализ", "Участие в общем рейтинге"],
      proFeatures: ["Неограниченные проекты", "Premium AI советы", "Связь с инвесторами", "Защита NDA"],
      entFeatures: ["Гос. KPI анализ", "Специальный Organization ID", "Сеть учеников", "Тех. поддержка 24/7"]
    },
    projectList: { title: "Мониторинг проектов", desc: "Все изолированные премиум проекты и их статус", empty: "В вашей организации пока нет проектов." },
    modal: { problem: "Суть проблемы", solution: "Инновационное Решение и MVP", ipProtected: "Интеллектуальная Собственность", signNda: "Подписать NDA", score: "Балл AI Анализа", invAttr: "Инвестиционная привлекательность", summary: "Резюме проекта", stage: "Стадия", request: "Запрос", expertFeedback: "Заключение и Решение Эксперта", accept: "Одобрить", reject: "Отклонить", contactAuthor: "Связь с автором", writeMsg: "Написать сообщение" },
    payments: { title: "Счет и Оплата", desc: "Пополнение баланса и история транзакций", balance: "Текущий баланс", topup: "Пополнить баланс", amount: "Сумма (UZS)", history: "История платежей", payme: "Payme", click: "Click", success: "перенаправление на страницу оплаты...", invalidAmount: "Пожалуйста, введите правильную сумму!", empty: "Транзакции отсутствуют.", enterAmountFirst: "Введите сумму для оплаты.", cardNumber: "Номер карты", expiry: "Срок (MM/YY)", payWithCard: "Оплатить картой", smsSent: "SMS код отправлен!", smsCode: "SMS Код", verify: "Подтвердить", invalidCard: "Неверные данные карты!", invalidSms: "SMS код должен содержать не менее 4 символов!", smsSentDesc: "На ваш номер отправлен код подтверждения. Введите его ниже." }
  },
  en: {
    nav: { about: "About Project", contact: "Contact", gov: "Gov KPI", orgLogin: "Org Login", studentLogin: "School Panel", login: "Login", dashboard: "Dashboard", submit: "Submit Project", projects: "Project Status", kpi: "KPI & Monitoring", team: "Team & Experts", settings: "Settings", logout: "Log out", payments: "Billing & Payments" },
    hero: { badge: "AI Premium Analysis V2", title1: "Talent is everywhere,", title2: "opportunities should be too.", desc: "A digital bridge between talents in developing regions and major investors. Evaluate your idea for free and turn it into an MVP.", startFree: "Start for free", video: "Video Tutorial" },
    stats: { users: "Users", startups: "Startups", orgs: "Organizations", regions: "Regions" },
    dashboard: { title: "Organization Panel", desc: "General statistics and AI analysis insights", totalUsers: "Total Users", received: "Received", rejected: "Rejected", approved: "Approved", growth: "Project Dynamics", statusDist: "Project Status" },
    submit: { title: "Create New Project", desc: "Enter your idea. Our AI Premium system will automatically evaluate it.", projName: "Project Name", problem: "Problem", solution: "Solution (MVP)", ip: "IP Protected", next: "Next Step", selectOrg: "Send project to organization", attachFile: "Project file (optional)", attachHint: "Only PDF, PPTX, Word (doc, docx)", ownerSection: "Project owner details", ownerName: "Full name (author)", ownerPhone: "Phone number", ownerSchool: "School / Organization",
      projNameEx: "Example: SmartAgro - Water saving system",
      problemEx: "Example: 40% of water is wasted in agriculture due to outdated irrigation methods...",
      solutionEx: "Example: A cheap AI platform that measures soil moisture via IoT sensors and automates watering.",
      fillAll: "Please fill in all fields!", freeAttemptMsg: "Using your 1 free analysis..."
    },
    payment: { title: "Premium AI Analysis", desc: "Your free limit is over. Pay to evaluate your project or use a voucher.", price: "32,000 UZS", payBtn: "I Paid", voucherTitle: "School Voucher", applyVoucher: "Apply Voucher", back: "Go Back" },
    auth: { loginTitle: "Sign In", regTitle: "Sign Up", name: "Full Name", emailOrId: "Email or ID", pass: "Password", loginBtn: "Sign In", regBtn: "Sign Up", or: "Or", google: "Continue with Google", roleSelect: "Login As", regionSelect: "Region", roles: { student: "Student", organization: "Organization / Investor", gov: "Government Control" }, regions: ["Tashkent", "Andijan", "Bukhara", "Fergana", "Jizzakh", "Khorezm", "Namangan", "Navoi", "Kashkadarya", "Samarkand", "Sirdarya", "Surkhandarya", "Karakalpakstan"], schoolSelect: "Educational Institution", schoolPlaceholder: "e.g., TUIT or School #7", orgNameSelect: "Organization Name", forgotLink: "Forgot password?", forgotTitle: "Reset password", forgotEmailHint: "Enter the email you signed up with", sendResetLink: "Send reset link", backToLogin: "Back to login", newPassword: "New password", confirmPassword: "Confirm password", setNewPassword: "Set new password", resetSuccess: "Password updated. You can sign in now.", forgotOnlySupabase: "Password reset only works when Supabase is connected.", resetEmailSent: "If this email is registered, a reset link has been sent." },
    about: { title: "Project Goal and Essence", subtitle: "Why NEXUS?", text1: "Why should opportunities only be in big cities? Talent is everywhere, but opportunities are unequally distributed — we need to change this.", text2: "NEXUS is a bridge designed to identify innovative startup initiatives of talented youth studying in remote schools, and turn them into real digital products at the MVP level.", card1Title: "Identify", card1Desc: "Identifying hidden talents and their unique ideas in remote regions through the platform.", card2Title: "Develop", card2Desc: "Turning a simple idea into a real business model with Premium AI analysis and strong mentors.", card3Title: "Invest (MVP)", card3Desc: "Presenting ready and verified projects to investors and direct financing." },
    contact: { desc: "A digital bridge between talent and capital. Build future innovations with us.", quickLinks: "Quick Links", contactUs: "Contact Us", address: "Jizzakh city, SAMBHRAM University", rights: "NEXUS Platform. All rights reserved." },
    kpi: { title: "Regional KPI Dashboard", desc: "Monitoring across schools and regions for government bodies", activeRegion: "Most Active Region", topSchool: "Top Startups", totalInv: "Total Investment", chartTitle: "Startup activity by regions" },
    team: { title: "Mentors and Experts", desc: "Find help, experience, and investment for your project", askMentor: "Request Mentorship", reqSent: "Mentorship request sent successfully!", addMentor: "Add Mentor", mentorName: "Name", mentorRole: "Role", mentorCompany: "Company", mentorTags: "Tags (comma-separated)", yourMentors: "Your Mentors", generalMentors: "General Mentors", deleteMentor: "Delete", editMentor: "Edit" },
    settings: { title: "System Settings", desc: "Manage profile and SaaS pricing plans", editProfile: "Edit Profile", uploadImg: "Upload New Photo", save: "Save Changes", planTitle: "Tariff Plan (SaaS)", current: "Current:", saved: "Data saved successfully!" },
    plans: { freeTitle: "School (Free)", proTitle: "Pro Organization", entTitle: "Gov (Enterprise)", popular: "Recommended", select: "Select", active: "Active", buy: "Purchase", contact: "Contact Us",
      freeFeatures: ["1 free project submission", "Basic AI analysis (Score)", "General ranking participation"],
      proFeatures: ["Unlimited projects", "Premium AI advice", "Direct investor contact", "NDA protection included"],
      entFeatures: ["Gov KPI dashboard", "Custom Organization ID", "Unlimited student network", "24/7 Tech support"]
    },
    projectList: { title: "Project Monitoring", desc: "All isolated premium projects and their statuses", empty: "There are no projects in your organization yet." },
    modal: { problem: "Problem Essence", solution: "Innovative Solution & MVP", ipProtected: "Intellectual Property Protected", signNda: "Sign NDA", score: "AI Analysis Score", invAttr: "Investment Attractiveness", summary: "Project Summary", stage: "Stage", request: "Request", expertFeedback: "Expert Feedback and Decision", accept: "Accept", reject: "Reject", contactAuthor: "Contact Author", writeMsg: "Write Message" },
    payments: { title: "Billing & Payments", desc: "Manage your balance and transaction history", balance: "Current Balance", topup: "Top Up Balance", amount: "Amount (UZS)", history: "Transaction History", payme: "Payme", click: "Click", success: "redirecting to payment gateway...", invalidAmount: "Please enter a valid amount!", empty: "No transactions found.", enterAmountFirst: "Please enter an amount to pay.", cardNumber: "Card Number", expiry: "Expiry (MM/YY)", payWithCard: "Pay with Card", smsSent: "SMS code sent!", smsCode: "SMS Code", verify: "Verify", invalidCard: "Invalid card details!", invalidSms: "SMS code must be at least 4 digits!", smsSentDesc: "A verification code has been sent to your phone. Please enter it below." }
  }
};

const LanguageContext = createContext();

/** Supabase session + profile dan currentUser (app) formatiga */
function mapProfileToCurrentUser(user, profile) {
  const plan = profile?.plan || 'free';
  const orgId = profile?.org_id || (profile?.role === 'student' ? 'ORG-SCH-007' : profile?.role === 'organization' ? 'ORG-ITP-001' : 'ORG-GOV-000');
  return {
    id: user?.id || profile?.id,
    name: profile?.full_name || user?.email || '',
    email: user?.email || '',
    role: profile?.role || 'student',
    orgId,
    plan: plan === 'free' ? 'free' : plan === 'pro' ? 'pro' : 'enterprise',
    orgName: profile?.org_name || profile?.school || '',
    freeAttempts: plan === 'free' ? 1 : 0,
    avatarUrl: (profile?.avatar_url?.startsWith?.('nexus_3d:')) ? profile.avatar_url : (profile?.avatar_url && ensurePublicStorageUrl(profile.avatar_url, 'avatars')) || null,
  };
}

// --- CUSTOM ANIMATIONS & CYBERPUNK STYLES ---
const CustomStyles = () => (
  <style>{`
    @keyframes orb-float-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(12vw, -12vh) scale(1.1); } 66% { transform: translate(-10vw, 15vh) scale(0.9); } }
    @keyframes orb-float-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-15vw, 15vh) scale(1.25); } 66% { transform: translate(12vw, -5vh) scale(0.8); } }
    @keyframes orb-float-3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(8vw, 25vh) scale(1.3); } }
    @keyframes fillBar { from { width: 0; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
    @keyframes shimmer { 100% { transform: translateX(200%); } }
    @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
    
    .animate-orb-1 { animation: orb-float-1 20s ease-in-out infinite; }
    .animate-orb-2 { animation: orb-float-2 25s ease-in-out infinite; }
    .animate-orb-3 { animation: orb-float-3 28s ease-in-out infinite; }
    .slide-up { opacity: 0; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-marquee { display: flex; width: max-content; animation: marquee 30s linear infinite; }
    .animate-marquee:hover { animation-play-state: paused; }
    
    .delay-100 { animation-delay: 100ms; } .delay-200 { animation-delay: 200ms; } .delay-300 { animation-delay: 300ms; } .delay-400 { animation-delay: 400ms; } .delay-500 { animation-delay: 500ms; }
    
    @media (max-width: 768px) {
      .slide-up { opacity: 1 !important; animation: none !important; transform: none !important; }
    }
    
    .bg-grid-texture {
      background-size: 50px 50px;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 10%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 10%, transparent 80%);
    }
    
    .premium-glass {
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.7) 0%, rgba(3, 7, 18, 0.5) 100%);
      backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    }
    
    .premium-gradient-text { background: linear-gradient(135deg, #fff 0%, #3b82f6 40%, #d946ef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0px 2px 15px rgba(217, 70, 239, 0.3)); }
    
    .btn-premium { position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .btn-premium::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 3s infinite; transform: skewX(-25deg); }

    ::-webkit-scrollbar { width: 5px; height: 5px; } 
    ::-webkit-scrollbar-track { background: transparent; } 
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; } 
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    select option { background: #0B1221; color: #fff; }
  `}</style>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function NexusLogo() {
  const gradientId = React.useId().replace(/:/g, '-');
  return (
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0B0B14] to-[#1a1025] border border-fuchsia-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(217,70,239,0.3)] group-hover:scale-105 transition-all relative overflow-hidden flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 md:w-6 md:h-6 z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="5" y1="4" x2="19" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <path d="M5 21V4L19 21V4" stroke={`url(#${gradientId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full pointer-events-none" aria-hidden="true"></div>
    </div>
  );
}

// --- MOCK DATA ---
const chartData = [{ name: 'Yan', projects: 2 }, { name: 'Fev', projects: 5 }, { name: 'Mar', projects: 8 }, { name: 'Apr', projects: 12 }, { name: 'May', projects: 20 }, { name: 'Iyun', projects: 35 }];
const kpiRegionData = [{ hudud: 'Jizzax', aktivlik: 85 }, { hudud: 'Toshkent', aktivlik: 92 }, { hudud: 'Samarqand', aktivlik: 65 }, { hudud: 'Sirdaryo', aktivlik: 45 }, { hudud: 'Xorazm', aktivlik: 70 }];
const pieData = [{ name: 'Qabul qilindi', value: 45, color: '#10B981' }, { name: 'Rad etildi', value: 20, color: '#EF4444' }, { name: "Ko'rilmoqda", value: 35, color: '#3b82f6' }];

const initialProjects = [
  { id: 1, orgId: 'ORG-SCH-007', targetOrgId: 'ORG-ITP-001', title: "AgroSmart - Qishloq xo'jaligida suvni tejash", author: "Aziz Rahimov", phone: "+998 (90) 123-45-67", school: "7-sonli maktab", status: "Qabul qilindi", aiScore: 92, badges: ['Star Project', 'EXPERT_APPROVED'], date: "2024-05-12", feedback: "Dolzarb muammo ko'tarilgan. Moliyalashtirishga tayyormiz." },
  { id: 2, orgId: 'ORG-SCH-007', targetOrgId: 'ORG-ITP-001', title: "EduVR - Virtual laboratoriya", author: "Malika Tohirova", phone: "+998 (99) 987-65-43", school: "IT Texnikum", status: "Rad etildi", aiScore: 42, badges: ['Draft'], date: "2024-05-18", feedback: "Amalga oshirish qiymati qimmat. Qayta ishlanishi kerak." },
  { id: 3, orgId: 'ORG-SCH-012', targetOrgId: 'ORG-ITP-001', title: "EcoDrone - Yong'inni aniqlash", author: "Sardor Rustamov", phone: "+998 (93) 321-76-54", school: "Prezident maktabi", status: "Ko'rilmoqda", aiScore: 78, badges: ['Verified'], date: "2024-06-02", feedback: "" }
];

const mockTeam = [
  { id: 1, name: "Doniyor Ergashev", role: "Startap Ekspert / Investor", company: "UzVC", avatar: "DE", rating: 4.9, tags: ["IT", "FinTech"] },
  { id: 2, name: "Malika Azimova", role: "Agrotexnologiyalar bo'yicha Mentor", company: "AgroBank", avatar: "MA", rating: 4.8, tags: ["Agro", "Eco"] },
  { id: 3, name: "Rustam Qodirov", role: "Texnik arxitektor (CTO)", company: "EPAM", avatar: "RQ", rating: 5.0, tags: ["AI", "EduTech"] },
];

const initialNotifications = [
  { id: 1, orgId: 'ORG-ITP-001', type: "info", text: "Yangi AI Premium tahlil moduli ishga tushdi.", time: "10 daqiqa oldin", unread: true },
  { id: 2, orgId: 'ORG-SCH-007', type: "success", text: "Sardor Rustamov yangi loyiha yubordi.", time: "1 soat oldin", unread: true },
  { id: 3, orgId: 'ALL', type: "warning", text: "Toshkent viloyati bo'yicha KPI yangilandi.", time: "Kecha", unread: false }
];

const partnersList = [
  { name: "IT Park Uzbekistan", icon: <Cpu className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /> },
  { name: "UzVC Fund", icon: <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-fuchsia-400" /> },
  { name: "AgroBank", icon: <Target className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" /> },
  { name: "EPAM Systems", icon: <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-400" /> },
  { name: "Innovatsiya Vazirligi", icon: <Award className="w-6 h-6 md:w-8 md:h-8 text-amber-400" /> },
  { name: "UNICEF Uzbekistan", icon: <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-200" /> },
  { name: "Yoshlar Ventures", icon: <Rocket className="w-6 h-6 md:w-8 md:h-8 text-fuchsia-400" /> },
  { name: "Oliy Ta'lim Vazirligi", icon: <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-blue-300" /> },
  { name: "Xalq Ta'limi Vazirligi", icon: <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-emerald-300" /> },
  { name: "O'zbekiston Hokimiyati", icon: <Landmark className="w-6 h-6 md:w-8 md:h-8 text-amber-200" /> },
];

// --- 3D AVATARS (DiceBear 9.x — erkak / ayol, cache’da tanlangan saqlanadi) ---
const AVATAR_3D_PREFIX = 'nexus_3d:';
const AVATAR_3D_MALE = ['male_1', 'male_2', 'male_3', 'male_4', 'male_5', 'male_6'];
const AVATAR_3D_FEMALE = ['female_1', 'female_2', 'female_3', 'female_4', 'female_5', 'female_6'];
const AVATAR_3D_CACHE_KEY = 'nexus_avatar_3d';

function getAvatar3DUrl(avatarId) {
  if (!avatarId) return null;
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(avatarId)}`;
}

function resolveAvatarDisplay(avatarUrl) {
  if (avatarUrl?.startsWith(AVATAR_3D_PREFIX)) {
    const id = avatarUrl.slice(AVATAR_3D_PREFIX.length);
    return { type: '3d', url: getAvatar3DUrl(id) };
  }
  if (avatarUrl) return { type: 'image', url: avatarUrl };
  return null;
}

function Avatar3DPickerModal({ onSelect, onClose, currentId }) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg premium-glass rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 z-10 slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-black text-white">3D avatar tanlash</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Erkak</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_3D_MALE.map(id => (
                <button key={id} type="button" onClick={() => onSelect(id)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${currentId === id ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/50' : 'border-white/10 hover:border-white/30'}`}>
                  <img src={getAvatar3DUrl(id)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3">Ayol</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_3D_FEMALE.map(id => (
                <button key={id} type="button" onClick={() => onSelect(id)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 ${currentId === id ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/50' : 'border-white/10 hover:border-white/30'}`}>
                  <img src={getAvatar3DUrl(id)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- GLOBAL COMPONENTS ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[300] slide-in-right flex items-center gap-3 px-5 py-4 md:px-6 rounded-2xl shadow-2xl border backdrop-blur-xl ${type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
      {type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : type === 'info' ? <Bell className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="font-bold text-sm leading-snug">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 flex-shrink-0"><X className="w-4 h-4" /></button>
    </div>
  );
};

const getBadgeColor = (badge) => {
  if(badge === 'Star Project') return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30';
  if(badge.includes('Verified')) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  if(badge === 'Developing') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
};

const getBadgeFromScore = (score) => {
  if (score >= 85) return "Star Project";
  if (score >= 70) return "Verified";
  if (score >= 50) return "Developing";
  return "Draft";
};

// --- NEW: REUSABLE CARD PAYMENT FORM WITH SMS OTP ---
function CardPaymentForm({ amountLabel, onSuccess, t, showToast }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCardChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 3) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setExpiry(val);
    }
  };

  const handleSendSms = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length !== 16 || expiry.length !== 5) {
      showToast(t.payments?.invalidCard || "Karta ma'lumotlari xato!", "error");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSmsSent(true);
      showToast(t.payments?.smsSent || "SMS kod yuborildi!", "info");
    }, 1200);
  };

  const handleVerifySms = (e) => {
    e.preventDefault();
    if (smsCode.length < 4) {
      showToast(t.payments?.invalidSms || "SMS kod xato!", "error");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(`Card **** ${cardNumber.slice(-4)}`);
    }, 1500);
  };

  return (
    <div className="w-full">
      {!isSmsSent ? (
        <form onSubmit={handleSendSms} className="space-y-4 mt-4">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.payments?.cardNumber || "Karta Raqami"}</label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input type="text" required value={cardNumber} onChange={handleCardChange} placeholder="0000 0000 0000 0000" className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white font-mono tracking-widest focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.payments?.expiry || "Muddat (MM/YY)"}</label>
            <input type="text" required value={expiry} onChange={handleExpiryChange} placeholder="MM/YY" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white font-mono tracking-widest focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" />
          </div>
          <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]">
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : `${amountLabel} - ${t.payments?.payWithCard || "To'lash"}`}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifySms} className="space-y-4 slide-up mt-4">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400"><MessageSquare className="w-6 h-6" /></div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">{t.payments?.smsSentDesc || "Telefoningizga tasdiqlash kodi yuborildi."}</p>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-center">{t.payments?.smsCode || "SMS Kod"}</label>
            <input type="text" required value={smsCode} onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-center text-white font-mono tracking-[0.5em] text-xl focus:border-emerald-500 focus:outline-none shadow-inner transition-colors" />
          </div>
          <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]">
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : (t.payments?.verify || "Tasdiqlash")}
          </button>
          <button type="button" onClick={() => setIsSmsSent(false)} className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors">{t.payment?.back || "Orqaga qaytish"}</button>
        </form>
      )}
    </div>
  );
}

// Layout Components properly defined BEFORE usage to avoid reference errors
function NavItem({ icon: IconComp, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-[1rem] sm:rounded-[1.2rem] transition-all font-bold text-sm group ${active ? 'bg-gradient-to-r from-blue-500/20 to-transparent text-white border border-blue-500/30 shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>}
      <div className={`${active ? 'scale-110 text-blue-400' : 'group-hover:scale-110 group-hover:text-slate-200'}`}>
         <IconComp className="w-5 h-5" />
      </div>
      <span className="tracking-wide">{label}</span>
    </button>
  );
}

function StatBox({ icon: IconComp, value, label, color = 'blue', delay }) {
  const themes = {
    blue: { wrapper: 'hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]', icon: 'text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:text-blue-300' },
    fuchsia: { wrapper: 'hover:border-fuchsia-500/30 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]', icon: 'text-fuchsia-400 bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-300' },
    emerald: { wrapper: 'hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]', icon: 'text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:text-emerald-300' }
  };
  const theme = themes[color] || themes.blue;

  return (
    <div className={`slide-up delay-${delay} premium-glass p-4 sm:p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all duration-500 min-h-[120px] sm:min-h-0 ${theme.wrapper}`}>
      <div className={`p-3 border border-white/5 rounded-xl md:rounded-2xl mb-3 md:mb-5 group-hover:scale-110 transition-all duration-300 shadow-inner flex-shrink-0 ${theme.icon}`}>
        <IconComp className="w-5 h-5 md:w-7 md:h-7 drop-shadow-md" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white mb-1 md:mb-2 tracking-tighter drop-shadow-md w-full">
        {value}
      </div>
      <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest leading-snug w-full px-1 break-words">{label}</p>
    </div>
  );
}

// FIXED: DashCard text overlap issue
function DashCard({ title, value, icon: IconComp, color, delay }) {
  const themes = {
    cyan: { bg: 'from-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    indigo: { bg: 'from-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
    red: { bg: 'from-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
    emerald: { bg: 'from-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    violet: { bg: 'from-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400' },
    blue: { bg: 'from-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    fuchsia: { bg: 'from-fuchsia-500/20', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400' }
  };
  const theme = themes[color] || themes.blue;

  return (
    <div className={`slide-up delay-${delay} bg-white/[0.02] backdrop-blur-xl border border-white/5 p-4 sm:p-5 md:p-6 rounded-[1.5rem] lg:rounded-[2rem] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:border-white/10 ${theme.border}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-bl ${theme.bg} to-transparent blur-3xl opacity-30 group-hover:opacity-60 transition-opacity`}></div>
      <div className="flex justify-between items-start relative z-10 w-full mb-3 sm:mb-4 gap-2">
        <h3 className="text-[10px] sm:text-[11px] xl:text-xs font-bold text-slate-400 tracking-wider uppercase leading-snug break-words w-[70%] xl:w-[75%] pr-1">
          {title}
        </h3>
        <div className={`p-2 bg-black/50 rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0 ${theme.text}`}>
          <IconComp className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-md" />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-md relative z-10 mt-auto pt-2 break-words w-full">
        {value}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max }) {
  const percentage = (score / max) * 100;
  return (
    <div className="bg-black/20 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5">
      <div className="flex justify-between text-xs md:text-sm mb-3 md:mb-4"><span className="text-slate-200 font-bold">{label}</span><span className="text-blue-400 font-black">{score} / {max}</span></div>
      <div className="w-full h-2.5 md:h-3 bg-black/60 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500 rounded-full" style={{ width: `${percentage}%` }}></div></div>
    </div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [lang, setLang] = useState('uz');
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(() => typeof window !== 'undefined' && window.location.hash.includes('reset-password'));
  
  const [currentUser, setCurrentUser] = useState(null); 
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const onHash = () => setShowResetPassword(typeof window !== 'undefined' && window.location.hash.includes('reset-password'));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Session dan profil yo'q bo'lsa (masalan Google birinchi kirish) — default profil yaratish
  const ensureProfileThenLogin = (user) => {
    api.getProfile(user.id).then((profile) => {
      if (profile) {
        setCurrentUser(mapProfileToCurrentUser(user, profile));
        setCurrentView('app');
        return;
      }
      const meta = user.user_metadata || {};
      let pending = null;
      try {
        const raw = localStorage.getItem('nexus_oauth_pending_profile') || sessionStorage.getItem('nexus_oauth_pending_profile');
        if (raw) {
          pending = JSON.parse(raw);
          localStorage.removeItem('nexus_oauth_pending_profile');
          sessionStorage.removeItem('nexus_oauth_pending_profile');
        }
      } catch (_) {}
      const role = pending?.role || 'student';
      const region = pending?.region || 'Toshkent';
      const school = pending?.school || meta.school || '';
      const orgId = role === 'student' ? 'ORG-SCH-007' : role === 'organization' ? 'ORG-ITP-001' : 'ORG-GOV-000';
      const orgName = role === 'student' ? school : role === 'organization' ? school : 'Davlat Nazorati';
      const plan = role === 'student' ? 'free' : role === 'organization' ? 'pro' : 'enterprise';
      const defaultProfile = {
        id: user.id,
        full_name: meta.full_name || meta.name || user.email || '',
        role,
        region,
        org_id: orgId,
        org_name: orgName,
        plan,
        school: school || null,
      };
      api.createProfile(defaultProfile).then(() => {
        api.getProfile(user.id).then((p) => {
          if (p) {
            setCurrentUser(mapProfileToCurrentUser(user, p));
            setCurrentView('app');
          }
        }).catch(() => {});
      }).catch(() => {});
    }).catch(() => {});
  };

  // Real DB: Supabase session → profile → currentUser
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) ensureProfileThenLogin(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentUser(null);
        setCurrentView('landing');
        return;
      }
      ensureProfileThenLogin(session.user);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || currentView !== 'app') return;
    api.getProjects({ role: currentUser.role, orgId: currentUser.orgId })
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
    api.getNotifications(currentUser.orgId)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [currentUser, currentView]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loginAs = (userProfile) => {
    setCurrentUser(userProfile);
    setCurrentView('app');
    setActiveTab(userProfile.role === 'student' ? 'submit' : userProfile.role === 'gov' ? 'kpi' : 'dashboard');
    showToast(translations[lang].auth.loginTitle + " - Muvaffaqiyatli!");
  };

  const logout = () => {
    if (supabase) supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView('landing');
    showToast(translations[lang].nav.logout, "info");
  };

  const updateProjectStatus = (projectId, newStatus, feedbackText) => {
    const project = projects.find(p => p.id === projectId);
    api.updateProject(projectId, { status: newStatus, feedback: feedbackText })
      .then(() => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus, feedback: feedbackText } : p));
        const text = newStatus === 'Qabul qilindi' ? `Loyihangiz qabul qilindi. ${(feedbackText || '').slice(0, 80)}` : `Loyihangiz rad etildi. ${(feedbackText || '').slice(0, 80)}`;
        return api.createNotification({ orgId: project?.orgId, type: newStatus === 'Qabul qilindi' ? 'success' : 'warning', text }).then(() => {
          if (project?.orgId === currentUser?.orgId) setNotifications(prev => [{ id: Date.now(), orgId: project.orgId, type: newStatus === 'Qabul qilindi' ? 'success' : 'warning', text, time: 'Hozirgina', unread: true }, ...prev]);
        });
      })
      .then(() => showToast(`Loyiha holati yangilandi!`, 'success'))
      .catch((err) => showToast(err.message || 'Xatolik', 'error'));
  };

  const visibleProjects = projects.filter(p => {
    if (!currentUser) return false;
    if (currentUser.role === 'gov') return true; 
    if (currentUser.role === 'student') return p.author === currentUser.name || p.orgId === currentUser.orgId; 
    if (currentUser.role === 'organization') return p.targetOrgId === currentUser.orgId; 
    return false;
  });

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      <CustomStyles />
      <div className="min-h-screen bg-[#05050A] text-slate-200 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative flex flex-col">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-grid-texture opacity-20"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-600/10 blur-[150px] animate-orb-1 mix-blend-screen"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/10 blur-[160px] animate-orb-2 mix-blend-screen"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col flex-1">
          {showResetPassword ? (
            <ResetPasswordPage showToast={showToast} onDone={() => { window.location.hash = ''; setShowResetPassword(false); }} />
          ) : currentView === 'landing' ? (
            <LandingPage onLoginSuccess={loginAs} showToast={showToast} />
          ) : (
            <ApplicationLayout 
              currentUser={currentUser} logout={logout} activeTab={activeTab} setActiveTab={setActiveTab}
              projects={visibleProjects} setProjects={setProjects} notifications={notifications}
              setNotifications={setNotifications} updateProjectStatus={updateProjectStatus}
              showToast={showToast}
              refreshUser={async () => {
                if (!supabase) return;
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  const profile = await api.getProfile(session.user.id);
                  if (profile) setCurrentUser(mapProfileToCurrentUser(session.user, profile));
                }
              }}
            />
          )}
        </div>
      </div>
    </LanguageContext.Provider>
  );
}

// --- RESET PASSWORD PAGE (Supabase recovery link) ---
function ResetPasswordPage({ showToast, onDone }) {
  const { t } = useContext(LanguageContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setHasSession(false);
      return;
    }
    supabase.auth.getSession()
      .then(({ data }) => {
        setHasSession(!!data?.session);
      })
      .catch(() => setHasSession(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setHasSession(true);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast(t.auth.confirmPassword + " mos kelmadi.", "warning");
      return;
    }
    if (password.length < 6) {
      showToast("Parol kamida 6 belgidan iborat bo'lishi kerak.", "warning");
      return;
    }
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      setLoading(false);
      if (error) {
        showToast(error.message || t.auth.forgotOnlySupabase, "warning");
        return;
      }
      setDone(true);
      showToast(t.auth.resetSuccess, "success");
      setTimeout(() => {
        window.location.hash = '';
        onDone();
      }, 2000);
    } catch (err) {
      setLoading(false);
      showToast(t.auth.forgotOnlySupabase, "warning");
    }
  };

  if (hasSession === null) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="premium-glass rounded-2xl p-8 border border-white/10 flex items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-blue-400" />
          <span className="text-white font-bold">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }
  if (!supabase || !hasSession) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="premium-glass rounded-2xl p-8 border border-white/10 max-w-md text-center">
          <p className="text-slate-300 mb-6">{t.auth.forgotOnlySupabase}</p>
          <p className="text-slate-500 text-sm mb-6">Havola orqali kelsangiz, Supabase ulangan va Email provider yoqilgan bo‘lishi kerak. 500 xatosi bo‘lsa, Supabase → Authentication → URL Configuration da Site URL va Redirect URLs ni production manzilingizga o‘rnating.</p>
          <button type="button" onClick={() => { window.location.hash = ''; onDone(); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">
            {t.auth.backToLogin}
          </button>
        </div>
      </div>
    );
  }
  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="premium-glass rounded-2xl p-8 border border-white/10 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-white font-bold text-lg mb-6">{t.auth.resetSuccess}</p>
          <button type="button" onClick={() => { window.location.hash = ''; onDone(); }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-xl font-bold transition-colors">
            {t.auth.backToLogin}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="premium-glass rounded-2xl p-8 border border-white/10 w-full max-w-md">
        <h2 className="text-2xl font-black text-white mb-2">{t.auth.setNewPassword}</h2>
        <p className="text-slate-400 text-sm mb-6">{t.auth.forgotEmailHint}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.newPassword}</label>
            <input required value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={6} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.confirmPassword}</label>
            <input required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" minLength={6} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder="••••••••" />
          </div>
          <button disabled={loading} type="submit" className="w-full btn-premium py-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-xl font-black flex items-center justify-center gap-2">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : t.auth.setNewPassword}
          </button>
          <button type="button" onClick={() => { window.location.hash = ''; onDone(); }} className="w-full py-2.5 text-slate-400 hover:text-white text-sm font-bold transition-colors">
            {t.auth.backToLogin}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- LANDING PAGE ---
function LandingPage({ onLoginSuccess, showToast }) {
  const { lang, setLang, t } = useContext(LanguageContext);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false });
  const [authMode, setAuthMode] = useState('login'); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);

  const [authForm, setAuthForm] = useState({
    name: '', email: '', password: '', role: 'student', region: 'Toshkent', school: ''
  });

  useEffect(() => {
    if (typeof api.getGlobalStats !== 'function') return;
    api.getGlobalStats()
      .then(setGlobalStats)
      .catch(() => setGlobalStats({ totalProjects: 0, totalOrganizations: 0, totalRegions: 0, uniqueAuthors: 0 }));
  }, []);

  const handleAuthModalOpen = (initialRole = 'student', mode = 'login') => {
    setAuthMode(mode);
    setAuthForm(prev => ({ ...prev, role: initialRole }));
    setAuthModal({ isOpen: true });
  };

  const executeAuth = async (e, isGoogle = false) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);

    if (supabase && !isGoogle) {
      try {
        if (authMode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: (authForm.email || '').trim(),
            password: authForm.password || '',
          });
          if (error) {
            showToast(error.message, "error");
            setIsLoggingIn(false);
            return;
          }
          const profile = await api.getProfile(data.user.id);
          if (!profile) {
            showToast("Profil topilmadi. Iltimos, qayta kiring.", "warning");
            setIsLoggingIn(false);
            return;
          }
          setAuthModal({ isOpen: false });
          setIsLoggingIn(false);
          onLoginSuccess(mapProfileToCurrentUser(data.user, profile));
          showToast(t.auth.loginTitle + " - Muvaffaqiyatli!", "success");
          return;
        }
        if (authMode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: (authForm.email || '').trim(),
            password: authForm.password || '',
            options: {
              data: {
                full_name: authForm.name || '',
                role: authForm.role,
                region: authForm.region || 'Toshkent',
                school: authForm.school || '',
              },
            },
          });
          if (error) {
            showToast(error.message, "error");
            setIsLoggingIn(false);
            return;
          }
          const orgId = authForm.role === 'student' ? 'ORG-SCH-007' : authForm.role === 'organization' ? 'ORG-ITP-001' : 'ORG-GOV-000';
          const orgName = authForm.role === 'student' ? (authForm.school || '') : authForm.role === 'organization' ? (authForm.school || '') : 'Davlat Nazorati';
          const plan = authForm.role === 'student' ? 'free' : authForm.role === 'organization' ? 'pro' : 'enterprise';
          await api.createProfile({
            id: data.user.id,
            full_name: authForm.name || '',
            role: authForm.role,
            region: authForm.region || 'Toshkent',
            org_id: orgId,
            org_name: orgName,
            school: authForm.school || null,
            plan,
          });
          const profile = await api.getProfile(data.user.id);
          setAuthModal({ isOpen: false });
          setIsLoggingIn(false);
          onLoginSuccess(mapProfileToCurrentUser(data.user, profile));
          showToast(t.settings.saved, "success");
          return;
        }
      } catch (err) {
        showToast(err.message || "Xatolik yuz berdi", "error");
        setIsLoggingIn(false);
        return;
      }
    }

    if (isGoogle && supabase) {
      if (authMode === 'register') {
        try {
          const payload = JSON.stringify({
            role: authForm.role,
            region: authForm.region || 'Toshkent',
            school: authForm.school || '',
          });
          localStorage.setItem('nexus_oauth_pending_profile', payload);
          sessionStorage.setItem('nexus_oauth_pending_profile', payload);
        } catch (_) {}
      }
      const redirectTo = `${window.location.origin}${window.location.pathname || ''}`;
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
        .then(({ error }) => {
          if (error) {
            showToast(error.message || "Google kirish xatosi", "error");
            setIsLoggingIn(false);
            return;
          }
          showToast("Google sahifasiga yo'naltirilmoqda...", "info");
        })
        .catch((err) => {
          showToast(err.message || "Google kirish xatosi", "error");
          setIsLoggingIn(false);
        });
      return;
    }

    // Mock auth (Supabase ulanmaganida)
    setTimeout(() => {
      setIsLoggingIn(false);
      setAuthModal({ isOpen: false });
      if (authMode === 'register') showToast(t.settings.saved, "success");
      let mockedUser = {};
      if (authForm.role === 'student') {
        mockedUser = { id: 'u1', name: authForm.name || "Sardor Rustamov", role: 'student', orgId: 'ORG-SCH-007', plan: 'free', orgName: authForm.school || '7-Maktab', freeAttempts: 1 };
      } else if (authForm.role === 'organization') {
        mockedUser = { id: 'u2', name: authForm.name || "Doniyor Ergashev", role: 'organization', orgId: 'ORG-ITP-001', plan: 'pro', orgName: authForm.school || 'Toshkent IT Park', freeAttempts: 0 };
      } else {
        mockedUser = { id: 'u3', name: authForm.name || "Vazirlik Xodimi", role: 'gov', orgId: 'ORG-GOV-000', plan: 'enterprise', orgName: 'Davlat Nazorati', freeAttempts: 0 };
      }
      onLoginSuccess(mockedUser);
    }, 1500);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      showToast(t.auth.forgotOnlySupabase, "warning");
      return;
    }
    const email = (authForm.email || '').trim();
    if (!email) return;
    setIsLoggingIn(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname || ''}#reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      setIsLoggingIn(false);
      if (error) {
        showToast(error.message || t.auth.forgotOnlySupabase, "warning");
        return;
      }
      showToast(t.auth.resetEmailSent, "success");
      setAuthMode('login');
    } catch (err) {
      setIsLoggingIn(false);
      showToast(t.auth.forgotOnlySupabase, "warning");
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto relative min-h-screen custom-scrollbar scroll-smooth">
      <nav className="flex justify-between items-center px-4 md:px-8 lg:px-12 py-4 md:py-5 border-b border-white/5 premium-glass sticky top-0 z-50 mx-2 md:mx-4 mt-2 md:mt-4 rounded-2xl md:rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 md:gap-4 hover:scale-105 transition-transform cursor-pointer group">
          <NexusLogo />
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-white drop-shadow-md">
            NEXUS<span className="text-blue-500">.</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex bg-black/40 rounded-lg p-1 mr-2 border border-white/5">
            {['uz', 'ru', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${lang === l ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
            ))}
          </div>
          <a href="#about" className="text-sm font-bold text-slate-300 hover:text-blue-400 transition-colors">{t.nav.about}</a>
          <a href="#contact" className="text-sm font-bold text-slate-300 hover:text-blue-400 transition-colors">{t.nav.contact}</a>
          <div className="w-px h-4 bg-white/10 mx-2"></div>
          <button onClick={() => handleAuthModalOpen('gov', 'login')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors items-center gap-2 flex">
            <Globe className="w-4 h-4" /> {t.nav.gov}
          </button>
          <button onClick={() => handleAuthModalOpen('organization', 'login')} className="btn-premium px-8 py-3 bg-white text-[#05050A] rounded-xl font-black text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {t.nav.orgLogin}
          </button>
        </div>
        <div className="lg:hidden flex gap-2 items-center">
          <button onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} className="text-xs font-bold uppercase p-2 border border-white/10 rounded-lg text-white">{lang}</button>
          <button onClick={() => handleAuthModalOpen('student', 'login')} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold rounded-xl text-sm shadow-lg">
            {t.nav.login}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full relative z-20 min-h-0 overflow-visible">
        <div className="w-full flex flex-col items-center justify-center text-center px-4 pt-16 md:pt-32 pb-16">
          <div className="slide-up delay-100 inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 rounded-full premium-glass border-blue-500/30 mb-6 md:mb-10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-400 animate-[pulseSoft_2s_infinite]" />
            <span className="text-xs md:text-sm font-black tracking-widest uppercase text-blue-100">{t.hero.badge}</span>
          </div>
          
          <h1 className="slide-up delay-200 text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-black text-white mb-6 md:mb-8 leading-tight max-w-6xl tracking-tighter">
            {t.hero.title1} <br className="hidden md:block"/>
            <span className="premium-gradient-text relative inline-block mt-2 md:mt-4 pb-2 pt-1">
              {t.hero.title2}
              <div className="absolute w-full h-1/2 bottom-0 left-0 bg-indigo-500/20 blur-2xl -z-10"></div>
            </span>
          </h1>
          
          <p className="slide-up delay-300 text-sm md:text-xl lg:text-2xl text-slate-400 max-w-3xl mb-10 md:mb-14 leading-relaxed font-medium px-2">
            {t.hero.desc}
          </p>
          
          <div className="slide-up delay-400 flex flex-col sm:flex-row gap-4 md:gap-6 relative w-full sm:w-auto px-4">
            <button onClick={() => handleAuthModalOpen('student', 'register')} className="w-full sm:w-auto btn-premium px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-600 via-indigo-500 to-fuchsia-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-[0_0_30px_rgba(217,70,239,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
              <Send className="w-5 h-5 md:w-6 md:h-6" /> {t.hero.startFree}
            </button>
            <button onClick={() => setIsVideoOpen(true)} className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 premium-glass text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 group hover:-translate-y-1 border border-white/10">
              <PlayCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-400 group-hover:text-white transition-colors" /> {t.hero.video}
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 mt-4 md:mt-12 slide-up delay-500 relative z-20 overflow-hidden mb-20 md:mb-32">
          <div className="relative flex overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#05050A] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#05050A] to-transparent z-10"></div>
            <div className="animate-marquee gap-10 md:gap-24">
              {[...partnersList, ...partnersList].map((partner, i) => (
                <div key={i} className="flex items-center gap-3 md:gap-4 opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer grayscale hover:grayscale-0">
                  {partner.icon}
                  <span className="text-white font-bold text-lg md:text-2xl tracking-tight whitespace-nowrap">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl mx-auto slide-up delay-500 px-4 md:px-8 mb-24 md:mb-40 min-h-0">
          <StatBox icon={Users} value={globalStats != null ? String(globalStats.uniqueAuthors) : '…'} label={t.stats.users} color="blue" delay="100" />
          <StatBox icon={Folder} value={globalStats != null ? String(globalStats.totalProjects) : '…'} label={t.stats.startups} color="fuchsia" delay="200" />
          <StatBox icon={Building} value={globalStats != null ? String(globalStats.totalOrganizations) : '…'} label={t.stats.orgs} color="emerald" delay="300" />
          <StatBox icon={Globe} value={globalStats != null ? String(globalStats.totalRegions) : '…'} label={t.stats.regions} color="blue" delay="400" />
        </div>

        <section id="about" className="w-full max-w-7xl mx-auto px-4 md:px-8 mb-24 md:mb-40 slide-up pt-10">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-md">{t.about.title}</h2>
            <p className="text-blue-400 font-bold tracking-widest uppercase text-sm">{t.about.subtitle}</p>
          </div>
          <div className="premium-glass rounded-[2rem] p-8 md:p-14 shadow-2xl border border-white/5 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl pointer-events-none"></div>
            <p className="text-xl md:text-3xl text-white font-black leading-snug md:leading-relaxed mb-6 tracking-tight drop-shadow-md">
              {t.about.text1}
            </p>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-12 max-w-4xl font-medium">
              {t.about.text2}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.01] p-8 rounded-[1.5rem] border border-white/5 hover:-translate-y-2 transition-transform duration-300 shadow-inner group">
                <div className="p-4 bg-fuchsia-500/10 inline-block rounded-2xl mb-6 group-hover:scale-110 transition-transform border border-fuchsia-500/20">
                  <Target className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h4 className="text-white font-black text-xl mb-3 tracking-tight">{t.about.card1Title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{t.about.card1Desc}</p>
              </div>
              <div className="bg-white/[0.01] p-8 rounded-[1.5rem] border border-white/5 hover:-translate-y-2 transition-transform duration-300 shadow-inner group">
                <div className="p-4 bg-blue-500/10 inline-block rounded-2xl mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                  <Lightbulb className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-white font-black text-xl mb-3 tracking-tight">{t.about.card2Title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{t.about.card2Desc}</p>
              </div>
              <div className="bg-white/[0.01] p-8 rounded-[1.5rem] border border-white/5 hover:-translate-y-2 transition-transform duration-300 shadow-inner group">
                <div className="p-4 bg-emerald-500/10 inline-block rounded-2xl mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                  <Rocket className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-white font-black text-xl mb-3 tracking-tight">{t.about.card3Title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{t.about.card3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="w-full border-t border-white/5 bg-[#05050A]/90 backdrop-blur-xl relative z-20 mt-auto overflow-visible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <NexusLogo />
                <span className="text-3xl font-black text-white tracking-tighter">NEXUS<span className="text-blue-500">.</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                {t.contact.desc}
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-black uppercase tracking-widest mb-6 text-sm">{t.contact.quickLinks}</h4>
              <ul className="space-y-4 text-slate-400 text-sm font-bold">
                <li><button onClick={() => handleAuthModalOpen('student', 'register')} className="hover:text-blue-400 transition-colors">{t.nav.submit}</button></li>
                <li><button onClick={() => handleAuthModalOpen('organization', 'login')} className="hover:text-blue-400 transition-colors">{t.nav.orgLogin}</button></li>
                <li><button onClick={() => handleAuthModalOpen('gov', 'login')} className="hover:text-blue-400 transition-colors">{t.nav.gov}</button></li>
                <li><button onClick={() => setIsVideoOpen(true)} className="hover:text-blue-400 transition-colors">{t.hero.video}</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-black uppercase tracking-widest mb-6 text-sm">{t.contact.contactUs}</h4>
              <div className="space-y-5">
                <div className="flex items-start gap-4 text-slate-300 text-sm font-bold">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shrink-0"><MapPin className="w-4 h-4 text-blue-400" /></div>
                  <span className="mt-1.5 leading-snug">{t.contact.address}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-300 text-sm font-bold">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shrink-0"><Phone className="w-4 h-4 text-emerald-400" /></div>
                  +998 (71) 209-99-99
                </div>
                <div className="flex items-center gap-4 text-slate-300 text-sm font-bold">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shrink-0"><Mail className="w-4 h-4 text-fuchsia-400" /></div>
                  info@nexus-startup.uz
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 py-8 text-center bg-black/20">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} {t.contact.rights}</p>
          </div>
        </footer>
      </main>

      {authModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthModal({ isOpen: false })}></div >
          <div className="relative w-full max-w-md premium-glass rounded-[2rem] p-6 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-10 slide-up border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setAuthModal({ isOpen: false })} className="absolute top-5 right-5 text-slate-400 hover:text-white"><X className="w-5 h-5 md:w-6 md:h-6"/></button>
            <div className="text-center mb-6 mt-2">
              <div className="inline-flex justify-center mb-4"><NexusLogo /></div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {authMode === 'forgot' ? t.auth.forgotTitle : authMode === 'login' ? t.auth.loginTitle : t.auth.regTitle}
              </h2>
            </div>
            
            {authMode !== 'forgot' && (
            <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/5">
              <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${authMode === 'login' ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                <LogIn className="w-4 h-4"/> {t.nav.login}
              </button>
              <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${authMode === 'register' ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                <UserPlus className="w-4 h-4"/> {t.auth.regBtn}
              </button>
            </div>
            )}
            {authMode === 'forgot' && (
              <p className="text-slate-400 text-sm mb-6 text-center">{t.auth.forgotEmailHint}</p>
            )}

            {authMode === 'forgot' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.emailOrId}</label>
                  <input required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} type="email" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder="email@example.com" />
                </div>
                <button disabled={isLoggingIn} type="submit" className="w-full btn-premium py-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-xl font-black shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02]">
                  {isLoggingIn ? <Loader className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : t.auth.sendResetLink}
                </button>
                <button type="button" onClick={() => setAuthMode('login')} className="w-full py-2.5 text-slate-400 hover:text-white text-sm font-bold transition-colors">
                  {t.auth.backToLogin}
                </button>
              </form>
            ) : (
            <form onSubmit={(e) => executeAuth(e, false)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.roleSelect}</label>
                  <select value={authForm.role} onChange={e => setAuthForm({...authForm, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm appearance-none cursor-pointer">
                     <option value="student">{t.auth.roles.student}</option>
                     <option value="organization">{t.auth.roles.organization}</option>
                     <option value="gov">{t.auth.roles.gov}</option>
                  </select>
                </div>
                {authMode === 'register' && (
                  <div className="flex-1 slide-up">
                    <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.regionSelect}</label>
                    <select value={authForm.region} onChange={e => setAuthForm({...authForm, region: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm appearance-none cursor-pointer">
                       {t.auth.regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <>
                  <div className="slide-up">
                    <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {authForm.role === 'student' ? t.auth.schoolSelect : t.auth.orgNameSelect}
                    </label>
                    <input required value={authForm.school} onChange={e => setAuthForm({...authForm, school: e.target.value})} type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder={authForm.role === 'student' ? t.auth.schoolPlaceholder : ""} />
                  </div>
                  <div className="slide-up">
                    <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.name}</label>
                    <input required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder="Ism va familiya" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.emailOrId}</label>
                <input required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder="ID yoki Email" />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.auth.pass}</label>
                <input required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} type="password" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors text-sm" placeholder="••••••••" />
                {authMode === 'login' && (
                  <button type="button" onClick={() => setAuthMode('forgot')} className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    {t.auth.forgotLink}
                  </button>
                )}
              </div>
              
              <button disabled={isLoggingIn} type="submit" className="w-full btn-premium py-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-xl font-black shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center justify-center gap-2 mt-4 transition-transform hover:scale-[1.02]">
                {isLoggingIn ? <Loader className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : (authMode === 'login' ? t.auth.loginBtn : t.auth.regBtn)}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">{t.auth.or}</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button type="button" onClick={() => executeAuth(null, true)} disabled={isLoggingIn} className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-inner">
                <GoogleIcon /> {t.auth.google}
              </button>
            </form>
            )}
          </div>
        </div>
      )}

      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsVideoOpen(false)}></div>
          <div className="relative w-full max-w-4xl bg-[#05050A] rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden slide-up flex flex-col">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/5">
              <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2"><Play className="w-5 h-5 text-blue-400"/> {t.hero.video}</h3>
              <button onClick={() => setIsVideoOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 md:w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="aspect-video bg-black relative w-full">
               <iframe className="w-full h-full" src="https://www.youtube.com/embed/k4J3Z1v3r7c?autoplay=1&rel=0" title="NEXUS Video Qo'llanma" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationLayout({ currentUser, logout, activeTab, setActiveTab, projects, setProjects, notifications, setNotifications, updateProjectStatus, showToast, refreshUser }) {
  const { lang, setLang, t } = useContext(LanguageContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const orgNotifications = notifications.filter(n => n.orgId === 'ALL' || n.orgId === currentUser.orgId);
  const unreadCount = orgNotifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(notifications.map(n => (n.orgId === 'ALL' || n.orgId === currentUser.orgId) ? {...n, unread: false} : n));
  const handleNavClick = (tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

  const NavigationLinks = () => (
    <React.Fragment>
      {currentUser.role !== 'gov' && <NavItem icon={LayoutDashboard} label={t.nav.dashboard} active={activeTab === 'dashboard'} onClick={() => handleNavClick('dashboard')} />}
      {currentUser.role === 'student' && <NavItem icon={Send} label={t.nav.submit} active={activeTab === 'submit'} onClick={() => handleNavClick('submit')} />}
      {currentUser.role !== 'gov' && <NavItem icon={Folder} label={t.nav.projects} active={activeTab === 'projects'} onClick={() => handleNavClick('projects')} />}
      {(currentUser.role === 'gov' || currentUser.role === 'organization') && <NavItem icon={TrendingUp} label={t.nav.kpi} active={activeTab === 'kpi'} onClick={() => handleNavClick('kpi')} />}
      <NavItem icon={Users} label={t.nav.team} active={activeTab === 'team'} onClick={() => handleNavClick('team')} />
      <NavItem icon={CreditCard} label={t.nav.payments} active={activeTab === 'payments'} onClick={() => handleNavClick('payments')} />
      <NavItem icon={Settings} label={t.nav.settings} active={activeTab === 'settings'} onClick={() => handleNavClick('settings')} />
    </React.Fragment>
  );

  return (
    <div className="flex h-screen w-full p-0 md:p-4 gap-4 flex-1 bg-[#05050A] overflow-hidden">
      <aside className="w-[280px] premium-glass flex-col hidden lg:flex relative z-20 rounded-[2rem] overflow-hidden shadow-2xl flex-shrink-0 border-white/5">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="p-6 relative z-10 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10 mt-2 cursor-pointer group" onClick={() => handleNavClick('dashboard')}>
            <NexusLogo />
            <span className="text-3xl font-black text-white tracking-tighter">NEXUS</span>
          </div>
          <button onClick={() => handleNavClick(currentUser.role === 'student' ? 'submit' : 'projects')} className="w-full btn-premium bg-white text-slate-900 hover:bg-slate-100 p-4 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.03] flex items-center justify-center gap-2 mb-8">
            <Send className="w-5 h-5" /> {currentUser.role === 'student' ? t.nav.submit : t.nav.projects}
          </button>
          <nav className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-2"><NavigationLinks /></nav>
          <div className="mt-4 pt-6 border-t border-white/10 relative z-10">
             <button onClick={logout} className="w-full flex items-center gap-4 text-slate-400 hover:text-red-400 transition-colors px-4 py-4 rounded-2xl hover:bg-red-500/10 group">
               <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               <span className="font-bold">{t.nav.logout}</span>
             </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="w-[280px] h-full premium-glass border-r border-white/10 relative z-10 flex flex-col p-6 slide-in-right">
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            <div className="flex items-center gap-3 mb-8 mt-2"><NexusLogo /><span className="text-2xl font-black text-white">NEXUS</span></div>
            <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar"><NavigationLinks /></nav>
            <button onClick={logout} className="w-full flex items-center gap-3 text-red-400 px-4 py-4 rounded-xl bg-red-500/10 font-bold mt-4"><LogOut className="w-5 h-5" /> {t.nav.logout}</button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 md:premium-glass md:rounded-[2rem] shadow-2xl border-white/5">
        <div className="w-full bg-blue-900/20 text-blue-200 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center py-1.5 flex justify-center items-center gap-2 border-b border-blue-500/20">
          <Server className="w-3 h-3 md:w-4 md:h-4 text-fuchsia-400" />
          <span>Tashkilot Izolyatsiyasi Faol | {currentUser.orgId}</span>
          <Lock className="w-3 h-3 md:w-4 md:h-4 ml-2 text-emerald-400" />
        </div>

        <header className="h-16 md:h-24 border-b border-white/5 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30 bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-300 hover:text-white"><Menu className="w-6 h-6"/></button>
             
             {currentUser.role === 'organization' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center border border-white/10 shadow-inner"><Award className="w-4 h-4 md:w-6 md:h-6 text-amber-400" /></div>
                  <div className="hidden sm:block">
                    <h2 className="text-white font-black text-sm md:text-xl tracking-tight drop-shadow-md">{currentUser.orgName}</h2>
                    <p className="text-[9px] md:text-xs text-blue-300 font-bold uppercase tracking-widest mt-0.5">Org ID: {currentUser.orgId}</p>
                  </div>
                </div>
             )}
             {currentUser.role === 'student' && (
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-500/10 rounded-lg md:rounded-xl flex items-center justify-center border border-emerald-500/20"><MapPin className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" /></div>
                  <div className="hidden sm:block">
                    <h2 className="text-white font-black text-sm md:text-xl tracking-tight drop-shadow-md">{currentUser.orgName}</h2>
                    <p className="text-[9px] md:text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-widest"><CheckCircle className="w-3 h-3"/> Geofencing faol</p>
                  </div>
               </div>
             )}
             {currentUser.role === 'gov' && (
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500/10 rounded-lg md:rounded-xl flex items-center justify-center border border-blue-500/20"><Globe className="w-4 h-4 md:w-6 md:h-6 text-blue-400" /></div>
                  <div className="hidden sm:block">
                    <h2 className="text-white font-black text-sm md:text-xl tracking-tight drop-shadow-md">{currentUser.orgName}</h2>
                    <p className="text-[9px] md:text-xs text-blue-300 font-bold uppercase tracking-widest mt-0.5">Davlat Analitikasi</p>
                  </div>
               </div>
             )}
          </div>

          <div className="flex items-center gap-3 md:gap-6 relative">
            <div className="hidden sm:flex bg-black/40 rounded-lg p-1 border border-white/5">
              {['uz', 'ru', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 text-[10px] md:text-xs font-bold uppercase rounded-md transition-all ${lang === l ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <button onClick={() => setLang(lang === 'uz' ? 'ru' : lang === 'ru' ? 'en' : 'uz')} className="sm:hidden text-[10px] font-bold uppercase p-2 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors">
              {lang}
            </button>

            <button onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) markAllRead(); }} className="relative p-2.5 md:p-3 text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 shadow-inner">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-fuchsia-500 rounded-full border-2 border-[#05050A] animate-pulse flex items-center justify-center text-[8px] font-bold text-white">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="absolute top-14 md:top-20 right-0 md:right-8 w-72 md:w-80 premium-glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden slide-up">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                   <h4 className="font-black text-white text-sm">Bildirishnomalar</h4>
                   <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded">Yangi: {unreadCount}</span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar bg-[#05050A]/90">
                  {orgNotifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex items-start gap-3">
                         <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-emerald-400' : notif.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`}></div>
                         <div>
                            <p className="text-sm font-medium text-slate-300 leading-snug">{notif.text}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{notif.time}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                  {orgNotifications.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">Xabarlar yo'q</div>}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-6 border-l border-white/10 cursor-pointer group" onClick={() => handleNavClick('settings')}>
              <div className="text-right hidden lg:block">
                <p className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{currentUser.role.toUpperCase()}</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-fuchsia-600 p-[2px] shadow-lg group-hover:shadow-fuchsia-500/50 transition-shadow overflow-hidden">
                {(() => {
                  const u = resolveAvatarDisplay(currentUser.avatarUrl);
                  const src = u?.type === '3d' ? u.url : (u?.type === 'image' ? (ensurePublicStorageUrl(u.url, 'avatars') || u.url) : null);
                  return src ? <img src={src} alt="" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-[#05050A] flex items-center justify-center text-white font-bold text-xs md:text-sm">{currentUser.name.split(' ').map(n=>n[0]).join('')}</div>;
                })()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative scroll-smooth custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard projects={projects} />}
          {activeTab === 'kpi' && <KPIDashboard projects={projects} />}
          {activeTab === 'team' && <TeamList currentUser={currentUser} showToast={showToast} />}
          {activeTab === 'payments' && <PaymentsDashboard currentUser={currentUser} showToast={showToast} />}
          {activeTab === 'settings' && <SettingsPanel currentUser={currentUser} showToast={showToast} refreshUser={refreshUser} />}
          {activeTab === 'submit' && currentUser.role === 'student' && <ProjectSubmission currentUser={currentUser} setProjects={setProjects} setActiveTab={setActiveTab} setNotifications={setNotifications} notifications={notifications} showToast={showToast} />}
          {activeTab === 'projects' && <ProjectList projects={projects} updateProjectStatus={updateProjectStatus} onViewProject={setViewProject} />}
        </div>
      </main>

      {viewProject && (
        <ProjectModal 
          project={viewProject} 
          onClose={() => setViewProject(null)} 
          role={currentUser.role} 
          updateProjectStatus={(status, fb) => { updateProjectStatus(viewProject.id, status, fb); setViewProject(null); }} 
        />
      )}
    </div>
  );
}

function Dashboard({ projects = [] }) {
  const { t } = useContext(LanguageContext);
  const stats = React.useMemo(() => {
    const total = projects.length;
    const approved = projects.filter(p => p.status === 'Qabul qilindi').length;
    const rejected = projects.filter(p => p.status === 'Rad etildi').length;
    const received = projects.filter(p => p.status === "Ko'rilmoqda").length;
    const uniqueAuthors = new Set(projects.map(p => p.author)).size;
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const byMonth = {};
    monthNames.forEach((_, i) => { byMonth[i] = { name: monthNames[i], projects: 0 }; });
    projects.forEach(p => {
      const d = p.date || (p.created_at && p.created_at.slice(0, 7));
      if (d) {
        const monthIdx = parseInt(d.slice(5, 7), 10) - 1;
        if (monthIdx >= 0 && monthIdx <= 11) byMonth[monthIdx].projects += 1;
      }
    });
    const chartData = monthNames.map((name, i) => ({ name, projects: byMonth[i].projects }));
    const pieData = [
      { name: 'Qabul qilindi', value: approved, color: '#10B981' },
      { name: 'Rad etildi', value: rejected, color: '#EF4444' },
      { name: "Ko'rilmoqda", value: received, color: '#3b82f6' },
    ].filter(d => d.value > 0);
    if (pieData.length === 0) pieData.push({ name: "Loyihalar yo'q", value: 1, color: '#64748b' });
    return { total, approved, rejected, received, uniqueAuthors, chartData, pieData };
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="slide-up mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-md">{t.dashboard.title}</h1>
        <p className="text-slate-400 text-sm md:text-lg font-medium">{t.dashboard.desc}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14">
        <DashCard title={t.dashboard.totalUsers} value={String(stats.uniqueAuthors)} icon={Users} color="blue" delay="100" />
        <DashCard title={t.dashboard.received} value={String(stats.total)} icon={Folder} color="fuchsia" delay="200" />
        <DashCard title={t.dashboard.rejected} value={String(stats.rejected)} icon={AlertTriangle} color="red" delay="300" />
        <DashCard title={t.dashboard.approved} value={String(stats.approved)} icon={CheckCircle} color="emerald" delay="400" />
      </div>

      <div className="slide-up delay-500 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="premium-glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-white mb-6 md:mb-8 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="w-5 h-5 text-blue-400" /></div> {t.dashboard.growth}
          </h3>
          <div className="h-56 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#3b82f6', fontWeight: '900' }} />
                <Line type="monotone" dataKey="projects" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#05050A', strokeWidth: 2, stroke: '#3b82f6' }} activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 0, shadowBlur: 10, shadowColor: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-white mb-6 md:mb-8 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg"><PieChart className="w-5 h-5 text-fuchsia-400" /></div> {t.dashboard.statusDist}
          </h3>
          <div className="h-56 md:h-80 w-full flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={10}>
                  {stats.pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 10px ${entry.color}50)` }} />))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
               <span className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{stats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIDashboard({ projects = [] }) {
  const { t } = useContext(LanguageContext);
  const kpiStats = React.useMemo(() => {
    const bySchool = {};
    projects.forEach(p => {
      const s = (p.school || "—").trim() || "—";
      bySchool[s] = (bySchool[s] || 0) + 1;
    });
    const sorted = Object.entries(bySchool).sort((a, b) => b[1] - a[1]);
    const topSchool = sorted[0] ? sorted[0][0] : "—";
    const chartData = sorted.slice(0, 8).map(([hudud, aktivlik]) => ({ hudud, aktivlik }));
    if (chartData.length === 0) chartData.push({ hudud: "—", aktivlik: 0 });
    return { topSchool, chartData };
  }, [projects]);

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="slide-up mb-6 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-md">{t.kpi.title}</h1>
        <p className="text-slate-400 text-sm md:text-lg font-medium">{t.kpi.desc}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        <DashCard title={t.kpi.activeRegion} value="—" icon={Globe} color="fuchsia" delay="100" />
        <DashCard title={t.kpi.topSchool} value={kpiStats.topSchool} icon={Building} color="blue" delay="200" />
        <div className="col-span-2 lg:col-span-1">
           <DashCard title={t.kpi.totalInv} value="—" icon={TrendingUp} color="emerald" delay="300" />
        </div>
      </div>

      <div className="slide-up delay-400 premium-glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden mb-10">
        <h3 className="text-base sm:text-lg md:text-2xl font-black text-white mb-6 md:mb-8 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-400" /></div> {t.kpi.chartTitle}
        </h3>
        <div className="h-64 md:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiStats.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="hudud" stroke="#64748B" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
              <Bar dataKey="aktivlik" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={25}>
                {kpiStats.chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 1 ? '#d946ef' : '#3b82f6'} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function TeamList({ currentUser, showToast }) {
  const { t } = useContext(LanguageContext);
  const [team, setTeam] = useState(mockTeam);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', tags: '' });
  const [saving, setSaving] = useState(false);

  const canManageMentors = currentUser && (currentUser.role === 'organization' || currentUser.role === 'gov');
  const orgId = currentUser?.orgId;

  useEffect(() => {
    if (!orgId) { setTeam(mockTeam); setLoading(false); return; }
    async function load() {
      try {
        const data = await api.getTeam(orgId);
        setTeam(Array.isArray(data) ? data : mockTeam);
      } catch {
        setTeam(mockTeam);
      }
      setLoading(false);
    }
    load();
  }, [orgId]);

  const handleAddMentor = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !orgId) return;
    setSaving(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [];
      const newMember = await api.addMentor({
        orgId,
        name: form.name.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        tags,
      });
      setTeam(prev => [newMember, ...prev]);
      setAddModal(false);
      setForm({ name: '', role: '', company: '', tags: '' });
      showToast(t.settings.saved, 'success');
    } catch (err) {
      showToast(err.message || 'Xatolik', 'error');
    }
    setSaving(false);
  };

  const handleDeleteMentor = async (member) => {
    if (member.orgId !== orgId || member.orgId === 'ALL') return;
    if (!confirm('Ushbu mentorni o\'chirishni xohlaysizmi?')) return;
    try {
      await api.deleteMentor(member.id, orgId);
      setTeam(prev => prev.filter(m => m.id !== member.id));
      showToast('Mentor o\'chirildi', 'success');
    } catch (err) {
      showToast(err.message || 'Xatolik', 'error');
    }
  };

  const displayTeam = loading ? mockTeam : team;
  const ownMentors = displayTeam.filter(m => m.orgId === orgId);
  const generalMentors = displayTeam.filter(m => m.orgId === 'ALL');
  const showSingleList = ownMentors.length === 0 && generalMentors.length === 0;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="slide-up mb-8 md:mb-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-md">{t.team.title}</h1>
          <p className="text-slate-400 text-sm md:text-lg font-medium">{t.team.desc}</p>
        </div>
        {canManageMentors && (
          <button onClick={() => setAddModal(true)} className="btn-premium px-6 py-3 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg">
            <UserPlus className="w-5 h-5" /> {t.team.addMentor}
          </button>
        )}
      </div>

      {ownMentors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-300 mb-3">{t.team.yourMentors}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {ownMentors.map((member) => (
              <TeamMemberCard key={member.id} member={member} showToast={showToast} t={t} onDelete={canManageMentors ? () => handleDeleteMentor(member) : null} />
            ))}
          </div>
        </div>
      )}
      {generalMentors.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-300 mb-3">{t.team.generalMentors}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {generalMentors.map((member, idx) => (
              <TeamMemberCard key={member.id} member={member} showToast={showToast} t={t} onDelete={null} idx={idx} />
            ))}
          </div>
        </div>
      )}
      {showSingleList && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayTeam.map((member, idx) => (
            <TeamMemberCard key={member.id} member={member} showToast={showToast} t={t} onDelete={canManageMentors && member.orgId === orgId ? () => handleDeleteMentor(member) : null} idx={idx} />
          ))}
        </div>
      )}

      {addModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setAddModal(false)}>
          <div className="premium-glass rounded-2xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-white mb-4">{t.team.addMentor}</h3>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.team.mentorName} *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none text-sm" placeholder="Ism Familiya" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.team.mentorRole}</label>
                <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none text-sm" placeholder="Startap eksperti" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.team.mentorCompany}</label>
                <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none text-sm" placeholder="UzVC" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.team.mentorTags}</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none text-sm" placeholder="IT, FinTech" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-xl font-black text-sm">{saving ? '...' : t.settings.save}</button>
                <button type="button" onClick={() => !saving && setAddModal(false)} className="px-4 py-3 border border-white/10 rounded-xl font-bold text-slate-400 text-sm">{t.payment.back}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamMemberCard({ member, showToast, t, onDelete, idx = 0 }) {
  const tags = Array.isArray(member.tags) ? member.tags : [];
  return (
    <div className={`slide-up delay-${(idx + 1) * 100} premium-glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(217,70,239,0.2)] hover:border-fuchsia-500/30`}>
      {onDelete && (
        <button type="button" onClick={onDelete} className="absolute top-4 left-4 p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 z-10 text-xs font-bold">{t.team.deleteMentor}</button>
      )}
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 font-bold text-xs">{member.rating ?? 5}</span>
        </div>
      </div>
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 p-1 shadow-lg mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-500">
          <div className="w-full h-full rounded-full bg-[#05050A] flex items-center justify-center text-2xl md:text-3xl font-black text-white">{member.avatar || '?'}</div>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white mb-1">{member.name}</h3>
        <p className="text-blue-400 font-bold text-xs md:text-sm mb-4">{member.role || '—'}</p>
        <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs md:text-sm font-medium"><Briefcase className="w-4 h-4" /> {member.company || '—'}</div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tags.map(tag => (<span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-bold text-slate-300">{tag}</span>))}
        </div>
        <button onClick={() => showToast(t.team.reqSent, "success")} className="w-full py-3 md:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm md:text-base font-black transition-colors flex items-center justify-center gap-2 border border-white/5 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-fuchsia-500 group-hover:border-transparent">
          <MessageSquare className="w-4 h-4 md:w-5 h-5" /> {t.team.askMentor}
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ currentUser, showToast, refreshUser }) {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    avatarUrl: currentUser.avatarUrl || null,
  });
  const [saving, setSaving] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const initials = (formData.name || 'U').trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const avatarDisplayUrl = formData.avatarUrl || currentUser.avatarUrl;
  const resolvedAvatar = resolveAvatarDisplay(avatarDisplayUrl);
  const showAvatarImg = resolvedAvatar && (resolvedAvatar.type !== 'image' || !avatarImgError);

  useEffect(() => {
    let avatarUrl = currentUser.avatarUrl || null;
    if (!avatarUrl && typeof window !== 'undefined') {
      const cached = localStorage.getItem(AVATAR_3D_CACHE_KEY);
      if (cached) avatarUrl = AVATAR_3D_PREFIX + cached;
    }
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      avatarUrl,
    });
  }, [currentUser.id, currentUser.name, currentUser.email, currentUser.avatarUrl]);
  useEffect(() => { setAvatarImgError(false); }, [avatarDisplayUrl]);

  const handleSelect3DAvatar = (avatarId) => {
    const value = AVATAR_3D_PREFIX + avatarId;
    setFormData(prev => ({ ...prev, avatarUrl: value }));
    try { localStorage.setItem(AVATAR_3D_CACHE_KEY, avatarId); } catch (_) {}
    setShowAvatarPicker(false);
    showToast("Avatar tanlandi. Saqlash tugmasini bosing.", "success");
  };

  const handleSave = async () => {
    if (!supabase || !currentUser?.id) {
      showToast(t.settings.saved, "success");
      return;
    }
    setSaving(true);
    try {
      await api.updateProfile(currentUser.id, { full_name: formData.name.trim(), avatar_url: formData.avatarUrl || null });
      if (typeof refreshUser === 'function') await refreshUser();
      showToast(t.settings.saved, "success");
    } catch (err) {
      showToast(err.message || "Saqlanmadi", "error");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 slide-up">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-md">{t.settings.title}</h1>
        <p className="text-slate-400 text-sm md:text-lg font-medium">{t.settings.desc}</p>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="premium-glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
           <h3 className="text-lg md:text-xl font-black text-white mb-6 border-b border-white/10 pb-4">{t.settings.editProfile}</h3>
           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                 <button type="button" onClick={() => setShowAvatarPicker(true)} className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-400 to-fuchsia-600 p-[2px] flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-fuchsia-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-400">
                   {showAvatarImg && resolvedAvatar?.url ? (
                     <img src={resolvedAvatar.type === '3d' ? resolvedAvatar.url : (ensurePublicStorageUrl(resolvedAvatar.url, 'avatars') || resolvedAvatar.url)} alt="Avatar" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" onError={() => setAvatarImgError(true)} />
                   ) : (
                     <div className="w-full h-full rounded-full bg-[#05050A] flex items-center justify-center text-xl md:text-2xl font-black text-white">{initials}</div>
                   )}
                 </button>
                 <div className="flex flex-col gap-2">
                   <button type="button" onClick={() => setShowAvatarPicker(true)} className="px-5 py-2 md:px-6 md:py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-xs md:text-sm w-fit">
                     3D avatar tanlash
                   </button>
                   <p className="text-[10px] text-slate-500">Erkak yoki ayol avataridan birini tanlang</p>
                 </div>
                 {showAvatarPicker && (
                   <Avatar3DPickerModal
                     onSelect={handleSelect3DAvatar}
                     onClose={() => setShowAvatarPicker(false)}
                     currentId={avatarDisplayUrl?.startsWith?.(AVATAR_3D_PREFIX) ? avatarDisplayUrl.slice(AVATAR_3D_PREFIX.length) : null}
                   />
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.auth.name}</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-white focus:border-blue-500 focus:outline-none text-sm md:text-base" placeholder="To'liq ism" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                  <input type="email" value={formData.email} readOnly className="w-full bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-slate-400 cursor-not-allowed text-sm md:text-base" />
                  <p className="text-[10px] text-slate-500 mt-1">Ro&apos;yxatdan o&apos;tgan email (o&apos;zgartirib bo&apos;lmaydi)</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto btn-premium px-8 py-3.5 bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-1 transition-transform disabled:opacity-70">{saving ? "Saqlanmoqda..." : t.settings.save}</button>
              </div>
           </div>
        </div>

        <div className="premium-glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
             <h3 className="text-lg md:text-xl font-black text-white">{t.settings.planTitle}</h3>
             <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-500/30">{t.settings.current} {currentUser.plan.toUpperCase()}</span>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${currentUser.plan === 'free' ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-black/30 border-white/5'} flex flex-col`}>
                <h4 className="text-xl font-black text-white mb-2">{t.plans.freeTitle}</h4>
                <div className="text-3xl font-black text-white mb-6">$0<span className="text-sm text-slate-500 font-medium">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {t.plans.freeFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0"/> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-colors mt-auto ${currentUser.plan === 'free' ? 'bg-white/10 text-white cursor-default' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                  {currentUser.plan === 'free' ? t.plans.active : t.plans.select}
                </button>
              </div>

              <div className={`p-6 rounded-2xl border relative ${currentUser.plan === 'pro' ? 'bg-fuchsia-900/20 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.2)]' : 'bg-black/30 border-white/5'} flex flex-col`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{t.plans.popular}</div>
                <h4 className="text-xl font-black text-white mb-2">{t.plans.proTitle}</h4>
                <div className="text-3xl font-black text-white mb-6">990k<span className="text-sm text-slate-500 font-medium">UZS</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {t.plans.proFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0"/> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => showToast("Payme/Click...", "info")} className={`w-full py-3 rounded-xl font-bold transition-colors mt-auto ${currentUser.plan === 'pro' ? 'bg-white/10 text-white cursor-default' : 'bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white shadow-lg'}`}>
                  {currentUser.plan === 'pro' ? t.plans.active : t.plans.buy}
                </button>
              </div>

              <div className={`p-6 rounded-2xl border ${currentUser.plan === 'enterprise' ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-black/30 border-white/5'} flex flex-col`}>
                <h4 className="text-xl font-black text-white mb-2">{t.plans.entTitle}</h4>
                <div className="text-3xl font-black text-white mb-6">Custom</div>
                <ul className="space-y-4 mb-8 flex-1">
                  {t.plans.entFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0"/> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-colors mt-auto ${currentUser.plan === 'enterprise' ? 'bg-white/10 text-white cursor-default' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                  {currentUser.plan === 'enterprise' ? t.plans.active : t.plans.contact}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsDashboard({ currentUser, showToast }) {
  const { t } = useContext(LanguageContext);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { id: '#TRX-9082', date: '2024-06-12', amount: '32,000 UZS', method: 'Card **** 8612', status: 'Muvaffaqiyatli' },
    { id: '#TRX-8123', date: '2024-05-20', amount: '990,000 UZS', method: 'Card **** 9910', status: 'Muvaffaqiyatli' }
  ]);

  const handlePayment = (methodStr) => {
    setTransactions([{ 
        id: `#TRX-${Math.floor(Math.random()*10000)}`, 
        date: new Date().toISOString().split('T')[0], 
        amount: `${parseInt(amount).toLocaleString()} UZS`, 
        method: methodStr, 
        status: 'Muvaffaqiyatli' 
    }, ...transactions]);
    setAmount('');
    showToast("To'lov qabul qilindi!", "success");
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 slide-up">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-md">{t.payments.title}</h1>
        <p className="text-slate-400 text-sm md:text-lg font-medium">{t.payments.desc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Balans va Top-up Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="premium-glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.payments.balance}</h3>
                <div className="text-4xl md:text-5xl font-black text-white mb-6">0 <span className="text-xl text-emerald-400">UZS</span></div>
                
                <div className="border-t border-white/10 pt-6 mt-2">
                    <h3 className="text-sm font-bold text-white mb-4">{t.payments.topup}</h3>
                    <div className="space-y-4">
                        <div>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={t.payments.amount}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 focus:outline-none shadow-inner transition-colors font-medium"
                            />
                        </div>
                        {amount && Number(amount) > 0 ? (
                            <div className="pt-2 slide-up">
                                <CardPaymentForm 
                                    amountLabel={`${parseInt(amount).toLocaleString()} UZS`} 
                                    onSuccess={(methodStr) => handlePayment(methodStr)} 
                                    t={t} 
                                    showToast={showToast} 
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-2">{t.payments.enterAmountFirst}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Tranzaksiyalar tarixi */}
        <div className="lg:col-span-2">
            <div className="premium-glass rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden h-full">
                <h3 className="text-lg md:text-xl font-black text-white mb-6 border-b border-white/10 pb-4">{t.payments.history}</h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {transactions.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">{t.payments.empty}</p>
                    ) : transactions.map((trx, i) => (
                        <div key={i} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">{trx.id}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{trx.date} • {trx.method}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-400 font-black">{trx.amount}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 bg-white/5 inline-block px-2 py-0.5 rounded-md">{trx.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

const defaultOrganizations = [
  { id: 'ORG-ITP-001', name: 'IT Park Uzbekistan', region: 'Toshkent' },
  { id: 'ORG-UZVC-002', name: 'UzVC Fund', region: 'Toshkent' },
  { id: 'ORG-AGRO-003', name: 'AgroBank', region: 'Toshkent' },
  { id: 'ORG-YV-004', name: 'Yoshlar Ventures', region: 'Toshkent' },
  { id: 'ORG-INNO-005', name: "Innovatsiya Vazirligi", region: 'Toshkent' },
];

const ALLOWED_PROJECT_EXT = ['.pdf', '.pptx', '.doc', '.docx'];
const ALLOWED_PROJECT_MIME = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

function ProjectSubmission({ currentUser, setProjects, setActiveTab, setNotifications, notifications, showToast }) {
  const { t } = useContext(LanguageContext);
  const [step, setStep] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [formData, setFormData] = useState({ title: '', problem: '', solution: '', category: 'IT', targetOrgId: '', authorName: '', phone: '', school: '' });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [organizations, setOrganizations] = useState(defaultOrganizations);

  useEffect(() => {
    if (currentUser?.name && !formData.authorName) setFormData(prev => ({ ...prev, authorName: currentUser.name }));
    if (currentUser?.orgName && !formData.school) setFormData(prev => ({ ...prev, school: currentUser.orgName || '' }));
  }, [currentUser?.name, currentUser?.orgName]);

  const validateProjectFile = (file) => {
    const name = (file.name || '').toLowerCase();
    const ok = ALLOWED_PROJECT_EXT.some(ext => name.endsWith(ext)) || ALLOWED_PROJECT_MIME.includes(file.type);
    return ok;
  };

  const runAIAnalysis = async (title, problem, solution) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      const res = await fetch(`${base}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || formData.title, problem: problem || formData.problem, solution: solution || formData.solution }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data && typeof data.totalScore === 'number') {
        return {
          totalScore: Math.min(100, Math.max(0, data.totalScore)),
          problemValidity: Math.min(25, Math.max(0, data.problemValidity ?? 0)),
          innovation: Math.min(20, Math.max(0, data.innovation ?? 0)),
          impact: Math.min(20, Math.max(0, data.impact ?? 0)),
          market: Math.min(20, Math.max(0, data.market ?? 0)),
          feasibility: Math.min(15, Math.max(0, data.feasibility ?? 0)),
        };
      }
    } catch (_) {}
    return null;
  };

  const mockAiResult = () => ({ totalScore: 88, problemValidity: 22, innovation: 18, impact: 18, market: 16, feasibility: 14 });

  useEffect(() => {
    api.getOrganizations().then((data) => {
      if (Array.isArray(data) && data.length > 0) setOrganizations(data);
    }).catch(() => {});
  }, []);

  const handleProceedToPayment = () => {
    if (!formData.title || !formData.problem || !formData.solution) return showToast(t.submit.fillAll, "error");
    if (!(formData.authorName || currentUser?.name)?.trim()) return showToast(t.submit.ownerName + " kiriting", "error");
    if (!(formData.phone || '').trim()) return showToast(t.submit.ownerPhone + " kiriting", "error");
    if (!(formData.school || currentUser?.orgName)?.trim()) return showToast(t.submit.ownerSchool + " kiriting", "error");
    
    // ADDED LOGIC: Free attempt check
    if (currentUser.freeAttempts > 0) {
      showToast(t.submit.freeAttemptMsg, "info");
      setStep(2);
      setIsEvaluating(true);
      runAIAnalysis().then((result) => {
        if (result) {
          setAiResult(result);
          setIsEvaluating(false);
        } else {
          setTimeout(() => {
            setAiResult(mockAiResult());
            setIsEvaluating(false);
          }, 2500);
        }
      }).catch(() => {
        setTimeout(() => {
          setAiResult(mockAiResult());
          setIsEvaluating(false);
        }, 2500);
      });
    } else {
      setStep(1.5); 
    }
  };

  const handlePaymentSuccess = () => {
    setStep(2);
    setIsEvaluating(true);
    runAIAnalysis().then((result) => {
      if (result) {
        setAiResult(result);
        setIsEvaluating(false);
      } else {
        setTimeout(() => {
          setAiResult(mockAiResult());
          setIsEvaluating(false);
        }, 2500);
      }
    }).catch(() => {
      setTimeout(() => {
        setAiResult(mockAiResult());
        setIsEvaluating(false);
      }, 2500);
    });
  };

  const handleSubmit = async () => {
    const targetOrgId = formData.targetOrgId || (organizations[0]?.id) || 'ORG-ITP-001';
    let attachmentUrl = null;
    if (attachmentFile) {
      if (!validateProjectFile(attachmentFile)) {
        showToast(t.submit.attachHint || "Faqat PDF, PPTX, Word (doc, docx)", "error");
        return;
      }
      try {
        attachmentUrl = await api.uploadProjectFile(currentUser.id, attachmentFile);
      } catch (err) {
        showToast(err.message || "Fayl yuklanmadi", "error");
        return;
      }
    }
    const authorName = (formData.authorName || currentUser.name || '').trim();
    const phone = (formData.phone || '').trim();
    const school = (formData.school || currentUser.orgName || '').trim();
    const newProject = { 
      id: Date.now(), 
      orgId: currentUser.orgId, 
      targetOrgId, 
      title: formData.title, 
      problem: formData.problem,
      solution: formData.solution,
      author: authorName, 
      phone: phone || "+998 (90) ***-**-**", 
      school: school, 
      status: "Ko'rilmoqda", 
aiScore: aiResult?.totalScore ?? 0,
      badges: ['Verified'],
      date: new Date().toISOString().split('T')[0],
      feedback: ""
    };
    currentUser.freeAttempts = 0;
    try {
      const saved = await api.createProject({
        orgId: currentUser.orgId,
        targetOrgId,
        title: formData.title,
        problem: formData.problem,
        solution: formData.solution,
        author: authorName,
        phone: phone || undefined,
        school: school,
        aiScore: aiResult?.totalScore ?? 0,
        badges: ['Verified'],
        attachmentUrl: attachmentUrl || undefined,
      });
      setProjects(prev => [saved, ...prev]);
      await api.createNotification({ orgId: targetOrgId, type: 'info', text: `Yangi loyiha: ${formData.title}` }).catch(() => {});
      await api.createNotification({ orgId: currentUser.orgId, type: 'info', text: `Yangi loyiha yuborildi.` }).catch(() => {});
    } catch {
      setProjects(prev => [newProject, ...prev]);
    }
    setNotifications(prev => [{ id: Date.now() + 1, orgId: currentUser.orgId, type: "info", text: `Yangi loyiha yuborildi.`, time: "Hozirgina", unread: true }, ...prev]);
    showToast("Loyiha muvaffaqiyatli yuborildi!", "success");
    setActiveTab('projects');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 pb-10">
      <div className="slide-up mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tighter drop-shadow-md">{t.submit.title}</h1>
        <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-medium">{t.submit.desc}</p>
      </div>

      <div className="slide-up delay-100 premium-glass rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden">
        {step === 1 ? (
          <div className="space-y-6 md:space-y-10 relative z-10">
            <div className="group">
              <label className="block text-xs md:text-sm font-black text-slate-300 mb-2 md:mb-3 uppercase tracking-widest">{t.submit.projName}</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white text-base md:text-lg focus:outline-none focus:border-blue-500 transition-all shadow-inner font-medium placeholder:text-slate-600" placeholder={t.submit.projNameEx} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="group">
              <label className="block text-xs md:text-sm font-black text-slate-300 mb-2 md:mb-3 uppercase tracking-widest">{t.submit.selectOrg}</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white text-base md:text-lg focus:outline-none focus:border-blue-500 transition-all shadow-inner font-medium" value={formData.targetOrgId || organizations[0]?.id || ''} onChange={e => setFormData({...formData, targetOrgId: e.target.value})}>
                <option value="">— {t.submit.selectOrg} —</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id} className="bg-[#0B1221] text-white">{org.name}{org.region ? ` (${org.region})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="rounded-xl md:rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 space-y-4 md:space-y-5">
              <h4 className="text-sm md:text-base font-black text-slate-200 uppercase tracking-widest border-b border-white/10 pb-2 md:pb-3">{t.submit.ownerSection}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.submit.ownerName}</label>
                  <input type="text" value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} placeholder={currentUser?.name || "Masalan: Aziz Rahimov"} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 md:p-4 text-white focus:border-blue-500 focus:outline-none text-sm md:text-base placeholder:text-slate-500" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.submit.ownerPhone}</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+998 90 123 45 67" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 md:p-4 text-white focus:border-blue-500 focus:outline-none text-sm md:text-base placeholder:text-slate-500" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.submit.ownerSchool}</label>
                  <input type="text" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} placeholder={currentUser?.orgName || "Masalan: 7-maktab yoki TATU"} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 md:p-4 text-white focus:border-blue-500 focus:outline-none text-sm md:text-base placeholder:text-slate-500" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label className="block text-xs md:text-sm font-black text-slate-300 mb-2 md:mb-3 uppercase tracking-widest">{t.submit.problem}</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner h-32 md:h-48 resize-none font-medium text-sm md:text-base placeholder:text-slate-600" placeholder={t.submit.problemEx} value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-black text-slate-300 mb-2 md:mb-3 uppercase tracking-widest">{t.submit.solution}</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white focus:outline-none focus:border-fuchsia-500 transition-all shadow-inner h-32 md:h-48 resize-none font-medium text-sm md:text-base placeholder:text-slate-600" placeholder={t.submit.solutionEx} value={formData.solution} onChange={e => setFormData({...formData, solution: e.target.value})}></textarea>
              </div>
            </div>
            <div className="group">
              <label className="block text-xs md:text-sm font-black text-slate-300 mb-2 md:mb-3 uppercase tracking-widest">{t.submit.attachFile}</label>
              <input type="file" accept=".pdf,.pptx,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => { const f = e.target.files?.[0]; if (f && validateProjectFile(f)) setAttachmentFile(f); else if (f) showToast(t.submit.attachHint, "error"); else setAttachmentFile(null); e.target.value = ''; }} className="w-full text-slate-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white/10 file:text-white file:font-bold file:cursor-pointer" />
              <p className="text-[10px] text-slate-500 mt-1">{t.submit.attachHint}</p>
              {attachmentFile && <p className="text-xs text-emerald-400 mt-1 font-bold">{attachmentFile.name}</p>}
            </div>
            <div className="pt-6 md:pt-8 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-full sm:w-auto">
                  <ShieldCheck className="w-6 h-6 md:w-8 h-8 text-emerald-400 flex-shrink-0" />
                  <div><p className="text-[10px] md:text-sm font-black text-emerald-400">{t.submit.ip}</p></div>
                </div>
                <button onClick={handleProceedToPayment} className="w-full sm:w-auto btn-premium px-8 md:px-10 py-4 md:py-5 bg-white text-slate-900 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3">
                  {t.submit.next} <ArrowRight className="w-5 h-5 md:w-6 h-6" />
                </button>
            </div>
          </div>

        ) : step === 1.5 ? (
          <div className="space-y-8 relative z-10 slide-up">
             <div className="text-center mb-8 md:mb-10">
               <h2 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">{t.payment.title}</h2>
               <p className="text-slate-400 text-xs md:text-base">{t.payment.desc}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-black/30 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-blue-500/50 transition-colors shadow-inner flex flex-col justify-center">
                   <h3 className="text-xl md:text-2xl font-black text-white mb-4 text-center">{t.payments.payWithCard}</h3>
                   <CardPaymentForm 
                      amountLabel={t.payment.price} 
                      onSuccess={() => handlePaymentSuccess()} 
                      t={t} 
                      showToast={showToast} 
                   />
                </div>

                <div className="bg-black/30 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center hover:border-fuchsia-500/50 transition-colors shadow-inner text-center">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(217,70,239,0.2)]"><Ticket className="w-8 h-8 md:w-10 h-10 text-fuchsia-400" /></div>
                   <h3 className="text-xl md:text-2xl font-black text-white mb-1 md:mb-2">{t.payment.voucherTitle}</h3>
                   <input type="text" placeholder="XXXX" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-center text-white font-mono tracking-[0.3em] md:tracking-[0.5em] text-xl md:text-2xl mb-4 md:mb-6 focus:outline-none focus:border-fuchsia-500 uppercase shadow-inner" />
                   <button onClick={() => voucherCode.length >= 4 ? handlePaymentSuccess() : showToast(t.payments?.invalidSms || "Iltimos, yaroqli vaucher kodini kiriting", "error")} className="w-full py-3 md:py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-black transition-all shadow-lg mt-auto text-sm md:text-base">{t.payment.applyVoucher}</button>
                </div>
             </div>
             <button onClick={() => setStep(1)} className="mt-6 md:mt-8 text-slate-400 hover:text-white flex items-center gap-2 text-sm md:text-base font-bold mx-auto transition-colors"><ArrowLeft className="w-4 h-4 md:w-5 h-5"/> {t.payment.back}</button>
          </div>

        ) : (
          <div className="space-y-8 md:space-y-12 relative z-10 slide-up">
            {isEvaluating || !aiResult ? (
              <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center slide-up">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 md:mb-10">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 shadow-inner"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 h-12 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3 tracking-tight">AI Tahlil qilmoqda...</h3>
                <div className="w-56 md:w-72 h-2.5 md:h-3 bg-white/5 rounded-full mt-6 md:mt-10 overflow-hidden border border-white/10 shadow-inner"><div className="h-full bg-gradient-to-r from-blue-400 to-fuchsia-500 rounded-full w-full animate-[fillBar_4s_ease-in-out]"></div></div>
              </div>
            ) : (
             <>
               <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border-2 border-blue-400 shadow-[0_0_60px_rgba(59,130,246,0.6)] mb-6 md:mb-8"><span className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200">{aiResult.totalScore}</span></div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter">AI Baholash Xulosasi</h2>
                  <div className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-fuchsia-500/10 border border-fuchsia-500/40 rounded-2xl mt-4"><Star className="w-5 h-5 md:w-6 h-6 fill-fuchsia-400 text-fuchsia-400 animate-pulse" /> <span className="text-fuchsia-400 font-black text-xs md:text-base tracking-widest uppercase">{getBadgeFromScore(aiResult.totalScore)}</span></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 bg-white/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-inner">
                  <ScoreBar label="Muammoning dolzarbligi" score={aiResult.problemValidity} max={25} />
                  <ScoreBar label="Innovatsionlik darajasi" score={aiResult.innovation} max={20} />
                  <ScoreBar label="Ijtimoiy ta'sir (Impact)" score={aiResult.impact} max={20} />
                  <ScoreBar label="Bozor salohiyati" score={aiResult.market} max={20} />
                  <div className="md:col-span-2"><ScoreBar label="Texnik amalga oshirish" score={aiResult.feasibility} max={15} /></div>
               </div>
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 pt-6 md:pt-8 border-t border-white/10">
                 <button onClick={() => setStep(1)} className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors text-sm md:text-base">Boshidan boshlash</button>
                 <button onClick={handleSubmit} className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 md:gap-3 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(217,70,239,0.3)]">Loyihani Yuborish <ArrowRight className="w-5 h-5 md:w-6 h-6" /></button>
               </div>
             </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectList({ projects, updateProjectStatus, onViewProject }) {
  const { t } = useContext(LanguageContext);
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="slide-up flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter drop-shadow-md">{t.projectList.title}</h1>
          <p className="text-slate-400 text-sm md:text-lg font-medium">{t.projectList.desc}</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {projects.length === 0 ? (
          <div className="p-10 text-center text-slate-500 premium-glass rounded-[2rem]">
            {t.projectList.empty}
          </div>
        ) : projects.map((project, index) => (
          <div key={project.id} onClick={() => onViewProject(project)} className={`slide-up delay-${(index+1)*100} premium-glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-5 lg:gap-8 items-start lg:items-center justify-between hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden cursor-pointer`}>
            <div className="absolute left-0 top-0 bottom-0 w-1.5 md:w-2 bg-gradient-to-b from-blue-400 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex-1 space-y-3 md:space-y-4 pl-0 lg:pl-4 w-full">
              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                <h2 className="text-lg md:text-xl lg:text-2xl font-black text-white group-hover:text-blue-300 transition-colors tracking-tight line-clamp-2">{project.title}</h2>
                <div className="flex gap-2">
                  {project.badges.map(b => (
                     <span key={b} className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${getBadgeColor(b)}`}><Star className="w-3 h-3 md:w-3.5 h-3.5" /> {b}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-slate-400 font-bold tracking-wide flex-wrap">
                <span className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl"><Users className="w-3.5 h-3.5 md:w-4 h-4"/> {project.author}</span>
                <span className="flex items-center gap-1.5 md:gap-2"><Building className="w-3.5 h-3.5 md:w-4 h-4"/> {project.school}</span>
                <span>{project.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto bg-black/20 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border border-white/5 shadow-inner flex-wrap md:flex-nowrap">
              <div className="flex flex-col items-center justify-center min-w-[60px] md:min-w-[90px]">
                <span className="text-[9px] md:text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 md:mb-1.5">Score</span>
                <span className={`text-2xl md:text-3xl lg:text-4xl font-black ${project.aiScore >= 80 ? 'text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-fuchsia-400 drop-shadow-md' : 'text-slate-400'}`}>{project.aiScore}</span>
              </div>
              
              <div className="h-10 md:h-14 w-px bg-white/10 hidden md:block"></div>
              
              <div className="flex-1 lg:flex-none flex justify-end min-w-[120px] md:min-w-[160px]">
                {project.status === 'Qabul qilindi' ? (
                  <span className="inline-flex items-center gap-2 md:gap-2.5 px-3 py-2 md:px-6 md:py-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg md:rounded-xl font-black text-xs md:text-sm w-full justify-center"><CheckCircle className="w-4 h-4 md:w-5 h-5" /> Qabul</span>
                ) : project.status === 'Rad etildi' ? (
                  <span className="inline-flex items-center gap-2 md:gap-2.5 px-3 py-2 md:px-6 md:py-3.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg md:rounded-xl font-black text-xs md:text-sm w-full justify-center"><AlertTriangle className="w-4 h-4 md:w-5 h-5" /> Rad etildi</span>
                ) : (
                  <span className="inline-flex items-center gap-2 md:gap-2.5 px-3 py-2 md:px-6 md:py-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg md:rounded-xl font-black text-xs md:text-sm w-full justify-center"><Activity className="w-4 h-4 md:w-5 h-5 animate-pulse" /> Ko'rilmoqda</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, role, updateProjectStatus }) {
  const { t } = useContext(LanguageContext);
  const [ndaSigned, setNdaSigned] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const needsNDA = role === 'organization' || role === 'gov';
  const isContactVisible = project.status === 'Qabul qilindi';

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto premium-glass rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10 z-10 flex flex-col slide-up custom-scrollbar">
        <div className="sticky top-0 bg-[#05050A]/90 backdrop-blur-xl border-b border-white/5 p-5 md:p-8 flex items-start justify-between z-20">
          <div>
            <div className="flex items-center gap-3 mb-2 md:mb-3 flex-wrap">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white">{project.title}</h2>
              {project.badges.map(b => (
                <span key={b} className={`px-2 py-1 md:px-3 md:py-1.5 text-[9px] md:text-xs font-black rounded-md md:rounded-lg border shadow-inner whitespace-nowrap ${getBadgeColor(b)}`}>{b}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-6 text-slate-400 text-[10px] md:text-sm font-bold">
              <span className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-white/5"><Users className="w-3.5 h-3.5 md:w-4 h-4"/> {project.author}</span>
              <span className="flex items-center gap-1.5 md:gap-2"><Building className="w-3.5 h-3.5 md:w-4 h-4 text-slate-500"/> {project.school}</span>
              <span className="flex items-center gap-1.5 md:gap-2 text-emerald-400"><ShieldCheck className="w-3.5 h-3.5 md:w-4 h-4"/> IP Timestamp: {project.date}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition-colors hover:rotate-90 duration-300 flex-shrink-0"><X className="w-5 h-5 md:w-6 h-6 text-slate-400 hover:text-white" /></button>
        </div>

        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
             <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-xs md:text-sm font-black text-blue-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {t.modal.problem}</h3>
                  <div className="bg-white/5 p-5 md:p-8 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/5 text-slate-300 leading-relaxed font-medium shadow-inner text-sm md:text-base">
                    {project.problem || "Muammo tavsifi kiritilmagan."}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs md:text-sm font-black text-fuchsia-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2"><Cpu className="w-4 h-4"/> {t.modal.solution}</h3>
                  {needsNDA && !ndaSigned && project.status === "Ko'rilmoqda" ? (
                    <div className="bg-black/40 border border-fuchsia-500/30 rounded-[1.2rem] md:rounded-[1.5rem] p-6 md:p-10 text-center relative overflow-hidden group shadow-inner">
                      <div className="absolute inset-0 bg-grid-texture opacity-20"></div>
                      <Lock className="w-10 h-10 md:w-14 md:h-14 text-fuchsia-400/50 mx-auto mb-4 md:mb-5 group-hover:scale-110 transition-transform" />
                      <h4 className="text-lg md:text-2xl font-black text-white mb-2 md:mb-3">{t.modal.ipProtected}</h4>
                      <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8 max-w-md mx-auto font-medium">Loyiha mexanizmi, chizmalari va biznes modelini ko'rish uchun Raqamli Maxfiylik Kelishuvini (NDA) tasdiqlashingiz kerak.</p>
                      <button onClick={() => setNdaSigned(true)} className="w-full sm:w-auto btn-premium px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-fuchsia-600 text-white rounded-xl font-black shadow-lg inline-flex justify-center items-center gap-2 md:gap-3 relative z-10 transition-all hover:scale-105 text-sm md:text-base"><FileText className="w-4 h-4 md:w-5 h-5" /> {t.modal.signNda}</button>
                    </div>
                  ) : (
                    <div className="bg-blue-500/5 p-5 md:p-8 rounded-[1.2rem] md:rounded-[1.5rem] border border-blue-500/20 text-slate-300 leading-relaxed font-medium relative overflow-hidden shadow-inner text-sm md:text-base">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-20deg]"><span className="text-3xl md:text-6xl lg:text-8xl font-black whitespace-nowrap tracking-tighter">NEXUS IP PROTECTED</span></div>
                      {project.solution || "Innovatsion yechim tavsifi kiritilmagan."}
                      {needsNDA && project.status === "Ko'rilmoqda" && (<div className="mt-4 md:mt-6 p-3 md:p-4 bg-black/30 rounded-lg md:rounded-xl border border-white/5 text-[10px] md:text-sm text-blue-300 font-bold">✅ Tashkilot NDA kelishuvini qabul qildi, batafsil biznes-reja ochildi.</div>)}
                    </div>
                  )}
                </div>

                {role === 'organization' && project.status === "Ko'rilmoqda" && ndaSigned && (
                  <div className="bg-white/5 p-5 md:p-8 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/10 shadow-inner mt-4 md:mt-6">
                    <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-400" /> {t.modal.expertFeedback}</h3>
                    <textarea className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner h-24 md:h-32 resize-none font-medium text-xs md:text-sm placeholder:text-slate-500" placeholder="Loyiha bo'yicha fikringiz va o'quvchi uchun keyingi qadamlarni yozing..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)}></textarea>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6">
                      <button onClick={() => updateProjectStatus(project.id, 'Qabul qilindi', feedbackText)} className="flex-1 btn-premium py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 text-sm md:text-base"><CheckCircle className="w-4 h-4 md:w-5 h-5" /> {t.modal.accept}</button>
                      <button onClick={() => updateProjectStatus(project.id, 'Rad etildi', feedbackText)} className="flex-1 btn-premium py-3 md:py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 text-sm md:text-base"><AlertTriangle className="w-4 h-4 md:w-5 h-5" /> {t.modal.reject}</button>
                    </div>
                  </div>
                )}

                {project.feedback && project.status !== "Ko'rilmoqda" && (
                   <div className={`p-5 md:p-8 rounded-[1.2rem] md:rounded-[1.5rem] border shadow-inner mt-4 md:mt-6 ${project.status === 'Qabul qilindi' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                     <h3 className={`text-xs md:text-sm font-black uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2 ${project.status === 'Qabul qilindi' ? 'text-emerald-400' : 'text-red-400'}`}><MessageSquare className="w-4 h-4" /> {t.modal.expertFeedback}</h3>
                     <p className="text-slate-200 font-medium text-xs md:text-sm leading-relaxed">{project.feedback}</p>
                   </div>
                )}
             </div>

             <div className="space-y-4 md:space-y-6">
                <div className="bg-black/40 border border-white/5 rounded-[1.2rem] md:rounded-[1.5rem] p-5 md:p-8 text-center shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-500/10 blur-2xl"></div>
                  <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3 relative z-10">{t.modal.score}</p>
                  <div className={`text-5xl md:text-7xl font-black drop-shadow-md relative z-10 ${project.aiScore >= 80 ? 'text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-fuchsia-400' : 'text-slate-400'}`}>{project.aiScore}</div>
                  <p className="text-[10px] md:text-sm text-cyan-400 font-bold mt-2 md:mt-3 relative z-10">{t.modal.invAttr}</p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[1.2rem] md:rounded-[1.5rem] p-5 md:p-6 space-y-4 md:space-y-5 shadow-inner">
                  <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-3 md:pb-4">{t.modal.summary}</h4>
                  <div className="flex items-center justify-between text-xs md:text-sm font-bold text-slate-300"><span>{t.modal.stage}:</span> <span className="text-white bg-white/10 px-2 py-1 md:px-3 md:py-1 rounded-md">Pre-Seed</span></div>
                  <div className="flex items-center justify-between text-xs md:text-sm font-bold text-slate-300"><span>{t.modal.request}:</span> <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 md:px-3 md:py-1 rounded-md">$15,000</span></div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[1.2rem] md:rounded-[1.5rem] p-5 md:p-6 shadow-inner">
                  <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">{t.modal.contactAuthor}</h4>
                  {isContactVisible ? (
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-200"><div className="p-2 bg-white/10 rounded-lg"><Phone className="w-4 h-4 text-emerald-400"/></div>{project.phone || "+998 (90) 123-45-67"}</div>
                      <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-200"><div className="p-2 bg-white/10 rounded-lg"><Mail className="w-4 h-4 text-blue-400"/></div>{project.author.toLowerCase().replace(' ', '')}@gmail.com</div>
                      <button className="w-full mt-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-black transition-colors">{t.modal.writeMsg}</button>
                    </div>
                  ) : (
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                       <Lock className="w-5 h-5 md:w-6 md:h-6 text-slate-500 mx-auto mb-2" />
                       <p className="text-[10px] md:text-xs text-slate-400 font-bold mb-1">Ma'lumotlar himoyalangan</p>
                       <p className="text-[9px] md:text-[10px] text-slate-500">Loyiha rasman qabul qilingandan so'ng raqamlar ochiladi.</p>
                       <div className="mt-3 text-sm md:text-base font-black text-slate-600 tracking-wider">+998 (**) ***-**-**</div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}