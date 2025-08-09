import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, MessageSquare, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not superadmin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'superadmin')) {
      toast({
        title: "Unauthorized",
        description: "You need superadmin access to view this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/superadmin/stats"],
    retry: false,
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["/api/superadmin/tenants"],
    retry: false,
  });

  if (isLoading || !isAuthenticated || user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

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

  return (
    <DashboardLayout title="Platform Overview" description="Monitor platform-wide metrics and tenant activity">
      <div className="space-y-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tenants"
            value={platformStats?.totalTenants || 0}
            icon={Building2}
            change={12.5}
            loading={statsLoading}
          />
          <StatsCard
            title="Active Tenants"
            value={platformStats?.activeTenants || 0}
            icon={CheckCircle}
            change={8.2}
            loading={statsLoading}
          />
          <StatsCard
            title="Total Conversations"
            value={platformStats?.totalConversations || 0}
            icon={MessageSquare}
            change={15.3}
            loading={statsLoading}
          />
          <StatsCard
            title="Total Leads"
            value={platformStats?.totalLeads || 0}
            icon={Users}
            change={23.1}
            loading={statsLoading}
          />
        </div>

        {/* Platform Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Platform Health
              </CardTitle>
              <CardDescription className="text-gray-400">
                System status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">System Status</span>
                  <Badge className="bg-green-500/10 text-green-400">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Database</span>
                  <Badge className="bg-green-500/10 text-green-400">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">API Response Time</span>
                  <span className="text-white">45ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Uptime</span>
                  <span className="text-white">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Alerts
              </CardTitle>
              <CardDescription className="text-gray-400">
                System alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white">High API usage detected</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white">Database backup completed</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white">New tenant onboarded</p>
                    <p className="text-xs text-gray-400">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/tenants">
                  <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    Manage Tenants
                  </Button>
                </Link>
                <Link href="/billing">
                  <Button className="w-full bg-secondary/10 hover:bg-secondary/20 text-secondary justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Billing
                  </Button>
                </Link>
                <Button className="w-full bg-accent/10 hover:bg-accent/20 text-accent justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  System Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenants */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Tenants</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest tenant registrations and activity
                </CardDescription>
              </div>
              <Link href="/tenants">
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  View all tenants
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {tenantsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tenants?.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tenants found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tenants?.slice(0, 10).map((tenant: any) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{tenant.name}</h4>
                        <p className="text-sm text-gray-400">{tenant.domain || 'No domain'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(tenant.subscriptionStatus)}>
                        {tenant.subscriptionStatus}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {tenant.subscriptionPlan || 'No plan'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
