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
import { Users, Plus, Search, Filter, Mail, Phone, Calendar, Star, TrendingUp, UserPlus, Target, MoreHorizontal, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BusinessLeads() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'manual',
    notes: ''
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewLeadData({ name: '', email: '', phone: '', source: 'manual', notes: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/leads/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-500/10 text-blue-400';
      case 'contacted':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'qualified':
        return 'bg-green-500/10 text-green-400';
      case 'converted':
        return 'bg-purple-500/10 text-purple-400';
      case 'lost':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success';
    if (score >= 60) return 'bg-warning/10 text-warning';
    if (score >= 40) return 'bg-accent/10 text-accent';
    return 'bg-gray-500/10 text-gray-400';
  };

  const getSourceColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'chatbot':
        return 'bg-primary/10 text-primary';
      case 'website':
        return 'bg-secondary/10 text-secondary';
      case 'manual':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const filteredLeads = (Array.isArray(leads) ? leads : []).filter((lead: any) => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleCreateLead = () => {
    if (!newLeadData.name.trim() && !newLeadData.email.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least a name or email",
        variant: "destructive",
      });
      return;
    }

    createLeadMutation.mutate(newLeadData);
  };

  const handleUpdateStatus = (leadId: string, status: string) => {
    updateLeadMutation.mutate({
      id: leadId,
      data: { status }
    });
  };

  const leadsArray = Array.isArray(leads) ? leads : [];
  const leadStats = {
    total: leadsArray.length,
    new: leadsArray.filter((l: any) => l.status === 'new').length,
    qualified: leadsArray.filter((l: any) => l.status === 'qualified').length,
    converted: leadsArray.filter((l: any) => l.status === 'converted').length,
    avgScore: leadsArray.length > 0 ? leadsArray.reduce((sum: number, lead: any) => sum + (lead.score || 0), 0) / leadsArray.length : 0
  };

  return (
    <DashboardLayout title="Lead Management" description="Track and manage your customer leads and conversions">
      <div className="space-y-6">
        {/* Lead Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{leadStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <UserPlus className="text-blue-400 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">New Leads</p>
                  <p className="text-2xl font-bold text-white">{leadStats.new}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Target className="text-success w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Qualified</p>
                  <p className="text-2xl font-bold text-white">{leadStats.qualified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <TrendingUp className="text-secondary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg. Score</p>
                  <p className="text-2xl font-bold text-white">{leadStats.avgScore.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Management */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">All Leads</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your customer leads and track conversion progress
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-border">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Lead</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new lead manually
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={newLeadData.name}
                        onChange={(e) => setNewLeadData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLeadData.email}
                        onChange={(e) => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone</Label>
                      <Input
                        id="phone"
                        value={newLeadData.phone}
                        onChange={(e) => setNewLeadData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="source" className="text-white">Source</Label>
                      <Select 
                        value={newLeadData.source} 
                        onValueChange={(value) => setNewLeadData(prev => ({ ...prev, source: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border">
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="chatbot">Chatbot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-white">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newLeadData.notes}
                        onChange={(e) => setNewLeadData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any notes about this lead..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                      <Button 
                        onClick={handleCreateLead}
                        disabled={createLeadMutation.isPending}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
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
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="chatbot">Chatbot</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leads Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Contact
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Source
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Score
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Created
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leadsLoading ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={i}>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32 bg-gray-700" />
                                <Skeleton className="h-3 w-24 bg-gray-700" />
                              </div>
                            </div>
                          </td>
                          <td className="p-4"><Skeleton className="h-6 w-16 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-6 w-12 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-6 w-20 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-20 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-8 w-8 bg-gray-700" /></td>
                        </tr>
                      ))
                    ) : filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No leads found</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Leads will appear here when captured by your chatbot'
                            }
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead: any) => (
                        <tr key={lead.id} className="hover:bg-gray-800/25">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {lead.name?.charAt(0) || lead.email?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {lead.name || 'Anonymous'}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                  {lead.email && (
                                    <span className="flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {lead.email}
                                    </span>
                                  )}
                                  {lead.phone && (
                                    <span className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {lead.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getSourceColor(lead.source)}>
                              {lead.source || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Badge className={getScoreColor(lead.score || 0)}>
                                {lead.score || 0}
                              </Badge>
                              {lead.score >= 80 && <Star className="w-4 h-4 text-yellow-400" />}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status || 'New'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(lead.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-surface border-border" align="end">
                                <DropdownMenuItem 
                                  onClick={() => setSelectedLead(lead)}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(lead.id, 'contacted')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Mark as Contacted
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(lead.id, 'qualified')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Mark as Qualified
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(lead.id, 'converted')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Mark as Converted
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Details Modal */}
        {selectedLead && (
          <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
            <DialogContent className="bg-surface border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedLead.name || 'Anonymous Lead'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Lead details and interaction history
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Name</Label>
                    <p className="text-gray-300 mt-1">{selectedLead.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-white">Email</Label>
                    <p className="text-gray-300 mt-1">{selectedLead.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-white">Phone</Label>
                    <p className="text-gray-300 mt-1">{selectedLead.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-white">Source</Label>
                    <Badge className={`mt-1 ${getSourceColor(selectedLead.source)}`}>
                      {selectedLead.source || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white">Score</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getScoreColor(selectedLead.score || 0)}>
                        {selectedLead.score || 0}
                      </Badge>
                      {selectedLead.score >= 80 && <Star className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status || 'New'}
                    </Badge>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div>
                    <Label className="text-white">Notes</Label>
                    <p className="text-gray-300 mt-1 bg-gray-800/50 p-3 rounded-lg">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                {selectedLead.metadata && (
                  <div>
                    <Label className="text-white">Additional Information</Label>
                    <div className="mt-1 bg-gray-800/50 p-3 rounded-lg">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(selectedLead.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4">
                  <Button
                    onClick={() => handleUpdateStatus(selectedLead.id, 'contacted')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Mark as Contacted
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedLead.id, 'qualified')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Qualified
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedLead(null)}>
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
