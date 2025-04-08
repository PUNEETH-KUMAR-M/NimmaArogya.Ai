import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, User, ShoppingCart, Moon, Sun, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { totalItems } = useCart(); // Use the cart hook to get the total items
  const location = useLocation();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    toast({
      title: isDarkMode ? "Light mode activated" : "Dark mode activated",
      duration: 2000,
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white dark:bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-mediwrap-blue dark:text-mediwrap-blue-light font-bold text-2xl">Medi</span>
              <span className="text-mediwrap-green dark:text-mediwrap-green-light font-bold text-2xl">Wrap</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/consultation" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/consultation'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light'
                  : 'text-gray-700 dark:text-gray-300 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light'
              }`}
            >
              Consultation
            </Link>
            <Link 
              to="/pharmacy" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/pharmacy'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light'
                  : 'text-gray-700 dark:text-gray-300 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light'
              }`}
            >
              Pharmacy
            </Link>
            <Link 
              to="/blood-donation" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/blood-donation'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light'
                  : 'text-gray-700 dark:text-gray-300 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light'
              }`}
            >
              Blood Donation
            </Link>
            <Link 
              to="/community" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/community'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light'
                  : 'text-gray-700 dark:text-gray-300 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light'
              }`}
            >
              Community
            </Link>
            <Link 
              to="/doctor-registration" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                location.pathname === '/doctor-registration'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light'
                  : 'text-gray-700 dark:text-gray-300 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>For Doctors</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-700 dark:text-gray-300">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-mediwrap-red rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="default" className="bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white">
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-700 dark:text-gray-300">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-mediwrap-red rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-gray-700 dark:text-gray-300">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-card shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/consultation"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/consultation'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light bg-gray-50 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Consultation
            </Link>
            <Link
              to="/pharmacy"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/pharmacy'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light bg-gray-50 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Pharmacy
            </Link>
            <Link
              to="/blood-donation"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/blood-donation'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light bg-gray-50 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blood Donation
            </Link>
            <Link
              to="/community"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/community'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light bg-gray-50 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Community
            </Link>
            <Link
              to="/doctor-registration"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/doctor-registration'
                  ? 'text-mediwrap-blue dark:text-mediwrap-blue-light bg-gray-50 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span>For Doctors</span>
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 rounded-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">Guest User</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">guest@example.com</div>
              </div>
              <div className="ml-auto flex items-center space-x-4">
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-mediwrap-red rounded-full">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-3 px-2 flex flex-col space-y-2">
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/profile'
                    ? 'text-mediwrap-blue dark:text-mediwrap-blue-light bg-gray-50 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-mediwrap-blue hover:bg-mediwrap-blue-light rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
