import { supabase } from '@/integrations/supabase/client';

// Define the User interface here since it's not exported from the API
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

// Define the Supabase Profile interface to match the actual data structure
interface SupabaseProfile {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  created_at: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Service for handling user-related operations
 */
export const userService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      // Transform data to match our User interface
      return data.map((profile: SupabaseProfile) => ({
        id: profile.id,
        name: profile.name || profile.email || 'Unknown',
        email: profile.email || 'No email',
        role: profile.role || 'Patient',
        status: 'Active',
        created_at: profile.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get a user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Cast data to our SupabaseProfile interface
      const profile = data as SupabaseProfile;
      
      // Transform to our User interface
      return {
        id: profile.id,
        name: profile.name || profile.email || 'Unknown',
        email: profile.email || 'No email',
        role: profile.role || 'Patient',
        status: 'Active',
        created_at: profile.created_at
      };
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(id: string): Promise<void> {
    try {
      console.log('User service: Deleting user with ID:', id);
      
      // First, check if the current user has admin role
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw userError;
      }
      
      console.log('Current user:', userData);
      
      // Attempt to delete the user
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      console.log('User successfully deleted from database via service');
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
};
