import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube, Music2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Brand & Addresses */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div>
              <p className="text-3xl font-bold text-foreground">
                Taawa<span className="text-primary"> Education</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Kenya Office */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-lg">Kenya Office</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Malik Heights, 6th Floor</p>
                  <p>Ngong Road</p>
                  <p>Nairobi, Kenya</p>
                  <p>+254 704 007 008,</p>
                  <p>+254 706 007 008,</p>
                  <p>+254 718 007 008</p>
                  <p>info@taawa.co.ke</p>
                </div>
              </div>

              {/* UK Office */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-lg">UK Office</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>128 City Road,</p>
                  <p>London,</p>
                  <p>EC1V 2NX,</p>
                  <p>United Kingdom</p>
                  <p>+44 (0) 203 907 7700</p>
                  <p>info@taawa.co.uk</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Music2 className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="hidden lg:block col-span-1"></div>

          {/* Information Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Information</h4>
            <ul className="space-y-4 text-sm text-primary">
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/fees" className="hover:underline">Fees</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="#faq" className="hover:underline">FAQ</Link></li>
              <li><Link to="/programs" className="hover:underline">Subject Selection</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground text-lg">Legal</h4>
            <ul className="space-y-4 text-sm text-primary">
              <li><Link to="/policy/fees" className="hover:underline">Fees Policy</Link></li>
              <li><Link to="/policy/admissions" className="hover:underline">Admissions Policy</Link></li>
              <li><Link to="/policy/child-protection" className="hover:underline">Child Protection Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms and Conditions</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 border-t border-border pt-8 text-center sm:flex sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Taawa Education. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
