# OX Game (Tic-Tac-Toe)

เกม OX แบบ Web Application — เล่นกับ AI บอท มีระบบ Login, คะแนนสะสม และ Leaderboard

**Live Demo:** https://ox-full-stack-developer-test.vercel.app

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | NestJS 11, TypeScript, Passport.js |
| Database | MongoDB Atlas |
| Auth | Google OAuth 2.0 + JWT |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## Production URLs

| | URL |
|---|---|
| Frontend | https://ox-full-stack-developer-test.vercel.app |
| Backend API | https://ox-full-stack-developer-test-production.up.railway.app |

---

## โครงสร้างโปรเจค

```
ox-full-stack-developer-test/
├── README.md
│
├── front-end/                        # Next.js App (Vercel)
│   ├── app/
│   │   ├── layout.tsx                # Root layout + SEO metadata
│   │   ├── page.tsx                  # หน้าเกม (protected)
│   │   ├── login/page.tsx            # หน้า Login with Google
│   │   ├── auth/callback/page.tsx    # รับ JWT หลัง OAuth redirect
│   │   └── leaderboard/page.tsx      # ตาราง Leaderboard
│   ├── components/
│   │   └── Board.tsx                 # กระดาน 3×3
│   ├── lib/
│   │   ├── auth.ts                   # จัดการ JWT token
│   │   └── game.ts                   # API calls
│   └── .env.local                    # NEXT_PUBLIC_API_URL
│
└── back-end/                         # NestJS API (Railway)
    ├── src/
    │   ├── auth/                     # Google OAuth + JWT strategy
    │   ├── game/                     # Game logic + Minimax bot AI
    │   ├── scores/                   # Leaderboard endpoint
    │   ├── users/                    # User model + score tracking
    │   └── config/                   # App configuration
    └── .env                          # Environment variables
```

---

## API Endpoints

| Method | Path | หน้าที่ | Auth |
|---|---|---|---|
| GET | `/auth/google` | เริ่ม Google OAuth flow | — |
| GET | `/auth/google/callback` | รับ callback จาก Google | — |
| GET | `/auth/me` | ข้อมูล user ปัจจุบัน | JWT |
| POST | `/game` | สร้างเกมใหม่ | JWT |
| POST | `/game/:id/move` | ส่ง move `{ position: 0-8 }` | JWT |
| GET | `/scores/leaderboard` | คะแนนผู้เล่นทั้งหมด | — |

---

## ระบบคะแนน

| ผลลัพธ์ | คะแนน |
|---|---|
| ชนะบอท | +1 |
| แพ้บอท | −1 |
| เสมอ | ไม่เปลี่ยน |
| ชนะ 3 ครั้งติดต่อกัน | +1 พิเศษ และ reset streak |

---

## รันในเครื่อง (Local Development)

### สิ่งที่ต้องมี

- Node.js v18+
- บัญชี MongoDB Atlas
- Google OAuth 2.0 Credentials

### 1. ตั้งค่า MongoDB Atlas

1. เข้า [cloud.mongodb.com](https://cloud.mongodb.com) → **Network Access**
2. **Add IP Address** → ใส่ `0.0.0.0/0` → **Confirm**

### 2. สร้าง Google OAuth Credentials

1. เข้า [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
5. **Save** → copy **Client ID** และ **Client Secret**

### 3. ตั้งค่า Environment Variables

**`back-end/.env`**

```env
MONGO_DB_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ox-game"

PORT=3001
FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=<random-secret-string>
JWT_EXPIRES_IN=7d
```

**`front-end/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. รัน

```bash
# Terminal 1 — Backend (port 3001)
cd back-end
npm install
npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd front-end
npm install
npm run dev
```

เปิด http://localhost:3000

---

## Deploy (Production)

### Backend → Railway

1. สมัคร [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. เลือก repo → set **Root Directory** เป็น `back-end`
3. ไปที่ **Variables** → เพิ่มค่าทั้งหมดจาก `.env` (ใช้ค่า production)
4. ได้ URL เช่น `https://your-app.up.railway.app`

### Frontend → Vercel

1. สมัคร [vercel.com](https://vercel.com) → **Add New Project** → เลือก repo
2. Set **Root Directory** เป็น `front-end`
3. **Environment Variables** → เพิ่ม:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
   ```
4. Deploy

### อัปเดตหลัง Deploy

**`back-end/.env` (Railway Variables)**
```env
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_CALLBACK_URL=https://your-app.up.railway.app/auth/google/callback
```

**Google Cloud Console** → เพิ่ม Authorized redirect URI:
```
https://your-app.up.railway.app/auth/google/callback
```

---

## แก้ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|---|---|
| `querySrv ECONNREFUSED` | เพิ่ม IP ใน MongoDB Atlas Network Access |
| `Error 401: invalid_client` | ตรวจสอบ `GOOGLE_CLIENT_ID` ใน `.env` |
| `Error 400: redirect_uri_mismatch` | เพิ่ม Redirect URI ใน Google Cloud Console ให้ตรงกับ `.env` |
| Backend ไม่ start | ตรวจสอบ port 3001 ว่าถูกใช้งานอยู่หรือไม่ |
