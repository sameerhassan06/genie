import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ConversationsChart from "@/components/dashboard/ConversationsChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LeadsTable from "@/components/dashboard/LeadsTable";
import AppointmentsTable from "@/components/dashboard/AppointmentsTable";
import ChatbotPreview from "@/components/dashboard/ChatbotPreview";
import { MessageSquare, UserPlus, Calendar, DollarSign } from "lucide-react";

export default function BusinessDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
    retry: false,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  const { data: chatbots, isLoading: chatbotsLoading } = useQuery({
    queryKey: ["/api/chatbots"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Monitor your chatbot performance and business metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Conversations"
            value={stats?.totalConversations || 0}
            icon={MessageSquare}
            change={12.5}
            loading={statsLoading}
          />
          <StatsCard
            title="New Leads"
            value={stats?.newLeads || 0}
            icon={UserPlus}
            change={8.2}
            loading={statsLoading}
          />
          <StatsCard
            title="Appointments"
            value={stats?.appointmentsScheduled || 0}
            icon={Calendar}
            change={15.3}
            loading={statsLoading}
          />
          <StatsCard
            title="Avg. Satisfaction"
            value={stats?.averageSatisfaction ? stats.averageSatisfaction.toFixed(1) : "0.0"}
            icon={DollarSign}
            change={23.1}
            loading={statsLoading}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConversationsChart />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadsTable leads={leads || []} loading={leadsLoading} />
          <AppointmentsTable appointments={appointments || []} loading={appointmentsLoading} />
        </div>

        {/* Chatbot Preview */}
        <ChatbotPreview chatbots={chatbots || []} loading={chatbotsLoading} />
      </div>
    </DashboardLayout>
  );
}
