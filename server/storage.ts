import {
  users,
  tenants,
  chatbots,
  leads,
  appointments,
  services,
  knowledgeBase,
  websiteContent,
  conversations,
  analytics,
  type User,
  type UpsertUser,
  type Tenant,
  type InsertTenant,
  type Chatbot,
  type InsertChatbot,
  type Lead,
  type InsertLead,
  type Appointment,
  type InsertAppointment,
  type Service,
  type InsertService,
  type KnowledgeBase,
  type InsertKnowledgeBase,
  type WebsiteContent,
  type InsertWebsiteContent,
  type Conversation,
  type InsertConversation,
  type Analytics,
  type InsertAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  promoteToSuperadmin(userId: string): Promise<User>;
  createTenantAdmin(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Tenant operations
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant>;
  getTenants(): Promise<Tenant[]>;
  
  // Chatbot operations
  getChatbot(id: string, tenantId?: string): Promise<Chatbot | undefined>;
  getChatbotsByTenant(tenantId: string): Promise<Chatbot[]>;
  createChatbot(chatbot: InsertChatbot): Promise<Chatbot>;
  updateChatbot(id: string, chatbot: Partial<InsertChatbot>, tenantId?: string): Promise<Chatbot>;
  deleteChatbot(id: string, tenantId?: string): Promise<void>;
  
  // Lead operations
  getLead(id: string, tenantId?: string): Promise<Lead | undefined>;
  getLeadsByTenant(tenantId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>, tenantId?: string): Promise<Lead>;
  deleteLead(id: string, tenantId?: string): Promise<void>;
  
  // Appointment operations
  getAppointment(id: string, tenantId?: string): Promise<Appointment | undefined>;
  getAppointmentsByTenant(tenantId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>, tenantId?: string): Promise<Appointment>;
  deleteAppointment(id: string, tenantId?: string): Promise<void>;
  
  // Service operations
  getService(id: string, tenantId?: string): Promise<Service | undefined>;
  getServicesByTenant(tenantId: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>, tenantId?: string): Promise<Service>;
  deleteService(id: string, tenantId?: string): Promise<void>;
  
  // Knowledge Base operations
  getKnowledgeBaseItem(id: string, tenantId?: string): Promise<KnowledgeBase | undefined>;
  getKnowledgeBaseByTenant(tenantId: string): Promise<KnowledgeBase[]>;
  createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase>;
  updateKnowledgeBaseItem(id: string, item: Partial<InsertKnowledgeBase>, tenantId?: string): Promise<KnowledgeBase>;
  deleteKnowledgeBaseItem(id: string, tenantId?: string): Promise<void>;
  
  // Website Content operations
  getWebsiteContent(id: string, tenantId?: string): Promise<WebsiteContent | undefined>;
  getWebsiteContentByTenant(tenantId: string): Promise<WebsiteContent[]>;
  createWebsiteContent(content: InsertWebsiteContent): Promise<WebsiteContent>;
  updateWebsiteContent(id: string, content: Partial<InsertWebsiteContent>, tenantId?: string): Promise<WebsiteContent>;
  deleteWebsiteContent(id: string, tenantId?: string): Promise<void>;
  
  // Conversation operations
  getConversation(id: string, tenantId?: string): Promise<Conversation | undefined>;
  getConversationsByTenant(tenantId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>, tenantId?: string): Promise<Conversation>;
  
  // Analytics operations
  getAnalyticsByTenant(tenantId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Dashboard aggregations
  getTenantStats(tenantId: string): Promise<{
    totalConversations: number;
    newLeads: number;
    appointmentsScheduled: number;
    averageSatisfaction: number;
  }>;
  
  // Superadmin operations
  getAllTenantsStats(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalConversations: number;
    totalLeads: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async promoteToSuperadmin(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: 'superadmin', tenantId: null, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createTenantAdmin(userData: UpsertUser & { password: string }): Promise<User> {
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    
    // Hash password
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(userData.password, salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Tenant operations
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.domain, domain));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...tenant, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant;
  }

  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  // Chatbot operations
  async getChatbot(id: string, tenantId?: string): Promise<Chatbot | undefined> {
    const conditions = tenantId ? and(eq(chatbots.id, id), eq(chatbots.tenantId, tenantId)) : eq(chatbots.id, id);
    const [chatbot] = await db.select().from(chatbots).where(conditions);
    return chatbot;
  }

  async getChatbotsByTenant(tenantId: string): Promise<Chatbot[]> {
    return await db.select().from(chatbots).where(eq(chatbots.tenantId, tenantId)).orderBy(desc(chatbots.createdAt));
  }

  async createChatbot(chatbot: InsertChatbot): Promise<Chatbot> {
    const [newChatbot] = await db.insert(chatbots).values(chatbot).returning();
    return newChatbot;
  }

  async updateChatbot(id: string, chatbot: Partial<InsertChatbot>, tenantId?: string): Promise<Chatbot> {
    const conditions = tenantId ? and(eq(chatbots.id, id), eq(chatbots.tenantId, tenantId)) : eq(chatbots.id, id);
    const [updatedChatbot] = await db
      .update(chatbots)
      .set({ ...chatbot, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedChatbot;
  }

  async deleteChatbot(id: string, tenantId?: string): Promise<void> {
    const conditions = tenantId ? and(eq(chatbots.id, id), eq(chatbots.tenantId, tenantId)) : eq(chatbots.id, id);
    await db.delete(chatbots).where(conditions);
  }

  // Lead operations
  async getLead(id: string, tenantId?: string): Promise<Lead | undefined> {
    const conditions = tenantId ? and(eq(leads.id, id), eq(leads.tenantId, tenantId)) : eq(leads.id, id);
    const [lead] = await db.select().from(leads).where(conditions);
    return lead;
  }

  async getLeadsByTenant(tenantId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.tenantId, tenantId)).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: string, lead: Partial<InsertLead>, tenantId?: string): Promise<Lead> {
    const conditions = tenantId ? and(eq(leads.id, id), eq(leads.tenantId, tenantId)) : eq(leads.id, id);
    const [updatedLead] = await db
      .update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedLead;
  }

  async deleteLead(id: string, tenantId?: string): Promise<void> {
    const conditions = tenantId ? and(eq(leads.id, id), eq(leads.tenantId, tenantId)) : eq(leads.id, id);
    await db.delete(leads).where(conditions);
  }

  // Appointment operations
  async getAppointment(id: string, tenantId?: string): Promise<Appointment | undefined> {
    const conditions = tenantId ? and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)) : eq(appointments.id, id);
    const [appointment] = await db.select().from(appointments).where(conditions);
    return appointment;
  }

  async getAppointmentsByTenant(tenantId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.tenantId, tenantId)).orderBy(asc(appointments.scheduledAt));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>, tenantId?: string): Promise<Appointment> {
    const conditions = tenantId ? and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)) : eq(appointments.id, id);
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: string, tenantId?: string): Promise<void> {
    const conditions = tenantId ? and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)) : eq(appointments.id, id);
    await db.delete(appointments).where(conditions);
  }

  // Service operations
  async getService(id: string, tenantId?: string): Promise<Service | undefined> {
    const conditions = tenantId ? and(eq(services.id, id), eq(services.tenantId, tenantId)) : eq(services.id, id);
    const [service] = await db.select().from(services).where(conditions);
    return service;
  }

  async getServicesByTenant(tenantId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.tenantId, tenantId)).orderBy(asc(services.name));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>, tenantId?: string): Promise<Service> {
    const conditions = tenantId ? and(eq(services.id, id), eq(services.tenantId, tenantId)) : eq(services.id, id);
    const [updatedService] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedService;
  }

  async deleteService(id: string, tenantId?: string): Promise<void> {
    const conditions = tenantId ? and(eq(services.id, id), eq(services.tenantId, tenantId)) : eq(services.id, id);
    await db.delete(services).where(conditions);
  }

  // Knowledge Base operations
  async getKnowledgeBaseItem(id: string, tenantId?: string): Promise<KnowledgeBase | undefined> {
    const conditions = tenantId ? and(eq(knowledgeBase.id, id), eq(knowledgeBase.tenantId, tenantId)) : eq(knowledgeBase.id, id);
    const [item] = await db.select().from(knowledgeBase).where(conditions);
    return item;
  }

  async getKnowledgeBaseByTenant(tenantId: string): Promise<KnowledgeBase[]> {
    return await db.select().from(knowledgeBase).where(eq(knowledgeBase.tenantId, tenantId)).orderBy(desc(knowledgeBase.usage_count));
  }

  async createKnowledgeBaseItem(item: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const [newItem] = await db.insert(knowledgeBase).values(item).returning();
    return newItem;
  }

  async updateKnowledgeBaseItem(id: string, item: Partial<InsertKnowledgeBase>, tenantId?: string): Promise<KnowledgeBase> {
    const conditions = tenantId ? and(eq(knowledgeBase.id, id), eq(knowledgeBase.tenantId, tenantId)) : eq(knowledgeBase.id, id);
    const [updatedItem] = await db
      .update(knowledgeBase)
      .set({ ...item, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedItem;
  }

  async deleteKnowledgeBaseItem(id: string, tenantId?: string): Promise<void> {
    const conditions = tenantId ? and(eq(knowledgeBase.id, id), eq(knowledgeBase.tenantId, tenantId)) : eq(knowledgeBase.id, id);
    await db.delete(knowledgeBase).where(conditions);
  }

  // Website Content operations
  async getWebsiteContent(id: string, tenantId?: string): Promise<WebsiteContent | undefined> {
    const conditions = tenantId ? and(eq(websiteContent.id, id), eq(websiteContent.tenantId, tenantId)) : eq(websiteContent.id, id);
    const [content] = await db.select().from(websiteContent).where(conditions);
    return content;
  }

  async getWebsiteContentByTenant(tenantId: string): Promise<WebsiteContent[]> {
    return await db.select().from(websiteContent).where(eq(websiteContent.tenantId, tenantId)).orderBy(desc(websiteContent.extractedAt));
  }

  async createWebsiteContent(content: InsertWebsiteContent): Promise<WebsiteContent> {
    const [newContent] = await db.insert(websiteContent).values(content).returning();
    return newContent;
  }

  async updateWebsiteContent(id: string, content: Partial<InsertWebsiteContent>, tenantId?: string): Promise<WebsiteContent> {
    const conditions = tenantId ? and(eq(websiteContent.id, id), eq(websiteContent.tenantId, tenantId)) : eq(websiteContent.id, id);
    const [updatedContent] = await db
      .update(websiteContent)
      .set({ ...content, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedContent;
  }

  async deleteWebsiteContent(id: string, tenantId?: string): Promise<void> {
    const conditions = tenantId ? and(eq(websiteContent.id, id), eq(websiteContent.tenantId, tenantId)) : eq(websiteContent.id, id);
    await db.delete(websiteContent).where(conditions);
  }

  // Conversation operations
  async getConversation(id: string, tenantId?: string): Promise<Conversation | undefined> {
    const conditions = tenantId ? and(eq(conversations.id, id), eq(conversations.tenantId, tenantId)) : eq(conversations.id, id);
    const [conversation] = await db.select().from(conversations).where(conditions);
    return conversation;
  }

  async getConversationsByTenant(tenantId: string): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.tenantId, tenantId)).orderBy(desc(conversations.createdAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>, tenantId?: string): Promise<Conversation> {
    const conditions = tenantId ? and(eq(conversations.id, id), eq(conversations.tenantId, tenantId)) : eq(conversations.id, id);
    const [updatedConversation] = await db
      .update(conversations)
      .set({ ...conversation, updatedAt: new Date() })
      .where(conditions)
      .returning();
    return updatedConversation;
  }

  // Analytics operations
  async getAnalyticsByTenant(tenantId: string, startDate?: Date, endDate?: Date): Promise<Analytics[]> {
    let query = db.select().from(analytics).where(eq(analytics.tenantId, tenantId));
    
    if (startDate && endDate) {
      query = query.where(and(
        eq(analytics.tenantId, tenantId),
        and(
          eq(analytics.date, startDate),
          eq(analytics.date, endDate)
        )
      ));
    }
    
    return await query.orderBy(desc(analytics.date));
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db.insert(analytics).values(analyticsData).returning();
    return newAnalytics;
  }

  // Dashboard aggregations
  async getTenantStats(tenantId: string): Promise<{
    totalConversations: number;
    newLeads: number;
    appointmentsScheduled: number;
    averageSatisfaction: number;
  }> {
    const [conversationCount] = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.tenantId, tenantId));

    const [leadCount] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.tenantId, tenantId));

    const [appointmentCount] = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.tenantId, tenantId));

    const [satisfactionAvg] = await db
      .select({ avg: avg(conversations.satisfactionRating) })
      .from(conversations)
      .where(eq(conversations.tenantId, tenantId));

    return {
      totalConversations: conversationCount.count,
      newLeads: leadCount.count,
      appointmentsScheduled: appointmentCount.count,
      averageSatisfaction: satisfactionAvg.avg ? parseFloat(satisfactionAvg.avg) : 0,
    };
  }

  // Superadmin operations
  async getAllTenantsStats(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalConversations: number;
    totalLeads: number;
  }> {
    const [tenantCount] = await db.select({ count: count() }).from(tenants);
    
    const [activeTenantCount] = await db
      .select({ count: count() })
      .from(tenants)
      .where(eq(tenants.subscriptionStatus, 'active'));

    const [conversationCount] = await db.select({ count: count() }).from(conversations);
    const [leadCount] = await db.select({ count: count() }).from(leads);

    return {
      totalTenants: tenantCount.count,
      activeTenants: activeTenantCount.count,
      totalConversations: conversationCount.count,
      totalLeads: leadCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
