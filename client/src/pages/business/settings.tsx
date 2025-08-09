import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Building2, Key, Bell, Shield, CreditCard, Users, Globe, Save, Eye, EyeOff } from "lucide-react";

export default function BusinessSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [businessData, setBusinessData] = useState({
    name: '',
    domain: '',
    website: '',
    description: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    leadNotifications: true,
    appointmentNotifications: true,
    weeklyReports: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '24',
  });

  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ["/api/tenant/profile"],
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/auth/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/tenant/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/profile"] });
      toast({
        title: "Success",
        description: "Business settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSaveBusiness = () => {
    updateBusinessMutation.mutate(businessData);
  };

  const generateApiKey = () => {
    // In a real implementation, this would call an API endpoint
    const newApiKey = `cb_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    toast({
      title: "API Key Generated",
      description: "Your new API key has been generated. Make sure to copy it now.",
    });
    // Store the API key (this would be handled by the backend)
  };

  return (
    <DashboardLayout title="Settings" description="Manage your account, business, and application settings">
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-surface border-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-primary">
              <Building2 className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-primary">
              <Key className="w-4 h-4 mr-2" />
              API & Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-primary">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Profile Picture</h3>
                      <p className="text-sm text-gray-400">Upload a profile picture to personalize your account</p>
                      <Button variant="outline" className="mt-2" disabled>
                        Upload Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business">
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Business Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your business details and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="businessName" className="text-white">Business Name</Label>
                    <Input
                      id="businessName"
                      value={businessData.name}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your Business Name"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="domain" className="text-white">Domain</Label>
                      <Input
                        id="domain"
                        value={businessData.domain}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, domain: e.target.value }))}
                        placeholder="yourbusiness.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-white">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        value={businessData.website}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourbusiness.com"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Business Description</Label>
                    <Textarea
                      id="description"
                      value={businessData.description}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your business..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Button 
                      onClick={handleSaveBusiness}
                      disabled={updateBusinessMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Business Info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Subscription</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your subscription plan and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Current Plan</h4>
                    <p className="text-sm text-gray-400">Professional Plan - $99/month</p>
                  </div>
                  <Badge className="bg-success/10 text-success">Active</Badge>
                </div>
                <div className="mt-4">
                  <Button variant="outline">
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Integrations */}
          <TabsContent value="api">
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">API Configuration</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage API keys and integration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-white">API Key</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="cb_1234567890_abcdefghijklmnop"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateApiKey}
                      >
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Use this API key to integrate with external services
                    </p>
                  </div>

                  <div>
                    <Label className="text-white">Webhook URL</Label>
                    <Input
                      placeholder="https://your-app.com/webhooks/chatbot"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Receive real-time notifications for events
                    </p>
                  </div>

                  <div>
                    <Label className="text-white">Allowed Origins</Label>
                    <Textarea
                      placeholder="https://yourdomain.com&#10;https://app.yourdomain.com"
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      List of domains allowed to use your chatbot (one per line)
                    </p>
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save API Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Third-party Integrations</CardTitle>
                <CardDescription className="text-gray-400">
                  Connect with your favorite tools and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm font-bold">Z</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Zapier</h4>
                        <p className="text-sm text-gray-400">Automate workflows</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm font-bold">S</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Slack</h4>
                        <p className="text-sm text-gray-400">Get notifications in Slack</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-sm font-bold">D</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Discord</h4>
                        <p className="text-sm text-gray-400">Community integration</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose how you want to be notified about important events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">New Lead Notifications</h4>
                      <p className="text-sm text-gray-400">Get notified when new leads are captured</p>
                    </div>
                    <Switch
                      checked={notificationSettings.leadNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, leadNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Appointment Notifications</h4>
                      <p className="text-sm text-gray-400">Get notified about appointment updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, appointmentNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Weekly Reports</h4>
                      <p className="text-sm text-gray-400">Receive weekly performance summaries</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                      }
                    />
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-white mb-4">Password</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="text-white">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="mt-1"
                        />
                      </div>
                      <Button variant="outline">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-white">Session Timeout</Label>
                    <Select 
                      value={securitySettings.sessionTimeout}
                      onValueChange={(value) => 
                        setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border">
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-400 mt-1">
                      Automatically log out after this period of inactivity
                    </p>
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing">
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-white">Billing & Usage</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your subscription, billing, and usage limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-800/50 border-border">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium text-white">Monthly Conversations</h4>
                        <p className="text-2xl font-bold text-primary mt-2">2,847</p>
                        <p className="text-sm text-gray-400">of 10,000 limit</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-border">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium text-white">Storage Used</h4>
                        <p className="text-2xl font-bold text-accent mt-2">1.2 GB</p>
                        <p className="text-sm text-gray-400">of 5 GB limit</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-accent h-2 rounded-full" style={{ width: '24%' }}></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-border">
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium text-white">Active Chatbots</h4>
                        <p className="text-2xl font-bold text-success mt-2">3</p>
                        <p className="text-sm text-gray-400">of 5 limit</p>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-success h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-4">Payment Method</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-400">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-white mb-4">Billing History</h4>
                    <div className="space-y-2">
                      {[
                        { date: '2024-01-01', amount: '$99.00', status: 'Paid' },
                        { date: '2023-12-01', amount: '$99.00', status: 'Paid' },
                        { date: '2023-11-01', amount: '$99.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div>
                            <p className="text-white">{invoice.date}</p>
                            <p className="text-sm text-gray-400">Professional Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-white">{invoice.amount}</p>
                            <Badge className="bg-success/10 text-success text-xs">
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button className="bg-primary hover:bg-primary/90">
                      Upgrade Plan
                    </Button>
                    <Button variant="outline">
                      Download Invoices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
