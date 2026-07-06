import React from "react";

function Footer() {
  return (
    <footer className="mt-12 text-center sm:text-left border-t border-orange-200 bg-white/80 backdrop-blur">

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">

        <div>
          <h3 className="brand-heading font-bold mb-3 text-slate-800">Company</h3>
          <ul className="space-y-2 text-slate-500 text-sm">
            <li>About Us</li>
            <li>QuickBite</li>
            <li>Careers</li>
            <li>Team</li>
          </ul>
        </div>

        <div>
          <h3 className="brand-heading font-bold mb-3 text-slate-800">Contact us</h3>
          <ul className="space-y-2 text-slate-500 text-sm">
            <li>Help & Support</li>
            <li>Partner with us</li>
            <li>Ride with us</li>
          </ul>
        </div>

        <div>
          <h3 className="brand-heading font-bold mb-3 text-slate-800">Legal</h3>
          <ul className="space-y-2 text-slate-500 text-sm">
            <li>Terms & Conditions</li>
            <li>Cookie Policy</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h3 className="brand-heading font-bold mb-3 text-slate-800">Available in:</h3>
          <ul className="space-y-2 text-slate-500 text-sm">
            <li>Bangalore</li>
            <li>Gurgaon</li>
            <li>Hyderabad</li>
            <li>Delhi</li>
            <li>Mumbai</li>
            <li>Pune</li>
            <li className="font-semibold text-orange-600">685 cities</li>
          </ul>
        </div>

        <div>
          <h3 className="brand-heading font-bold mb-3 text-slate-800">Social Links</h3>
          <ul className="space-y-2 text-slate-500 text-sm">
            <li>LinkedIn</li>
            <li>Instagram</li>
            <li>Facebook</li>
            <li>Pinterest</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-orange-200 text-center py-4 text-slate-500 text-sm">
        © 2026 QuickBite Technologies Pvt. Ltd.
      </div>

    </footer>
  );
}

export default Footer;