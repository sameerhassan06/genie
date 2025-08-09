import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Bot, 
  Calendar, 
  Package, 
  Palette, 
  Settings, 
  Users, 
  MessageSquare, 
  Brain,
  Building2,
  CreditCard,
  Shield,
  PieChart
} from "lucide-react";

const businessNavItems = [
  { href: "/", icon: BarChart3, label: "Dashboard" },
  { href: "/chatbot-designer", icon: Palette, label: "Chatbot Designer" },
  { href: "/leads", icon: Users, label: "Leads Management" },
  { href: "/appointments", icon: Calendar, label: "Appointments" },
  { href: "/products", icon: Package, label: "Products & Services" },
  { href: "/qa-management", icon: MessageSquare, label: "Q&A Management" },
  { href: "/ai-training", icon: Brain, label: "AI Training" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const superAdminNavItems = [
  { href: "/", icon: PieChart, label: "Platform Overview" },
  { href: "/tenants", icon: Building2, label: "Tenant Management" },
  { href: "/billing", icon: CreditCard, label: "Billing & Subscriptions" },
  { href: "/settings", icon: Shield, label: "Platform Settings" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  const navItems = user?.role === 'superadmin' ? superAdminNavItems : businessNavItems;

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-surface border-r border-border overflow-y-auto">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                {user?.role === 'superadmin' ? 'Admin Portal' : 'ChatBot Pro'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}>
                    <item.icon className="mr-3 w-5 h-5" />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 p-4">
            <div className="flex items-center">
              <img 
                className="inline-block h-10 w-10 rounded-full object-cover" 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"} 
                alt="Profile" 
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'
                  }
                </p>
                <p className="text-xs font-medium text-gray-400">
                  {user?.role === 'superadmin' ? 'Super Admin' : 'Business Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
