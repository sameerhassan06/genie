import { storage } from "../storage";
import { aiService } from "./aiService";
import type { InsertChatbot, Chatbot } from "@shared/schema";

export class ChatbotService {
  async createChatbot(chatbotData: InsertChatbot): Promise<Chatbot> {
    // Create the chatbot
    const chatbot = await storage.createChatbot(chatbotData);
    
    // Generate embed code
    const embedCode = this.generateEmbedCode(chatbot.id);
    
    // Update with embed code
    const updatedChatbot = await storage.updateChatbot(chatbot.id, {
      embedCode
    }, chatbot.tenantId);
    
    return updatedChatbot;
  }

  private generateEmbedCode(chatbotId: string): string {
    return `<script>
(function() {
  var script = document.createElement('script');
  script.src = '${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/embed/chatbot.js';
  script.dataset.chatbotId = '${chatbotId}';
  document.head.appendChild(script);
})();
</script>`;
  }

  async processMessage(chatbotId: string, message: string, sessionId?: string): Promise<{
    response: string;
    leadCaptured?: boolean;
    appointmentBooked?: boolean;
  }> {
    // Get chatbot configuration
    const chatbot = await storage.getChatbot(chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    // Use AI service to generate response
    const response = await aiService.generateChatbotResponse(
      message,
      chatbot,
      sessionId
    );

    return {
      response: response.message,
      leadCaptured: response.leadCaptured,
      appointmentBooked: response.appointmentBooked
    };
  }
}

export const chatbotService = new ChatbotService();