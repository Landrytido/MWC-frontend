import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth";
import { TimerIndicator } from "../TimerIndicator";

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const navItemClass =
    "text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-teal-700";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <Link
            to={state.isAuthenticated ? "/dashboard" : "/"}
            className="text-xl md:text-2xl font-script text-slate-800 tracking-tight"
          >
            My Web Companion
          </Link>
          {state.isAuthenticated && <TimerIndicator />}
        </div>

        <nav className="hidden md:flex items-center space-x-7">
          <Link to={state.isAuthenticated ? "/dashboard" : "/"} className={navItemClass}>
            {state.isAuthenticated ? "Tableau de bord" : "Accueil"}
          </Link>
          <Link to="/about" className={navItemClass}>
            Pourquoi My Web Companion ?
          </Link>
          <Link to="/privacy" className={navItemClass}>
            Confidentialité
          </Link>

          {!state.isAuthenticated ? (
            <>
              <Link to="/signup" className={navItemClass}>
                Inscription
              </Link>
              <Link to="/login" className="btn btn-primary px-4 py-2 text-xs md:text-sm">
                Connexion
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center rounded-full border border-slate-200/90 bg-white/80 px-2 py-1.5 text-slate-700 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-700"
              >
                <span className="mr-2 text-sm font-semibold">
                  {state.user?.firstName || "Utilisateur"}
                </span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {getInitials(state.user?.firstName, state.user?.lastName)}
                </div>
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-lg backdrop-blur-sm">
                  <Link
                    to="/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Paramètres du compte
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <button
          className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur-xl">
          <div className="space-y-3">
            <Link
              to={state.isAuthenticated ? "/dashboard" : "/"}
              className="block text-sm font-semibold text-slate-700 hover:text-teal-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {state.isAuthenticated ? "Tableau de bord" : "Accueil"}
            </Link>
            <Link
              to="/about"
              className="block text-sm font-semibold text-slate-700 hover:text-teal-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pourquoi My Web Companion ?
            </Link>
            <Link
              to="/privacy"
              className="block text-sm font-semibold text-slate-700 hover:text-teal-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Confidentialité
            </Link>

            {!state.isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="block text-sm font-semibold text-slate-700 hover:text-teal-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
                <Link
                  to="/login"
                  className="btn btn-primary w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard/settings"
                  className="block text-sm font-semibold text-slate-700 hover:text-teal-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Paramètres du compte
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block w-full text-left text-sm font-semibold text-slate-700 hover:text-teal-700"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;