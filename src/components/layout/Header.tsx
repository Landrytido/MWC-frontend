import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const Header: React.FC = () => {
  const { isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-script text-gray-800">
              My Web Companion
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-teal-500">
              Accueil
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-teal-500">
              Pourquoi My Web Companion ?
            </Link>
            {!isSignedIn && (
              <>
                <Link
                  to="/signup"
                  className="text-gray-600 hover:text-teal-500"
                >
                  Inscription
                </Link>
                <Link to="/login" className="text-gray-600 hover:text-teal-500">
                  Connexion
                </Link>
              </>
            )}
            <Link to="/about" className="text-gray-600 hover:text-teal-500">
              À propos
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-teal-500">
              Politique de confidentialité
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3">
            <Link
              to="/"
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/about"
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pourquoi My Web Companion ?
            </Link>
            {!isSignedIn && (
              <>
                <Link
                  to="/signup"
                  className="block text-gray-600 hover:text-teal-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
                <Link
                  to="/login"
                  className="block text-gray-600 hover:text-teal-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              </>
            )}
            <Link
              to="/about"
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              À propos
            </Link>
            <Link
              to="/privacy"
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Politique de confidentialité
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
