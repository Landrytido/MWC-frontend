// Composant de test pour démontrer le fonctionnement du EventModal
import React, { useState } from "react";
import EventModal from "./EventModal";
import { CreateEventRequest } from "../types/calendar";

const EventModalTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"event" | "task">("task");
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  const handleSubmit = async (eventData: CreateEventRequest) => {
    console.log("Données soumises :", eventData);
    // Ici vous feriez l'appel API réel
    return Promise.resolve();
  };

  const openModalFromCalendar = (date: string) => {
    setSelectedDate(date);
    setModalType("task");
    setIsModalOpen(true);
  };

  const openModalFromGlobalButton = () => {
    setSelectedDate(undefined); // Important : pas de date pré-sélectionnée
    setModalType("task");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Test EventModal - Refactorisation</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Scénario 1 : Création depuis le calendrier
          </h2>
          <p className="text-gray-600 mb-4">
            Simule un clic sur une date du calendrier. Le modal devrait :
            <br />• Pré-remplir et verrouiller la date planifiée
            <br />• Masquer les boutons de planification et le champ date
            d'échéance
          </p>
          <button
            onClick={() => openModalFromCalendar("2024-01-15")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Créer tâche pour le 15 janvier 2024
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            Scénario 2 : Création depuis le bouton global
          </h2>
          <p className="text-gray-600 mb-4">
            Simule un clic sur le bouton "Nouvelle tâche" global. Le modal
            devrait :
            <br />• Afficher les boutons de planification
            (aucune/aujourd'hui/demain)
            <br />• Afficher le champ date d'échéance si "aucune planification"
            est sélectionnée
          </p>
          <button
            onClick={openModalFromGlobalButton}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Nouvelle tâche (bouton global)
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            Test de réinitialisation
          </h2>
          <p className="text-gray-600 mb-4">
            Pour tester la réinitialisation, ouvrez le premier modal, fermez-le,
            puis ouvrez le second. L'état ne devrait pas persister entre les
            ouvertures.
          </p>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        modalType={modalType}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default EventModalTest;
