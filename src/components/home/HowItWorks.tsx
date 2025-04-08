
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Video, FileText, MapPin } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Book an Appointment",
    description: "Choose a doctor based on specialty, ratings, and availability, then book an appointment that fits your schedule."
  },
  {
    icon: MapPin,
    title: "Select Consultation Type",
    description: "Decide between an in-person visit with directions to the hospital or a convenient virtual consultation."
  },
  {
    icon: Video,
    title: "Attend Consultation",
    description: "Meet your doctor online or in-person for diagnosis, treatment plans, and prescriptions."
  },
  {
    icon: FileText,
    title: "Manage Records",
    description: "Access your medical records, prescriptions, and doctor's notes after your consultation."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            How Doctor Consultation Works
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get professional medical advice in four simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="bg-mediwrap-blue/10 dark:bg-mediwrap-blue/20 rounded-full p-6 mb-6">
                  <step.icon className="w-10 h-10 text-mediwrap-blue dark:text-mediwrap-blue-light" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-mediwrap-blue/30 dark:bg-mediwrap-blue-light/30 -translate-y-1/2" style={{ width: "calc(100% - 3rem)" }}>
                  <div className="absolute right-0 -top-1.5 w-3 h-3 bg-mediwrap-blue dark:bg-mediwrap-blue-light rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/consultation">
            <Button size="lg" className="bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white px-8">
              Book a Consultation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
