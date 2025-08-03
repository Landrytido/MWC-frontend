import React from "react";

const VerifyEmail: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold mb-4">Vérification de l'email</h1>
    <p className="text-gray-700">
      Un code de vérification a été envoyé à votre adresse email. Veuillez
      vérifier votre boîte de réception et suivre les instructions.
    </p>
  </div>
);

export default VerifyEmail;
