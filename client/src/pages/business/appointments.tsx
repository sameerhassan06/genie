import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Clock, MapPin, User, Video, CheckCircle, XCircle, AlertCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BusinessAppointments() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 30,
    serviceId: '',
    meetingLink: ''
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewAppointmentData({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 30,
        serviceId: '',
        meetingLink: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredAppointments = appointments?.filter((appointment: any) => {
    const appointmentDate = new Date(appointment.scheduledAt).toISOString().split('T')[0];
    const matchesDate = !selectedDate || appointmentDate === selectedDate;
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesDate && matchesStatus;
  }) || [];

  const upcomingAppointments = appointments?.filter((apt: any) => 
    new Date(apt.scheduledAt) > new Date() && apt.status !== 'cancelled'
  ) || [];

  const appointmentStats = {
    total: appointments?.length || 0,
    upcoming: upcomingAppointments.length,
    completed: appointments?.filter((a: any) => a.status === 'completed').length || 0,
    cancelled: appointments?.filter((a: any) => a.status === 'cancelled').length || 0,
  };

  const handleCreateAppointment = () => {
    if (!newAppointmentData.title.trim() || !newAppointmentData.scheduledAt) {
      toast({
        title: "Error",
        description: "Please provide title and scheduled time",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      ...newAppointmentData,
      scheduledAt: new Date(newAppointmentData.scheduledAt).toISOString()
    });
  };

  const handleUpdateStatus = (appointmentId: string, status: string) => {
    updateAppointmentMutation.mutate({
      id: appointmentId,
      data: { status }
    });
  };

  return (
    <DashboardLayout title="Appointment Management" description="Schedule and manage appointments with your customers">
      <div className="space-y-6">
        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Appointments</p>
                  <p className="text-2xl font-bold text-white">{appointmentStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="text-blue-400 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Upcoming</p>
                  <p className="text-2xl font-bold text-white">{appointmentStats.upcoming}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="text-success w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-white">{appointmentStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-error/10 rounded-lg">
                  <XCircle className="text-error w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-white">{appointmentStats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Appointment Calendar</CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage your appointment schedule
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-white">Date:</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-surface border-border max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Book New Appointment</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Schedule a new appointment with a customer
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title" className="text-white">Title</Label>
                          <Input
                            id="title"
                            value={newAppointmentData.title}
                            onChange={(e) => setNewAppointmentData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Appointment title"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="service" className="text-white">Service</Label>
                          <Select 
                            value={newAppointmentData.serviceId}
                            onValueChange={(value) => setNewAppointmentData(prev => ({ ...prev, serviceId: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-border">
                              {services?.map((service: any) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} ({service.duration}min)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="scheduledAt" className="text-white">Date & Time</Label>
                          <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={newAppointmentData.scheduledAt}
                            onChange={(e) => setNewAppointmentData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="15"
                            max="180"
                            value={newAppointmentData.duration}
                            onChange={(e) => setNewAppointmentData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="meetingLink" className="text-white">Meeting Link (optional)</Label>
                        <Input
                          id="meetingLink"
                          type="url"
                          value={newAppointmentData.meetingLink}
                          onChange={(e) => setNewAppointmentData(prev => ({ ...prev, meetingLink: e.target.value }))}
                          placeholder="https://zoom.us/j/..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-white">Description</Label>
                        <Textarea
                          id="description"
                          value={newAppointmentData.description}
                          onChange={(e) => setNewAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Appointment details..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-4">
                        <Button 
                          onClick={handleCreateAppointment}
                          disabled={createAppointmentMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Book Appointment
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Appointments List */}
            <div className="space-y-4">
              {appointmentsLoading ? (
                [...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-gray-800/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-gray-700" />
                            <Skeleton className="h-3 w-24 bg-gray-700" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20 bg-gray-700" />
                          <Skeleton className="h-6 w-16 bg-gray-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAppointments.length === 0 ? (
                <Card className="bg-gray-800/50 border-border">
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No appointments found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedDate ? `No appointments on ${new Date(selectedDate).toLocaleDateString()}` : 'Try selecting a different date'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map((appointment: any) => {
                  const { date, time } = formatDate(appointment.scheduledAt);
                  return (
                    <Card key={appointment.id} className="bg-gray-800/50 border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{appointment.title}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-sm text-gray-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {time} ({appointment.duration}min)
                                </div>
                                {appointment.meetingLink && (
                                  <div className="flex items-center text-sm text-gray-400">
                                    <Video className="w-3 h-3 mr-1" />
                                    Video call
                                  </div>
                                )}
                              </div>
                              {appointment.description && (
                                <p className="text-sm text-gray-400 mt-1">{appointment.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm text-white">{date}</p>
                              <Badge className={getStatusColor(appointment.status)}>
                                <span className="flex items-center space-x-1">
                                  {getStatusIcon(appointment.status)}
                                  <span>{appointment.status}</span>
                                </span>
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-surface border-border" align="end">
                                <DropdownMenuItem 
                                  onClick={() => setSelectedAppointment(appointment)}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
            <DialogContent className="bg-surface border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedAppointment.title}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Appointment details and information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Date & Time</Label>
                    <p className="text-gray-300 mt-1">
                      {formatDate(selectedAppointment.scheduledAt).date} at {formatDate(selectedAppointment.scheduledAt).time}
                    </p>
                  </div>
                  <div>
                    <Label className="text-white">Duration</Label>
                    <p className="text-gray-300 mt-1">{selectedAppointment.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-white">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedAppointment.status)}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(selectedAppointment.status)}
                        <span>{selectedAppointment.status}</span>
                      </span>
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white">Service</Label>
                    <p className="text-gray-300 mt-1">
                      {services?.find((s: any) => s.id === selectedAppointment.serviceId)?.name || 'General Consultation'}
                    </p>
                  </div>
                </div>

                {selectedAppointment.description && (
                  <div>
                    <Label className="text-white">Description</Label>
                    <p className="text-gray-300 mt-1 bg-gray-800/50 p-3 rounded-lg">
                      {selectedAppointment.description}
                    </p>
                  </div>
                )}

                {selectedAppointment.meetingLink && (
                  <div>
                    <Label className="text-white">Meeting Link</Label>
                    <div className="mt-1">
                      <a 
                        href={selectedAppointment.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline flex items-center"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Video Call
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4">
                  <Button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Mark Complete
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
