import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  Database, 
  Mail, 
  Key,
  Save,
  RefreshCw
} from "lucide-react";

export default function SuperAdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Mock platform settings - in real app this would come from API
  const { data: platformSettings, isLoading } = useQuery({
    queryKey: ["/api/superadmin/platform-settings"],
    retry: false,
  });

  // Mock data for demonstration
  const settings = platformSettings || {
    platformName: "ChatBot Pro",
    platformUrl: "https://your-domain.com",
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxTenantsPerUser: 5,
    defaultTrialDays: 14,
    supportEmail: "support@chatbotpro.com",
    maintenanceMode: false,
    analyticsEnabled: true,
    backupFrequency: "daily"
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/superadmin/platform-settings", "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/platform-settings"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update platform settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    updateSettingsMutation.mutate(data);
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "security", label: "Security", icon: Shield },
    { id: "email", label: "Email", icon: Mail },
    { id: "system", label: "System", icon: Database }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground">Configure your multi-tenant chatbot platform</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Platform Admin
          </Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-background border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
                <CardDescription>Basic platform configuration and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action={handleSaveSettings}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input
                        id="platformName"
                        name="platformName"
                        defaultValue={settings.platformName}
                        placeholder="ChatBot Pro"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="platformUrl">Platform URL</Label>
                      <Input
                        id="platformUrl"
                        name="platformUrl"
                        type="url"
                        defaultValue={settings.platformUrl}
                        placeholder="https://your-domain.com"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        name="supportEmail"
                        type="email"
                        defaultValue={settings.supportEmail}
                        placeholder="support@chatbotpro.com"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4" disabled={updateSettingsMutation.isPending}>
                    {updateSettingsMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Settings</CardTitle>
                <CardDescription>Control user registration and tenant creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable new user registrations
                    </p>
                  </div>
                  <Switch defaultChecked={settings.registrationEnabled} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new users
                    </p>
                  </div>
                  <Switch defaultChecked={settings.emailVerificationRequired} />
                </div>
                
                <div className="grid gap-2">
                  <Label>Max Tenants per User</Label>
                  <Input
                    type="number"
                    defaultValue={settings.maxTenantsPerUser}
                    min="1"
                    max="50"
                    className="w-32"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Default Trial Days</Label>
                  <Input
                    type="number"
                    defaultValue={settings.defaultTrialDays}
                    min="0"
                    max="365"
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>Platform security and access control settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to restrict access during maintenance
                    </p>
                  </div>
                  <Switch defaultChecked={settings.maintenanceMode} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable platform usage analytics
                    </p>
                  </div>
                  <Switch defaultChecked={settings.analyticsEnabled} />
                </div>
                
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    API keys and sensitive security settings are managed through environment variables.
                    Contact your system administrator for changes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email notifications and templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Email configuration is managed through environment variables and SMTP settings.
                    This feature will be available in a future update.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "system" && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Database and system-level settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Backup Frequency</Label>
                  <select 
                    defaultValue={settings.backupFrequency}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Database configuration and backup settings are managed at the infrastructure level.
                    Contact your system administrator for advanced database settings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}