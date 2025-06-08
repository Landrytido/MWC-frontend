import React, { useEffect, useRef } from "react";
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
import CreateNote from "./components/pages/CreateNote";
import EditNote from "./components/pages/EditNote";
import CreateLink from "./components/pages/CreateLink";
import EditLink from "./components/pages/EditLink";
import { AppProvider } from "./components/contexts/AppContext";
import NoteDetail from "./components/pages/NoteDetail";
import VerifyEmail from "./components/pages/VerifyEmail";

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

const AuthenticatedRedirect = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return null;
};

// ✅ COMPOSANT CORRIGÉ - Synchronisation utilisateur
const UserSynchronizer = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const syncedRef = useRef(false); // ✅ Empêche les synchronisations multiples

  useEffect(() => {
    // ✅ Synchroniser seulement UNE FOIS par session
    const syncUser = async () => {
      if (isSignedIn && user && !syncedRef.current) {
        try {
          syncedRef.current = true; // ✅ Marquer comme synchronisé

          // const token = await getToken();

          await fetch("http://localhost:8080/api/users/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress || "",
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
            }),
          });

          console.log("User synchronized with backend");
        } catch (error) {
          console.error("Error synchronizing user:", error);
          syncedRef.current = false; // ✅ Réessayer en cas d'erreur
        }
      }
    };

    syncUser();
  }, [isSignedIn, user?.id, getToken]); // ✅ Dépendances fixes

  // ✅ Reset au déconnexion
  useEffect(() => {
    if (!isSignedIn) {
      syncedRef.current = false;
    }
  }, [isSignedIn]);

  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ClerkProvider
        publishableKey={clerkPubKey}
        appearance={{
          variables: {
            colorPrimary: "#38b2ac",
            borderRadius: "0.375rem",
          },
          elements: {
            formButtonPrimary:
              "bg-teal-400 hover:bg-teal-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500",
            card: "shadow-xl rounded-lg",
            formFieldInput:
              "rounded-md focus:ring-teal-500 focus:border-teal-500",
            footer: "hidden",
          },
        }}
      >
        <Router>
          {/* ✅ Synchronisation contrôlée */}
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
                      <Route path="/notes/new" element={<CreateNote />} />
                      <Route path="/notes/:id" element={<EditNote />} />
                      <Route path="/notes/:id/view" element={<NoteDetail />} />
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
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </Router>
      </ClerkProvider>
    </AppProvider>
  );
};

export default App;
