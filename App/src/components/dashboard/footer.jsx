import { Sprout, MapPin, Mail, Phone, Facebook, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
                <Sprout className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold">Farmer Advisory</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
                Empowering farmers with data-driven insights for a sustainable and profitable future. Your trusted partner in agriculture.
            </p>
        </div>

        {/* Quick Links */}
        <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition">Dashboard</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Weather Forecast</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Market Prices</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">My Profile</a></li>
            </ul>
        </div>

        {/* Resources */}
        <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition">Crop Information</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Pest Control</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Govt Schemes</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Community Forum</a></li>
            </ul>
        </div>

        {/* Contact */}
        <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Miraj, Sangli, Maharashtra, India</span>
                </li>
                <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <span>contact@agriassist.com</span>
                </li>
                <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span>+91 12345 67890</span>
                </li>
            </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
        <p>&copy; 2025 Farmer Advisory System. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
            <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />
            <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
            <Linkedin className="w-5 h-5 hover:text-white cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}