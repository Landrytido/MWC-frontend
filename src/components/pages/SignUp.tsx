import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import personImage1 from "../../assets/person-1.png";
import personImage2 from "../../assets/person-2.png";

const SignUp: React.FC = () => {
  const { state, register, clearError } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  useEffect(() => {
    if (state.error) {
      clearError();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (state.error) {
        clearError();
      }
    };
  }, [clearError, state.error]);
  const handleInputChange = (field: string, value: string) => {
    if (state.error) {
      clearError();
    }

    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmailAddress(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !emailAddress.trim() ||
      !password.trim()
    ) {
      return;
    }

    try {
      await register({
        email: emailAddress,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const PasswordStrengthIndicator: React.FC<{ password: string }> = ({
    password,
  }) => {
    const getPasswordStrength = (pwd: string) => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      return score;
    };

    const strength = getPasswordStrength(password);
    const getStrengthText = () => {
      switch (strength) {
        case 0:
        case 1:
          return {
            text: "Très faible",
            color: "text-red-600",
            bg: "bg-red-200",
          };
        case 2:
          return {
            text: "Faible",
            color: "text-orange-600",
            bg: "bg-orange-200",
          };
        case 3:
          return {
            text: "Moyen",
            color: "text-yellow-600",
            bg: "bg-yellow-200",
          };
        case 4:
          return { text: "Fort", color: "text-green-600", bg: "bg-green-200" };
        case 5:
          return {
            text: "Très fort",
            color: "text-green-700",
            bg: "bg-green-300",
          };
        default:
          return { text: "", color: "", bg: "" };
      }
    };

    if (!password) return null;

    const { text, color, bg } = getStrengthText();
    const width = (strength / 5) * 100;

    return (
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span className={`${color} font-medium`}>{text}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${bg} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${width}%` }}
          ></div>
        </div>
        {strength < 3 && (
          <p className="text-xs text-gray-600 mt-1">
            Utilisez au moins 8 caractères avec majuscules, minuscules, chiffres
            et symboles
          </p>
        )}
      </div>
    );
  };

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

            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
                Création de votre compte
              </h2>

              {state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Erreur d'inscription</span>
                  </div>
                  <p className="mt-1 text-sm">{state.error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="sr-only">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                      disabled={state.isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="sr-only">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                      disabled={state.isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="emailAddress" className="sr-only">
                    Email
                  </label>
                  <input
                    id="emailAddress"
                    type="email"
                    placeholder="Email"
                    value={emailAddress}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={state.isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>

                <div className="mb-8">
                  <label htmlFor="password" className="sr-only">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                    disabled={state.isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>

                <button
                  type="submit"
                  disabled={
                    state.isLoading ||
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !emailAddress.trim() ||
                    !password.trim()
                  }
                  className="w-full py-3 px-4 bg-teal-400 hover:bg-teal-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Inscription en cours...
                    </div>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    to="/login"
                    className="text-teal-500 hover:underline"
                    onClick={() => clearError()}
                  >
                    Se Connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
