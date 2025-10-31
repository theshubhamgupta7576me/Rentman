# 🏠 Rentman - Property Management Application

## 📊 Project Overview

Rentman is a complete property management application with authentication, allowing landlords to track tenants, rent payments, electricity bills, and more.

---

## ✨ Features Implemented

### 🔐 Authentication System
- ✅ Login with Email OR Phone Number
- ✅ Secure password storage (bcrypt hashing)
- ✅ JWT token-based authentication
- ✅ User data isolation (each user sees only their data)
- ✅ Auto-login with stored tokens
- ✅ Beautiful login/register UI
- ✅ Protected routes

### 🏘️ Property Management
- ✅ Tenant management (add, edit, delete, archive)
- ✅ Rent payment tracking
- ✅ Electricity bill calculation
- ✅ Multiple payment modes (cash/online)
- ✅ Document upload support
- ✅ Rent collector management
- ✅ Dashboard with analytics
- ✅ Settings customization

### 🎨 User Interface
- ✅ Modern, responsive design
- ✅ Mobile-friendly navigation
- ✅ Beautiful gradient UI
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Loading states

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Context API** - State Management

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password Hashing

---

## 📁 Project Structure

```
Rentman/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── auth/                 # Authentication pages
│   │   ├── common/               # Shared components
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── rent-logs/            # Rent log pages
│   │   ├── settings/             # Settings pages
│   │   └── tenants/              # Tenant pages
│   ├── context/
│   │   ├── AppContext.tsx        # App state
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── ToastContext.tsx      # Notifications
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   ├── utils/                    # Utility functions
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
│
├── backend/                      # Backend source
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts       # Database setup
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT authentication
│   │   ├── routes/
│   │   │   ├── authRoutes.ts     # Auth endpoints
│   │   │   ├── tenantRoutes.ts   # Tenant endpoints
│   │   │   └── rentLogRoutes.ts  # Rent log endpoints
│   │   ├── services/
│   │   │   ├── authService.ts    # Auth logic
│   │   │   ├── tenantService.ts  # Tenant logic
│   │   │   └── rentLogService.ts # Rent log logic
│   │   ├── types/
│   │   │   └── index.ts          # Backend types
│   │   └── index.ts              # Server entry
│   ├── data/                     # SQLite database
│   └── package.json              # Backend dependencies
│
├── public/                       # Static assets
├── dist/                         # Production build
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel deployment
└── README.md                    # This file
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Instructions

**1. Clone the repository:**
```bash
git clone https://github.com/theshubhamgupta7576me/Rentman.git
cd Rentman
```

**2. Install dependencies:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

**3. Start the servers:**
```bash
# Terminal 1: Start backend (port 3001)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
npm run dev
```

**4. Open in browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

---

## 🌐 Deployment

### GitHub Repository
**URL**: https://github.com/theshubhamgupta7576me/Rentman  
**Branch**: fdev (main development branch)

### Vercel Deployment

**Quick Deploy:**
1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Vite configuration
4. Click "Deploy"
5. Your app is live in 2-3 minutes!

**See detailed guides:**
- `DEPLOY_NOW.md` - Quick deployment steps
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide

---

## 🔑 Authentication

### Login Options
Users can sign in with either:
1. **Email**: `user@example.com` + password
2. **Phone Number**: `+919876543210` + password

### User Data Isolation
Each user's data is completely isolated:
- Tenants belong to specific users
- Rent logs are tied to user accounts
- Settings are per-user
- All API endpoints filter by userId

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register   - Create account
POST /api/auth/login      - Sign in
```

### Tenants (Protected)
```
GET    /api/tenants                  - List tenants
GET    /api/tenants/:id              - Get tenant
POST   /api/tenants                  - Create tenant
PUT    /api/tenants/:id              - Update tenant
DELETE /api/tenants/:id              - Delete tenant
```

### Rent Logs (Protected)
```
GET    /api/rent-logs                - List logs
GET    /api/rent-logs/:id            - Get log
POST   /api/rent-logs                - Create log
PUT    /api/rent-logs/:id            - Update log
DELETE /api/rent-logs/:id            - Delete log
```

### Rent Collectors (Protected)
```
GET    /api/tenants/collectors/list      - List collectors
POST   /api/tenants/collectors           - Create collector
DELETE /api/tenants/collectors/:id       - Delete collector
```

### Settings (Protected)
```
GET    /api/tenants/settings/get         - Get settings
PUT    /api/tenants/settings/update      - Update settings
```

---

## 🗄️ Database Schema

**Users** - User accounts (id, email, phoneNumber, password, createdAt)  
**Tenants** - Property tenants (linked to userId)  
**RentLogs** - Rent payment history (linked to userId & tenantId)  
**RentCollectors** - Rent collection agents (linked to userId)  
**Settings** - User preferences (linked to userId)

---

## 📝 Development

### Available Scripts

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

**Backend:**
```bash
npm run dev      # Start with nodemon (auto-reload)
npm run start    # Start without auto-reload
npm run build    # Compile TypeScript
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled
- ✅ User data isolation at database level
- ✅ Input validation on all endpoints

---

## 📚 Documentation

- `BACKEND_GUIDE.md` - Backend architecture & API docs
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `DEPLOY_NOW.md` - Quick deployment guide
- `PROJECT_SUMMARY.md` - This file

---

## 🎯 Current Status

✅ **Authentication**: Complete  
✅ **Frontend**: Complete & responsive  
✅ **Backend API**: Complete & tested  
✅ **Database**: SQLite with user isolation  
✅ **Deployment**: Ready for Vercel  
⚠️ **Data Migration**: Frontend still uses localStorage (backend ready)  

---

## 🚧 Future Enhancements

- [ ] Migrate frontend to use backend API
- [ ] Add tenant communication features
- [ ] Email/SMS notifications
- [ ] Generate PDF invoices
- [ ] Add more analytics charts
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Export data to CSV/Excel
- [ ] Cloud storage for documents
- [ ] Mobile app (React Native)

---

## 👤 Developer

**Shubham Gupta**  
Repository: https://github.com/theshubhamgupta7576me/Rentman

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- Icons: Lucide React
- UI Inspiration: Modern property management apps
- Backend: Express + TypeScript best practices

---

**Built with ❤️ using React, TypeScript, and Node.js**

