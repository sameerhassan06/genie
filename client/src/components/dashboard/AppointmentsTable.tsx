import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Calendar, Clock } from "lucide-react";

interface Appointment {
  id: string;
  title?: string;
  scheduledAt?: string;
  duration?: number;
  status?: string;
  leadId?: string;
  serviceId?: string;
}

interface AppointmentsTableProps {
  appointments: Appointment[];
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'scheduled':
      return 'bg-blue-500/10 text-blue-400';
    case 'confirmed':
      return 'bg-green-500/10 text-green-400';
    case 'completed':
      return 'bg-purple-500/10 text-purple-400';
    case 'cancelled':
      return 'bg-red-500/10 text-red-400';
    case 'no_show':
      return 'bg-gray-500/10 text-gray-400';
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  let dateLabel = '';
  if (appointmentDate.getTime() === today.getTime()) {
    dateLabel = 'Today';
  } else if (appointmentDate.getTime() === tomorrow.getTime()) {
    dateLabel = 'Tomorrow';
  } else {
    dateLabel = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return { dateLabel, timeLabel };
};

export default function AppointmentsTable({ appointments, loading }: AppointmentsTableProps) {
  if (loading) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Upcoming Appointments</CardTitle>
            <Skeleton className="h-8 w-24 bg-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-gray-700" />
                    <Skeleton className="h-3 w-24 bg-gray-700" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-3 w-12 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.scheduledAt || '') > new Date())
    .sort((a, b) => new Date(a.scheduledAt || '').getTime() - new Date(b.scheduledAt || '').getTime())
    .slice(0, 4);

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Upcoming Appointments</CardTitle>
          <Link href="/appointments">
            <Button variant="link" className="text-primary hover:text-primary/80 p-0">
              View calendar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No upcoming appointments</p>
            <p className="text-sm text-gray-500 mt-1">
              Appointments will appear here when scheduled through your chatbot
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              const { dateLabel, timeLabel } = formatDate(appointment.scheduledAt || '');
              
              return (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {appointment.title || 'Appointment'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(appointment.status || 'scheduled')}>
                          {appointment.status || 'Scheduled'}
                        </Badge>
                        {appointment.duration && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.duration}m
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{timeLabel}</p>
                    <p className="text-xs text-gray-400">{dateLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
