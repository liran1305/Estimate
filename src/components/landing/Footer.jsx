import React from 'react';
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-2xl font-bold text-[#0A66C2]">Estimate</div>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Use</a>
          </div>
          
          <p className="text-sm text-gray-400">
            © Estimate 2025
          </p>
        </div>
      </div>
    </footer>
  );
}