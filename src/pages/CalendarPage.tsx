import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../shared/components/layout/Layout";
import Calendar from "../features/calendar/components/Calendar";

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "notes"; // notes par défaut

  const getReturnUrl = () => {
    return `/dashboard?tab=${returnTo}`;
  };

  const getSectionName = () => {
    switch (returnTo) {
      case "tasks":
        return "Tâches";
      case "links":
        return "Liens";
      case "tools":
        return "Outils";
      case "notes":
        return "Notes";
      default:
        return "Dashboard";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate(getReturnUrl())}
            className="hover:text-gray-700 transition-colors"
          >
            {getSectionName()}
          </button>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-700 font-medium">Calendrier</span>
        </nav>

        {/* Composant principal du calendrier */}
        <Calendar />
      </div>
    </Layout>
  );
};

export default CalendarPage;
