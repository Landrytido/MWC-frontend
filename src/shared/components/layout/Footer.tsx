import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { state } = useAuth();

  return (
    <footer className="border-t border-slate-200/80 bg-white/65 py-5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm md:flex-row md:px-6">
        <div className="text-slate-600">
          <Link
            to={state.isAuthenticated ? "/dashboard" : "/"}
            className="font-semibold text-slate-700 transition-colors hover:text-teal-700"
          >
            My Web Companion
          </Link>
        </div>

        <div className="text-slate-500">Copyright {currentYear}</div>
      </div>
    </footer>
  );
};

export default Footer;