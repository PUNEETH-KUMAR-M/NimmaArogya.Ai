
import { supabase } from "@/integrations/supabase/client";
import { Doctor, toast } from "./types";

export class DoctorService {
  // Get all doctors
  async getDoctors(): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*');
      
      if (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Error",
          description: "Failed to fetch doctors",
          variant: "destructive",
        });
        return [];
      }
      
      return data as Doctor[];
    } catch (error) {
      console.error('Error in getDoctors:', error);
      return [];
    }
  }

  // Get a single doctor by ID
  async getDoctor(id: string): Promise<Doctor | undefined> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching doctor:', error);
        return undefined;
      }
      
      return data as Doctor;
    } catch (error) {
      console.error('Error in getDoctor:', error);
      return undefined;
    }
  }

  // Add a new doctor
  async addDoctor(doctorData: Omit<Doctor, "id">): Promise<Doctor | null> {
    try {
      // Process next_available field properly
      const processedData = {
        ...doctorData,
        // Convert to string if it's not already a string
        next_available: typeof doctorData.next_available !== 'string'
          ? (doctorData.next_available ? String(doctorData.next_available) : null)
          : doctorData.next_available
      };

      const { data, error } = await supabase
        .from('doctors')
        .insert([processedData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding doctor:', error);
        toast({
          title: "Error",
          description: "Failed to add doctor",
          variant: "destructive",
        });
        return null;
      }
      
      return data as Doctor;
    } catch (error) {
      console.error('Error in addDoctor:', error);
      return null;
    }
  }

  // Update a doctor
  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | undefined> {
    try {
      // Process next_available field properly
      const processedUpdates = {
        ...updates,
        // Only process next_available if it exists in updates
        ...(updates.next_available !== undefined && {
          next_available: typeof updates.next_available !== 'string'
            ? (updates.next_available ? String(updates.next_available) : null)
            : updates.next_available
        })
      };

      const { data, error } = await supabase
        .from('doctors')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating doctor:', error);
        toast({
          title: "Error",
          description: "Failed to update doctor",
          variant: "destructive",
        });
        return undefined;
      }
      
      return data as Doctor;
    } catch (error) {
      console.error('Error in updateDoctor:', error);
      return undefined;
    }
  }

  // Search doctors by name, specialty or hospital
  async searchDoctors(searchTerm: string): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,hospital.ilike.%${searchTerm}%`);
      
      if (error) {
        console.error('Error searching doctors:', error);
        return [];
      }
      
      return data as Doctor[];
    } catch (error) {
      console.error('Error in searchDoctors:', error);
      return [];
    }
  }
}
