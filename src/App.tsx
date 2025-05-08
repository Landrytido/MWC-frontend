import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import Home from "./components/pages/Home";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Dashboard from "./components/pages/Dashboard";
import About from "./components/pages/About";
import Privacy from "./components/pages/Privacy";
import UserSettings from "./components/pages/UserSettings";

// Récupération de la clé Clerk API depuis .env
const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  window.ENV?.CLERK_PUBLISHABLE_KEY ||
  "";

if (!clerkPubKey) {
  console.warn(
    "Missing Clerk Publishable Key - authentication will not work properly"
  );
}

// Composant pour rediriger un utilisateur authentifié
const AuthenticatedRedirect = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    // Si l'utilisateur est connecté et accède à home, login ou signup,
    // il sera redirigé vers le dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, render le contenu normalement
  return null;
};

const App: React.FC = () => {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        variables: {
          colorPrimary: "#38b2ac", // Couleur teal-500 pour correspondre au design
          borderRadius: "0.375rem", // rounded-md en Tailwind
        },
        elements: {
          formButtonPrimary:
            "bg-teal-400 hover:bg-teal-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500",
          card: "shadow-xl rounded-lg",
          formFieldInput:
            "rounded-md focus:ring-teal-500 focus:border-teal-500",
          footer: "hidden", // Masquer le footer par défaut de Clerk
        },
      }}
    >
      <Router>
        <Routes>
          {/* Routes publiques avec redirection pour utilisateurs authentifiés */}
          <Route
            path="/"
            element={
              <>
                <AuthenticatedRedirect />
                <Home />
              </>
            }
          />
          <Route
            path="/signup/*"
            element={
              <>
                <AuthenticatedRedirect />
                <SignUp />
              </>
            }
          />
          <Route
            path="/login/*"
            element={
              <>
                <AuthenticatedRedirect />
                <SignIn />
              </>
            }
          />

          {/* Routes accessibles à tous */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Routes protégées nécessitant une authentification */}
          <Route
            path="/dashboard/*"
            element={
              <>
                <SignedIn>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<UserSettings />} />
                  </Routes>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </Router>
    </ClerkProvider>
  );
};

export default App;
