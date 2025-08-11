# Complete Git Push + Coolify 4 Deployment Guide

## Your Repository: https://github.com/sameerhassan06/genie.git

### Step 1: Connect to Your GitHub Repository

Run these commands in your local project directory (where you see the error):

```bash
# Remove any existing remote (if present)
git remote remove origin

# Add your new GitHub repository
git remote add origin https://github.com/sameerhassan06/genie.git

# Verify the remote is added correctly
git remote -v
```

### Step 2: Push Your Code to GitHub

```bash
# Check current status
git status

# Add all files (including new Coolify deployment files)
git add .

# Commit all changes
git commit -m "Add complete Coolify deployment configuration and platform code"

# Push to GitHub (this will create the main branch on GitHub)
git push -u origin main
```

**If you get authentication errors:**
- Use your GitHub username and Personal Access Token (not password)
- Or set up SSH keys for easier access

### Step 3: Create Application in Coolify 4

#### 3.1 Access Coolify Dashboard
1. Open your Coolify 4 panel
2. Click **+ New Resource**
3. Select **Application**
4. Choose **Git Repository**

#### 3.2 Repository Configuration
- **Repository URL**: `https://github.com/sameerhassan06/genie.git`
- **Branch**: `main`
- **Build Pack**: Select **Dockerfile**
- **Build Context**: `.` (root directory)
- **Dockerfile Path**: `./Dockerfile`

#### 3.3 Application Settings
- **Application Name**: `genie-chatbot-saas`
- **Port**: `5000`
- **Health Check URL**: `/api/health`
- **Health Check Port**: `5000`

### Step 4: Configure Environment Variables

In Coolify, go to **Environment** tab and add these variables:

#### 4.1 Database Configuration
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
*Replace with your actual Supabase connection string*

#### 4.2 Generate Session Secret
Run this command locally to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then add to Coolify:
```
SESSION_SECRET=your_generated_secure_string_from_above
```

#### 4.3 OpenAI Integration
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### 4.4 Application Settings
```
NODE_ENV=production
PORT=5000
```

### Step 5: Domain Setup (Optional)

#### 5.1 Add Custom Domain
1. Go to **Domains** tab in your Coolify app
2. Click **+ Add Domain**
3. Enter your domain: `yourdomain.com`
4. Enable **Generate SSL Certificate**

#### 5.2 DNS Configuration
Point your domain to your Coolify server:
```
Type: A Record
Name: @ (or your subdomain)
Value: YOUR_COOLIFY_SERVER_IP
```

### Step 6: Deploy Your Application

1. Click the **Deploy** button in Coolify
2. Monitor the build process in the **Logs** tab
3. Build will take 3-5 minutes
4. Wait for "Build successful" message

### Step 7: Verify Deployment

#### 7.1 Check Health Endpoint
Visit: `https://your-domain.com/api/health` or `http://your-server-ip:port/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "uptime": 123.45
}
```

#### 7.2 Access Your Platform
**Main URL**: `https://your-domain.com`

### Step 8: Login and Test

#### 8.1 Superadmin Access
- **URL**: Your deployed domain
- **Username**: `admin`
- **Password**: `admin123`
- **Features**: Platform overview, tenant management, user management

#### 8.2 Business User Access
- **URL**: Your deployed domain `/auth`
- **Username**: `johndoe`
- **Password**: `password123`
- **Features**: Chatbot creation, lead management, appointments

### Step 9: Platform Features Available

Your deployed platform includes:
- **5 Demo Tenants** with real business data
- **7 Users** including superadmin
- **2 Configured Chatbots** ready for testing
- **Lead Management** with 1 sample lead
- **AI Integration** with OpenAI GPT-4o
- **Real-time Notifications** via WebSocket
- **Appointment Scheduling** system
- **Multi-tenant Architecture** with data isolation

### Troubleshooting

#### Git Issues
```bash
# If push fails, try force push (be careful!)
git push -f origin main

# If authentication fails, use token
git remote set-url origin https://YOUR-USERNAME:YOUR-TOKEN@github.com/sameerhassan06/genie.git
```

#### Coolify Build Issues
- Check **Logs** tab for build errors
- Verify all environment variables are set
- Ensure Dockerfile is in repository root
- Check if port 5000 is available

#### Runtime Issues
- Check container logs in Coolify
- Verify database connection string
- Test health endpoint first
- Check OpenAI API key is valid

### Success Checklist

- [ ] Git remote added successfully
- [ ] Code pushed to GitHub
- [ ] Coolify application created
- [ ] Environment variables configured
- [ ] Domain set up (if using custom domain)
- [ ] Deployment completed successfully
- [ ] Health check responding
- [ ] Superadmin login working
- [ ] Business user login working
- [ ] Platform features accessible

### Next Steps After Deployment

1. **Test AI Features**: Create a new chatbot and test responses
2. **Lead Management**: Test lead capture and management
3. **Multi-tenant**: Create additional tenants as needed
4. **Customization**: Modify branding and features for your needs
5. **Monitoring**: Set up monitoring for production use

Your multi-tenant SaaS chatbot platform is now live and ready to serve customers!