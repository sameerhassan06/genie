import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface Lead {
  id: string;
  name?: string;
  email?: string;
  source?: string;
  score?: number;
  status?: string;
  createdAt?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-500/10 text-blue-400';
    case 'contacted':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'qualified':
      return 'bg-green-500/10 text-green-400';
    case 'converted':
      return 'bg-purple-500/10 text-purple-400';
    case 'lost':
      return 'bg-red-500/10 text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-success/10 text-success';
  if (score >= 60) return 'bg-warning/10 text-warning';
  return 'bg-gray-500/10 text-gray-400';
};

export default function LeadsTable({ leads, loading }: LeadsTableProps) {
  if (loading) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Leads</CardTitle>
            <Skeleton className="h-8 w-20 bg-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <Skeleton className="h-3 w-24 bg-gray-700" />
                </div>
                <Skeleton className="h-6 w-16 bg-gray-700" />
                <Skeleton className="h-6 w-20 bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Leads</CardTitle>
          <Link href="/leads">
            <Button variant="link" className="text-primary hover:text-primary/80 p-0">
              View all leads
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No leads found</p>
            <p className="text-sm text-gray-500 mt-1">
              Leads will appear here once your chatbot starts capturing them
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    Contact
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    Source
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    Score
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id}>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {lead.name?.charAt(0) || lead.email?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {lead.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {lead.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-300">
                        {lead.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge className={getScoreColor(lead.score || 0)}>
                        {lead.score || 0}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Badge className={getStatusColor(lead.status || 'new')}>
                        {lead.status || 'New'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
