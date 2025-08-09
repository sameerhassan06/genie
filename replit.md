# Overview

This is a multi-tenant SaaS chatbot platform that enables businesses to create, deploy, and manage AI-powered chatbots for their websites. The system supports lead capture, appointment scheduling, customer support, and intelligent conversations through AI integration. It features role-based access control with superadmin oversight and individual business tenant management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Styling**: Dark theme design with CSS custom properties for theming

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live updates and notifications
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple

## Authentication & Authorization
- **Provider**: Replit OpenID Connect integration using passport strategy
- **Session Storage**: Database-backed sessions with secure HTTP-only cookies
- **Role-based Access**: Three-tier system (superadmin, business_admin, business_member)
- **Multi-tenant Security**: Tenant isolation at the database and API level

## Database Design
- **Multi-tenant Architecture**: Tenant-scoped data isolation with foreign key relationships
- **Core Entities**: Users, Tenants, Chatbots, Leads, Appointments, Services, Knowledge Base
- **Analytics**: Conversation tracking and performance metrics storage
- **Content Management**: Website scraping results and knowledge base entries

## AI Integration
- **Provider**: OpenAI GPT-4o for natural language processing
- **Training Pipeline**: Website content scraping and knowledge base generation
- **Context Management**: Dynamic context injection from website content and knowledge base
- **Response Generation**: Contextual chatbot responses with lead extraction capabilities

## Real-time Features
- **WebSocket Manager**: Client-side WebSocket connection handling with reconnection logic
- **Live Updates**: Real-time notifications for new leads, appointments, and conversations
- **Tenant Broadcasting**: Scoped real-time updates within tenant boundaries

## Content Management
- **Web Scraping**: Puppeteer-based website content extraction
- **Knowledge Base**: Structured Q&A management with AI-assisted training
- **Content Processing**: Automatic content analysis and chatbot training data generation

# External Dependencies

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management
- **Connect PG Simple**: PostgreSQL session store adapter

## AI & ML Services
- **OpenAI API**: GPT-4o model for natural language processing and response generation
- **Puppeteer**: Headless Chrome automation for website content scraping

## Authentication
- **Replit OIDC**: OpenID Connect provider for user authentication
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## Development Tools
- **Vite**: Frontend build tool with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production builds
- **Replit Dev Tools**: Runtime error overlay and cartographer for development