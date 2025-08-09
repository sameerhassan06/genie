import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

// Import pages
import Landing from "@/pages/landing";
import Setup from "@/pages/setup";
import SuperAdminDashboard from "@/pages/superadmin/dashboard";
import SuperAdminTenants from "@/pages/superadmin/tenants";
import SuperAdminBilling from "@/pages/superadmin/billing";
import BusinessDashboard from "@/pages/business/dashboard";
import ChatbotDesigner from "@/pages/business/chatbot-designer";
import Leads from "@/pages/business/leads";
import Appointments from "@/pages/business/appointments";
import Products from "@/pages/business/products";
import QAManagement from "@/pages/business/qa-management";
import AITraining from "@/pages/business/ai-training";
import Settings from "@/pages/business/settings";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/setup" component={Setup} />
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : user?.role === 'superadmin' ? (
        <>
          <Route path="/" component={SuperAdminDashboard} />
          <Route path="/tenants" component={SuperAdminTenants} />
          <Route path="/billing" component={SuperAdminBilling} />
        </>
      ) : user?.tenantId ? (
        <>
          <Route path="/" component={BusinessDashboard} />
          <Route path="/chatbot-designer" component={ChatbotDesigner} />
          <Route path="/leads" component={Leads} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/products" component={Products} />
          <Route path="/qa-management" component={QAManagement} />
          <Route path="/ai-training" component={AITraining} />
          <Route path="/settings" component={Settings} />
        </>
      ) : (
        // User is authenticated but has no tenant and is not superadmin - needs setup
        <Route path="/" component={() => { 
          window.location.href = '/setup'; 
          return null; 
        }} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
