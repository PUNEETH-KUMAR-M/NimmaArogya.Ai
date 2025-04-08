import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import apiClient from "@/services/api";
import { CalendarDays, Clock, User, MapPin, Phone, Mail, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [doctorsMap, setDoctorsMap] = useState<Record<string, any>>({});

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile data
  const fetchProfileData = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setProfileData(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Fetch user appointments
  const { 
    data: appointments = [], 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['userAppointments', user?.id],
    queryFn: () => {
      if (!user) return [];
      return apiClient.getPatientAppointments(user.id);
    },
    enabled: !!user,
  });

  // Fetch doctor details for all appointments
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!appointments.length) return;
      
      // Get unique doctor IDs
      const doctorIds = [...new Set(appointments.map(app => app.doctor_id))];
      const doctorsData: Record<string, any> = {};
      
      // Fetch details for each doctor
      for (const id of doctorIds) {
        try {
          const doctor = await apiClient.getDoctor(id);
          if (doctor) {
            doctorsData[id] = doctor;
          }
        } catch (error) {
          console.error(`Error fetching doctor ${id}:`, error);
        }
      }
      
      setDoctorsMap(doctorsData);
    };
    
    fetchDoctorDetails();
  }, [appointments]);

  // Listen for real-time changes to appointments
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('public:appointments')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `patient_id=eq.${user.id}`
        }, () => {
          refetch();
        })
        .subscribe();
        
      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, refetch]);

  if (!isAuthenticated || !user) {
    return null; // Don't render anything if not authenticated
  }

  // Use profile data if available, otherwise fall back to user data
  const displayData = profileData || user;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Profile</span>
                  <Button 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={`https://avatar.vercel.sh/${displayData.email}?size=128`} alt={displayData.name} />
                  <AvatarFallback>
                    <UserCircle className="w-32 h-32 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold mt-4">{displayData.name}</h2>
                <Badge className="mt-2 capitalize">{displayData.role}</Badge>
                
                <div className="w-full mt-8 space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{displayData.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{displayData.phone || "+1 (555) 123-4567"}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{displayData.address || "New York, USA"}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-8 bg-mediwrap-blue hover:bg-mediwrap-blue-light"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    {isLoading ? (
                      <div className="py-8 text-center text-gray-500">
                        Loading appointments...
                      </div>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center">
                                <div className="bg-mediwrap-blue/10 p-3 rounded-full">
                                  <User className="h-6 w-6 text-mediwrap-blue" />
                                </div>
                                <div className="ml-4">
                                  {doctorsMap[appointment.doctor_id] ? (
                                    <>
                                      <p className="font-semibold">Dr. {doctorsMap[appointment.doctor_id].name}</p>
                                      <p className="text-sm text-mediwrap-blue">{doctorsMap[appointment.doctor_id].specialty}</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="font-semibold">Doctor #{appointment.doctor_id}</p>
                                      <p className="text-sm text-gray-500">Loading details...</p>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center mt-4 md:mt-0">
                                <div className="flex items-center mr-4">
                                  <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">{appointment.date}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">{appointment.time}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 md:mt-0">
                                <Badge variant={
                                  appointment.status === "confirmed" ? "default" : 
                                  appointment.status === "pending" ? "outline" : 
                                  "destructive"
                                }>
                                  {appointment.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4 space-x-2">
                              <Button variant="outline" size="sm">Reschedule</Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={async (event) => {
                                  // Disable button during cancellation
                                  const target = event.target as HTMLButtonElement;
                                  const originalText = target.innerText;
                                  target.disabled = true;
                                  target.innerText = "Cancelling...";
                                  
                                  // Call API to cancel appointment
                                  const success = await apiClient.updateAppointmentStatus(
                                    appointment.id, 
                                    "canceled"
                                  );
                                  
                                  // If successful, refetch appointments to update UI
                                  if (success) {
                                    refetch();
                                  }
                                  
                                  // Re-enable button
                                  target.disabled = false;
                                  target.innerText = originalText;
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No upcoming appointments.
                        <div className="mt-4">
                          <Button onClick={() => navigate('/consultation')} className="bg-mediwrap-blue hover:bg-mediwrap-blue-light">
                            Book an Appointment
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <div className="py-8 text-center text-gray-500">
                      No past appointments found.
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all">
                    <div className="py-8 text-center text-gray-500">
                      {isLoading ? "Loading appointments..." : (
                        appointments.length > 0 ? 
                          "All appointments listed above." : 
                          "No appointments found."
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={displayData}
        onProfileUpdated={fetchProfileData}
      />
    </Layout>
  );
};

export default Profile;
