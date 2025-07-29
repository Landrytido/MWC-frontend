import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={state.isAuthenticated ? "/dashboard" : "/"}
              className="text-2xl font-script text-gray-800"
            >
              My Web Companion
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to={state.isAuthenticated ? "/dashboard" : "/"}
              className="text-gray-600 hover:text-teal-500"
            >
              {state.isAuthenticated ? "Tableau de bord" : "Accueil"}
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-teal-500">
              Pourquoi My Web Companion ?
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-teal-500">
              Confidentialité
            </Link>

            {!state.isAuthenticated ? (
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
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center text-gray-600 hover:text-teal-500 focus:outline-none"
                >
                  <span className="mr-2">
                    {state.user?.firstName || "Utilisateur"}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(state.user?.firstName, state.user?.lastName)}
                  </div>
                  <svg
                    className="ml-1 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Paramètres du compte
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
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
              to={state.isAuthenticated ? "/dashboard" : "/"}
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {state.isAuthenticated ? "Tableau de bord" : "Accueil"}
            </Link>
            <Link
              to="/about"
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pourquoi My Web Companion ?
            </Link>
            <Link
              to="/privacy"
              className="block text-gray-600 hover:text-teal-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Confidentialité
            </Link>

            {!state.isAuthenticated ? (
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
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-600 hover:text-teal-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block text-gray-600 hover:text-teal-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Paramètres du compte
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left text-gray-600 hover:text-teal-500"
                >
                  Déconnexion
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
