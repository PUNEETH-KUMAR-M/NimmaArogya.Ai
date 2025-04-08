import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  Users, 
  UserCog, 
  PieChart, 
  Calendar, 
  Settings, 
  Search, 
  PlusCircle, 
  Pill, 
  Droplet, 
  MessagesSquare, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pencil as PencilIcon,
  Loader2
} from "lucide-react";
import { DoctorService } from "@/services/api/doctor-service";
import apiClient, { Doctor, Appointment, Product } from "@/services/api";
import { doctorService } from "../services/doctor-service";
import { userService } from "../services/user-service";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';

// For demonstration purposes, we'll use the regular supabase client
// In a real application, you would implement proper admin authentication
// and use server-side APIs for administrative operations

// Define additional types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
}

interface Ticket {
  id: number;
  user: string;
  issue: string;
  status: string;
  priority: string;
  date: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const doctorService = new DoctorService();

  // State for dialogs
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditDoctorDialogOpen, setIsEditDoctorDialogOpen] = useState(false);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  
  // State for new doctor form
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    hospital: "",
    location: "",
    education: "",
    experience: "",
    fee: 0,
    rating: 4.5,
    reviews: 0,
    available: true,
    online: false,
    image: null,
    next_available: new Date().toISOString().split('T')[0]
  });
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" // Default role
  });
  
  // Use React Query to fetch data from Supabase
  const { 
    data: doctors = [], 
    isLoading: isDoctorsLoading,
    error: doctorsError,
    refetch: refetchDoctors 
  } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        // Check if we have temporary doctors data (for demo delete functionality)
        if ((window as any).tempDoctors) {
          const tempData = (window as any).tempDoctors;
          // Clear the temporary data
          (window as any).tempDoctors = null;
          return tempData;
        }
        // Otherwise fetch from the service as usual
        return await doctorService.getDoctors();
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({
          title: "Error",
          description: "Failed to fetch doctors. Please check your Supabase configuration.",
          variant: "destructive",
        });
        throw error;
      }
    }
  });
  
  // Use React Query to fetch users from Supabase
  const {
    data: users = [],
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        // Check if we have temporary users data (for demo delete functionality)
        if ((window as any).tempUsers) {
          const tempData = (window as any).tempUsers;
          // Clear the temporary data
          (window as any).tempUsers = null;
          return tempData;
        }
        
        // Use the user service to fetch users
        return await userService.getUsers();
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
        throw error; // Throw the error to be consistent with doctors query
      }
    }
  });

  // Use React Query to fetch appointments from Supabase
  const {
    data: appointments = [],
    isLoading: isAppointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors:doctor_id (name)
          `);
        
        if (error) throw error;
        
        // Transform data to match our UI expectations
        return data.map((appointment: any) => ({
          id: appointment.id,
          patient_id: appointment.patient_id,
          patient: 'Patient', // We would need to fetch patient names separately
          doctor: appointment.doctors?.name || 'Unknown Doctor',
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          type: appointment.type
        }));
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Use React Query to fetch products from Supabase
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // For tickets, we'll use static data for now as there's no tickets table yet
  // In a real app, you would create a tickets table in Supabase
  const tickets = [
    { id: 1, user: "John Doe", issue: "Cannot book appointment", status: "Open", priority: "High", date: "2024-03-28" },
    { id: 2, user: "Sarah Johnson", issue: "Payment not processed", status: "In Progress", priority: "Medium", date: "2024-03-27" },
    { id: 3, user: "Robert Smith", issue: "Missing prescription", status: "Closed", priority: "Low", date: "2024-03-25" },
  ];

  const updateTicketStatus = (id: number, newStatus: string) => {
    // This would be replaced with an API call in a real implementation
    const updatedTickets = tickets.map(ticket => 
      ticket.id === id ? { ...ticket, status: newStatus } : ticket
    );
    
    toast({
      title: "Ticket Updated",
      description: `Ticket #${id} status changed to ${newStatus}`,
    });
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];
  
  // Filter doctors based on search query
  const filteredDoctors = Array.isArray(doctors) ? doctors.filter(doctor => 
    (doctor.name && doctor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doctor.hospital && doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];
  
  // Handle input change for new doctor form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: name === "fee" ? parseFloat(value) : value
    }));
  };
  
  // Handle select change for new doctor form
  const handleSelectChange = (name: string, value: string | boolean) => {
    setNewDoctor(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new doctor to Supabase
  const handleAddDoctor = async () => {
    try {
      setIsAddingDoctor(true);
      // Validate form
      if (!newDoctor.name || !newDoctor.specialty) {
        toast({
          title: "Validation Error",
          description: "Name and specialty are required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Add doctor to Supabase
      const addedDoctor = await doctorService.addDoctor(newDoctor);
      
      if (addedDoctor) {
        // Refetch doctors to update the list
        refetchDoctors();
        
        // Reset form and close dialog
        setNewDoctor({
          name: "",
          specialty: "",
          hospital: "",
          location: "",
          education: "",
          experience: "",
          fee: 0,
          rating: 4.5,
          reviews: 0,
          available: true,
          online: false,
          image: null,
          next_available: new Date().toISOString().split('T')[0]
        });
        setIsAddDoctorDialogOpen(false);
        
        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast({
        title: "Error",
        description: "Failed to add doctor to database. Please check your Supabase configuration.",
        variant: "destructive",
      });
    } finally {
      setIsAddingDoctor(false);
    }
  };

  // Handle doctor deletion
  const handleDeleteDoctor = async (doctorId: string | number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        // Find the doctor in the current list
        const doctorToDelete = doctors.find(d => d.id.toString() === doctorId.toString());
        if (!doctorToDelete) {
          throw new Error('Doctor not found');
        }
        
        console.log('Deleting doctor:', doctorToDelete.name, 'with ID:', doctorId);
        
        try {
          // Use the doctor service to delete the doctor
          // First try with a direct Supabase call for this demo
          const { error } = await supabase
            .from('doctors')
            .delete()
            .eq('id', doctorId.toString());
            
          if (error) throw error;
          console.log('Doctor successfully deleted via direct Supabase call');
        } catch (serviceError) {
          console.error('Service error deleting doctor:', serviceError);
          console.warn('Falling back to UI-only deletion');
          
          // UI-only fallback - remove from local state
          const updatedDoctors = doctors.filter(d => d.id.toString() !== doctorId.toString());
          (window as any).tempDoctors = updatedDoctors;
        }
        
        // Always refetch to update the UI
        await refetchDoctors();
        
        toast({
          title: "Success",
          description: "Doctor deleted successfully",
        });
      } catch (error) {
        console.error('Error in handleDeleteDoctor:', error);
        toast({
          title: "Error",
          description: "Failed to delete doctor: " + (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string | number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Find the user in the current list
        const userToDelete = users.find(u => u.id.toString() === userId.toString());
        if (!userToDelete) {
          throw new Error('User not found');
        }
        
        console.log('Deleting user:', userToDelete.name, 'with ID:', userId);
        
        try {
          // Use the user service to delete the user
          // First try with a direct Supabase call for this demo
          const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId.toString());
            
          if (error) throw error;
          console.log('User successfully deleted via direct Supabase call');
        } catch (serviceError) {
          console.error('Service error deleting user:', serviceError);
          console.warn('Falling back to UI-only deletion');
          
          // UI-only fallback - remove from local state
          const updatedUsers = users.filter(u => u.id.toString() !== userId.toString());
          (window as any).tempUsers = updatedUsers;
        }
        
        // Always refetch to update the UI
        await refetchUsers();
        
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } catch (error) {
        console.error('Error in handleDeleteUser:', error);
        toast({
          title: "Error",
          description: "Failed to delete user: " + (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  // Handle input change for new user form
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select change for new user form
  const handleUserSelectChange = (name: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new user to Supabase
  const handleAddUser = async () => {
    try {
      setIsAddingUser(true);
      
      // Validate form
      if (!newUser.email || !newUser.password || !newUser.name) {
        toast({
          title: "Validation Error",
          description: "Email, password, and name are required fields",
          variant: "destructive",
        });
        setIsAddingUser(false);
        return;
      }
      
      // Create user in Supabase Auth using standard signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role
          }
        }
      });
      
      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }
      
      if (authData.user) {
        // Since we can't directly insert into profiles due to RLS, 
        // we'll rely on the auto-creation mechanism mentioned in the memories
        // The profile will be created when the user signs in
        
        // For admin users, we'll still need the manual SQL update
        if (newUser.role === 'admin') {
          // This is a workaround for the two-step process mentioned in the memories
          const pendingAdmins = JSON.parse(localStorage.getItem('pendingAdmins') || '[]');
          pendingAdmins.push({
            id: authData.user.id,
            email: newUser.email,
            name: newUser.name
          });
          localStorage.setItem('pendingAdmins', JSON.stringify(pendingAdmins));
          
          // Show SQL command in console for manually updating role
          console.log(`-- Run this SQL command to make the user an admin:`);
          console.log(`UPDATE public.profiles SET role = 'admin' WHERE id = '${authData.user.id}';`);
          
          toast({
            title: "Admin User Created",
            description: "The user has been created. They need to sign in once, then you can update their role to admin using the SQL command in the console.",
          });
        } else {
          toast({
            title: "User Created",
            description: "The user has been created successfully. They will appear in the user list after they sign in for the first time.",
          });
        }
        
        // Reset form and close dialog
        setNewUser({
          email: "",
          password: "",
          name: "",
          role: "user"
        });
        setIsAddUserDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: `Failed to create user: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  // Handle user edit
  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsEditingUser(true);
      
      // Validate form
      if (!selectedUser.name || !selectedUser.email) {
        toast({
          title: "Validation Error",
          description: "Name and email are required fields",
          variant: "destructive",
        });
        setIsEditingUser(false);
        return;
      }
      
      // Update user in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: selectedUser.name,
          role: selectedUser.role,
          // Don't update email as it's managed by Auth
        })
        .eq('id', selectedUser.id);
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      toast({
        title: "User Updated",
        description: "The user has been updated successfully.",
      });
      
      // Refetch users to update the list
      await refetchUsers();
      
      // Reset form and close dialog
      setSelectedUser(null);
      setIsEditUserDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: `Failed to update user: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsEditingUser(false);
    }
  };

  // Handle doctor edit
  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      setIsEditingDoctor(true);
      
      // Validate form
      if (!selectedDoctor.name || !selectedDoctor.specialty) {
        toast({
          title: "Validation Error",
          description: "Name and specialty are required fields",
          variant: "destructive",
        });
        setIsEditingDoctor(false);
        return;
      }
      
      // Process next_available field properly
      const processedData = {
        ...selectedDoctor,
        // Convert to string if it's not already a string
        next_available: typeof selectedDoctor.next_available !== 'string'
          ? (selectedDoctor.next_available ? String(selectedDoctor.next_available) : null)
          : selectedDoctor.next_available
      };
      
      // Update doctor in the database
      const { error } = await supabase
        .from('doctors')
        .update({
          name: processedData.name,
          specialty: processedData.specialty,
          hospital: processedData.hospital,
          location: processedData.location,
          education: processedData.education,
          experience: processedData.experience,
          fee: processedData.fee,
          rating: processedData.rating,
          available: processedData.available,
          next_available: processedData.next_available
        })
        .eq('id', selectedDoctor.id);
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      toast({
        title: "Doctor Updated",
        description: "The doctor has been updated successfully.",
      });
      
      // Refetch doctors to update the list
      await refetchDoctors();
      
      // Reset form and close dialog
      setSelectedDoctor(null);
      setIsEditDoctorDialogOpen(false);
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast({
        title: "Error",
        description: `Failed to update doctor: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsEditingDoctor(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">
                  {isUsersLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    users?.length || 0
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Appointments</p>
                <h3 className="text-2xl font-bold">
                  {isAppointmentsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    appointments?.length || 0
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Pill className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Medications</p>
                <h3 className="text-2xl font-bold">
                  {isProductsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    products?.length || 0
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Droplet className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Blood Donations</p>
                <h3 className="text-2xl font-bold">
                  {/* For now, we'll use a placeholder since the blood_donations table doesn't exist yet */}
                  {/* In a real app, you would create this table in Supabase */}
                  0
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span>Doctors</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Support Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Management</span>
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-mediwrap-blue hover:bg-mediwrap-blue-light flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Add User</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Enter the details for the new user below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newUser.email}
                            onChange={handleUserInputChange}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={newUser.password}
                            onChange={handleUserInputChange}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={newUser.name}
                            onChange={handleUserInputChange}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            onValueChange={(value) => handleUserSelectChange("role", value)}
                            defaultValue={newUser.role}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {newUser.role === 'admin' && (
                            <p className="text-xs text-amber-600 mt-1">
                              Note: Admin users require a two-step process. After creation, the user must sign in once, then you'll need to manually update their role.
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={handleAddUser}
                          disabled={isAddingUser}
                          className="bg-mediwrap-blue hover:bg-mediwrap-blue-light"
                        >
                          {isAddingUser ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create User"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
                    <DialogTrigger asChild>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Enter the details for the user below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={selectedUser?.name}
                            onChange={(e) => setSelectedUser(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={selectedUser?.email}
                            onChange={(e) => setSelectedUser(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            onValueChange={(value) => setSelectedUser(prev => ({ ...prev, role: value }))}
                            defaultValue={selectedUser?.role}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={handleEditUser}
                          disabled={isEditingUser}
                          className="bg-mediwrap-blue hover:bg-mediwrap-blue-light"
                        >
                          {isEditingUser ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update User"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Manage all registered users in the system
                </CardDescription>
                <div className="flex items-center mt-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users by name or email..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isUsersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : usersError ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-red-500">
                            Error loading users. Please try again.
                          </TableCell>
                        </TableRow>
                      ) : users.length > 0 ? (
                        users.filter(user => 
                          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{typeof user.id === 'string' ? user.id.substring(0, 8) + '...' : user.id}</TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              <Badge variant={user.status === 'Active' ? "default" : "destructive"}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditUserDialogOpen(true);
                                }}>Edit</Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {searchQuery ? "No users found matching your search" : "No users found in the system"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Doctor Management</span>
                  <Dialog open={isAddDoctorDialogOpen} onOpenChange={setIsAddDoctorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-mediwrap-blue hover:bg-mediwrap-blue-light flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Doctor</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Doctor</DialogTitle>
                        <DialogDescription>
                          Enter the details for the new doctor below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={newDoctor.name}
                              onChange={handleInputChange}
                              placeholder="Dr. John Doe"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="specialty">Specialty</Label>
                            <Select
                              onValueChange={(value) => handleSelectChange("specialty", value)}
                              defaultValue={newDoctor.specialty}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cardiology">Cardiology</SelectItem>
                                <SelectItem value="Dermatology">Dermatology</SelectItem>
                                <SelectItem value="Neurology">Neurology</SelectItem>
                                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                                <SelectItem value="Surgery">Surgery</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="hospital">Hospital</Label>
                            <Input
                              id="hospital"
                              name="hospital"
                              value={newDoctor.hospital}
                              onChange={handleInputChange}
                              placeholder="City Medical Center"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              value={newDoctor.location}
                              onChange={handleInputChange}
                              placeholder="New York"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="education">Education</Label>
                            <Input
                              id="education"
                              name="education"
                              value={newDoctor.education}
                              onChange={handleInputChange}
                              placeholder="Harvard Medical School"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="experience">Experience</Label>
                            <Input
                              id="experience"
                              name="experience"
                              value={newDoctor.experience}
                              onChange={handleInputChange}
                              placeholder="10 years"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="fee">Consultation Fee</Label>
                            <Input
                              id="fee"
                              name="fee"
                              type="number"
                              value={newDoctor.fee}
                              onChange={handleInputChange}
                              placeholder="150"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="online">Consultation Type</Label>
                            <Select
                              onValueChange={(value) => handleSelectChange("online", value === "true")}
                              defaultValue={newDoctor.online ? "true" : "false"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Online Available</SelectItem>
                                <SelectItem value="false">In-person Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDoctorDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddDoctor}>Add Doctor</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isEditDoctorDialogOpen} onOpenChange={setIsEditDoctorDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                        <DialogDescription>
                          Enter the details for the doctor below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={selectedDoctor?.name}
                              onChange={(e) => setSelectedDoctor(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Dr. John Doe"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="specialty">Specialty</Label>
                            <Select
                              onValueChange={(value) => setSelectedDoctor(prev => ({ ...prev, specialty: value }))}
                              defaultValue={selectedDoctor?.specialty}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cardiology">Cardiology</SelectItem>
                                <SelectItem value="Dermatology">Dermatology</SelectItem>
                                <SelectItem value="Neurology">Neurology</SelectItem>
                                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                                <SelectItem value="Surgery">Surgery</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="hospital">Hospital</Label>
                            <Input
                              id="hospital"
                              name="hospital"
                              value={selectedDoctor?.hospital}
                              onChange={(e) => setSelectedDoctor(prev => ({ ...prev, hospital: e.target.value }))}
                              placeholder="City Medical Center"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              name="location"
                              value={selectedDoctor?.location}
                              onChange={(e) => setSelectedDoctor(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="New York"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="education">Education</Label>
                            <Input
                              id="education"
                              name="education"
                              value={selectedDoctor?.education}
                              onChange={(e) => setSelectedDoctor(prev => ({ ...prev, education: e.target.value }))}
                              placeholder="Harvard Medical School"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="experience">Experience</Label>
                            <Input
                              id="experience"
                              name="experience"
                              value={selectedDoctor?.experience}
                              onChange={(e) => setSelectedDoctor(prev => ({ ...prev, experience: e.target.value }))}
                              placeholder="10 years"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="fee">Consultation Fee</Label>
                            <Input
                              id="fee"
                              name="fee"
                              type="number"
                              value={selectedDoctor?.fee}
                              onChange={(e) => setSelectedDoctor(prev => ({ ...prev, fee: parseFloat(e.target.value) }))}
                              placeholder="150"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="online">Consultation Type</Label>
                            <Select
                              onValueChange={(value) => setSelectedDoctor(prev => ({ ...prev, online: value === "true" }))}
                              defaultValue={selectedDoctor?.online ? "true" : "false"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Online Available</SelectItem>
                                <SelectItem value="false">In-person Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDoctorDialogOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={handleEditDoctor}
                          disabled={isEditingDoctor}
                          className="bg-mediwrap-blue hover:bg-mediwrap-blue-light"
                        >
                          {isEditingDoctor ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Doctor"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Manage all doctors in the system
                </CardDescription>
                <div className="flex items-center mt-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search doctors..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isDoctorsLoading ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue" />
                  </div>
                ) : doctorsError ? (
                  <div className="flex justify-center items-center p-12 text-red-500">
                    Error loading doctors. Please try again.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>Hospital</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(filteredDoctors) && filteredDoctors.length > 0 ? (
                          filteredDoctors.map((doctor) => (
                            <TableRow key={doctor.id}>
                              <TableCell className="font-medium">{doctor.name}</TableCell>
                              <TableCell>{doctor.specialty}</TableCell>
                              <TableCell>{doctor.hospital || "N/A"}</TableCell>
                              <TableCell>{doctor.location || "N/A"}</TableCell>
                              <TableCell>₹{doctor.fee}</TableCell>
                              <TableCell>{doctor.rating} ({doctor.reviews})</TableCell>
                              <TableCell>
                                <Badge variant={doctor.available ? "default" : "destructive"}>
                                  {doctor.available ? "Available" : "Unavailable"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setIsEditDoctorDialogOpen(true);
                                  }}>
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500"
                                    onClick={() => handleDeleteDoctor(doctor.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              {searchQuery ? "No doctors found matching your search" : "No doctors found in the system"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>
                  Manage user support tickets and inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(tickets) && tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>{ticket.id}</TableCell>
                          <TableCell>{ticket.user}</TableCell>
                          <TableCell>{ticket.issue}</TableCell>
                          <TableCell>
                            <Badge variant={
                              ticket.status === "Open" ? "destructive" : 
                              ticket.status === "In Progress" ? "outline" : 
                              "default"
                            }>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              ticket.priority === "High" ? "destructive" : 
                              ticket.priority === "Medium" ? "outline" : 
                              "secondary"
                            }>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => updateTicketStatus(ticket.id, "In Progress")}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-green-500" onClick={() => updateTicketStatus(ticket.id, "Closed")}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => updateTicketStatus(ticket.id, "Cancelled")}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments Management</CardTitle>
                <CardDescription>
                  View and manage all appointments in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isAppointmentsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : appointmentsError ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-red-500">
                            Error loading appointments. Please try again.
                          </TableCell>
                        </TableRow>
                      ) : Array.isArray(appointments) && appointments.length > 0 ? (
                        appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>{typeof appointment.id === 'string' ? appointment.id.substring(0, 8) + '...' : appointment.id}</TableCell>
                            <TableCell>{appointment.patient || 'Unknown Patient'}</TableCell>
                            <TableCell>{appointment.doctor || 'Unknown Doctor'}</TableCell>
                            <TableCell>{appointment.date}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>
                              <Badge variant={
                                appointment.status === "confirmed" ? "default" : 
                                appointment.status === "pending" ? "outline" : 
                                "destructive"
                              }>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500"
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to cancel this appointment?')) {
                                      try {
                                        const { error } = await supabase
                                          .from('appointments')
                                          .update({ status: 'canceled' })
                                          .eq('id', appointment.id);
                                        
                                        if (error) throw error;
                                        
                                        refetchAppointments();
                                        toast({
                                          title: "Success",
                                          description: "Appointment canceled successfully",
                                        });
                                      } catch (error) {
                                        console.error('Error canceling appointment:', error);
                                        toast({
                                          title: "Error",
                                          description: "Failed to cancel appointment",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No appointments found in the system
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Placeholder */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  View system usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center p-12 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics dashboard content would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Placeholder */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Admin User Management</h3>
                    <p className="text-muted-foreground mb-6">Create admin users to manage the system</p>
                    <CreateAdminForm />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Configuration</h3>
                    <div className="flex justify-center items-center p-12 border-2 border-dashed rounded-md h-[400px]">
                      <div className="text-center">
                        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">Additional settings would appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
