# Deployment Guide

## Overview
Deploy frontend to Vercel and backend to Render

## Prerequisites
- GitHub repository with your code
- Vercel account (free)
- Render account (free tier available)

## Backend Deployment (Render)

### 1. Push to GitHub
```bash
git add .
git commit -m "Add deployment configuration for Render"
git push origin main
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub account
4. Select your repository
5. Use the `backend` folder as root directory
6. Render will automatically detect it's a Node.js project

### 3. Configure Service Settings
- **Name**: mutare-backend
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Free

### 4. Configure Environment Variables
In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 5. Database Setup
**Option 1**: Use Render's PostgreSQL service
1. In Render dashboard, click "New" → "PostgreSQL"
2. Create a new database
3. Copy the internal connection string

**Option 2**: Keep using Neon (recommended)
- Use your existing Neon connection string

### 6. Update CORS
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
VITE_API_URL=https://your-app-name.onrender.com
```

### 3. Update CORS in Backend
After getting your Vercel domain, update the backend CORS configuration.

## Post-Deployment Steps

### 1. Test the Applications
- Frontend: Visit your Vercel URL
- Backend: Visit `https://your-app-name.onrender.com/health`

### 2. Database Migration
If needed, run database migrations in Render shell:
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
- Backend: `https://your-app-name.onrender.com`

## Render-Specific Notes

### Auto-Deploy
- Render automatically deploys on every push to main branch
- Supports preview environments for pull requests

### Health Checks
- Render uses `/health` endpoint to monitor service health
- Already configured in your server.ts

### Cold Starts
- Free tier may have cold starts (30-60 seconds)
- Consider upgrading to paid tier for production

### Database Connection
- Use internal database URLs for better performance
- External databases work fine but may have higher latency

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS origins in backend
2. **Database Connection**: Check DATABASE_URL format
3. **Build Failures**: Check Render build logs
4. **Cold Starts**: Normal on free tier, upgrade if needed

### Environment Variables
Make sure all required environment variables are set in Render dashboard.

### API Connection
Test API endpoints directly before testing through frontend.

## Monitoring
- Render: Built-in metrics and logs
- Vercel: Analytics and performance metrics

## Next Steps
1. Set up custom domains
2. Configure SSL certificates (automatic on both platforms)
3. Set up monitoring and alerts
4. Consider upgrading Render plan for better performance
