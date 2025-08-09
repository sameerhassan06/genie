import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    type: "lead",
    message: "New lead captured from website",
    time: "2 minutes ago",
    color: "bg-primary"
  },
  {
    id: 2,
    type: "appointment",
    message: "Appointment scheduled via chatbot",
    time: "5 minutes ago",
    color: "bg-success"
  },
  {
    id: 3,
    type: "training",
    message: "AI training completed for new content",
    time: "12 minutes ago",
    color: "bg-accent"
  },
  {
    id: 4,
    type: "inquiry",
    message: "Customer inquiry about pricing",
    time: "15 minutes ago",
    color: "bg-warning"
  },
  {
    id: 5,
    type: "publish",
    message: "New chatbot flow published",
    time: "1 hour ago",
    color: "bg-secondary"
  },
];

export default function RecentActivity() {
  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{activity.message}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <Button 
          variant="link" 
          className="w-full mt-4 text-primary hover:text-primary/80 p-0"
        >
          View all activity
        </Button>
      </CardContent>
    </Card>
  );
}
