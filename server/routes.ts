import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { aiService } from "./services/aiService";
import { chatbotService } from "./services/chatbotService";
import { scrapingService } from "./services/scrapingService";
import { insertTenantSchema, insertChatbotSchema, insertLeadSchema, insertAppointmentSchema, insertServiceSchema, insertKnowledgeBaseSchema } from "@shared/schema";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to check if user is superadmin
const isSuperAdmin = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ message: "Forbidden: Superadmin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Failed to verify admin status" });
  }
};

// Middleware to get tenant context for business admins
const getTenantContext = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === 'superadmin') {
      // Superadmins can access any tenant via query parameter
      req.tenantId = (req.query.tenantId as string) || undefined;
    } else {
      // Business users can only access their own tenant
      req.tenantId = user.tenantId;
    }

    if (!req.tenantId && user.role !== 'superadmin') {
      return res.status(403).json({ message: "No tenant access" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Failed to get tenant context" });
  }
};

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware  
  setupAuth(app);

  // Auth routes are handled in setupAuth function

  // === SETUP & USER MANAGEMENT ===
  
  // Promote user to superadmin (for initial setup)
  app.post("/api/setup/promote-superadmin", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if any superadmins exist (for security)
      const allUsers = await storage.getAllUsers();
      const existingSuperadmins = allUsers.filter(user => user.role === 'superadmin');
      
      if (existingSuperadmins.length === 0) {
        // First user becomes superadmin
        const user = await storage.promoteToSuperadmin(userId);
        res.json({ message: "Successfully promoted to superadmin", user });
      } else {
        res.status(403).json({ message: "Superadmin already exists" });
      }
    } catch (error) {
      console.error("Error promoting to superadmin:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Check setup status
  app.get("/api/setup/status", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const hasSuperadmin = allUsers.some(user => user.role === 'superadmin');
      res.json({ hasSuperadmin, totalUsers: allUsers.length });
    } catch (error) {
      console.error("Error checking setup status:", error);
      res.status(500).json({ message: "Failed to check setup status" });
    }
  });

  // === SUPERADMIN ROUTES ===
  
  // Get all users (superadmin only)
  app.get("/api/superadmin/users", isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get all tenants (superadmin only)
  app.get("/api/superadmin/tenants", isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  // Create new tenant with admin user (superadmin only)
  app.post("/api/superadmin/tenants", isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      console.log("Creating tenant with data:", req.body);
      const { adminEmail, adminFirstName, adminLastName, ...tenantData } = req.body;
      
      // Validate tenant data
      const parsedTenantData = insertTenantSchema.parse(tenantData);
      console.log("Parsed tenant data:", parsedTenantData);
      
      // Create tenant and admin user in a transaction-like approach
      const tenant = await storage.createTenant(parsedTenantData);
      console.log("Created tenant:", tenant);
      
      if (adminEmail && adminFirstName && adminLastName && req.body.adminPassword) {
        // Create admin user for the tenant
        const adminUser = await storage.createTenantAdmin({
          email: adminEmail,
          firstName: adminFirstName,
          lastName: adminLastName,
          password: req.body.adminPassword,
          role: 'business_admin' as const,
          tenantId: tenant.id
        });
        console.log("Created admin user:", adminUser);
        
        res.json({ 
          tenant, 
          adminUser,
          message: "Tenant and admin user created successfully. Admin can now log in with their credentials." 
        });
      } else {
        res.json({ 
          tenant,
          message: "Tenant created successfully. No admin user was created." 
        });
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create tenant" });
      }
    }
  });

  // Update tenant (superadmin only)
  app.patch("/api/superadmin/tenants/:id", isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const tenant = await storage.updateTenant(id, updates);
      res.json(tenant);
    } catch (error) {
      console.error("Error updating tenant:", error);
      res.status(500).json({ message: "Failed to update tenant" });
    }
  });

  // Get platform-wide statistics (superadmin only)
  app.get("/api/superadmin/stats", isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getAllTenantsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });

  // === TENANT CREATION FOR BUSINESS USERS ===
  
  // Create tenant for authenticated user (business members can create their own tenant)
  app.post("/api/tenants", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user already has a tenant
      if (user.tenantId) {
        return res.status(400).json({ message: "User already belongs to a tenant" });
      }
      
      const tenantData = insertTenantSchema.parse(req.body);
      
      // Create the tenant
      const tenant = await storage.createTenant(tenantData);
      
      // Promote user to business_admin and assign to tenant
      await storage.upsertUser({
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'business_admin',
        tenantId: tenant.id,
      });
      
      res.json(tenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: "Failed to create tenant" });
    }
  });

  // === TENANT-SCOPED ROUTES ===
  
  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const stats = await storage.getTenantStats(tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // === CHATBOT ROUTES ===
  
  // Get chatbots
  app.get("/api/chatbots", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const chatbots = await storage.getChatbotsByTenant(tenantId);
      res.json(chatbots);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
      res.status(500).json({ message: "Failed to fetch chatbots" });
    }
  });

  // Create chatbot
  app.post("/api/chatbots", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const chatbotData = insertChatbotSchema.parse({ ...req.body, tenantId });
      const chatbot = await storage.createChatbot(chatbotData);
      res.json(chatbot);
    } catch (error) {
      console.error("Error creating chatbot:", error);
      res.status(500).json({ message: "Failed to create chatbot" });
    }
  });

  // Update chatbot
  app.patch("/api/chatbots/:id", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updates = req.body;
      const chatbot = await storage.updateChatbot(id, updates, tenantId);
      res.json(chatbot);
    } catch (error) {
      console.error("Error updating chatbot:", error);
      res.status(500).json({ message: "Failed to update chatbot" });
    }
  });

  // Delete chatbot
  app.delete("/api/chatbots/:id", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      await storage.deleteChatbot(id, tenantId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      res.status(500).json({ message: "Failed to delete chatbot" });
    }
  });

  // === LEADS ROUTES ===
  
  // Get leads
  app.get("/api/leads", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const leads = await storage.getLeadsByTenant(tenantId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Create lead
  app.post("/api/leads", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const leadData = insertLeadSchema.parse({ ...req.body, tenantId });
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Update lead
  app.patch("/api/leads/:id", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updates = req.body;
      const lead = await storage.updateLead(id, updates, tenantId);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // === APPOINTMENTS ROUTES ===
  
  // Get appointments
  app.get("/api/appointments", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const appointments = await storage.getAppointmentsByTenant(tenantId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Create appointment
  app.post("/api/appointments", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const appointmentData = insertAppointmentSchema.parse({ ...req.body, tenantId });
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Update appointment
  app.patch("/api/appointments/:id", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const updates = req.body;
      const appointment = await storage.updateAppointment(id, updates, tenantId);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // === SERVICES ROUTES ===
  
  // Get services
  app.get("/api/services", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const services = await storage.getServicesByTenant(tenantId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Create service
  app.post("/api/services", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const serviceData = insertServiceSchema.parse({ ...req.body, tenantId });
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // === KNOWLEDGE BASE ROUTES ===
  
  // Get knowledge base
  app.get("/api/knowledge-base", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const knowledgeBase = await storage.getKnowledgeBaseByTenant(tenantId);
      res.json(knowledgeBase);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base" });
    }
  });

  // Create knowledge base item
  app.post("/api/knowledge-base", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const itemData = insertKnowledgeBaseSchema.parse({ ...req.body, tenantId });
      const item = await storage.createKnowledgeBaseItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating knowledge base item:", error);
      res.status(500).json({ message: "Failed to create knowledge base item" });
    }
  });

  // === AI TRAINING ROUTES ===
  
  // Scrape website content
  app.post("/api/ai/scrape-website", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const content = await scrapingService.scrapeWebsite(url);
      const websiteContent = await storage.createWebsiteContent({
        tenantId,
        url,
        title: content.title,
        content: content.content,
      });

      res.json(websiteContent);
    } catch (error) {
      console.error("Error scraping website:", error);
      res.status(500).json({ message: "Failed to scrape website" });
    }
  });

  // Train AI with content
  app.post("/api/ai/train", isAuthenticated, getTenantContext, async (req, res) => {
    try {
      const tenantId = req.tenantId!;
      const { contentIds, chatbotId } = req.body;
      
      const result = await aiService.trainChatbot(tenantId, chatbotId, contentIds);
      res.json(result);
    } catch (error) {
      console.error("Error training AI:", error);
      res.status(500).json({ message: "Failed to train AI" });
    }
  });

  // === PUBLIC CHATBOT API ===
  
  // Public chatbot interaction (no auth required)
  app.post("/api/public/chat/:chatbotId", async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const { message, sessionId } = req.body;
      
      const response = await chatbotService.processMessage(chatbotId, message, sessionId);
      res.json(response);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Get chatbot widget configuration (no auth required)
  app.get("/api/public/chatbot/:chatbotId/config", async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const chatbot = await storage.getChatbot(chatbotId);
      
      if (!chatbot || !chatbot.isActive) {
        return res.status(404).json({ message: "Chatbot not found or inactive" });
      }

      // Return only public configuration
      const config = {
        id: chatbot.id,
        name: chatbot.name,
        welcomeMessage: chatbot.welcomeMessage,
        theme: chatbot.theme,
      };

      res.json(config);
    } catch (error) {
      console.error("Error fetching chatbot config:", error);
      res.status(500).json({ message: "Failed to fetch chatbot configuration" });
    }
  });

  // === WEBSOCKET SETUP ===
  
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        switch (message.type) {
          case 'subscribe_tenant':
            // Join tenant-specific room for real-time updates
            ws.tenantId = message.tenantId;
            ws.send(JSON.stringify({ type: 'subscribed', tenantId: message.tenantId }));
            break;
            
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Broadcast real-time updates to connected clients
  const broadcastToTenant = (tenantId: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && (client as any).tenantId === tenantId) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Store broadcast function for use in services
  app.set('broadcastToTenant', broadcastToTenant);

  return httpServer;
}
