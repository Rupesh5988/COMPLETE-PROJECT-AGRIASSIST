import { Tractor, Leaf, Mail, MapPin, Phone, Twitter, Linkedin, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tractor className="h-8 w-8 text-green-400" />
              <h2 className="text-xl font-bold text-white">Farmer Advisory</h2>
            </div>
            <p className="text-sm text-gray-400">
              Empowering farmers with data-driven insights for a sustainable and profitable future. Your trusted partner in agriculture.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="mt-8 lg:mt-0">
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Dashboard</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Weather Forecast</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Market Prices</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">My Profile</a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="mt-8 lg:mt-0">
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Crop Information</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Pest & Disease Control</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Government Schemes</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Community Forum</a>
              </li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="mt-8 lg:mt-0">
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Contact Us</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-base text-gray-400">Miraj, Sangli, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
                <a href="mailto:contact@farmeradvisory.com" className="text-base text-gray-400 hover:text-white transition-colors duration-200">contact@farmeradvisory.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <a href="tel:+910000000000" className="text-base text-gray-400 hover:text-white transition-colors duration-200">+91-1234567890</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">&copy; {currentYear} Farmer Advisory System. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
