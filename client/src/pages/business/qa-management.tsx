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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Plus, Search, Tag, TrendingUp, MoreHorizontal, Edit, Trash2, Eye, Brain } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function QAManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKB, setSelectedKB] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newKBData, setNewKBData] = useState({
    question: '',
    answer: '',
    tags: '',
    isActive: true
  });
  const [editKBData, setEditKBData] = useState<any>(null);

  const { data: knowledgeBase, isLoading: kbLoading } = useQuery({
    queryKey: ["/api/knowledge-base"],
    retry: false,
  });

  const createKBMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/knowledge-base", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({
        title: "Success",
        description: "Q&A item created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewKBData({
        question: '',
        answer: '',
        tags: '',
        isActive: true
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create Q&A item",
        variant: "destructive",
      });
    },
  });

  const updateKBMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/knowledge-base/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({
        title: "Success",
        description: "Q&A item updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditKBData(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update Q&A item",
        variant: "destructive",
      });
    },
  });

  const deleteKBMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/knowledge-base/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base"] });
      toast({
        title: "Success",
        description: "Q&A item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete Q&A item",
        variant: "destructive",
      });
    },
  });

  const filteredKB = knowledgeBase?.filter((item: any) => {
    const matchesSearch = item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }) || [];

  const kbStats = {
    total: knowledgeBase?.length || 0,
    active: knowledgeBase?.filter((kb: any) => kb.isActive).length || 0,
    totalUsage: knowledgeBase?.reduce((sum: number, kb: any) => sum + (kb.usage_count || 0), 0) || 0,
    avgUsage: knowledgeBase?.length ? 
      (knowledgeBase.reduce((sum: number, kb: any) => sum + (kb.usage_count || 0), 0) / knowledgeBase.length).toFixed(1) : 0
  };

  const handleCreateKB = () => {
    if (!newKBData.question.trim() || !newKBData.answer.trim()) {
      toast({
        title: "Error",
        description: "Both question and answer are required",
        variant: "destructive",
      });
      return;
    }

    const tags = newKBData.tags ? newKBData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    createKBMutation.mutate({
      ...newKBData,
      tags
    });
  };

  const handleEditKB = (item: any) => {
    setEditKBData({
      ...item,
      tags: item.tags ? item.tags.join(', ') : ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateKB = () => {
    if (!editKBData?.question?.trim() || !editKBData?.answer?.trim()) {
      toast({
        title: "Error",
        description: "Both question and answer are required",
        variant: "destructive",
      });
      return;
    }

    const tags = editKBData.tags ? editKBData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

    updateKBMutation.mutate({
      id: editKBData.id,
      data: {
        ...editKBData,
        tags
      }
    });
  };

  const handleDeleteKB = (id: string) => {
    if (confirm('Are you sure you want to delete this Q&A item?')) {
      deleteKBMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateKBMutation.mutate({
      id,
      data: { isActive }
    });
  };

  return (
    <DashboardLayout title="Q&A Management" description="Manage your chatbot's knowledge base with custom questions and answers">
      <div className="space-y-6">
        {/* Knowledge Base Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Q&A Items</p>
                  <p className="text-2xl font-bold text-white">{kbStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Brain className="text-success w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Items</p>
                  <p className="text-2xl font-bold text-white">{kbStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="text-accent w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Usage</p>
                  <p className="text-2xl font-bold text-white">{kbStats.totalUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Tag className="text-secondary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg. Usage</p>
                  <p className="text-2xl font-bold text-white">{kbStats.avgUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Base Management */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Knowledge Base</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage custom questions and answers to train your chatbot
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Q&A
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Q&A</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new question and answer pair for your chatbot
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question" className="text-white">Question</Label>
                      <Textarea
                        id="question"
                        value={newKBData.question}
                        onChange={(e) => setNewKBData(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter the question customers might ask..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="answer" className="text-white">Answer</Label>
                      <Textarea
                        id="answer"
                        value={newKBData.answer}
                        onChange={(e) => setNewKBData(prev => ({ ...prev, answer: e.target.value }))}
                        placeholder="Enter the answer your chatbot should provide..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={newKBData.tags}
                        onChange={(e) => setNewKBData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g., pricing, support, features"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={newKBData.isActive}
                        onCheckedChange={(checked) => setNewKBData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="active" className="text-white">
                        Active
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                      <Button 
                        onClick={handleCreateKB}
                        disabled={createKBMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Create Q&A
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
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
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions, answers, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Knowledge Base Items */}
            <div className="space-y-4">
              {kbLoading ? (
                [...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-gray-800/50 border-border">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4 bg-gray-700" />
                        <Skeleton className="h-16 w-full bg-gray-700" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-32 bg-gray-700" />
                          <Skeleton className="h-6 w-20 bg-gray-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredKB.length === 0 ? (
                <Card className="bg-gray-800/50 border-border">
                  <CardContent className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Q&A Items Found</h3>
                    <p className="text-gray-400 mb-6">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first Q&A to train your chatbot'}
                    </p>
                    {!searchTerm && (
                      <Button 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Create First Q&A
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredKB.map((item: any) => (
                  <Card key={item.id} className="bg-gray-800/50 border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-2">{item.question}</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-surface border-border" align="end">
                              <DropdownMenuItem 
                                onClick={() => setSelectedKB(item)}
                                className="text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEditKB(item)}
                                className="text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Q&A
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteKB(item.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              Used {item.usage_count || 0} times
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={item.isActive}
                              onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                              size="sm"
                            />
                            <Badge variant={item.isActive ? "default" : "secondary"}>
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Q&A Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-surface border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Q&A</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your question and answer
              </DialogDescription>
            </DialogHeader>
            {editKBData && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-question" className="text-white">Question</Label>
                  <Textarea
                    id="edit-question"
                    value={editKBData.question}
                    onChange={(e) => setEditKBData((prev: any) => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question customers might ask..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-answer" className="text-white">Answer</Label>
                  <Textarea
                    id="edit-answer"
                    value={editKBData.answer}
                    onChange={(e) => setEditKBData((prev: any) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter the answer your chatbot should provide..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags" className="text-white">Tags (comma-separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editKBData.tags}
                    onChange={(e) => setEditKBData((prev: any) => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., pricing, support, features"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editKBData.isActive}
                    onCheckedChange={(checked) => setEditKBData((prev: any) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-active" className="text-white">
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Button 
                    onClick={handleUpdateKB}
                    disabled={updateKBMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Update Q&A
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Q&A Details Modal */}
        {selectedKB && (
          <Dialog open={!!selectedKB} onOpenChange={() => setSelectedKB(null)}>
            <DialogContent className="bg-surface border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Q&A Details</DialogTitle>
                <DialogDescription className="text-gray-400">
                  View question and answer details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label className="text-white">Question</Label>
                  <p className="text-gray-300 mt-1 bg-gray-800/50 p-3 rounded-lg">
                    {selectedKB.question}
                  </p>
                </div>
                <div>
                  <Label className="text-white">Answer</Label>
                  <p className="text-gray-300 mt-1 bg-gray-800/50 p-3 rounded-lg">
                    {selectedKB.answer}
                  </p>
                </div>
                {selectedKB.tags && selectedKB.tags.length > 0 && (
                  <div>
                    <Label className="text-white">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedKB.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Status</Label>
                    <Badge className={`mt-1 ${selectedKB.isActive ? 'bg-success/10 text-success' : 'bg-gray-500/10 text-gray-400'}`}>
                      {selectedKB.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white">Usage Count</Label>
                    <p className="text-gray-300 mt-1">{selectedKB.usage_count || 0} times</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Button
                    onClick={() => handleEditKB(selectedKB)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Edit Q&A
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedKB(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
