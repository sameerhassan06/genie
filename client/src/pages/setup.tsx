import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, Users, Building } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SetupStatus {
  hasSuperadmin: boolean;
  totalUsers: number;
}

function TenantSetup({ user }: { user: any }) {
  const [tenantData, setTenantData] = useState({
    name: "",
    domain: "",
    website: ""
  });

  const createTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/tenants", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      window.location.href = "/";
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenantMutation.mutate(tenantData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building className="h-16 w-16 mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Create Your Business Tenant</CardTitle>
          <CardDescription>
            Set up your business profile to start creating AI chatbots
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Business Name"
                value={tenantData.name}
                onChange={(e) => setTenantData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="domain">Domain (Optional)</Label>
              <Input
                id="domain"
                type="text"
                placeholder="yourbusiness.com"
                value={tenantData.domain}
                onChange={(e) => setTenantData(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourbusiness.com"
                value={tenantData.website}
                onChange={(e) => setTenantData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={createTenantMutation.isPending}>
              {createTenantMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Tenant...
                </>
              ) : (
                'Create Tenant'
              )}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                fetch('/api/logout', { method: 'POST', credentials: 'include' })
                  .then(() => window.location.href = '/');
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Setup() {
  const { user, isAuthenticated } = useAuth();
  const [promotionSuccess, setPromotionSuccess] = useState(false);

  // Check setup status
  const { data: setupStatus, isLoading: statusLoading } = useQuery<SetupStatus>({
    queryKey: ["/api/setup/status"],
    retry: false,
  });

  // Promote to superadmin mutation
  const promoteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/setup/promote-superadmin", "POST", {});
    },
    onSuccess: (data) => {
      setPromotionSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/setup/status"] });
    },
  });

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking setup status...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated but not superadmin, show tenant creation
  if (isAuthenticated && setupStatus?.hasSuperadmin && (user as any)?.role !== 'superadmin') {
    return <TenantSetup user={user} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Platform Setup</CardTitle>
          <CardDescription>
            {setupStatus?.hasSuperadmin
              ? "Welcome back, Administrator"
              : "Set up your multi-tenant chatbot platform"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to continue with the setup process.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full"
              >
                Sign In
              </Button>
            </div>
          )}

          {isAuthenticated && !setupStatus?.hasSuperadmin && !promotionSuccess && (
            <div className="space-y-4">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  You're the first user! Become the platform administrator to manage tenants and users.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>As a superadmin, you'll be able to:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Create and manage business tenants</li>
                  <li>View platform-wide analytics</li>
                  <li>Manage user roles and permissions</li>
                  <li>Monitor system performance</li>
                </ul>
              </div>

              <Button 
                onClick={() => promoteMutation.mutate()}
                disabled={promoteMutation.isPending}
                className="w-full"
              >
                {promoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Become Platform Administrator
                  </>
                )}
              </Button>
            </div>
          )}

          {promotionSuccess && (
            <div className="text-center space-y-4">
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Successfully set up as platform administrator!
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {setupStatus?.hasSuperadmin && (user as any)?.role === 'superadmin' && (
            <div className="text-center space-y-4">
              <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You are signed in as platform administrator.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {promoteMutation.isError && (
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertDescription>
                {promoteMutation.error instanceof Error 
                  ? promoteMutation.error.message 
                  : "Failed to set up administrator. Please try again."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}