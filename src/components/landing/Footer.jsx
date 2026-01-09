import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <Logo />
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to={createPageUrl("TermsOfService")} className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to={createPageUrl("Disclaimer")} className="hover:text-gray-900 transition-colors">Disclaimer</Link>
          </div>
          
          <p className="text-sm text-gray-400">
            © Estimate 2025
          </p>
        </div>
      </div>
    </footer>
  );
}