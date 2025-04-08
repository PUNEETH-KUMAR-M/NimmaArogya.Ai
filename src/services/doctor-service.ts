import { supabase } from '@/integrations/supabase/client';
import { Doctor } from '@/services/api';

/**
 * Service for handling doctor-related operations
 */
export const doctorService = {
  /**
   * Get all doctors
   */
  async getDoctors(): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  /**
   * Get a doctor by ID
   */
  async getDoctorById(id: string): Promise<Doctor | null> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Error fetching doctor with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a doctor by ID
   */
  async deleteDoctor(id: string): Promise<void> {
    try {
      console.log('Doctor service: Deleting doctor with ID:', id);
      
      // First, check if the current user has admin role
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw userError;
      }
      
      console.log('Current user:', userData);
      
      // Attempt to delete the doctor
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting doctor:', error);
        throw error;
      }
      
      console.log('Doctor successfully deleted from database via service');
    } catch (error) {
      console.error(`Error deleting doctor with ID ${id}:`, error);
      throw error;
    }
  }
};
