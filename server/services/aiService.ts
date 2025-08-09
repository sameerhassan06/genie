import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default-key"
});

export class AIService {
  async trainChatbot(tenantId: string, chatbotId: string, contentIds: string[]) {
    try {
      // Get all website content for the tenant
      const allContent = await storage.getWebsiteContentByTenant(tenantId);
      const selectedContent = contentIds.length > 0 
        ? allContent.filter(content => contentIds.includes(content.id!))
        : allContent;

      if (selectedContent.length === 0) {
        throw new Error("No content available for training");
      }

      // Combine all content into training data
      const combinedContent = selectedContent
        .map(content => `URL: ${content.url}\nTitle: ${content.title}\nContent: ${content.content}`)
        .join('\n\n---\n\n');

      // Generate embeddings or training summary
      const trainingPrompt = `
        Analyze the following website content and create a comprehensive knowledge base for a chatbot.
        Extract key information about products, services, company details, FAQ, and any other relevant information.
        Format the response as JSON with categories and key points.

        Content:
        ${combinedContent}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI trainer that creates knowledge bases for chatbots. Analyze content and extract structured information."
          },
          {
            role: "user",
            content: trainingPrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000
      });

      const trainingData = JSON.parse(response.choices[0].message.content || '{}');

      // Update chatbot with training data
      await storage.updateChatbot(chatbotId, {
        flows: trainingData,
        updatedAt: new Date()
      }, tenantId);

      return {
        success: true,
        message: "Chatbot training completed successfully",
        contentProcessed: selectedContent.length,
        trainingData
      };
    } catch (error) {
      console.error("AI training error:", error);
      throw new Error("Failed to train chatbot with AI");
    }
  }

  async generateResponse(context: string, userMessage: string, knowledgeBase: any[]) {
    try {
      const kbContext = knowledgeBase
        .map(item => `Q: ${item.question}\nA: ${item.answer}`)
        .join('\n\n');

      const prompt = `
        You are a helpful business chatbot. Use the provided context and knowledge base to answer the user's question.
        If you don't have enough information, politely explain what you can help with instead.

        Context: ${context}
        
        Knowledge Base:
        ${kbContext}

        User Question: ${userMessage}

        Respond in a helpful, professional manner. If appropriate, offer to schedule an appointment or provide contact information.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional business chatbot assistant. Be helpful, accurate, and conversational."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't generate a response at this time.";
    } catch (error) {
      console.error("AI response generation error:", error);
      return "I'm experiencing technical difficulties. Please try again later or contact support.";
    }
  }

  async generateLeadScore(leadData: any) {
    try {
      const prompt = `
        Analyze the following lead data and provide a score from 0-100 based on likelihood to convert.
        Consider factors like engagement level, information provided, source, and any behavioral indicators.

        Lead Data:
        ${JSON.stringify(leadData, null, 2)}

        Respond with JSON containing:
        {
          "score": number (0-100),
          "reasoning": "explanation of the score",
          "recommendations": ["action1", "action2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a lead scoring AI that analyzes customer data to predict conversion likelihood."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content || '{"score": 50, "reasoning": "Unable to analyze", "recommendations": []}');
    } catch (error) {
      console.error("Lead scoring error:", error);
      return {
        score: 50,
        reasoning: "Error in scoring algorithm",
        recommendations: ["Manual review recommended"]
      };
    }
  }

  async extractLeadFromConversation(messages: any[]) {
    try {
      const conversation = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `
        Analyze this chatbot conversation and extract lead information.
        Look for name, email, phone, company, interests, and any other relevant contact details.

        Conversation:
        ${conversation}

        Respond with JSON containing extracted lead data:
        {
          "name": "string or null",
          "email": "string or null", 
          "phone": "string or null",
          "company": "string or null",
          "interests": ["array of interests"],
          "notes": "summary of conversation and interests"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a lead extraction AI that identifies potential customer information from conversations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error("Lead extraction error:", error);
      return null;
    }
  }
}

export const aiService = new AIService();
