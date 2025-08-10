import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Demo mode for static deployment
const isDemoMode = typeof window !== 'undefined' && 
  import.meta.env.MODE === 'production' && 
  window.location.hostname.includes('vercel');

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: isDemoMode 
      ? () => Promise.resolve({
          id: 1,
          username: "demo_superadmin",
          role: "superadmin",
          tenantId: null,
          createdAt: new Date().toISOString()
        })
      : getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading: isDemoMode ? false : isLoading,
    isAuthenticated: isDemoMode ? true : !!user,
  };
}
