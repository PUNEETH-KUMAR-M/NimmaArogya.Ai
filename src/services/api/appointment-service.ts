import { supabase } from "@/integrations/supabase/client";
import { Appointment, toast } from "./types";

export class AppointmentService {
  // Book an appointment
  async bookAppointment(doctorId: string, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to book an appointment",
          variant: "destructive",
        });
        return null;
      }

      const newAppointment = {
        doctor_id: doctorId,
        patient_id: user.id,
        date: appointmentData.date || new Date().toISOString().split('T')[0],
        time: appointmentData.time || "10:00 AM",
        type: appointmentData.type || "video",
        status: "pending"
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select()
        .single();
      
      if (error) {
        console.error('Error booking appointment:', error);
        toast({
          title: "Error",
          description: "Failed to book appointment",
          variant: "destructive",
        });
        return null;
      }
      
      return data as Appointment;
    } catch (error) {
      console.error('Error in bookAppointment:', error);
      return null;
    }
  }

  // Update appointment status
  async updateAppointmentStatus(id: string, status: "confirmed" | "pending" | "canceled"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating appointment status:', error);
        toast({
          title: "Error",
          description: "Failed to update appointment status",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: `Appointment ${status === 'canceled' ? 'canceled' : 'updated'} successfully`,
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      return false;
    }
  }

  // Get all appointments
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*');
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
      
      return data as Appointment[];
    } catch (error) {
      console.error('Error in getAllAppointments:', error);
      return [];
    }
  }

  // Get appointments for a doctor
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId);
      
      if (error) {
        console.error('Error fetching doctor appointments:', error);
        return [];
      }
      
      return data as Appointment[];
    } catch (error) {
      console.error('Error in getDoctorAppointments:', error);
      return [];
    }
  }

  // Get appointments for a patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId);
      
      if (error) {
        console.error('Error fetching patient appointments:', error);
        return [];
      }
      
      return data as Appointment[];
    } catch (error) {
      console.error('Error in getPatientAppointments:', error);
      return [];
    }
  }
}
