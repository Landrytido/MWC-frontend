import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, SignupForm } from "../features/auth";
import Header from "../shared/components/layout/Header";
import Footer from "../shared/components/layout/Footer";
import personImage1 from "../../src/assets/person-1.png";
import personImage2 from "../../src/assets/person-2.png";

const SignUp: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute left-0 top-1/4 -translate-x-full transform">
              <img src={personImage1} alt="" className="w-64 h-auto" />
            </div>

            <div className="hidden md:block absolute right-0 top-1/4 translate-x-full transform">
              <img src={personImage2} alt="" className="w-64 h-auto" />
            </div>

            <SignupForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
