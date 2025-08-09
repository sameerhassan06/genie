import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Globe, Plus, Download, Zap, CheckCircle, AlertCircle, Clock, FileText, Trash2, RefreshCw } from "lucide-react";

export default function AITraining() {
  const { toast } = useToast();
  const [selectedChatbot, setSelectedChatbot] = useState<string>("");
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isScrapeDialogOpen, setIsScrapeDialogOpen] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");

  const { data: chatbots, isLoading: chatbotsLoading } = useQuery({
    queryKey: ["/api/chatbots"],
    retry: false,
  });

  const { data: websiteContent, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/website-content"],
    retry: false,
  });

  const scrapeWebsiteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/ai/scrape-website", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-content"] });
      toast({
        title: "Success",
        description: "Website content scraped successfully",
      });
      setIsScrapeDialogOpen(false);
      setScrapeUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to scrape website content",
        variant: "destructive",
      });
    },
  });

  const trainAIMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/ai/train", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
      toast({
        title: "Success",
        description: "AI training completed successfully",
      });
      setIsTraining(false);
      setTrainingProgress(0);
      setSelectedContent([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to train AI",
        variant: "destructive",
      });
      setIsTraining(false);
      setTrainingProgress(0);
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/website-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-content"] });
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const contentStats = {
    total: websiteContent?.length || 0,
    active: websiteContent?.filter((c: any) => c.isActive).length || 0,
    totalWords: websiteContent?.reduce((sum: number, content: any) => 
      sum + (content.content?.split(' ').length || 0), 0) || 0,
    avgWords: websiteContent?.length ? 
      Math.round((websiteContent.reduce((sum: number, content: any) => 
        sum + (content.content?.split(' ').length || 0), 0) / websiteContent.length)) : 0
  };

  const handleScrapeWebsite = () => {
    if (!scrapeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(scrapeUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    scrapeWebsiteMutation.mutate({ url: scrapeUrl });
  };

  const handleTrainAI = () => {
    if (!selectedChatbot) {
      toast({
        title: "Error",
        description: "Please select a chatbot to train",
        variant: "destructive",
      });
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    trainAIMutation.mutate({
      chatbotId: selectedChatbot,
      contentIds: selectedContent
    });
  };

  const handleSelectAllContent = (checked: boolean) => {
    if (checked) {
      setSelectedContent(websiteContent?.map((c: any) => c.id) || []);
    } else {
      setSelectedContent([]);
    }
  };

  const handleSelectContent = (contentId: string, checked: boolean) => {
    if (checked) {
      setSelectedContent(prev => [...prev, contentId]);
    } else {
      setSelectedContent(prev => prev.filter(id => id !== contentId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout title="AI Training" description="Train your chatbot with website content and knowledge">
      <div className="space-y-6">
        {/* Training Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Content Pages</p>
                  <p className="text-2xl font-bold text-white">{contentStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="text-success w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Content</p>
                  <p className="text-2xl font-bold text-white">{contentStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Brain className="text-accent w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Words</p>
                  <p className="text-2xl font-bold text-white">{contentStats.totalWords.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Globe className="text-secondary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg. Words/Page</p>
                  <p className="text-2xl font-bold text-white">{contentStats.avgWords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Training Section */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Training Center
            </CardTitle>
            <CardDescription className="text-gray-400">
              Train your chatbot with scraped content and improve its responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Training Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Select Chatbot</Label>
                  <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a chatbot to train" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border">
                      {chatbots?.map((chatbot: any) => (
                        <SelectItem key={chatbot.id} value={chatbot.id}>
                          {chatbot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleTrainAI}
                    disabled={!selectedChatbot || selectedContent.length === 0 || isTraining || trainAIMutation.isPending}
                    className="bg-primary hover:bg-primary/90 w-full"
                  >
                    {isTraining || trainAIMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Training AI...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Training Progress */}
              {(isTraining || trainAIMutation.isPending) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Training Progress</Label>
                    <span className="text-sm text-gray-400">{Math.round(trainingProgress)}%</span>
                  </div>
                  <Progress value={trainingProgress} className="w-full" />
                  <p className="text-sm text-gray-400">
                    Processing content and updating AI knowledge base...
                  </p>
                </div>
              )}

              {/* Content Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-white">Select Content for Training</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={websiteContent?.length > 0 && selectedContent.length === websiteContent.length}
                      onCheckedChange={handleSelectAllContent}
                    />
                    <Label htmlFor="select-all" className="text-sm text-gray-400">
                      Select All ({websiteContent?.length || 0})
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Selected: {selectedContent.length} / {websiteContent?.length || 0} content items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Website Content Scraping */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Website Content
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Scrape and manage content from your website
                </CardDescription>
              </div>
              <Dialog open={isScrapeDialogOpen} onOpenChange={setIsScrapeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Scrape Website
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-border">
                  <DialogHeader>
                    <DialogTitle className="text-white">Scrape Website Content</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter a URL to scrape content for AI training
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="url" className="text-white">Website URL</Label>
                      <Input
                        id="url"
                        type="url"
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                      <Button 
                        onClick={handleScrapeWebsite}
                        disabled={scrapeWebsiteMutation.isPending}
                        className="bg-accent hover:bg-accent/90"
                      >
                        {scrapeWebsiteMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Scraping...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Scrape Content
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsScrapeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {contentLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-gray-800/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4 bg-gray-700" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4 bg-gray-700" />
                          <Skeleton className="h-4 w-1/2 bg-gray-700" />
                          <Skeleton className="h-3 w-full bg-gray-700" />
                        </div>
                        <Skeleton className="h-6 w-16 bg-gray-700" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : websiteContent?.length === 0 ? (
              <Card className="bg-gray-800/50 border-border">
                <CardContent className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Content Found</h3>
                  <p className="text-gray-400 mb-6">
                    Scrape your website content to start training your AI chatbot
                  </p>
                  <Button 
                    onClick={() => setIsScrapeDialogOpen(true)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    Scrape First Page
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {websiteContent?.map((content: any) => (
                  <Card key={content.id} className="bg-gray-800/50 border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedContent.includes(content.id)}
                          onCheckedChange={(checked) => handleSelectContent(content.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{content.title || 'Untitled Page'}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={content.isActive ? "default" : "secondary"}>
                                {content.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContentMutation.mutate(content.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{content.url}</p>
                          <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                            {content.content?.substring(0, 200)}...
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>{content.content?.split(' ').length || 0} words</span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(content.extractedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
