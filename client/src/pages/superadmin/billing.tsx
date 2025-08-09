import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, DollarSign, TrendingUp, Users, Building2, Calendar, Search, Filter, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SuperAdminBilling() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["/api/superadmin/tenants"],
    retry: false,
  });

  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/superadmin/stats"],
    retry: false,
  });

  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/superadmin/tenants/${id}`, data);
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
        return 'bg-success/10 text-success';
      case 'trialing':
        return 'bg-primary/10 text-primary';
      case 'past_due':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'bg-secondary/10 text-secondary';
      case 'professional':
        return 'bg-accent/10 text-accent';
      case 'starter':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 199;
      case 'professional':
        return 99;
      case 'starter':
        return 29;
      default:
        return 0;
    }
  };

  const filteredTenants = tenants?.filter((tenant: any) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.subscriptionPlan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  }) || [];

  const totalMRR = filteredTenants
    .filter((tenant: any) => tenant.subscriptionStatus === 'active')
    .reduce((sum: number, tenant: any) => sum + getPlanPrice(tenant.subscriptionPlan), 0);

  const handleUpdatePlan = (tenantId: string, plan: string) => {
    updateTenantMutation.mutate({
      id: tenantId,
      data: { subscriptionPlan: plan }
    });
  };

  const handleUpdateStatus = (tenantId: string, status: string) => {
    updateTenantMutation.mutate({
      id: tenantId,
      data: { subscriptionStatus: status }
    });
  };

  return (
    <DashboardLayout title="Billing & Subscriptions" description="Manage platform billing, subscriptions, and revenue">
      <div className="space-y-6">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <DollarSign className="text-success w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalMRR.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  12.5%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Subscribers</p>
                  <p className="text-2xl font-bold text-white">
                    {tenants?.filter((t: any) => t.subscriptionStatus === 'active').length || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  8.2%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <CreditCard className="text-accent w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Trial Conversions</p>
                  <p className="text-2xl font-bold text-white">24.5%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-success flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  4.1%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Calendar className="text-warning w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Churn Rate</p>
                  <p className="text-2xl font-bold text-white">2.1%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-error flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                  0.5%
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-white">Subscription Management</CardTitle>
            <CardDescription className="text-gray-400">
              Manage tenant subscriptions and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenants..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border">
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscriptions Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Tenant
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Plan
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        MRR
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Next Billing
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider p-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tenantsLoading ? (
                      [...Array(5)].map((_, i) => (
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
                          <td className="p-4"><Skeleton className="h-6 w-20 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-6 w-16 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-12 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-4 w-20 bg-gray-700" /></td>
                          <td className="p-4"><Skeleton className="h-8 w-8 bg-gray-700" /></td>
                        </tr>
                      ))
                    ) : filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">No tenants found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((tenant: any) => (
                        <tr key={tenant.id} className="hover:bg-gray-800/25">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{tenant.name}</p>
                                <p className="text-xs text-gray-400">{tenant.domain || 'No domain'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getPlanColor(tenant.subscriptionPlan)}>
                              {tenant.subscriptionPlan || 'No plan'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(tenant.subscriptionStatus)}>
                              {tenant.subscriptionStatus}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-white font-medium">
                              ${getPlanPrice(tenant.subscriptionPlan)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-400">
                              {tenant.subscriptionEndsAt 
                                ? new Date(tenant.subscriptionEndsAt).toLocaleDateString()
                                : 'N/A'
                              }
                            </span>
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
                                  onClick={() => handleUpdatePlan(tenant.id, 'starter')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Change to Starter
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdatePlan(tenant.id, 'professional')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Change to Professional
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdatePlan(tenant.id, 'enterprise')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Change to Enterprise
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(tenant.id, tenant.subscriptionStatus === 'active' ? 'cancelled' : 'active')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  {tenant.subscriptionStatus === 'active' ? 'Cancel' : 'Activate'} Subscription
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
      </div>
    </DashboardLayout>
  );
}
