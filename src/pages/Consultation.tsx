import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Video, Users, MapPin, Calendar, Clock, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient, { Doctor } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Consultation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [consultationType, setConsultationType] = useState("all");
  const { toast } = useToast();

  const { data: doctors = [], isLoading, refetch } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiClient.getDoctors(),
  });

  useEffect(() => {
    const channel = supabase
      .channel('public:doctors')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'doctors' 
      }, () => {
        refetch();
      })
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [refetch]);

  const handleBookAppointment = (doctorId: string, doctorName: string, type: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    toast({
      title: "Appointment Requested",
      description: `Your ${type} appointment with ${doctorName} has been requested. We'll confirm shortly.`,
    });
    
    apiClient.bookAppointment(doctorId, {
      type: type === "video" ? "video" : "in-person",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
    });
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (consultationType === "online" && !doctor.online) return false;
    if (consultationType === "in-person" && doctor.online) return false;
    
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="bg-gradient-to-br from-mediwrap-blue/10 to-mediwrap-green/10 dark:from-mediwrap-blue/5 dark:to-mediwrap-green/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Find and Book Doctor Appointments
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Connect with top healthcare professionals for online or in-person consultations
            </p>
          </div>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by doctor name, specialty, or hospital"
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger 
              value="all" 
              onClick={() => setConsultationType("all")}
            >
              All Consultations
            </TabsTrigger>
            <TabsTrigger 
              value="online" 
              onClick={() => setConsultationType("online")}
              className="flex items-center"
            >
              <Video className="w-4 h-4 mr-2" />
              Online
            </TabsTrigger>
            <TabsTrigger 
              value="in-person" 
              onClick={() => setConsultationType("in-person")}
              className="flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              In-Person
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-500 dark:text-gray-400">Loading doctors...</p>
                </div>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden shadow-lg border-0 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 p-6 flex flex-col items-center justify-center bg-gradient-to-b from-mediwrap-blue/5 to-mediwrap-blue/10 border-r border-gray-200 dark:border-gray-700 rounded-l">
                        <div className="relative">
                          {doctor.image ? (
                            <img
                              src={doctor.image}
                              alt={doctor.name}
                              className="w-32 h-32 rounded-full object-cover border-2 border-mediwrap-blue/30 shadow-md"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div 
                            className={`${doctor.image ? 'hidden' : ''} w-32 h-32 rounded-full border-2 border-mediwrap-blue/30 bg-gradient-to-br from-mediwrap-blue/20 to-mediwrap-blue/40 flex flex-col items-center justify-center shadow-md`}
                          >
                            <span className="text-xs font-medium text-mediwrap-blue/70 mb-1">Dr.</span>
                            <span className="text-2xl font-bold text-mediwrap-blue">
                             {doctor.name.split(' ').map(name => 
                                name.charAt(0).toUpperCase()
                              ).join('')} 
                            </span>
                          </div>
                          {doctor.available && (
                            <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></span>
                          )}
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-center text-gray-800 dark:text-gray-100">Dr. {doctor.name}</h3>
                        <p className="text-mediwrap-blue font-medium text-center">{doctor.specialty}</p>
                        <div className="flex items-center mt-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium">{doctor.rating}</span>
                          <span className="ml-1 text-gray-500 text-sm">({doctor.reviews} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="md:w-3/4 p-6 bg-white dark:bg-gray-900 rounded-r">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hospital</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{doctor.hospital}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-mediwrap-blue mr-1" />
                              <p className="font-medium text-gray-800 dark:text-gray-200">{doctor.location}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Next Available</p>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-mediwrap-blue mr-1" />
                              <p className="font-medium text-gray-800 dark:text-gray-200">{doctor.next_available}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">About</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Education</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{doctor.education}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{doctor.experience}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                          <div className="flex items-center">
                            <p className="text-lg font-bold text-mediwrap-blue mr-2">₹{doctor.fee}</p>
                            <span className="text-sm text-gray-500">per consultation</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              className="bg-mediwrap-blue hover:bg-mediwrap-blue-light flex items-center gap-2"
                              onClick={() => handleBookAppointment(doctor.id, doctor.name, "video")}
                            >
                              <Video className="h-4 w-4" />
                              <span>Video Consultation</span>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="border-mediwrap-blue text-mediwrap-blue hover:bg-mediwrap-blue/10 flex items-center gap-2"
                              onClick={() => handleBookAppointment(doctor.id, doctor.name, "in-person")}
                            >
                              <Users className="h-4 w-4" />
                              <span>In-Person Visit</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-500 dark:text-gray-400">No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="online">
            {/* Content will be shown through filtering */}
          </TabsContent>
          
          <TabsContent value="in-person">
            {/* Content will be shown through filtering */}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Consultation;
