import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import Home from "./components/pages/Home";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import Dashboard from "./components/pages/Dashboard";
import About from "./components/pages/About";
import Privacy from "./components/pages/Privacy";

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
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/signup/*" element={<SignUp />} />
          <Route path="/login/*" element={<SignIn />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Routes protégées nécessitant une authentification */}
          <Route
            path="/dashboard/*"
            element={
              <>
                <SignedIn>
                  <Dashboard />
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
