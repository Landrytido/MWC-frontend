import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/contexts/AuthContext";
import { AppProvider } from "./components/contexts/AppContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
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
import NoteDetail from "./components/pages/NoteDetail";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Routes protégées */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<UserSettings />} />
                    <Route path="/notes/new" element={<CreateNote />} />
                    <Route path="/notes/:id" element={<EditNote />} />
                    <Route path="/notes/:id/view" element={<NoteDetail />} />
                    <Route path="/links/new" element={<CreateLink />} />
                    <Route path="/links/:id" element={<EditLink />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
