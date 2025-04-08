
/**
 * API service for handling all backend requests using Supabase
 */
import { DoctorService } from "./doctor-service";
import { AppointmentService } from "./appointment-service";
import { ProductService } from "./product-service";
import { Doctor, Appointment, Product } from "./types";

// Re-export types
export type { Doctor, Appointment, Product } from "./types";

// API client class to handle all backend requests through a facade pattern
export class ApiClient {
  private doctorService: DoctorService;
  private appointmentService: AppointmentService;
  private productService: ProductService;

  constructor() {
    this.doctorService = new DoctorService();
    this.appointmentService = new AppointmentService();
    this.productService = new ProductService();
  }

  // Doctor related methods
  async getDoctors() {
    return this.doctorService.getDoctors();
  }
  
  async getDoctor(id: string) {
    return this.doctorService.getDoctor(id);
  }

  async addDoctor(doctorData: Omit<Doctor, "id">) {
    return this.doctorService.addDoctor(doctorData);
  }

  async updateDoctor(id: string, updates: Partial<Doctor>) {
    return this.doctorService.updateDoctor(id, updates);
  }

  async searchDoctors(searchTerm: string) {
    return this.doctorService.searchDoctors(searchTerm);
  }

  // Appointment related methods
  async bookAppointment(doctorId: string, appointmentData: Partial<Appointment>) {
    return this.appointmentService.bookAppointment(doctorId, appointmentData);
  }

  async updateAppointmentStatus(id: string, status: "confirmed" | "pending" | "canceled") {
    return this.appointmentService.updateAppointmentStatus(id, status);
  }

  async getAllAppointments() {
    return this.appointmentService.getAllAppointments();
  }

  async getDoctorAppointments(doctorId: string) {
    return this.appointmentService.getDoctorAppointments(doctorId);
  }

  async getPatientAppointments(patientId: string) {
    return this.appointmentService.getPatientAppointments(patientId);
  }

  // Product related methods
  async getProducts() {
    return this.productService.getProducts();
  }

  async getProduct(id: string) {
    return this.productService.getProduct(id);
  }

  async addProduct(productData: Omit<Product, "id">) {
    return this.productService.addProduct(productData);
  }

  async updateProductStock(id: string, newStock: number) {
    return this.productService.updateProductStock(id, newStock);
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;
