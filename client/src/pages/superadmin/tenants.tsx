import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Edit, Eye, MoreHorizontal, Users, MessageSquare, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SuperAdminTenants() {
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    domain: '',
    website: '',
    subscriptionPlan: 'starter'
  });

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["/api/superadmin/tenants"],
    retry: false,
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/superadmin/tenants", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/tenants"] });
      toast({
        title: "Success",
        description: "Tenant created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewTenantData({ name: '', domain: '', website: '', subscriptionPlan: 'starter' });
    },
    onError: (error) => {
      console.error("Tenant creation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create tenant",
        variant: "destructive",
      });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest(`/api/superadmin/tenants/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/tenants"] });
      toast({
        title: "Success",
        description: "Tenant updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update tenant",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400';
      case 'trialing':
        return 'bg-blue-500/10 text-blue-400';
      case 'past_due':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const handleCreateTenant = () => {
    if (!newTenantData.name.trim()) {
      toast({
        title: "Error",
        description: "Tenant name is required",
        variant: "destructive",
      });
      return;
    }

    createTenantMutation.mutate(newTenantData);
  };

  const handleUpdateStatus = (tenantId: string, status: string) => {
    updateTenantMutation.mutate({
      id: tenantId,
      data: { subscriptionStatus: status }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Tenant Management" description="Manage all platform tenants and their subscriptions">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 bg-gray-700" />
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Tenant Management" description="Manage all platform tenants and their subscriptions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              All Tenants ({tenants?.length || 0})
            </h2>
            <p className="text-sm text-gray-400">
              Manage tenant accounts, subscriptions, and access
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface border-border">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Tenant</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new tenant to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Business Name</Label>
                  <Input
                    id="name"
                    value={newTenantData.name}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter business name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="domain" className="text-white">Domain</Label>
                  <Input
                    id="domain"
                    value={newTenantData.domain}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="text-white">Website URL</Label>
                  <Input
                    id="website"
                    value={newTenantData.website}
                    onChange={(e) => setNewTenantData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="plan" className="text-white">Subscription Plan</Label>
                  <Select 
                    value={newTenantData.subscriptionPlan} 
                    onValueChange={(value) => setNewTenantData(prev => ({ ...prev, subscriptionPlan: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border">
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Button 
                    onClick={handleCreateTenant}
                    disabled={createTenantMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Tenant
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

        {/* Tenants Grid */}
        {tenants?.length === 0 ? (
          <Card className="bg-surface border-border">
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Tenants Found</h3>
              <p className="text-gray-400 mb-6">
                Create your first tenant to get started
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Create First Tenant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants?.map((tenant: any) => (
              <Card key={tenant.id} className="bg-surface border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{tenant.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {tenant.domain || 'No domain'}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-surface border-border" align="end">
                        <DropdownMenuItem 
                          onClick={() => setSelectedTenant(tenant)}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateStatus(tenant.id, tenant.subscriptionStatus === 'active' ? 'inactive' : 'active')}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {tenant.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <Badge className={getStatusColor(tenant.subscriptionStatus)}>
                        {tenant.subscriptionStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Plan</span>
                      <span className="text-sm text-white font-medium">
                        {tenant.subscriptionPlan || 'No plan'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Created</span>
                      <span className="text-sm text-white">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {tenant.website && (
                      <div className="pt-2">
                        <a 
                          href={tenant.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary/80 underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tenant Details Modal */}
        {selectedTenant && (
          <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
            <DialogContent className="bg-surface border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedTenant.name}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Tenant details and statistics
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Business Name</Label>
                    <p className="text-gray-300 mt-1">{selectedTenant.name}</p>
                  </div>
                  <div>
                    <Label className="text-white">Domain</Label>
                    <p className="text-gray-300 mt-1">{selectedTenant.domain || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-white">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedTenant.subscriptionStatus)}`}>
                      {selectedTenant.subscriptionStatus}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white">Plan</Label>
                    <p className="text-gray-300 mt-1">{selectedTenant.subscriptionPlan || 'No plan'}</p>
                  </div>
                </div>

                {selectedTenant.website && (
                  <div>
                    <Label className="text-white">Website</Label>
                    <a 
                      href={selectedTenant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline block mt-1"
                    >
                      {selectedTenant.website}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Users</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Conversations</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                    <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400">Appointments</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Button
                    onClick={() => handleUpdateStatus(selectedTenant.id, selectedTenant.subscriptionStatus === 'active' ? 'inactive' : 'active')}
                    variant={selectedTenant.subscriptionStatus === 'active' ? 'destructive' : 'default'}
                    className={selectedTenant.subscriptionStatus === 'active' ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {selectedTenant.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'} Tenant
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTenant(null)}>
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
