# Fix Git Lock Issue and Deploy to Coolify

## Step 1: Fix Git Lock Issue

The `.git/config` file is locked. Run these commands to fix it:

```bash
# Navigate to your project directory
cd "C:\Users\samee\Desktop\new chatbot\Genie"

# Remove the lock file
del .git\config.lock

# If the above doesn't work, try:
rmdir /s .git\config.lock

# Or use PowerShell:
Remove-Item .git\config.lock -Force
```

## Step 2: Add Remote Repository

After removing the lock:

```bash
# Check if remote already exists
git remote -v

# If origin exists, remove it first
git remote remove origin

# Add your new repository
git remote add origin https://github.com/sameerhassan06/genie.git

# Verify it was added
git remote -v
```

## Step 3: Push to GitHub

```bash
# Check status
git status

# Add all files
git add .

# Commit with message
git commit -m "Complete AI chatbot SaaS platform with Coolify deployment"

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy to Coolify 4

### 4.1 Create Application
1. Open Coolify dashboard
2. **+ New Resource** → **Application** → **Git Repository**
3. Repository: `https://github.com/sameerhassan06/genie.git`
4. Branch: `main`
5. Build Pack: **Dockerfile**

### 4.2 Application Settings
- Name: `genie-chatbot-saas`
- Port: `5000`
- Health Check: `/api/health`

### 4.3 Environment Variables
```env
DATABASE_URL=your_supabase_connection_string
SESSION_SECRET=secure_random_32_char_string
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
PORT=5000
```

### 4.4 Generate Session Secret
Run locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Deploy and Access

After deployment succeeds:

**Superadmin Login:**
- Username: `admin`
- Password: `admin123`
- Features: Platform management, 5 demo tenants

**Business User Login:**
- Username: `johndoe`  
- Password: `password123`
- Features: AI chatbot creation, lead management

## Alternative: Fresh Git Setup

If issues persist, start fresh:

```bash
# Backup your code first
xcopy . ..\Genie-backup /E /I

# Remove git folder
rmdir /s .git

# Initialize fresh repository
git init
git branch -m main
git remote add origin https://github.com/sameerhassan06/genie.git
git add .
git commit -m "Complete AI chatbot SaaS platform"
git push -u origin main
```

Your platform includes:
- Multi-tenant architecture
- AI-powered chatbots
- Lead capture and management
- Real-time notifications
- 7 users with demo data
- 5 configured tenants
- Professional UI with dark theme