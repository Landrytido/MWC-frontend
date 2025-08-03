import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, LoginForm } from "../features/auth";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import personImage3 from "../../src/assets/person-3.png";
import personImage4 from "../../src/assets/person-4.png";

const SignIn: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, from]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl mx-auto">
            <div className="hidden md:block absolute left-0 top-1/4 -translate-x-full transform">
              <img src={personImage4} alt="" className="w-64 h-auto" />
            </div>

            <div className="hidden md:block absolute right-0 top-1/4 translate-x-full transform">
              <img src={personImage3} alt="" className="w-64 h-auto" />
            </div>

            <LoginForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignIn;
