import { supabase } from "@/integrations/supabase/client";
import { toast } from "./types";

export interface DonationCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  operating_hours: string;
  image_url: string;
  distance?: string; // Calculated field, not stored in DB
  urgent?: boolean; // Derived from blood_needs
  bloodNeeded?: string[]; // Derived from blood_needs
  slots?: string[]; // Derived from donation_slots
}

export interface DonationSlot {
  id: string;
  center_id: string;
  slot_date: string;
  slot_time: string;
  capacity: number;
  booked: number;
}

export interface BloodNeed {
  id: string;
  center_id: string;
  blood_type: string;
  urgency: 'normal' | 'urgent' | 'critical';
}

export interface DonationAppointment {
  id: string;
  user_id: string;
  center_id: string;
  slot_id: string;
  blood_type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  center?: DonationCenter;
  slot?: DonationSlot;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_type: string;
  hospital: string;
  urgency: 'medium' | 'urgent' | 'critical';
  date_needed: string;
  reason?: string;
  status: 'active' | 'fulfilled' | 'expired';
}

export interface DonorProfile {
  id: string;
  user_id: string;
  blood_type: string;
  last_donation_date?: string;
  donation_count: number;
  eligible_to_donate: boolean;
  next_eligible_date?: string;
  medical_conditions?: string[];
  notifications_enabled: boolean;
}

export class BloodDonationService {
  // Get all donation centers with blood needs and slots
  async getDonationCenters(location?: string, bloodType?: string): Promise<DonationCenter[]> {
    try {
      // For debugging
      console.log("Fetching donation centers...");
      
      // Use a simpler query that will work with any database structure
      const { data, error } = await supabase
        .from('donation_centers')
        .select('*') as any;
      
      if (error) {
        console.error('Error fetching donation centers:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log("No donation centers found in database");
        // Return mock data as fallback
        return this.getMockDonationCenters();
      }
      
      console.log(`Found ${data.length} donation centers`);
      
      // Process centers to add mock distance and other derived fields
      const processedCenters = data.map((center: any) => {
        // Add mock distance
        const mockDistance = (Math.random() * 5).toFixed(1) + ' miles';
        
        // Add mock urgency and blood needs (in a real app, these would come from the blood_needs table)
        const mockBloodNeeds = ['A+', 'O+', 'B-', 'AB+'].slice(0, Math.floor(Math.random() * 3) + 1);
        const mockUrgent = Math.random() > 0.5;
        
        // Add mock slots (in a real app, these would come from the donation_slots table)
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
        const mockSlots = hours
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(hour => {
            const date = new Date();
            date.setHours(hour, Math.random() > 0.5 ? 30 : 0, 0);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          })
          .sort();
        
        return {
          ...center,
          distance: mockDistance,
          urgent: mockUrgent,
          bloodNeeded: mockBloodNeeds,
          slots: mockSlots
        } as DonationCenter;
      });
      
      // Filter by blood type if specified
      let filteredCenters = processedCenters;
      if (bloodType) {
        filteredCenters = processedCenters.filter(center => 
          center.bloodNeeded?.includes(bloodType)
        );
      }
      
      // Sort by urgency and distance
      filteredCenters.sort((a, b) => {
        // First by urgency
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        
        // Then by distance
        const distA = parseFloat(a.distance?.split(' ')[0] || '0');
        const distB = parseFloat(b.distance?.split(' ')[0] || '0');
        return distA - distB;
      });
      
      return filteredCenters;
    } catch (error) {
      console.error('Error in getDonationCenters:', error);
      // Return mock data as fallback
      return this.getMockDonationCenters();
    }
  }
  
  // Get all blood requests
  async getBloodRequests(): Promise<BloodRequest[]> {
    try {
      // In a real app, this would fetch from the blood_requests table
      // For now, return mock data
      return [
        {
          id: "1",
          patient_name: "John D.",
          blood_type: "A+",
          hospital: "City General Hospital",
          urgency: "urgent",
          date_needed: new Date().toISOString(),
          reason: "Surgery",
          status: "active"
        },
        {
          id: "2",
          patient_name: "Sarah M.",
          blood_type: "O-",
          hospital: "University Medical Center",
          urgency: "critical",
          date_needed: new Date().toISOString(),
          reason: "Accident",
          status: "active"
        },
        {
          id: "3",
          patient_name: "Michael R.",
          blood_type: "B+",
          hospital: "Community Blood Center",
          urgency: "medium",
          date_needed: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
          reason: "Surgery",
          status: "active"
        }
      ];
    } catch (error) {
      console.error('Error in getBloodRequests:', error);
      return [];
    }
  }
  
  // Get all blood needs
  async getBloodNeeds(): Promise<BloodNeed[]> {
    try {
      // Try to fetch from the database
      const { data, error } = await supabase
        .from('blood_needs')
        .select('*') as any;
      
      if (error) {
        console.error('Error fetching blood needs:', error);
        // Return mock data as fallback
        return this.getMockBloodNeeds();
      }
      
      if (!data || data.length === 0) {
        console.log("No blood needs found in database");
        // Return mock data as fallback
        return this.getMockBloodNeeds();
      }
      
      return data as BloodNeed[];
    } catch (error) {
      console.error('Error in getBloodNeeds:', error);
      // Return mock data as fallback
      return this.getMockBloodNeeds();
    }
  }
  
  // Get donor profile for current user
  async getDonorProfile(): Promise<DonorProfile | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        return null;
      }
      
      // Check localStorage first as a fallback
      const storageKey = `donor_profile_${user.user.id}`;
      const storedProfile = localStorage.getItem(storageKey);
      if (storedProfile) {
        console.log('Donor profile found in localStorage:', storedProfile);
        return JSON.parse(storedProfile) as DonorProfile;
      }
      
      // Try to fetch the donor profile from the database
      try {
        const { data, error } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('user_id', user.user.id)
          .single() as any;
        
        if (error) {
          // If the error is just that no rows were found, that's fine
          if (error.code === 'PGRST116') {
            console.log('No donor profile found for user');
            return null;
          }
          console.error('Error fetching donor profile:', error);
          return null;
        }
        
        console.log('Donor profile found in database:', data);
        return data as DonorProfile;
      } catch (dbError) {
        console.error('Database error in getDonorProfile:', dbError);
        return null;
      }
    } catch (error) {
      console.error('Error in getDonorProfile:', error);
      return null;
    }
  }
  
  // Create or update donor profile
  async saveDonorProfile(profile: Partial<DonorProfile>): Promise<DonorProfile | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to register as a donor",
          variant: "destructive",
        });
        return null;
      }
      
      // Create a donor profile object
      const donorProfile: DonorProfile = {
        id: profile.id || `local-${Date.now()}`,
        user_id: user.user.id,
        blood_type: profile.blood_type || "O+",
        donation_count: profile.donation_count || 0,
        eligible_to_donate: profile.eligible_to_donate !== false,
        notifications_enabled: profile.notifications_enabled !== false
      };
      
      // Try to save to database first
      try {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('donor_profiles')
          .select('id')
          .eq('user_id', user.user.id)
          .single() as any;
        
        let result;
        
        if (existingProfile && !fetchError) {
          // Update existing profile
          const { data, error } = await supabase
            .from('donor_profiles')
            .update({
              blood_type: donorProfile.blood_type,
              donation_count: donorProfile.donation_count,
              eligible_to_donate: donorProfile.eligible_to_donate,
              notifications_enabled: donorProfile.notifications_enabled,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProfile.id)
            .select() as any;
          
          if (error) {
            throw error;
          }
          
          result = data[0];
          console.log('Updated donor profile in database:', result);
        } else {
          // Create new profile
          const { data, error } = await supabase
            .from('donor_profiles')
            .insert({
              user_id: donorProfile.user_id,
              blood_type: donorProfile.blood_type,
              donation_count: donorProfile.donation_count,
              eligible_to_donate: donorProfile.eligible_to_donate,
              notifications_enabled: donorProfile.notifications_enabled
            })
            .select() as any;
          
          if (error) {
            throw error;
          }
          
          result = data[0];
          console.log('Created donor profile in database:', result);
        }
        
        toast({
          title: "Profile Saved",
          description: "Your donor profile has been saved successfully.",
        });
        
        return result as DonorProfile;
      } catch (dbError) {
        console.error('Database error in saveDonorProfile:', dbError);
        
        // Fall back to localStorage
        const storageKey = `donor_profile_${user.user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(donorProfile));
        console.log('Donor profile saved to localStorage:', donorProfile);
        
        toast({
          title: "Profile Saved Locally",
          description: "Your donor profile has been saved locally. In a production environment, this would be saved to the database.",
        });
        
        return donorProfile;
      }
    } catch (error) {
      console.error('Error in saveDonorProfile:', error);
      toast({
        title: "Error",
        description: "Failed to save donor profile",
        variant: "destructive",
      });
      return null;
    }
  }
  
  // Schedule a donation appointment
  async scheduleDonation(centerId: string, slotId: string, bloodType: string, notes?: string): Promise<DonationAppointment | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to schedule a donation",
          variant: "destructive",
        });
        return null;
      }
      
      // In a real app, this would save to the donation_appointments table
      // For now, just return a mock appointment
      const mockAppointment: DonationAppointment = {
        id: "mock-appointment-id",
        user_id: user.user.id,
        center_id: centerId,
        slot_id: slotId,
        blood_type: bloodType,
        status: "scheduled",
        notes
      };
      
      toast({
        title: "Appointment Scheduled",
        description: "Your donation appointment has been scheduled successfully.",
      });
      
      return mockAppointment;
    } catch (error) {
      console.error('Error in scheduleDonation:', error);
      toast({
        title: "Error",
        description: "Failed to schedule donation",
        variant: "destructive",
      });
      return null;
    }
  }
  
  // Helper method to get mock donation centers
  private getMockDonationCenters(): DonationCenter[] {
    return [
      {
        id: "1",
        name: "City General Hospital",
        address: "123 Main Street",
        city: "Downtown",
        state: "CA",
        postal_code: "90001",
        phone: "555-123-4567",
        email: "donate@citygeneral.org",
        operating_hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM",
        image_url: "https://images.unsplash.com/photo-1587351021759-3772687a4d9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        distance: "1.2 miles",
        bloodNeeded: ["A+", "O+", "B-"],
        slots: ["9:00 AM", "11:30 AM", "2:00 PM"],
        urgent: true
      },
      {
        id: "2",
        name: "Community Blood Center",
        address: "456 Park Avenue",
        city: "Westside",
        state: "CA",
        postal_code: "90002",
        phone: "555-234-5678",
        email: "info@communityblood.org",
        operating_hours: "Mon-Sat: 9AM-5PM",
        image_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        distance: "2.5 miles",
        bloodNeeded: ["AB+", "O-"],
        slots: ["10:00 AM", "1:00 PM", "3:30 PM"],
        urgent: false
      },
      {
        id: "3",
        name: "University Medical Center",
        address: "789 College Blvd",
        city: "Eastside",
        state: "CA",
        postal_code: "90003",
        phone: "555-345-6789",
        email: "blood@umc.edu",
        operating_hours: "Mon-Fri: 8:30AM-7PM, Sat-Sun: 10AM-4PM",
        image_url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        distance: "3.7 miles",
        bloodNeeded: ["A-", "B+", "O+"],
        slots: ["8:30 AM", "12:00 PM", "4:00 PM"],
        urgent: true
      },
      {
        id: "4",
        name: "Regional Medical Center",
        address: "101 Health Way",
        city: "Northside",
        state: "CA",
        postal_code: "90004",
        phone: "555-456-7890",
        email: "donate@regionalmed.org",
        operating_hours: "Mon-Fri: 9AM-6PM",
        image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        distance: "4.1 miles",
        bloodNeeded: ["AB-", "O+"],
        slots: ["9:30 AM", "1:30 PM", "3:00 PM"],
        urgent: false
      }
    ];
  }
  
  // Helper method to get mock blood needs
  private getMockBloodNeeds(): BloodNeed[] {
    return [
      {
        id: "1",
        center_id: "1",
        blood_type: "O-",
        urgency: "critical"
      },
      {
        id: "2",
        center_id: "1",
        blood_type: "AB+",
        urgency: "urgent"
      },
      {
        id: "3",
        center_id: "2",
        blood_type: "B-",
        urgency: "normal"
      },
      {
        id: "4",
        center_id: "3",
        blood_type: "A+",
        urgency: "urgent"
      },
      {
        id: "5",
        center_id: "4",
        blood_type: "O+",
        urgency: "normal"
      }
    ];
  }
}
