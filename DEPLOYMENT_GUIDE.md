# Deployment Guide for Rentman

## 🚀 Deploying to Vercel

### Frontend Deployment (Recommended for Now)

Since your frontend still uses localStorage, the easiest deployment is:

**Option 1: Frontend Only on Vercel**
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository: `theshubhamgupta7576me/Rentman`
5. Vercel will auto-detect it's a Vite project
6. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Click "Deploy"

Your site will be live in ~2 minutes! 🎉

### Backend Deployment Options

**Option A: Deploy Backend Separately to Railway/Render**
1. **Railway** (Recommended):
   - Go to https://railway.app
   - Sign up with GitHub
   - Create new project
   - Add PostgreSQL or MySQL database
   - Deploy backend with environment variables

2. **Render**:
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repo
   - Set root directory to `backend/`
   - Use Node.js

3. **Vercel Serverless**:
   - Already configured in `vercel.json`
   - Requires migrating to Vercel's serverless functions
   - More complex setup

**Option B: Use Vercel for Both Frontend & Backend**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables

For backend, you'll need:
```env
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
NODE_ENV=production
```

Set these in:
- Vercel: Project Settings → Environment Variables
- Railway: Environment → Variables
- Render: Environment → Environment Variables

---

## 📦 Current Deployment Strategy

### Recommended: Two-Tier Deployment

1. **Frontend → Vercel** (Free, fast CDN)
   - Deploy the React app
   - Fast global CDN
   - Auto SSL certificates
   - Preview deployments

2. **Backend → Railway/Render** (Database + API)
   - Persistent SQLite or PostgreSQL
   - Server always running
   - Environment variables
   - API endpoints

### Quick Deploy Steps

**Step 1: Deploy Frontend**
```bash
cd Rentman
npm run build
# Then use Vercel dashboard or CLI
```

**Step 2: Deploy Backend**
```bash
cd backend
# Choose one:
# Railway: Railway CLI or Dashboard
# Render: Connect GitHub and deploy
```

**Step 3: Update Frontend API URL**

Update `src/context/AuthContext.tsx`:
```typescript
// Change from:
const API_BASE_URL = 'http://localhost:3001/api';

// To your deployed backend URL:
const API_BASE_URL = 'https://your-backend-url.railway.app/api';
// or
const API_BASE_URL = 'https://your-app.onrender.com/api';
```

**Step 4: Rebuild & Redeploy Frontend**
```bash
npm run build
# Redeploy to Vercel
```

---

## 🔄 Alternative: Keep Using localStorage

If you want to deploy NOW without backend:

Your app works with localStorage only!
- No backend needed
- Works offline
- Data stored in browser
- **Just deploy frontend to Vercel**

Users can still create accounts (stored locally), but data won't sync across devices.

---

## 📝 Before Committing to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add authentication system with backend API"

# Push to GitHub
git push origin main
# or
git push origin fdev  # if on fdev branch
```

---

## ✅ Deployment Checklist

- [ ] Update `.gitignore` (DONE)
- [ ] Add backend files to repository
- [ ] Commit and push to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Update API URL in frontend
- [ ] Test deployment
- [ ] Share your live URL! 🎉

---

## 🎯 URLs After Deployment

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.railway.app/api`

Both will be auto-assigned by the platforms!

---

**Questions? Check the platforms' documentation or test locally first!**

