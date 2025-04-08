import { toast } from "@/hooks/use-toast";

export interface Doctor {
  id: string;
  user_id?: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews: number;
  image: string;
  available: boolean;
  next_available: string; // Changed from Date to string to match Supabase's output
  fee: number;
  education: string;
  experience: string;
  location: string;
  online: boolean;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  type: "video" | "in-person";
  status: "confirmed" | "pending" | "canceled";
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  rating?: number;
  reviews?: number;
  prescription?: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export { toast };
