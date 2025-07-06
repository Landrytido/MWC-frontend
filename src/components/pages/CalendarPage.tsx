// src/components/pages/CalendarPage.tsx

import React from "react";
import Layout from "../layout/Layout";
import Calendar from "../calendar/Calendar";
import { CalendarProvider } from "../contexts/CalendarContext";

const CalendarPage: React.FC = () => {
  return (
    <Layout>
      <CalendarProvider>
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <a
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </a>
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
      </CalendarProvider>
    </Layout>
  );
};

export default CalendarPage;
