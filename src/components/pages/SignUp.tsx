import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import personImage1 from "../../assets/person-1.png";
import personImage2 from "../../assets/person-2.png";

const SignUp: React.FC = () => {
  const { isLoaded, signUp } = useSignUp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError("");

      await signUp.create({
        emailAddress,
        password,
      });

      // if (firstName || lastName) {
      //   await signUp.update({
      //     firstName,
      //     lastName,
      //   });
      // }

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      navigate("/verify-email");
    } catch (err: unknown) {
      const error = err as {
        errors?: Array<{ longMessage?: string; code?: string }>;
      };
      console.error(JSON.stringify(err, null, 2));

      if (error.errors) {
        const errorMessages = error.errors
          .map((e) => {
            switch (e.code) {
              case "form_password_pwned":
                return "Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre.";
              case "form_password_too_common":
                return "Ce mot de passe est trop commun. Veuillez en choisir un plus sécurisé.";
              case "form_password_length_too_short":
                return "Le mot de passe doit contenir au moins 8 caractères.";
              default:
                return e.longMessage;
            }
          })
          .join(" ");
        setError(errorMessages);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Erreur d'inscription avec Google:", err);
      setError("Échec de l'inscription avec Google. Veuillez réessayer.");
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
  const handleGitHubSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Erreur d'inscription avec GitHub:", err);
      setError("Échec de l'inscription avec GitHub. Veuillez réessayer.");
    }
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

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
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
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isLoaded}
                  className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Vous avez déjà un compte ?{" "}
                  <a href="/login" className="text-teal-500 hover:underline">
                    Se Connecter
                  </a>
                </p>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500">
                      Ou inscrivez-vous avec
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10.013 4.491-10.013 10.012s4.491 10.012 10.013 10.012c8.025 0 9.964-7.516 9.152-11.693l-9.152 0.002z"
                        fill="#4285F4"
                      />
                    </svg>
                    <span className="ml-2">Continuer avec Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGitHubSignUp}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M10.9 2.1c-4.6.5-8.3 4.2-8.8 8.7-.5 4.7 2.2 8.9 6.3 10.5.8.3 1.6-.4 1.6-1.2 0-.7-.8-1.3-1.2-1.8-2.2-1.8-3.5-4.6-3.1-7.6.6-4.3 4.4-7.7 8.7-7.9 4.7-.2 8.6 3.3 9.1 7.9.3 2.8-.8 5.5-2.8 7.3-.5.5-1.2 1.1-1.2 1.9 0 .9.9 1.6 1.7 1.2 4-1.7 6.6-5.7 6.2-10.2-.5-4.8-4.7-8.7-9.5-9C15.9 1.7 13.3 1.8 10.9 2.1z"
                        fill="#333"
                      />
                    </svg>
                    <span className="ml-2">S'inscrire avec GitHub</span>
                  </button>
                </div>
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
