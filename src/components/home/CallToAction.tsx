
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-mediwrap-blue to-mediwrap-blue-light rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 lg:p-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to take control of your healthcare journey?
              </h2>
              <p className="text-lg text-white/90 mb-8">
                Join MediWrap today and experience seamless healthcare management with doctor consultations, medicine delivery, blood donation opportunities, and a supportive community.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="bg-white text-mediwrap-blue hover:bg-gray-100">
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/consultation">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-full min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Healthcare professionals"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-mediwrap-blue/80"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
