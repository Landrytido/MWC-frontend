import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./shared/contexts/AppContext";
import { ProtectedRoute } from "./features/auth";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./components/pages/Dashboard";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import UserSettings from "./pages/UserSettings";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
import CreateLink from "./pages/CreateLink";
import EditLink from "./pages/EditLink";
import NoteDetail from "./features/notes/components/NoteDetail";
import CalendarPage from "./pages/CalendarPage";
const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

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
                  <Route path="/calendar" element={<CalendarPage />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
