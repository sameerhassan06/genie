import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  loading?: boolean;
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  loading, 
  className 
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className="bg-surface border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Skeleton className="w-12 h-12 rounded-lg bg-gray-700" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-700" />
              <Skeleton className="h-6 w-20 bg-gray-700" />
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-24 bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = change ? change > 0 : false;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn(
      "bg-surface border-border hover:border-primary/50 transition-colors hover-glow",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="text-primary w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn(
              "flex items-center",
              isPositive ? "text-success" : "text-error"
            )}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {Math.abs(change)}%
            </span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
