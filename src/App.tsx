
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";

// Pages
import Index from "./pages/Index";
import Consultation from "./pages/Consultation";
import Pharmacy from "./pages/Pharmacy";
import BloodDonation from "./pages/BloodDonation";
import Community from "./pages/Community";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import DoctorRegistration from "./pages/DoctorRegistration";
import NotFound from "./pages/NotFound";
import DoctorPanel from "./pages/DoctorPanel";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/pharmacy" element={<Pharmacy />} />
              <Route path="/blood-donation" element={<BloodDonation />} />
              <Route path="/community" element={<Community />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/doctor-panel" element={<DoctorPanel />} />
              <Route path="/doctor-registration" element={<DoctorRegistration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
