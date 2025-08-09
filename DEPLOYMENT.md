# Deploying to Vercel

This guide will help you deploy your multi-tenant SaaS platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code needs to be in a GitHub repository
3. **Supabase Database**: Your database is already set up and migrated

## Step 1: Prepare Your Repository

1. Push your current code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Multi-tenant SaaS platform"
git remote add origin https://github.com/sameerhassan06/chatbots.git
git push -u origin main
```

## Step 2: Update Package.json Scripts

Since I cannot modify package.json directly in this environment, you need to manually update the scripts section:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "vercel-build": "vite build",
    "start": "NODE_ENV=production node server/index.ts",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

## Step 3: Configure Environment Variables in Vercel

After connecting your GitHub repository to Vercel:

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Environment Variables"
3. Add these variables:

```
SUPABASE_DATABASE_URL=your-supabase-connection-string
OPENAI_API_KEY=your-openai-api-key
SESSION_SECRET=your-random-session-secret
NODE_ENV=production
```

**Important**: Use the same `SUPABASE_DATABASE_URL` that you configured in Replit Secrets.

## Step 4: Deploy to Vercel

1. **Connect GitHub**: In Vercel dashboard, click "New Project" and connect your GitHub repository
2. **Configure Build Settings**:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

3. **Deploy**: Click "Deploy" and wait for the build to complete

## Step 5: Verify Deployment

After deployment:

1. **Test Authentication**: Try logging in with:
   - Superadmin: username `admin`, password `admin123`
   - Business users: existing usernames from your database

2. **Check Database Connection**: Verify that the platform can connect to your Supabase database

3. **Test Features**: 
   - Create new tenants
   - Design chatbots
   - Manage leads
   - Access business dashboards

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Verify `SUPABASE_DATABASE_URL` is correct
   - Ensure Supabase project allows connections from Vercel

2. **Build Failures**:
   - Check that all dependencies are installed
   - Verify TypeScript compilation passes

3. **Authentication Issues**:
   - Ensure `SESSION_SECRET` is set
   - Check that session storage is configured properly

### Build Logs:

Check Vercel's build logs if deployment fails. Common solutions:
- Update Node.js version to 18+ in Vercel settings
- Ensure all environment variables are properly set

## Post-Deployment

1. **Custom Domain**: Configure a custom domain in Vercel settings
2. **SSL Certificate**: Vercel provides automatic SSL certificates
3. **Performance Monitoring**: Use Vercel Analytics to monitor your application

Your multi-tenant SaaS platform should now be live on Vercel!