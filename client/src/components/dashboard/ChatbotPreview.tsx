import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Bot, Edit, BarChart3, Zap, MessageSquare, TrendingUp } from "lucide-react";

interface Chatbot {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
  };
  welcomeMessage?: string;
}

interface ChatbotPreviewProps {
  chatbots: Chatbot[];
  loading?: boolean;
}

export default function ChatbotPreview({ chatbots, loading }: ChatbotPreviewProps) {
  if (loading) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40 bg-gray-700" />
            <Skeleton className="h-9 w-32 bg-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 bg-gray-700 rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-32 bg-gray-700 rounded-lg" />
              <Skeleton className="h-32 bg-gray-700 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeChatbot = chatbots.find(bot => bot.isActive) || chatbots[0];

  if (!activeChatbot) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Chatbot Preview</CardTitle>
            <Link href="/chatbot-designer">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Create Chatbot
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Chatbot Found</h3>
            <p className="text-gray-400 mb-6">
              Create your first chatbot to start engaging with customers
            </p>
            <Link href="/chatbot-designer">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-white">Chatbot Preview</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-gray-400">
                {activeChatbot.isActive ? 'Live on website' : 'Inactive'}
              </span>
            </div>
          </div>
          <Link href="/chatbot-designer">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Edit Chatbot
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chatbot Widget Preview */}
          <div className="relative">
            <div className="bg-gray-900 rounded-lg p-4 min-h-96">
              {/* Website mockup */}
              <div className="bg-white rounded-t-lg p-4 h-64">
                <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                <h2 className="text-gray-900 text-lg font-bold">Professional Services</h2>
                <p className="text-gray-600 text-sm">We help businesses grow with expert consulting...</p>
              </div>
              
              {/* Chatbot Widget */}
              <div className="absolute bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl border">
                <div 
                  className="text-white p-4 rounded-t-lg flex items-center justify-between"
                  style={{ backgroundColor: activeChatbot.theme?.primaryColor || '#6366F1' }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{activeChatbot.name}</span>
                  </div>
                  <button className="text-white/80 hover:text-white">
                    ×
                  </button>
                </div>
                <div className="p-4 h-64 overflow-y-auto bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: activeChatbot.theme?.primaryColor || '#6366F1' }}
                      >
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                        <p className="text-sm text-gray-800">
                          {activeChatbot.welcomeMessage || "Hi! How can I help you today?"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div 
                        className="text-white p-3 rounded-lg max-w-xs"
                        style={{ backgroundColor: activeChatbot.theme?.primaryColor || '#6366F1' }}
                      >
                        <p className="text-sm">I'd like to know more about your services</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: activeChatbot.theme?.primaryColor || '#6366F1' }}
                      >
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                        <p className="text-sm text-gray-800">
                          Great! We offer strategic business consulting and digital transformation. 
                          Would you like to schedule a consultation?
                        </p>
                        <div className="mt-2 space-y-1">
                          <button 
                            className="w-full text-left p-2 rounded text-sm hover:bg-gray-100 transition-colors"
                            style={{ color: activeChatbot.theme?.primaryColor || '#6366F1' }}
                          >
                            📅 Schedule consultation
                          </button>
                          <button 
                            className="w-full text-left p-2 rounded text-sm hover:bg-gray-100 transition-colors"
                            style={{ color: activeChatbot.theme?.primaryColor || '#6366F1' }}
                          >
                            📄 View our services
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ 
                        focusRingColor: activeChatbot.theme?.primaryColor || '#6366F1'
                      }}
                    />
                    <button 
                      className="text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: activeChatbot.theme?.primaryColor || '#6366F1' }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot Analytics */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Today's Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">147</p>
                      <p className="text-xs text-gray-400">Conversations</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">98.5%</p>
                      <p className="text-xs text-gray-400">Response Rate</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">4.8</p>
                      <p className="text-xs text-gray-400">Satisfaction</p>
                    </div>
                    <div className="text-warning">⭐</div>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">23</p>
                      <p className="text-xs text-gray-400">Conversions</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-accent">🎯</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="ghost"
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary justify-start"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Welcome Message
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full bg-secondary/10 hover:bg-secondary/20 text-secondary justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Train with New Content
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full bg-accent/10 hover:bg-accent/20 text-accent justify-start"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
