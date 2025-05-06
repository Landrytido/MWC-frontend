import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 py-4 border-t border-gray-200">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-600 mb-2 md:mb-0">
          <Link to="/" className="text-gray-700 hover:text-teal-500">
            My Web Companion
          </Link>
        </div>

        <div className="text-gray-500 text-sm">Copyright {currentYear}</div>
      </div>
    </footer>
  );
};

export default Footer;
