import OpenAI from "openai";
import { storage } from "../storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatbotResponse {
  message: string;
  isLead?: boolean;
  leadData?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    message?: string;
  };
  suggestedAppointment?: boolean;
}

export class ChatbotService {
  async processMessage(
    chatbotId: string,
    message: string,
    context: any = {}
  ): Promise<ChatbotResponse> {
    try {
      // Get chatbot configuration
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot) {
        throw new Error("Chatbot not found");
      }

      // Get relevant knowledge base entries
      const knowledgeBase = await storage.getKnowledgeBaseByTenant(chatbot.tenantId);
      const contextualKnowledge = knowledgeBase
        .filter(kb => 
          message.toLowerCase().includes(kb.question.toLowerCase()) ||
          (kb.tags && kb.tags.some(tag => message.toLowerCase().includes(tag.toLowerCase())))
        )
        .slice(0, 3);

      // Build system prompt
      const systemPrompt = `You are ${chatbot.name}, an AI assistant for ${chatbot.tenantId}. 

Your role:
- Provide helpful customer support
- Identify potential leads and extract contact information
- Suggest appointments when appropriate
- Use the knowledge base to answer questions accurately

Knowledge Base:
${contextualKnowledge.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n')}

Guidelines:
- Be friendly and professional
- If you detect contact information (name, email, phone), flag this as a lead
- If the user expresses interest in services or wants to schedule something, suggest an appointment
- Always respond in JSON format with: { "message": "your response", "isLead": boolean, "leadData": {...}, "suggestedAppointment": boolean }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"message": "I apologize, but I encountered an error processing your request."}');

      // Save lead if detected
      if (result.isLead && result.leadData) {
        await storage.createLead({
          tenantId: chatbot.tenantId,
          chatbotId: chatbotId,
          name: result.leadData.name,
          email: result.leadData.email,
          phone: result.leadData.phone,
          message: result.leadData.message || message,
          status: 'new',
          source: 'chatbot',
        });
      }

      return result;
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      return {
        message: "I apologize, but I'm currently experiencing technical difficulties. Please try again later.",
      };
    }
  }

  async trainChatbot(chatbotId: string, websiteContent: string[]): Promise<void> {
    try {
      const chatbot = await storage.getChatbot(chatbotId);
      if (!chatbot) {
        throw new Error("Chatbot not found");
      }

      // Process website content with OpenAI to generate knowledge base entries
      const prompt = `Analyze the following website content and generate Q&A pairs for a customer support chatbot.

Website Content:
${websiteContent.join('\n\n')}

Generate 10-15 relevant Q&A pairs that customers might ask about this business. Format as JSON array:
[{"question": "...", "answer": "...", "tags": ["tag1", "tag2"]}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const qaPairs = JSON.parse(response.choices[0].message.content || '[]');

      // Save to knowledge base
      for (const qa of qaPairs) {
        await storage.createKnowledgeBaseItem({
          tenantId: chatbot.tenantId,
          question: qa.question,
          answer: qa.answer,
          tags: qa.tags || [],
        });
      }

      console.log(`Generated ${qaPairs.length} knowledge base entries for chatbot ${chatbotId}`);
    } catch (error) {
      console.error("Error training chatbot:", error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();