# COOLIFY DEPLOYMENT GUIDE

## 🚀 Deploy Your Multi-Tenant SaaS Platform to Coolify

### Prerequisites
1. Coolify panel access
2. Domain name for your application
3. Supabase database URL
4. OpenAI API key

### Deployment Steps

#### 1. Push Code to Git Repository
Ensure all files are committed to your GitHub repository, including:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

#### 2. Setup Environment Variables in Coolify
In your Coolify panel, add these environment variables:

**Required Environment Variables:**
```
DATABASE_URL=your_supabase_database_url
SESSION_SECRET=your_secure_session_secret (generate a random 32+ character string)
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=5000
```

#### 3. Coolify Configuration
1. **Source Type**: Git Repository
2. **Repository**: `https://github.com/sameerhassan06/chatbots.git`
3. **Build Pack**: Docker
4. **Port**: 5000
5. **Health Check Path**: `/api/health`

#### 4. Domain Configuration
- Set your custom domain in Coolify
- SSL will be automatically configured
- The app will be accessible at your domain

#### 5. Database Setup
Your Supabase database is already configured with all tables and data:
- 7 users including superadmin (username: admin, password: admin123)
- 5 tenants with sample data
- 2 chatbots and lead data

### 🎯 What You'll Get
- **Superadmin Panel**: Complete tenant management
- **Business Dashboards**: AI chatbot creation and management  
- **Real-time Features**: WebSocket notifications
- **Secure Authentication**: Username/password with automatic tenant creation
- **Multi-tenant Architecture**: Complete data isolation

### 📊 Demo Access
- **Superadmin**: username `admin`, password `admin123`
- **Business User**: username `johndoe`, password `password123`

### 🔧 Build Process
The Docker build will:
1. Install Node.js dependencies
2. Build frontend (React/Vite) and backend (Express)
3. Create optimized production bundle
4. Start server on port 5000

### 🏥 Health Monitoring
Health check endpoint at `/api/health` provides:
- Application status
- Uptime information
- Database connectivity

### ⚡ Features Included
- AI-powered chatbots with OpenAI integration
- Lead capture and management
- Appointment scheduling
- Business analytics
- Real-time notifications
- Responsive design
- Dark theme UI

Ready to deploy! Your multi-tenant SaaS platform will be live and fully functional.