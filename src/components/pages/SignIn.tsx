import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const SignIn: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
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

      // Start the sign in process
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        // Set the session active
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      } else {
        // Handle other status
        console.log(result);
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "errors" in err) {
        const error = err as { errors: Array<{ longMessage?: string }> };
        setError(
          error.errors?.[0]?.longMessage ||
            "Une erreur est survenue. Veuillez réessayer."
        );
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Erreur de connexion avec Google:", err);
      setError("Échec de la connexion avec Google. Veuillez réessayer.");
    }
  };

  const handleGitHubSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl: "/dashboard",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Erreur de connexion avec GitHub:", err);
      setError("Échec de la connexion avec GitHub. Veuillez réessayer.");
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Form container */}
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
                Connexion
              </h2>

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
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

                <div className="mb-6">
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
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="text-teal-500 hover:underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isLoaded}
                  className="w-full py-3 px-4 bg-teal-400 hover:bg-teal-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Vous n'avez pas de compte ?{" "}
                  <a href="/signup" className="text-teal-500 hover:underline">
                    S'inscrire
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
                      Ou connectez-vous avec
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
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
                    onClick={handleGitHubSignIn}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M10.9 2.1c-4.6.5-8.3 4.2-8.8 8.7-.5 4.7 2.2 8.9 6.3 10.5.8.3 1.6-.4 1.6-1.2 0-.7-.8-1.3-1.2-1.8-2.2-1.8-3.5-4.6-3.1-7.6.6-4.3 4.4-7.7 8.7-7.9 4.7-.2 8.6 3.3 9.1 7.9.3 2.8-.8 5.5-2.8 7.3-.5.5-1.2 1.1-1.2 1.9 0 .9.9 1.6 1.7 1.2 4-1.7 6.6-5.7 6.2-10.2-.5-4.8-4.7-8.7-9.5-9C15.9 1.7 13.3 1.8 10.9 2.1z"
                        fill="#333"
                      />
                    </svg>
                    <span className="ml-2">Se connecter avec GitHub</span>
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

export default SignIn;
