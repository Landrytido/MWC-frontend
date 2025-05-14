import React, { useEffect } from "react";
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
  useUser,
} from "@clerk/clerk-react";
import Home from "./components/pages/Home";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Dashboard from "./components/pages/Dashboard";
import About from "./components/pages/About";
import Privacy from "./components/pages/Privacy";
import UserSettings from "./components/pages/UserSettings";
import { useApiService } from "./components/services/apiService";
import CreateNote from "./components/pages/CreateNote";
import EditNote from "./components/pages/EditNote";
import CreateLink from "./components/pages/CreateLink";
import EditLink from "./components/pages/EditLink";

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

// Composant pour synchroniser l'utilisateur avec le backend
const UserSynchronizer = () => {
  const { isSignedIn, user } = useUser();
  const api = useApiService();

  useEffect(() => {
    // Synchroniser l'utilisateur avec le backend quand il est connecté
    const syncUser = async () => {
      if (isSignedIn && user) {
        try {
          await api.user.syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
          });

          console.log("User synchronized with backend");
        } catch (error) {
          console.error("Error synchronizing user:", error);
        }
      }
    };

    syncUser();
  }, [isSignedIn, user, api.user]);

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
        {/* Ajouter le synchroniseur d'utilisateur ici pour qu'il soit actif sur toutes les routes */}
        <SignedIn>
          <UserSynchronizer />
        </SignedIn>

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
                    {/* Ajouter routes pour les notes et les liens */}
                    <Route path="/notes/new" element={<CreateNote />} />
                    <Route path="/notes/:id" element={<EditNote />} />
                    <Route path="/links/new" element={<CreateLink />} />
                    <Route path="/links/:id" element={<EditLink />} />
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
