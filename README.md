# UstaTop - Ishonchli Ustalar va Qurilish Mollari Portali

UstaTop — O'zbekiston bo'ylab professional ustalarni (elektriklar, santexniklar, mebel ustalari, konditsioner ta'mirlash, qurilish ustalari va boshqalar) topish, ular bilan to'g'ridan-to'g'ri bog'lanish va sifatli qurilish/ta'mirlash mahsulotlarini xarid qilish uchun mo'ljallangan to'liq stack (Full-Stack) ishlab chiqarish darajasidagi platforma.

---

## 🚀 Texnologiyalar va Arxitektura

- **Frontend:**
  - React 18, TypeScript, Vite
  - TailwindCSS (zamonaviy Emerald/Indigo dizayn tizimi)
  - Lucide Icons
  - React Router DOM v6
  - Ko'p tillilik tizimi (O'zbek, Rus, Ingliz)
  - Tungi rejim (Dark Mode / Light Mode)
  - Axios (avtorizatsiya interceptorlari bilan)

- **Backend:**
  - Node.js, Express, TypeScript
  - Prisma ORM
  - JWT sessiyalar & xavfsiz avtorizatsiya
  - Zod (qat'iy sxema validatsiyasi)
  - Xavfsizlik: Helmet, CORS, Express-Rate-Limit (SMS OTP brute-force himoyasi)
  - Fayl saqlash: Multer + Storage Provider Abstraction (Local/Cloud)
  - SMS provayder: Eskiz.uz REST API integratsiyasi va MockSmsProvider

- **Ma'lumotlar bazasi:**
  - PostgreSQL (ishlab chiqarish uchun) / SQLite (mahalliy ishlab chiqish uchun)
  - Prisma orqali boshqariladi

---

## 📁 Loyiha Tuzilishi

```
ustatop/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Baza modellari: User, MasterProfile, Product, OtpCode, Favorite
│   │   └── seed.ts              # Boshlang'ich admin va tizim sozlamalarini yaratish
│   ├── src/
│   │   ├── config/              # Muhit o'zgaruvchilari va sozlamalar
│   │   ├── controllers/         # Auth, User, Master, Product, Admin, Upload kontrollerlari
│   │   ├── db/                  # Prisma mijoz instansiyasi
│   │   ├── middleware/          # Auth, AdminGuard, RateLimiter, Upload, ErrorHandler
│   │   ├── routes/              # /api/auth, /api/users, /api/masters, /api/products, /api/admin
│   │   ├── schemas/             # Zod validatsiya sxemalari
│   │   ├── services/            # Auth, SMS (Eskiz/Mock), Storage, Master, Product, Admin
│   │   ├── utils/               # JWT, OTP hashing, Logger
│   │   ├── app.ts               # Express ilovasi
│   │   └── server.ts            # Server ishga tushirish
│   ├── tests/
│   │   └── api.test.ts          # Integratsiya va unit testlari
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Backend API mijozlari (auth, master, product, admin, upload)
│   │   ├── components/          # Header, BottomNav, MasterCard, ProductCard, AuthModal, StatusBadge
│   │   ├── contexts/            # AuthContext, ThemeContext, LanguageContext
│   │   ├── i18n/                # uz / ru / en tarjimalar lug'ati
│   │   ├── pages/               # Home, Search, Masters, MasterDetail, Market, ProductDetail, Profile, BecomeMaster, Admin
│   │   ├── types/               # TypeScript interfeyslari
│   │   ├── App.tsx              # Router va sahifalar
│   │   ├── index.css            # Tailwind va shriftlar
│   │   └── main.tsx             # React kirish nuqtasi
│   ├── package.json
│   └── vite.config.ts
├── package.json                 # Monorepo root skriptlari
└── README.md
```

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish

Backend va Frontend papkalarida paketlarni o'rnatish:

```bash
# Backend uchun
cd backend
npm install

# Frontend uchun
cd ../frontend
npm install
```

### 2. Muhit O'zgaruvchilarini Sozlash (.env)

`backend/.env` faylini yarating yoki tekshiring:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db" # PostgreSQL uchun: postgresql://postgres:password@localhost:5432/ustatop?schema=public
JWT_SECRET="ustatop-jwt-secure-secret-key-2026-uzbekistan"
JWT_EXPIRES_IN="7d"

# SMS Konfiguratsiyasi (mock | eskiz)
SMS_PROVIDER=mock
ESKIZ_EMAIL=sizning-eskiz-emailingiz@example.com
ESKIZ_PASSWORD=sizning-eskiz-parolingiz

# Fayllarni saqlash
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Admin sozlamalari
ADMIN_PHONE=+998901234567
ADMIN_SECRET_KEY="sayfulloh orzusi sayfulloh google"

# CORS
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

### 3. Ma'lumotlar Bazasini Tayyorlash va Seed Qilish

```bash
cd backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Serverlarni Ishga Tushirish

Ikkala qismni alohida terminalda ishga tushiring:

**Backend Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend Ilovasi (Port 5173):**
```bash
cd frontend
npm run dev
```

Ilovani brauzerda oching: `http://localhost:5173`

---

## 🧪 Avtomatlashtirilgan Testlarni Ishga Tushirish

Backend integratsiya va xavfsizlik testlarini yurgazish:

```bash
cd backend
npm test
```

Testlar quyidagilarni to'liq tekshiradi:
1. SMS OTP yaratish, yaroqlilik muddati va keshdan tekshirish.
2. Foydalanuvchi profilini yangilash va **telefon raqamini o'zgarmasligi (read-only) qoidasi**.
3. Usta arizasini topshirish (`PENDING` holati).
4. `PENDING` va `REJECTED` holatdagi ustalarni ochiq ro'yxatda ko'rinmasligini kafolatlash.
5. Admin tomonidan tasdiqlash (`APPROVED`) va ustaning avtomatik ommaviy sahifada paydo bo'lishi.
6. Admin bo'lmagan foydalanuvchilarning admin API'lariga kira olmasligi (403 Forbidden).
7. Market mahsulotlari bo'yicha to'liq CRUD amallari.
8. Dashboard statistikasi hisoblari.

---

## 🔐 Xavfsizlik Qoidalari va Xususiyatlar

1. **Telefon Raqam — Asosiy Identifikator:**
   - Foydalanuvchining telefon raqami SMS OTP orqali tasdiqlanadi.
   - Profil sahifasidan telefon raqamini o'zboshimchalik bilan o'zgartirib bo'lmaydi.
2. **Ustalarning Ko'rinishi:**
   - Faqatgina Admin tomonidan tasdiqlangan (`APPROVED`) ustalar ommaviy katalogda ko'rinadi.
   - Arizalar avtomatik `PENDING` holatida tushadi va admin tekshiruvidan o'tadi.
3. **Admin Huquqlari:**
   - Har bir admin endpointi server darajasida `requireAdmin` middleware bilan himoyalangan.
   - Admin paneliga kirish uchun xavfsiz kalit so'zi (`sayfulloh orzusi sayfulloh google`) yoki admin telefoni ishlatiladi.
4. **Fayllar Xavfsizligi:**
   - Faqat haqiqiy rasm formatlari (JPEG, PNG, WEBP) qabul qilinadi.
   - Hajmi 5MB bilan cheklangan.

---

## 📡 Asosiy API Endpointlari

| Metod | Endpoint | Tavsif | Kirish |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/request-otp` | SMS OTP kod so'rash | Ochiq |
| `POST` | `/api/auth/verify-otp` | Kodni tasdiqlash va JWT olish | Ochiq |
| `POST` | `/api/auth/admin-login` | Maxfiy kalit bilan admin kirishi | Ochiq |
| `GET` | `/api/auth/me` | Joriy foydalanuvchi va usta statusi | Autentifikatsiya |
| `PATCH` | `/api/users/profile` | Profilni yangilash (telefon o'zgarmaydi) | Autentifikatsiya |
| `GET` | `/api/masters` | Tasdiqlangan ustalar ro'yxati va filtri | Ochiq |
| `GET` | `/api/masters/:id` | Tanlangan usta profili | Ochiq |
| `POST` | `/api/masters/apply` | Usta bo'lish uchun ariza topshirish | Autentifikatsiya |
| `GET` | `/api/products` | Faol market mahsulotlari | Ochiq |
| `GET` | `/api/products/:id` | Mahsulot tafsilotlari | Ochiq |
| `POST` | `/api/upload/image` | Profil yoki mahsulot rasmini yuklash | Autentifikatsiya |
| `GET` | `/api/admin/dashboard` | Statistika hisobotlari | Faqat Admin |
| `GET` | `/api/admin/masters` | Usta arizalari ro'yxati | Faqat Admin |
| `PATCH` | `/api/admin/masters/:id/approve` | Usta arizasini qabul qilish | Faqat Admin |
| `PATCH` | `/api/admin/masters/:id/reject` | Usta arizasini rad etish | Faqat Admin |
| `POST` | `/api/admin/products` | Yangi mahsulot qo'shish | Faqat Admin |
| `PATCH` | `/api/admin/products/:id` | Mahsulotni tahrirlash | Faqat Admin |
| `DELETE` | `/api/admin/products/:id` | Mahsulotni o'chirish | Faqat Admin |
| `GET` | `/api/admin/users` | Barcha foydalanuvchilar | Faqat Admin |

---

## 💡 SMS Provayderini (Eskiz.uz) ulash

Haqiqiy SMS yuborish uchun:
1. [Eskiz.uz](https://eskiz.uz) saytidan ro'yxatdan o'ting va balansni to'ldiring.
2. `backend/.env` faylida:
   ```env
   SMS_PROVIDER=eskiz
   ESKIZ_EMAIL=sizning_emailingiz@example.com
   ESKIZ_PASSWORD=sizning_parolingiz
   ```
3. Backend avtomatik ravishda token olib, SMS'larni O'zbekiston raqamlariga yetkazadi.
