# Multi-Tenant SaaS Chatbot Platform

A comprehensive multi-tenant SaaS platform for creating and managing AI-powered chatbots with lead generation, customer support, and business management features.

## Features

- **Multi-tenant Architecture**: Isolated data and permissions per business
- **AI-Powered Chatbots**: OpenAI GPT-4o integration for intelligent conversations
- **Lead Management**: Capture, score, and manage leads with automated workflows
- **Appointment Scheduling**: Integrated booking system with calendar management
- **Role-Based Access**: Superadmin, business admin, and member roles
- **Real-time Updates**: WebSocket-powered live notifications
- **Responsive Design**: Modern dark theme with mobile-first approach

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Supabase hosted)
- **Authentication**: Username/password with secure session management
- **Real-time**: WebSockets for live updates
- **AI**: OpenAI GPT-4o for natural language processing

## Quick Start

### Local Development

1. **Clone & Install**:
```bash
git clone <your-repo>
cd chatbot-saas-platform
npm install
```

2. **Environment Setup**:
```bash
# Copy environment variables
SUPABASE_DATABASE_URL=your-supabase-connection-string
OPENAI_API_KEY=your-openai-api-key
SESSION_SECRET=your-random-secret-key
```

3. **Database Setup**:
```bash
npm run db:push
```

4. **Start Development**:
```bash
npm run dev
```

Visit `http://localhost:5000` and login with:
- **Superadmin**: username `admin`, password `admin123`

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository
- Supabase database (already configured)

### Deploy Steps

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Deploy to Vercel"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure build settings:
     - **Framework**: Other
     - **Build Command**: `vite build`
     - **Output Directory**: `client/dist`

3. **Environment Variables** (in Vercel dashboard):
```
SUPABASE_DATABASE_URL=your-supabase-connection-string
OPENAI_API_KEY=your-openai-api-key  
SESSION_SECRET=generate-random-32-char-string
NODE_ENV=production
```

4. **Deploy**: Click "Deploy" and wait for completion

## Key Features

### For Superadmins
- Manage all tenants and users
- View platform-wide analytics
- Configure system settings
- Monitor usage and performance

### For Business Admins
- Create and customize chatbots
- Manage team members
- View leads and appointments
- Access business analytics
- Configure business settings

### For Business Members
- View assigned leads
- Manage appointments
- Access limited analytics
- Update profile settings

## API Routes

- `GET /api/user` - Current user info
- `POST /api/login` - User authentication
- `POST /api/register` - New user registration
- `GET /api/superadmin/*` - Superadmin endpoints
- `GET /api/business/*` - Business management endpoints

## Database Schema

The platform uses a multi-tenant PostgreSQL database with these core entities:

- **Users**: Authentication and role management
- **Tenants**: Business account isolation
- **Chatbots**: AI assistant configurations
- **Leads**: Customer contact management
- **Appointments**: Scheduling system
- **Services**: Business service catalog
- **Knowledge Base**: AI training content
- **Conversations**: Chat history tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For deployment issues or feature requests, check the documentation or create an issue.

---

**Live Demo**: Once deployed, your platform will be available at `https://your-project.vercel.app`