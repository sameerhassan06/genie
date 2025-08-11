# Git Setup and Coolify Deployment Guide

## Fix Git Remote and Deploy to Coolify 4

### Step 1: Configure Git Remote Connection

Since your Git remote origin isn't configured, follow these steps:

#### Option A: Connect to Existing GitHub Repository
If you have a GitHub repository at `https://github.com/sameerhassan06/chatbots.git`:

```bash
# Add the remote origin
git remote add origin https://github.com/sameerhassan06/chatbots.git

# Verify the remote is added
git remote -v

# Push your code
git push -u origin main
```

#### Option B: Create New GitHub Repository
If you need to create a new repository:

1. Go to GitHub.com
2. Click "New repository"
3. Name it: `chatbot-saas-platform` or `chatbots`
4. Don't initialize with README (since you have code)
5. Copy the repository URL

Then run:
```bash
# Add the new remote origin
git remote add origin https://github.com/sameerhassan06/YOUR-NEW-REPO-NAME.git

# Push your code
git push -u origin main
```

#### Option C: Use GitHub CLI (if installed)
```bash
# Create and push to new repo in one command
gh repo create chatbot-saas-platform --public --push --source .
```

### Step 2: Verify Git Status

After setting up the remote, verify everything is ready:

```bash
# Check remote configuration
git remote -v

# Check branch status
git branch -a

# Check if files are committed
git status
```

### Step 3: Push All Deployment Files

Ensure all Coolify deployment files are pushed:
```bash
# Add any remaining files
git add .

# Commit changes
git commit -m "Add complete Coolify deployment configuration"

# Push to GitHub
git push origin main
```

### Step 4: Deploy to Coolify 4

Once your code is on GitHub, follow these steps in Coolify:

#### 4.1 Create New Application
1. Open Coolify 4 dashboard
2. Navigate to **Resources** → **+ New Resource**
3. Select **Application**
4. Choose **Git Repository**

#### 4.2 Repository Configuration
- **Repository URL**: `https://github.com/sameerhassan06/YOUR-REPO-NAME.git`
- **Branch**: `main`
- **Build Pack**: `Dockerfile`

#### 4.3 Application Settings
- **Name**: `chatbot-saas-platform`
- **Port**: `5000`
- **Health Check URL**: `/api/health`

#### 4.4 Environment Variables
Add these in Coolify Environment tab:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SESSION_SECRET=generate-secure-random-string-32-chars-minimum
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production
PORT=5000
```

**Generate SESSION_SECRET:**
```bash
# Use this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4.5 Domain Configuration
1. Go to **Domains** tab
2. Add your domain: `yourdomain.com`
3. Enable SSL certificate generation

#### 4.6 Deploy
1. Click **Deploy** button
2. Monitor build logs
3. Wait for successful deployment

### Step 5: Access Your Platform

After successful deployment:

**Superadmin Access:**
- URL: `https://yourdomain.com`
- Username: `admin`
- Password: `admin123`

**Business User Access:**
- URL: `https://yourdomain.com/auth`
- Username: `johndoe`
- Password: `password123`

### Step 6: Verify Deployment

Check these endpoints:
- **Health Check**: `https://yourdomain.com/api/health`
- **Main App**: `https://yourdomain.com`
- **API Status**: `https://yourdomain.com/api/user` (should return 401 for unauthorized)

### Troubleshooting

**If Git push fails:**
- Check GitHub repository exists and is accessible
- Verify you have push permissions
- Try using personal access token instead of password

**If Coolify build fails:**
- Check build logs in Coolify dashboard
- Verify all environment variables are set
- Ensure Dockerfile is in repository root

**If deployment succeeds but app doesn't work:**
- Check container logs in Coolify
- Verify database connection string is correct
- Test health endpoint first: `/api/health`

### Your Platform Features

Once deployed, you'll have:
- Complete multi-tenant SaaS platform
- 5 demo tenants with real data
- 7 users including superadmin
- AI chatbot creation with OpenAI integration
- Lead management and appointment scheduling
- Real-time WebSocket notifications
- Professional dark theme UI

Ready to serve customers with AI-powered chatbot solutions!