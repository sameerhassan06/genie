import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FlowBuilder from "@/components/chatbot/FlowBuilder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Palette, Code, Eye } from "lucide-react";

export default function ChatbotDesigner() {
  const { toast } = useToast();
  const [selectedChatbot, setSelectedChatbot] = useState<string | null>(null);
  const [newChatbotName, setNewChatbotName] = useState("");

  const { data: chatbots, isLoading } = useQuery({
    queryKey: ["/api/chatbots"],
    retry: false,
  });

  const chatbotsArray = Array.isArray(chatbots) ? chatbots : [];

  const createChatbotMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/chatbots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
      toast({
        title: "Success",
        description: "Chatbot created successfully",
      });
      setNewChatbotName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create chatbot",
        variant: "destructive",
      });
    },
  });

  const updateChatbotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/chatbots/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
      toast({
        title: "Success",
        description: "Chatbot updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update chatbot",
        variant: "destructive",
      });
    },
  });

  const handleCreateChatbot = () => {
    if (!newChatbotName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a chatbot name",
        variant: "destructive",
      });
      return;
    }

    createChatbotMutation.mutate({
      name: newChatbotName,
      description: "",
      welcomeMessage: "Hi! How can I help you today?",
      fallbackMessage: "I'm sorry, I didn't understand that. Can you please rephrase your question?",
      theme: {
        primaryColor: "#6366F1",
        secondaryColor: "#8B5CF6",
        backgroundColor: "#FFFFFF",
        textColor: "#000000",
      },
      flows: {},
    });
  };

  const currentChatbot = chatbotsArray.find((bot: any) => bot.id === selectedChatbot);

  const handleUpdateChatbot = (field: string, value: any) => {
    if (!selectedChatbot) return;

    updateChatbotMutation.mutate({
      id: selectedChatbot,
      data: { [field]: value },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading chatbots...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Chatbot Designer</h1>
            <p className="text-gray-400">Create and customize your chatbot experience</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter chatbot name"
                value={newChatbotName}
                onChange={(e) => setNewChatbotName(e.target.value)}
                className="w-48"
              />
              <Button 
                onClick={handleCreateChatbot} 
                disabled={createChatbotMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Chatbot
              </Button>
            </div>
          </div>
        </div>

        {/* Chatbot Selection */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Select Chatbot</CardTitle>
            <CardDescription className="text-gray-400">
              Choose a chatbot to edit or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatbotsArray.map((chatbot: any) => (
                <Card
                  key={chatbot.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    selectedChatbot === chatbot.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-600 hover:border-gray-500 bg-gray-700"
                  }`}
                  onClick={() => setSelectedChatbot(chatbot.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{chatbot.name}</h3>
                      <Badge variant={chatbot.isActive ? "default" : "secondary"}>
                        {chatbot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{chatbot.description || "No description"}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Status: {chatbot.status}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Editor */}
        {selectedChatbot && currentChatbot && (
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="flows" className="data-[state=active]:bg-primary">
                <Code className="w-4 h-4 mr-2" />
                Conversation Flows
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-primary">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-primary">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Basic Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your chatbot's basic information and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Chatbot Name</Label>
                        <Input
                          id="name"
                          value={currentChatbot.name}
                          onChange={(e) => handleUpdateChatbot("name", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea
                          id="description"
                          value={currentChatbot.description || ""}
                          onChange={(e) => handleUpdateChatbot("description", e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="status" className="text-white">Status</Label>
                        <Select
                          value={currentChatbot.status}
                          onValueChange={(value) => handleUpdateChatbot("status", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="welcome" className="text-white">Welcome Message</Label>
                        <Textarea
                          id="welcome"
                          value={currentChatbot.welcomeMessage || ""}
                          onChange={(e) => handleUpdateChatbot("welcomeMessage", e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fallback" className="text-white">Fallback Message</Label>
                        <Textarea
                          id="fallback"
                          value={currentChatbot.fallbackMessage || ""}
                          onChange={(e) => handleUpdateChatbot("fallbackMessage", e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={currentChatbot.isActive}
                          onCheckedChange={(checked) => handleUpdateChatbot("isActive", checked)}
                        />
                        <Label htmlFor="active" className="text-white">
                          Active on Website
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flows">
              <FlowBuilder
                chatbot={currentChatbot}
                onUpdate={(flows) => handleUpdateChatbot("flows", flows)}
              />
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Chatbot Appearance</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize the look and feel of your chatbot widget
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Primary Color</Label>
                        <Input
                          type="color"
                          value={currentChatbot.theme?.primaryColor || "#6366F1"}
                          onChange={(e) => handleUpdateChatbot("theme", {
                            ...currentChatbot.theme,
                            primaryColor: e.target.value
                          })}
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Secondary Color</Label>
                        <Input
                          type="color"
                          value={currentChatbot.theme?.secondaryColor || "#8B5CF6"}
                          onChange={(e) => handleUpdateChatbot("theme", {
                            ...currentChatbot.theme,
                            secondaryColor: e.target.value
                          })}
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Background Color</Label>
                        <Input
                          type="color"
                          value={currentChatbot.theme?.backgroundColor || "#FFFFFF"}
                          onChange={(e) => handleUpdateChatbot("theme", {
                            ...currentChatbot.theme,
                            backgroundColor: e.target.value
                          })}
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Text Color</Label>
                        <Input
                          type="color"
                          value={currentChatbot.theme?.textColor || "#000000"}
                          onChange={(e) => handleUpdateChatbot("theme", {
                            ...currentChatbot.theme,
                            textColor: e.target.value
                          })}
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Chatbot Preview</CardTitle>
                  <CardDescription className="text-gray-400">
                    See how your chatbot will appear to visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-700 rounded-lg p-6 min-h-96">
                    <div className="max-w-sm mx-auto">
                      {/* Chatbot Widget Preview */}
                      <div className="bg-white rounded-lg shadow-xl border overflow-hidden">
                        <div 
                          className="text-white p-4 flex items-center justify-between"
                          style={{ backgroundColor: currentChatbot.theme?.primaryColor || "#6366F1" }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-sm">🤖</span>
                            </div>
                            <span className="font-medium">{currentChatbot.name}</span>
                          </div>
                        </div>
                        <div className="p-4 h-64 overflow-y-auto" style={{ backgroundColor: currentChatbot.theme?.backgroundColor || "#FFFFFF" }}>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: currentChatbot.theme?.primaryColor || "#6366F1" }}
                              >
                                <span className="text-white text-xs">🤖</span>
                              </div>
                              <div 
                                className="p-3 rounded-lg shadow-sm max-w-xs"
                                style={{ backgroundColor: "#F3F4F6", color: currentChatbot.theme?.textColor || "#000000" }}
                              >
                                <p className="text-sm">{currentChatbot.welcomeMessage}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              placeholder="Type your message..." 
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              style={{ color: currentChatbot.theme?.textColor || "#000000" }}
                            />
                            <button 
                              className="text-white p-2 rounded-lg"
                              style={{ backgroundColor: currentChatbot.theme?.primaryColor || "#6366F1" }}
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
