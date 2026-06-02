import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-100 mt-10 text-center sm:text-left">

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">

        {/* Company */}
        <div>
          <h3 className="font-bold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>About Us</li>
            <li>ShinobiFest</li>
            <li>Careers</li>
            <li>Team</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold mb-3">Contact us</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>Help & Support</li>
            <li>Partner with us</li>
            <li>Ride with us</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold mb-3">Legal</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>Terms & Conditions</li>
            <li>Cookie Policy</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Cities */}
        <div>
          <h3 className="font-bold mb-3">Available in:</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>Bangalore</li>
            <li>Gurgaon</li>
            <li>Hyderabad</li>
            <li>Delhi</li>
            <li>Mumbai</li>
            <li>Pune</li>
            <li className="font-semibold">685 cities</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-bold mb-3">Social Links</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>LinkedIn</li>
            <li>Instagram</li>
            <li>Facebook</li>
            <li>Pinterest</li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t text-center py-4 text-gray-500 text-sm">
        © 2025 Swiggy Limited
      </div>

    </footer>
  );
}

export default Footer;