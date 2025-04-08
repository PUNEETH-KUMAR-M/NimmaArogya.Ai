
import { 
  Video, 
  MapPin, 
  Pill, 
  Truck, 
  Heart, 
  Users, 
  FileText, 
  Calendar 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Online Consultation",
    description: "Connect with doctors through secure video calls from the comfort of your home.",
    icon: Video,
    color: "bg-mediwrap-blue",
    link: "/consultation"
  },
  {
    title: "In-Person Visits",
    description: "Book physical appointments with top doctors at hospitals near you.",
    icon: MapPin,
    color: "bg-mediwrap-green",
    link: "/consultation"
  },
  {
    title: "Medicine Delivery",
    description: "Order prescribed medicines and healthcare products online.",
    icon: Pill,
    color: "bg-mediwrap-blue",
    link: "/pharmacy"
  },
  {
    title: "Order Tracking",
    description: "Track your medicine orders in real-time until they reach your doorstep.",
    icon: Truck,
    color: "bg-mediwrap-green",
    link: "/pharmacy"
  },
  {
    title: "Blood Donation",
    description: "Register as a donor and receive notifications for blood donation opportunities.",
    icon: Heart,
    color: "bg-mediwrap-red",
    link: "/blood-donation"
  },
  {
    title: "Health Community",
    description: "Connect with others, share experiences, and learn from health discussions.",
    icon: Users,
    color: "bg-mediwrap-orange",
    link: "/community"
  },
  {
    title: "Medical Records",
    description: "Store and access all your medical records, prescriptions, and reports securely.",
    icon: FileText,
    color: "bg-mediwrap-blue",
    link: "/profile"
  },
  {
    title: "Appointment Reminders",
    description: "Get timely reminders for upcoming appointments and medication schedules.",
    icon: Calendar,
    color: "bg-mediwrap-green",
    link: "/consultation"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            MediWrap offers a complete range of healthcare services designed to make your health management simple and efficient.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <a 
              href={feature.link} 
              key={index}
              className="group"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-mediwrap-blue/50 dark:hover:border-mediwrap-blue-light/50">
                <CardHeader>
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                    <feature.icon size={24} />
                  </div>
                  <CardTitle className="group-hover:text-mediwrap-blue dark:group-hover:text-mediwrap-blue-light">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
