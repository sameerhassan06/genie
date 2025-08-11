# Complete Coolify 4 Deployment Guide

## Multi-Tenant SaaS Chatbot Platform Setup

### Prerequisites
- Coolify 4 installed and running
- Domain name (e.g., `yourdomain.com`)
- GitHub repository access
- Supabase account with database URL
- OpenAI API key

---

## Step 1: Prepare Your Repository

### 1.1 Push Latest Code to GitHub
```bash
git add .
git commit -m "Add Coolify deployment configuration with Docker"
git push origin main
```

### 1.2 Verify Required Files
Ensure these files exist in your repository:
- ✅ `Dockerfile` (Multi-stage Node.js build)
- ✅ `docker-compose.yml` (Container configuration)
- ✅ `.dockerignore` (Build optimization)
- ✅ `start.sh` (Production startup script)

---

## Step 2: Create New Resource in Coolify 4

### 2.1 Access Coolify Dashboard
1. Open your Coolify 4 panel
2. Navigate to **Resources** or **Projects**
3. Click **+ New Resource**

### 2.2 Choose Resource Type
- Select **Application**
- Choose **Git Repository** as source

### 2.3 Repository Configuration
**Git Repository URL:**
```
https://github.com/sameerhassan06/genie.git
```

**Branch:** `main`

**Build Pack:** `Dockerfile` (Docker)

---

## Step 3: Configure Application Settings

### 3.1 Basic Settings
**Name:** `chatbot-saas-platform`
**Port:** `5000`
**Health Check URL:** `/api/health`

### 3.2 Build Configuration
**Dockerfile Path:** `./Dockerfile`
**Build Context:** `.` (root directory)

---

## Step 4: Environment Variables Setup

Navigate to the **Environment** tab and add these variables:

### 4.1 Database Configuration
```env
DATABASE_URL=postgresql://user:password@host:port/database
```
**Value:** Your Supabase PostgreSQL connection string
- Get this from Supabase Dashboard → Settings → Database
- Use the "Connection string" → "URI" format

### 4.2 Authentication
```env
SESSION_SECRET=your-super-secure-random-string-minimum-32-characters-long
```
**Generate a secure secret:**
```bash
openssl rand -base64 48
```

### 4.3 AI Integration
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```
**Get from:** OpenAI Dashboard → API Keys

### 4.4 Application Settings
```env
NODE_ENV=production
PORT=5000
```

---

## Step 5: Domain Configuration

### 5.1 Add Custom Domain
1. Go to **Domains** tab
2. Click **+ Add Domain**
3. Enter your domain: `yourdomain.com`
4. Enable **Generate SSL Certificate**

### 5.2 DNS Configuration
Point your domain to your Coolify server:
```
A Record: yourdomain.com → YOUR_COOLIFY_SERVER_IP
```

---

## Step 6: Deploy the Application

### 6.1 Start Deployment
1. Click **Deploy** button
2. Monitor the build logs
3. Wait for successful deployment (usually 3-5 minutes)

### 6.2 Verify Deployment
**Health Check:** `https://yourdomain.com/api/health`
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "uptime": 123.45
}
```

---

## Step 7: Access Your Platform

### 7.1 Superadmin Access
**URL:** `https://yourdomain.com`
**Username:** `admin`
**Password:** `admin123`

**Features:**
- Platform overview with 5 demo tenants
- User management (7 existing users)
- Tenant management and billing
- System analytics and monitoring

### 7.2 Business User Access  
**URL:** `https://yourdomain.com/auth`
**Username:** `johndoe`
**Password:** `password123`

**Features:**
- AI chatbot creation and management
- Lead capture dashboard (1 existing lead)
- Appointment scheduling
- Knowledge base management
- Real-time notifications

---

## Step 8: Database Verification

Your Supabase database already contains:
- **7 Users** (including superadmin)
- **5 Tenants** with sample data
- **2 Chatbots** configured
- **1 Lead** for testing
- Complete schema with all tables

---

## Step 9: Troubleshooting

### 9.1 Build Failures
**Check logs in Coolify:**
- Navigate to your application
- Click **Logs** tab
- Review build and runtime logs

**Common Issues:**
- Missing environment variables
- Database connection failures
- Port conflicts

### 9.2 Database Connection Issues
**Test database connectivity:**
```bash
# In Coolify terminal or container logs
node -e "console.log(process.env.DATABASE_URL)"
```

### 9.3 SSL Certificate Issues
- Ensure DNS is properly configured
- Check domain propagation: `dig yourdomain.com`
- SSL generation can take 5-10 minutes

---

## Step 10: Monitoring & Maintenance

### 10.1 Application Monitoring
**Built-in Health Checks:**
- Coolify automatically monitors `/api/health`
- Container restart on failure
- Resource usage tracking

### 10.2 Logs Access
**View real-time logs:**
- Coolify Dashboard → Your App → Logs
- Filter by container or time range

### 10.3 Scaling (Optional)
**For high traffic:**
- Increase container resources in Coolify
- Configure horizontal scaling
- Add load balancer if needed

---

## Step 11: Platform Features

### 11.1 Multi-Tenant Architecture
- Complete data isolation between tenants
- Tenant-scoped API endpoints
- Role-based access control

### 11.2 AI-Powered Features
- OpenAI GPT-4o integration for chatbots
- Website content scraping
- Intelligent lead extraction
- Automated response generation

### 11.3 Real-time Capabilities
- WebSocket notifications
- Live dashboard updates
- Real-time conversation monitoring

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Coolify resource created
- [ ] Docker build pack selected
- [ ] All environment variables set
- [ ] Domain configured with SSL
- [ ] DNS pointing to Coolify server
- [ ] Deployment completed successfully
- [ ] Health check responding
- [ ] Superadmin login working
- [ ] Business user login working

---

## Support & Next Steps

Your multi-tenant SaaS platform is now live with:
- Complete authentication system
- AI chatbot capabilities
- Lead management tools
- Multi-tenant data isolation
- Real-time notifications
- Professional UI/UX

**Platform URL:** `https://yourdomain.com`
**Admin Panel:** Login with superadmin credentials
**Documentation:** Available in repository README files

Ready to serve your customers with AI-powered chatbot solutions!