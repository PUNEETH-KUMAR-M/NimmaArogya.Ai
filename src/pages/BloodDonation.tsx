import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Calendar, Bell, Heart, Clock, Check, X, Loader2, Droplet } from "lucide-react";
import { BloodDonationService, DonationCenter, BloodRequest, DonorProfile, BloodNeed } from "@/services/api/blood-donation-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const bloodDonationService = new BloodDonationService();

const BloodDonation = () => {
  const [bloodType, setBloodType] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();
  const [showRegistration, setShowRegistration] = useState(false);
  const [donorForm, setDonorForm] = useState<Partial<DonorProfile>>({
    blood_type: "",
    notifications_enabled: true,
    eligible_to_donate: true
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch donation centers
  const { 
    data: donationCenters = [], 
    isLoading: isLoadingCenters,
    refetch: refetchCenters
  } = useQuery({
    queryKey: ['donationCenters', bloodType, location],
    queryFn: () => bloodDonationService.getDonationCenters(location, bloodType === "all" ? "" : bloodType),
  });

  // Fetch blood requests
  const { 
    data: recentRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests 
  } = useQuery({
    queryKey: ['bloodRequests'],
    queryFn: () => bloodDonationService.getBloodRequests(),
  });

  // Fetch blood needs
  const { 
    data: bloodNeeds = [],
    isLoading: isLoadingNeeds,
    refetch: refetchNeeds 
  } = useQuery({
    queryKey: ['bloodNeeds'],
    queryFn: () => bloodDonationService.getBloodNeeds(),
  });

  // State to control how many blood needs to show
  const [showAllNeeds, setShowAllNeeds] = useState(false);

  // Get the blood needs to display (limited or all)
  const displayedNeeds = showAllNeeds ? bloodNeeds : bloodNeeds.slice(0, 5);

  // Fetch donor profile
  const { 
    data: donorProfile,
    isLoading: isLoadingProfile,
    refetch: refetchDonorProfile
  } = useQuery({
    queryKey: ['donorProfile'],
    queryFn: () => bloodDonationService.getDonorProfile(),
  });

  // Check if user is registered as a donor
  const isRegistered = !!donorProfile;

  // Set up donor form with profile data if available
  useEffect(() => {
    if (donorProfile) {
      setDonorForm({
        blood_type: donorProfile.blood_type,
        notifications_enabled: donorProfile.notifications_enabled,
        eligible_to_donate: donorProfile.eligible_to_donate,
        medical_conditions: donorProfile.medical_conditions
      });
    }
  }, [donorProfile]);

  // Mutation for registering as a donor
  const registerDonorMutation = useMutation({
    mutationFn: (profile: Partial<DonorProfile>) => bloodDonationService.saveDonorProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donorProfile'] });
      refetchDonorProfile();
      setShowRegistration(false);
      
      toast({
        title: "Registration Successful",
        description: "You've been registered as a blood donor. You'll receive notifications about donation opportunities near you.",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "There was an error registering you as a donor. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for scheduling a donation
  const scheduleDonationMutation = useMutation({
    mutationFn: ({ centerId, slotId, bloodType }: { centerId: string, slotId: string, bloodType: string }) => 
      bloodDonationService.scheduleDonation(centerId, slotId, bloodType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationCenters'] });
      
      toast({
        title: "Donation Scheduled",
        description: "Your blood donation has been scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "There was an error scheduling your donation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleScheduleDonation = (centerId: string, slot: string) => {
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }
    
    // Find the slot ID based on the formatted time
    const center = donationCenters.find(c => c.id === centerId);
    if (!center || !center.slots) {
      toast({
        title: "Error",
        description: "Could not find the selected slot. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // For now, we'll just use a placeholder slot ID
    // In a real implementation, you would need to fetch the actual slot IDs
    const slotId = `${centerId}-${slot.replace(/\s/g, '').replace(':', '')}`;
    
    scheduleDonationMutation.mutate({
      centerId,
      slotId,
      bloodType: donorProfile?.blood_type || ""
    });
  };

  const handleRegisterAsDonor = () => {
    if (!donorForm.blood_type) {
      toast({
        title: "Validation Error",
        description: "Please select your blood type",
        variant: "destructive",
      });
      return;
    }
    
    registerDonorMutation.mutate(donorForm);
  };

  const handleNotifyMe = (bloodType: string) => {
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }
    
    toast({
      title: "Notification Set",
      description: `You'll be notified when ${bloodType} blood type is needed near you.`,
    });
  };

  const handleSearch = () => {
    refetchCenters();
    
    toast({
      title: "Search Results",
      description: `Showing donation centers${bloodType ? ` for ${bloodType} blood type` : ""}${location ? ` near ${location}` : ""}.`,
    });
  };

  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Layout>
      {/* Hero section */}
      <div className="bg-gradient-to-br from-mediwrap-red/10 to-mediwrap-blue/10 dark:from-mediwrap-red/5 dark:to-mediwrap-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Blood Donation Network
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join our network of donors and help save lives by donating blood when and where it's needed
            </p>
          </div>
          
          <div className="mt-8 max-w-3xl mx-auto bg-white dark:bg-card shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="blood-type">Blood Type</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger id="blood-type" className="w-full">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Enter your location" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full bg-mediwrap-red hover:bg-mediwrap-red/90 text-white"
                  onClick={handleSearch}
                >
                  Find Donation Centers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Donation Centers */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Nearby Donation Centers</h2>
            
            {isLoadingCenters ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue" />
              </div>
            ) : donationCenters.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No donation centers found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {donationCenters.map((center) => (
                  <Card key={center.id} className={`overflow-hidden border ${center.urgent ? 'border-mediwrap-red/50' : ''}`}>
                    {center.urgent && (
                      <div className="bg-mediwrap-red text-white px-4 py-1 text-sm font-medium">
                        Urgent Need for {center.bloodNeeded?.join(", ")} Blood Types
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img 
                          src={center.image_url} 
                          alt={center.name}
                          className="w-full h-full object-cover"
                          style={{ maxHeight: '200px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <h3 className="text-xl font-bold mb-2">{center.name}</h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{center.address}, {center.city}</span>
                          <span className="ml-auto text-sm">{center.distance}</span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Blood Types Needed:</p>
                          <div className="flex flex-wrap gap-2">
                            {center.bloodNeeded?.map((type) => (
                              <span 
                                key={type} 
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  type === bloodType 
                                    ? 'bg-mediwrap-red text-white' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Available Slots:</p>
                          <div className="flex flex-wrap gap-2">
                            {center.slots && center.slots.length > 0 ? (
                              center.slots.map((slot, index) => (
                                <Button 
                                  key={index}
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleScheduleDonation(center.id, slot)}
                                  disabled={!isAuthenticated}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {slot}
                                </Button>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No available slots today</p>
                            )}
                          </div>
                        </div>
                        
                        {!isAuthenticated && (
                          <p className="text-xs text-amber-600 mb-4">
                            You need to sign in to schedule a donation
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-mediwrap-blue"
                            onClick={() => window.open(`tel:${center.phone}`)}
                          >
                            Call Center
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-mediwrap-red"
                            onClick={() => handleNotifyMe(center.bloodNeeded?.[0] || 'A+')}
                            disabled={!isAuthenticated}
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Notify Me
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Right column - Recent Requests & Donor Registration */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Blood Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-mediwrap-blue" />
                  </div>
                ) : recentRequests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active blood requests</p>
                ) : (
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div key={request.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{request.patient_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{request.hospital}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.blood_type === bloodType 
                              ? 'bg-mediwrap-red text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {request.blood_type}
                          </span>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                          <span className={`mr-2 px-1.5 py-0.5 rounded ${
                            request.urgency === 'critical' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : request.urgency === 'urgent'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                          </span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Needed: {new Date(request.date_needed).toLocaleDateString()}
                          </span>
                        </div>
                        {request.reason && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Reason: {request.reason}
                          </p>
                        )}
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            className="w-full bg-[#ff9580] hover:bg-[#ff9580]/90 text-white"
                            onClick={async () => {
                              if (!isAuthenticated) {
                                toast({
                                  title: "Authentication Required",
                                  description: "Please sign in to respond to blood requests.",
                                  variant: "destructive",
                                });
                                navigate("/login");
                                return;
                              }
                              
                              // Check if user is registered as a donor
                              await refetchDonorProfile();
                              
                              if (!donorProfile) {
                                toast({
                                  title: "Registration Required",
                                  description: "Please register as a donor to respond to blood requests.",
                                  variant: "destructive",
                                });
                                setShowRegistration(true);
                                return;
                              }
                              
                              handleNotifyMe(request.blood_type);
                              
                              toast({
                                title: "Thank You!",
                                description: `The hospital has been notified of your interest in donating ${request.blood_type} blood. They will contact you with further details.`,
                              });
                            }}
                            disabled={!isAuthenticated}
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            I Can Help
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button 
                  variant="link" 
                  className="text-mediwrap-blue"
                  onClick={() => {
                    // Fetch all blood requests
                    bloodDonationService.getBloodRequests().then(allRequests => {
                      // Update the state with all requests
                      queryClient.setQueryData(['bloodRequests'], allRequests);
                      
                      // Show a toast notification
                      toast({
                        title: "Blood Requests Updated",
                        description: "Showing all active blood requests.",
                      });
                    });
                  }}
                >
                  View All Requests
                </Button>
              </CardFooter>
            </Card>
            
            {/* Blood Needs Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Blood Needs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNeeds ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-mediwrap-blue" />
                  </div>
                ) : bloodNeeds.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No blood needs at this time</p>
                ) : (
                  <div className="space-y-4">
                    {displayedNeeds.map((need) => (
                      <div key={need.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <Droplet className={`h-8 w-8 mr-3 ${
                            need.urgency === 'critical' 
                              ? 'text-red-500' 
                              : need.urgency === 'urgent'
                                ? 'text-amber-500'
                                : 'text-blue-500'
                          }`} />
                          <div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              need.blood_type === bloodType 
                                ? 'bg-mediwrap-red text-white' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                              {need.blood_type}
                            </span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {need.urgency.charAt(0).toUpperCase() + need.urgency.slice(1)} need
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-[#ff9580] hover:bg-[#ff9580]/90 text-white"
                          onClick={async () => {
                            if (!isAuthenticated) {
                              toast({
                                title: "Authentication Required",
                                description: "Please sign in to respond to blood needs.",
                                variant: "destructive",
                              });
                              navigate("/login");
                              return;
                            }
                            
                            // Check if user is registered as a donor
                            await refetchDonorProfile();
                            
                            if (!donorProfile) {
                              toast({
                                title: "Registration Required",
                                description: "Please register as a donor to respond to blood needs.",
                                variant: "destructive",
                              });
                              setShowRegistration(true);
                              return;
                            }
                            
                            toast({
                              title: "Thank You!",
                              description: `The donation center has been notified of your interest in donating ${need.blood_type} blood.`,
                            });
                          }}
                          disabled={!isAuthenticated}
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          I Can Help
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button 
                  variant="link" 
                  className="text-mediwrap-blue"
                  onClick={() => {
                    if (!showAllNeeds) {
                      // If not showing all needs, toggle to show all
                      setShowAllNeeds(true);
                      toast({
                        title: "Showing All Blood Needs",
                        description: "Displaying all current blood needs.",
                      });
                    } else {
                      // If already showing all, refresh the data
                      bloodDonationService.getBloodNeeds().then(allNeeds => {
                        // Update the state with all needs
                        queryClient.setQueryData(['bloodNeeds'], allNeeds);
                        
                        // Show a toast notification
                        toast({
                          title: "Blood Needs Updated",
                          description: "Refreshed all current blood needs.",
                        });
                      });
                    }
                  }}
                >
                  {showAllNeeds ? "Refresh Needs" : `View All Needs (${bloodNeeds.length})`}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Become a Donor</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProfile ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-mediwrap-blue" />
                  </div>
                ) : isRegistered ? (
                  <div className="text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-500 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">You're a Registered Donor</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Blood Type: <span className="font-medium">{donorProfile?.blood_type}</span>
                    </p>
                    {donorProfile?.last_donation_date && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Last Donation: {new Date(donorProfile.last_donation_date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Donations: {donorProfile?.donation_count || 0}
                    </p>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Sign in to register as a blood donor and start saving lives
                    </p>
                    <Button 
                      className="bg-mediwrap-blue hover:bg-mediwrap-blue-light"
                      onClick={() => navigate('/login')}
                    >
                      Sign In to Continue
                    </Button>
                  </div>
                ) : showRegistration ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="donor-blood-type">Your Blood Type</Label>
                      <Select 
                        value={donorForm.blood_type} 
                        onValueChange={(value) => setDonorForm({...donorForm, blood_type: value})}
                      >
                        <SelectTrigger id="donor-blood-type">
                          <SelectValue placeholder="Select your blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={donorForm.notifications_enabled}
                        onChange={(e) => setDonorForm({...donorForm, notifications_enabled: e.target.checked})}
                        className="rounded border-gray-300 text-mediwrap-blue focus:ring-mediwrap-blue"
                      />
                      <Label htmlFor="notifications" className="text-sm cursor-pointer">
                        Receive notifications about donation opportunities
                      </Label>
                    </div>
                    
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRegistration(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-mediwrap-red hover:bg-mediwrap-red/90 text-white"
                        onClick={handleRegisterAsDonor}
                        disabled={registerDonorMutation.isPending}
                      >
                        {registerDonorMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register as Donor"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Heart className="h-12 w-12 text-mediwrap-red mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Become a Blood Donor</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Join our network of donors and help save lives by donating blood
                    </p>
                    <Button 
                      className="bg-mediwrap-red hover:bg-mediwrap-red/90 text-white"
                      onClick={() => setShowRegistration(true)}
                    >
                      Register Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BloodDonation;
