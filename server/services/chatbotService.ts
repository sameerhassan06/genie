import { storage } from "../storage";
import { aiService } from "./aiService";
import { randomUUID } from "crypto";

export class ChatbotService {
  async processMessage(chatbotId: string, message: string, sessionId?: string) {
    try {
      // Get chatbot configuration
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot || !chatbot.isActive) {
        throw new Error("Chatbot not found or inactive");
      }

      // Generate session ID if not provided
      if (!sessionId) {
        sessionId = randomUUID();
      }

      // Get existing conversation or create new one
      let conversation = await this.getOrCreateConversation(chatbot, sessionId);

      // Get knowledge base for the tenant
      const knowledgeBase = await storage.getKnowledgeBaseByTenant(chatbot.tenantId);

      // Get website content for context
      const websiteContent = await storage.getWebsiteContentByTenant(chatbot.tenantId);
      const context = websiteContent
        .map(content => content.content)
        .join('\n')
        .substring(0, 2000); // Limit context size

      // Generate AI response
      const aiResponse = await aiService.generateResponse(context, message, knowledgeBase);

      // Update conversation with new messages
      const messages = conversation.messages as any[] || [];
      messages.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: aiResponse, timestamp: new Date() }
      );

      conversation = await storage.updateConversation(conversation.id!, {
        messages,
        updatedAt: new Date()
      });

      // Check if we should extract lead information
      await this.extractAndCreateLead(chatbot.tenantId, chatbot.id!, messages, sessionId);

      // Check for appointment scheduling intent
      const appointmentIntent = this.detectAppointmentIntent(message);
      let appointmentOptions = null;
      
      if (appointmentIntent) {
        const services = await storage.getServicesByTenant(chatbot.tenantId);
        appointmentOptions = services.map(service => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        }));
      }

      return {
        response: aiResponse,
        sessionId,
        conversationId: conversation.id,
        appointmentOptions,
        suggestions: this.generateSuggestions(message, knowledgeBase)
      };
    } catch (error) {
      console.error("Chatbot processing error:", error);
      return {
        response: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        sessionId: sessionId || randomUUID(),
        error: true
      };
    }
  }

  private async getOrCreateConversation(chatbot: any, sessionId: string) {
    // Try to find existing conversation
    const conversations = await storage.getConversationsByTenant(chatbot.tenantId);
    const existing = conversations.find(conv => conv.sessionId === sessionId);
    
    if (existing) {
      return existing;
    }

    // Create new conversation
    return await storage.createConversation({
      tenantId: chatbot.tenantId,
      chatbotId: chatbot.id,
      sessionId,
      messages: [],
      metadata: {}
    });
  }

  private async extractAndCreateLead(tenantId: string, chatbotId: string, messages: any[], sessionId: string) {
    try {
      // Only try to extract lead if conversation has enough messages
      if (messages.length < 4) return;

      const leadData = await aiService.extractLeadFromConversation(messages);
      
      if (leadData && (leadData.email || leadData.phone || leadData.name)) {
        // Check if lead already exists
        const existingLeads = await storage.getLeadsByTenant(tenantId);
        const existingLead = existingLeads.find(lead => 
          (leadData.email && lead.email === leadData.email) ||
          (leadData.phone && lead.phone === leadData.phone)
        );

        if (!existingLead) {
          // Generate lead score
          const scoring = await aiService.generateLeadScore(leadData);
          
          // Create new lead
          const lead = await storage.createLead({
            tenantId,
            chatbotId,
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            source: 'chatbot',
            score: scoring.score,
            notes: leadData.notes,
            metadata: { 
              sessionId, 
              interests: leadData.interests,
              scoring: scoring
            }
          });

          console.log(`New lead created: ${lead.id}`);
        }
      }
    } catch (error) {
      console.error("Lead extraction error:", error);
    }
  }

  private detectAppointmentIntent(message: string): boolean {
    const appointmentKeywords = [
      'appointment', 'schedule', 'book', 'meeting', 'consultation',
      'call', 'demo', 'session', 'available', 'calendar'
    ];
    
    const lowerMessage = message.toLowerCase();
    return appointmentKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private generateSuggestions(message: string, knowledgeBase: any[]): string[] {
    // Generate contextual suggestions based on knowledge base
    const suggestions = [
      "Tell me about your services",
      "How can I schedule an appointment?",
      "What are your pricing options?"
    ];

    // Add relevant suggestions from knowledge base
    const relevantKB = knowledgeBase
      .slice(0, 2)
      .map(item => item.question);

    return [...suggestions, ...relevantKB].slice(0, 4);
  }

  async scheduleAppointment(chatbotId: string, appointmentData: any, sessionId: string) {
    try {
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot) {
        throw new Error("Chatbot not found");
      }

      // Find associated lead
      const leads = await storage.getLeadsByTenant(chatbot.tenantId);
      const lead = leads.find(l => l.metadata && (l.metadata as any).sessionId === sessionId);

      const appointment = await storage.createAppointment({
        tenantId: chatbot.tenantId,
        leadId: lead?.id,
        serviceId: appointmentData.serviceId,
        title: appointmentData.title || "Chatbot Scheduled Appointment",
        description: appointmentData.description,
        scheduledAt: new Date(appointmentData.scheduledAt),
        duration: appointmentData.duration || 30,
        status: 'scheduled'
      });

      return {
        success: true,
        appointment,
        message: "Your appointment has been scheduled successfully! We'll send you a confirmation email shortly."
      };
    } catch (error) {
      console.error("Appointment scheduling error:", error);
      return {
        success: false,
        message: "Sorry, I couldn't schedule your appointment. Please try again or contact us directly."
      };
    }
  }
}

export const chatbotService = new ChatbotService();
