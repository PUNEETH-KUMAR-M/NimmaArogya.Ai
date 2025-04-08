
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-mediwrap-blue/10 to-mediwrap-green/10 dark:from-mediwrap-blue/5 dark:to-mediwrap-green/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Your Health, <span className="text-mediwrap-blue dark:text-mediwrap-blue-light">Our Priority</span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                MediWrap brings healthcare to your fingertips. Book appointments, order medicines, donate blood, and join a community of health-conscious individuals.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/consultation">
                <Button size="lg" className="bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white px-6">
                  Book Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pharmacy">
                <Button size="lg" variant="outline" className="border-mediwrap-blue text-mediwrap-blue hover:bg-mediwrap-blue/10">
                  Order Medicines
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-mediwrap-blue dark:text-mediwrap-blue-light">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-mediwrap-blue dark:text-mediwrap-blue-light">100k+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-mediwrap-blue dark:text-mediwrap-blue-light">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hospitals</div>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-mediwrap-blue/20 rounded-full filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-mediwrap-green/20 rounded-full filter blur-3xl opacity-70"></div>
            <img
              src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              alt="Doctor with patient"
              className="relative z-10 rounded-2xl shadow-xl w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
