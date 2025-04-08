
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-card border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-mediwrap-blue dark:text-mediwrap-blue-light font-bold text-2xl">Medi</span>
              <span className="text-mediwrap-green dark:text-mediwrap-green-light font-bold text-2xl">Wrap</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your complete healthcare management solution. Book appointments, order medicines, donate blood, and connect with a community of healthcare professionals.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-mediwrap-blue">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-mediwrap-blue">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-mediwrap-blue">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/consultation" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Doctor Consultation
                </Link>
              </li>
              <li>
                <Link to="/pharmacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Medicine Delivery
                </Link>
              </li>
              <li>
                <Link to="/blood-donation" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Blood Donation
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Health Community
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-mediwrap-blue dark:hover:text-mediwrap-blue-light">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2 text-mediwrap-blue dark:text-mediwrap-blue-light" />
                +91 98765 41230
              </li>
              <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2 text-mediwrap-blue dark:text-mediwrap-blue-light" />
                support@mediwrap.com
              </li>
              <li className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                123 Healthcare Avenue
                <br />
                Medical District, MD 12345
                <br />
                India
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} MediWrap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
