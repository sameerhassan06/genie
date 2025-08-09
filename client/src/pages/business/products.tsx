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
import { Switch } from "@/components/ui/switch";
import { Package, Plus, DollarSign, Clock, Calendar, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BusinessProducts() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    isActive: true,
    availableSlots: []
  });
  const [editServiceData, setEditServiceData] = useState<any>(null);

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const servicesArray = Array.isArray(services) ? services : [];

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/services", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewServiceData({
        name: '',
        description: '',
        duration: 30,
        price: '',
        isActive: true,
        availableSlots: []
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/services/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditServiceData(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    },
  });

  const serviceStats = {
    total: services?.length || 0,
    active: services?.filter((s: any) => s.isActive).length || 0,
    avgPrice: services?.reduce((sum: number, service: any) => sum + (parseFloat(service.price) || 0), 0) / (services?.length || 1) || 0,
    avgDuration: services?.reduce((sum: number, service: any) => sum + (service.duration || 0), 0) / (services?.length || 1) || 0
  };

  const handleCreateService = () => {
    if (!newServiceData.name.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }

    createServiceMutation.mutate({
      ...newServiceData,
      price: newServiceData.price ? parseFloat(newServiceData.price) : null
    });
  };

  const handleEditService = (service: any) => {
    setEditServiceData({
      ...service,
      price: service.price ? service.price.toString() : ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = () => {
    if (!editServiceData?.name?.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }

    updateServiceMutation.mutate({
      id: editServiceData.id,
      data: {
        ...editServiceData,
        price: editServiceData.price ? parseFloat(editServiceData.price) : null
      }
    });
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleToggleActive = (serviceId: string, isActive: boolean) => {
    updateServiceMutation.mutate({
      id: serviceId,
      data: { isActive }
    });
  };

  return (
    <DashboardLayout title="Products & Services" description="Manage your service offerings and pricing">
      <div className="space-y-6">
        {/* Service Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Services</p>
                  <p className="text-2xl font-bold text-white">{serviceStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Package className="text-success w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Services</p>
                  <p className="text-2xl font-bold text-white">{serviceStats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <DollarSign className="text-accent w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg. Price</p>
                  <p className="text-2xl font-bold text-white">${serviceStats.avgPrice.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Clock className="text-secondary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg. Duration</p>
                  <p className="text-2xl font-bold text-white">{serviceStats.avgDuration.toFixed(0)}min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Management */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Service Offerings</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your services, pricing, and availability
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Service</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new service offering for your customers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Service Name</Label>
                      <Input
                        id="name"
                        value={newServiceData.name}
                        onChange={(e) => setNewServiceData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter service name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea
                        id="description"
                        value={newServiceData.description}
                        onChange={(e) => setNewServiceData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your service..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="15"
                          max="480"
                          value={newServiceData.duration}
                          onChange={(e) => setNewServiceData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-white">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newServiceData.price}
                          onChange={(e) => setNewServiceData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={newServiceData.isActive}
                        onCheckedChange={(checked) => setNewServiceData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="active" className="text-white">
                        Active Service
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                      <Button 
                        onClick={handleCreateService}
                        disabled={createServiceMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Create Service
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
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-gray-800/50 border-border">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-32 bg-gray-700" />
                        <Skeleton className="h-16 w-full bg-gray-700" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-16 bg-gray-700" />
                          <Skeleton className="h-6 w-20 bg-gray-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : services?.length === 0 ? (
              <Card className="bg-gray-800/50 border-border">
                <CardContent className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Services Found</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first service to start offering appointments
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services?.map((service: any) => (
                  <Card key={service.id} className="bg-gray-800/50 border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white">{service.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-surface border-border" align="end">
                              <DropdownMenuItem 
                                onClick={() => setSelectedService(service)}
                                className="text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEditService(service)}
                                className="text-gray-300 hover:text-white hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteService(service.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {service.description || 'No description provided'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration} min
                          </div>
                          <div className="flex items-center space-x-2">
                            {service.price && (
                              <span className="text-white font-semibold">
                                ${parseFloat(service.price).toFixed(2)}
                              </span>
                            )}
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={(checked) => handleToggleActive(service.id, checked)}
                              size="sm"
                            />
                            <span className="text-sm text-gray-400">Available</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Service Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-surface border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Service</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your service details and pricing
              </DialogDescription>
            </DialogHeader>
            {editServiceData && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-white">Service Name</Label>
                  <Input
                    id="edit-name"
                    value={editServiceData.name}
                    onChange={(e) => setEditServiceData((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter service name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description" className="text-white">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editServiceData.description}
                    onChange={(e) => setEditServiceData((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your service..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-duration" className="text-white">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min="15"
                      max="480"
                      value={editServiceData.duration}
                      onChange={(e) => setEditServiceData((prev: any) => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price" className="text-white">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editServiceData.price}
                      onChange={(e) => setEditServiceData((prev: any) => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editServiceData.isActive}
                    onCheckedChange={(checked) => setEditServiceData((prev: any) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-active" className="text-white">
                    Active Service
                  </Label>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Button 
                    onClick={handleUpdateService}
                    disabled={updateServiceMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Update Service
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Service Details Modal */}
        {selectedService && (
          <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
            <DialogContent className="bg-surface border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">{selectedService.name}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Service details and configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Service Name</Label>
                    <p className="text-gray-300 mt-1">{selectedService.name}</p>
                  </div>
                  <div>
                    <Label className="text-white">Status</Label>
                    <Badge className={`mt-1 ${selectedService.isActive ? 'bg-success/10 text-success' : 'bg-gray-500/10 text-gray-400'}`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white">Duration</Label>
                    <p className="text-gray-300 mt-1">{selectedService.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-white">Price</Label>
                    <p className="text-gray-300 mt-1">
                      {selectedService.price ? `$${parseFloat(selectedService.price).toFixed(2)}` : 'Free'}
                    </p>
                  </div>
                </div>

                {selectedService.description && (
                  <div>
                    <Label className="text-white">Description</Label>
                    <p className="text-gray-300 mt-1 bg-gray-800/50 p-3 rounded-lg">
                      {selectedService.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4">
                  <Button
                    onClick={() => handleEditService(selectedService)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Edit Service
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedService(null)}>
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
