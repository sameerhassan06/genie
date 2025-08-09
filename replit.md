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
- **Provider**: Traditional username/password authentication with bcrypt hashing
- **Session Storage**: Memory-based sessions with secure HTTP-only cookies (eliminates database conflicts)
- **Role-based Access**: Three-tier system (superadmin, business_admin, business_member)
- **Multi-tenant Security**: Tenant isolation at the database and API level
- **Simple Auth Interface**: Clean signup/signin buttons at /auth page with form validation
- **Username-based Login**: Users register and login with username instead of email
- **Automatic Tenant Creation**: Default tenant is created automatically after user registration

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
- **Supabase PostgreSQL**: Primary database hosted on Supabase with Drizzle ORM
- **Drizzle Kit**: Database migrations and schema management
- **Memory Session Store**: In-memory session storage for authentication

## AI & ML Services
- **OpenAI API**: GPT-4o model for natural language processing and response generation
- **Puppeteer**: Headless Chrome automation for website content scraping

## Authentication
- **Passport.js**: Authentication middleware with local strategy
- **Bcrypt**: Password hashing for secure authentication

## Development Tools
- **Vite**: Frontend build tool with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production builds
- **Replit Dev Tools**: Runtime error overlay and cartographer for development

# Recent Changes

## August 2025
- **Completed Supabase Migration**: Successfully created full database schema and migrated all data (7 users, 5 tenants, 2 chatbots, 1 lead) to Supabase PostgreSQL
- **Database Schema Creation**: Manually created all tables (users, tenants, chatbots, leads, appointments, services, knowledge_base, conversations) with proper foreign key constraints
- **Data Migration Success**: All existing data transferred with ON CONFLICT handling to prevent duplicates
- **Fixed Authentication System**: Resolved infinite 401 loops and improved session handling
- **Automatic Tenant Creation**: Users now get default tenants created after registration
- **Added Service Modules**: Created chatbotService and scrapingService for AI functionality
- **Enhanced Business Dashboard**: Improved form functionality and chatbot creation flow