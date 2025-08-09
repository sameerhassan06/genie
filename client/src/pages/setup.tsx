import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SetupStatus {
  hasSuperadmin: boolean;
  totalUsers: number;
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

  // If setup is complete and user is not superadmin, redirect
  if (setupStatus?.hasSuperadmin && user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              The platform has already been set up. Please contact your administrator for access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/api/logout'} 
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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

          {setupStatus?.hasSuperadmin && user?.role === 'superadmin' && (
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