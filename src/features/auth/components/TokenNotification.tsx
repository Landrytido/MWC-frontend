import React, { useEffect } from "react";

interface TokenNotificationProps {
  show: boolean;
  message: string;
  type: "success" | "warning" | "error";
  onClose: () => void;
}

const TokenNotification: React.FC<TokenNotificationProps> = ({
  show,
  message,
  type,
  onClose,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-fermeture après 5 secondes

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const typeStyles = {
    success: "bg-green-100 border-green-400 text-green-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    error: "bg-red-100 border-red-400 text-red-700",
  };

  const icons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 border rounded-lg shadow-lg transition-all duration-300 ${typeStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="mr-2">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-lg leading-none cursor-pointer hover:opacity-70"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TokenNotification;
