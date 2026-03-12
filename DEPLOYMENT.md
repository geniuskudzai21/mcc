# Deployment Guide

## Overview
Deploy frontend to Vercel and backend to Railway

## Prerequisites
- GitHub repository with your code
- Vercel account (free)
- Railway account (free tier available)

## Backend Deployment (Railway)

### 1. Push to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your repository
5. Railway will automatically detect it's a Node.js project

### 3. Configure Environment Variables
In Railway dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 4. Database Setup
- Option 1: Use Railway's PostgreSQL service
- Option 2: Keep using Neon (recommended for production)

### 5. Update CORS
Once your Vercel domain is ready, update the CORS origins in `backend/src/server.ts`:
```typescript
origin: ['https://your-vercel-domain.vercel.app']
```

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `frontend` folder
5. Vercel will automatically detect it's a React/Vite project

### 2. Configure Environment Variables
In Vercel dashboard, add:
```
VITE_API_URL=https://your-railway-url.railway.app
```

### 3. Update CORS in Backend
After getting your Vercel domain, update the backend CORS configuration.

## Post-Deployment Steps

### 1. Test the Applications
- Frontend: Visit your Vercel URL
- Backend: Visit `https://your-railway-url.railway.app/health`

### 2. Database Migration
Run database migrations if needed:
```bash
npx prisma migrate deploy
```

### 3. Seed Data (Optional)
If you have seed data:
```bash
npx prisma db seed
```

## URLs Structure
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-app-name.railway.app`

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS origins in backend
2. **Database Connection**: Check DATABASE_URL format
3. **Build Failures**: Check logs in Railway/Vercel dashboards

### Environment Variables
Make sure all required environment variables are set in both platforms.

### API Connection
Test API endpoints directly before testing through frontend.

## Monitoring
- Railway: Built-in metrics and logs
- Vercel: Analytics and performance metrics

## Next Steps
1. Set up custom domains
2. Configure SSL certificates (automatic on both platforms)
3. Set up monitoring and alerts
4. Configure backup strategies
