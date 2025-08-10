import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
// Demo mode for static deployment
const isDemoMode = typeof window !== 'undefined' && 
  import.meta.env.MODE === 'production' && 
  window.location.hostname.includes('vercel');

// Demo data for static deployment
const demoData: Record<string, any> = {
  "/api/superadmin/stats": {
    totalTenants: 5,
    activeTenants: 4,
    totalUsers: 12,
    totalConversations: 1847,
    totalLeads: 423,
    averageResponseTime: 2.3,
    successRate: 94.2
  },
  "/api/superadmin/tenants": [
    {
      id: 1,
      name: "TechCorp Solutions",
      domain: "techcorp.com",
      website: "https://techcorp.com",
      subscriptionPlan: "professional",
      status: "active",
      createdAt: "2024-12-01",
      userCount: 5,
      chatbotCount: 2,
      conversationsCount: 847
    },
    {
      id: 2,
      name: "Local Café",
      domain: "localcafe.com",
      website: "https://localcafe.com",
      subscriptionPlan: "starter",
      status: "trialing",
      createdAt: "2024-12-15",
      userCount: 2,
      chatbotCount: 1,
      conversationsCount: 234
    },
    {
      id: 3,
      name: "Legal Advisors Inc",
      domain: "legaladvisors.com",
      website: "https://legaladvisors.com",
      subscriptionPlan: "enterprise",
      status: "active",
      createdAt: "2024-11-20",
      userCount: 3,
      chatbotCount: 3,
      conversationsCount: 556
    },
    {
      id: 4,
      name: "HealthCare Plus",
      domain: "healthcareplus.com",
      website: "https://healthcareplus.com",
      subscriptionPlan: "professional",
      status: "past_due",
      createdAt: "2024-11-10",
      userCount: 2,
      chatbotCount: 1,
      conversationsCount: 210
    }
  ]
};

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Return demo data in demo mode
    if (isDemoMode) {
      const key = queryKey.join("/");
      return demoData[key] || null;
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
