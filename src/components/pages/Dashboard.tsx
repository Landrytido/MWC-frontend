import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import NoteCard from "../dashboard/NoteCard";
import LinkCard from "../dashboard/LinkCard";
import { Note, SavedLink } from "../types";

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"notes" | "links">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [newLink, setNewLink] = useState({
    url: "",
    title: "",
    description: "",
  });

  // Simuler le chargement des données depuis le backend
  useEffect(() => {
    // En production, on ferait un appel API ici
    const dummyNotes: Note[] = [
      {
        id: "1",
        title: "Idées pour le projet",
        content:
          "Ajouter une fonctionnalité de recherche, permettre de catégoriser les notes",
        createdAt: new Date("2023-05-15"),
      },
      {
        id: "2",
        title: "Choses à faire",
        content:
          "Appeler le plombier, acheter des légumes, répondre aux emails",
        createdAt: new Date("2023-05-10"),
      },
    ];

    const dummyLinks: SavedLink[] = [
      {
        id: "1",
        url: "https://react.dev",
        title: "Documentation React",
        description: "Documentation officielle de React",
        createdAt: new Date("2023-05-12"),
      },
      {
        id: "2",
        url: "https://tailwindcss.com",
        title: "Tailwind CSS",
        description: "Framework CSS utilitaire",
        createdAt: new Date("2023-05-08"),
      },
    ];

    setNotes(dummyNotes);
    setLinks(dummyLinks);
  }, []);

  const handleAddNote = () => {
    if (newNote.title.trim() === "" || newNote.content.trim() === "") return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date(),
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "" });
    setIsAddingNote(false);
  };

  const handleAddLink = () => {
    if (newLink.url.trim() === "") return;

    const link: SavedLink = {
      id: Date.now().toString(),
      url: newLink.url,
      title: newLink.title || newLink.url,
      description: newLink.description,
      createdAt: new Date(),
    };

    setLinks([link, ...links]);
    setNewLink({ url: "", title: "", description: "" });
    setIsAddingLink(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {user?.firstName || "utilisateur"}
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord My Web Companion
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "notes"
                ? "text-teal-500 border-b-2 border-teal-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "links"
                ? "text-teal-500 border-b-2 border-teal-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("links")}
          >
            Liens Sauvegardés
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === "notes" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Mes Notes
                </h2>
                <button
                  className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600"
                  onClick={() => setIsAddingNote(!isAddingNote)}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Ajouter une note
                </button>
              </div>

              {isAddingNote && (
                <div className="bg-white p-4 rounded-md shadow-md mb-4">
                  <input
                    type="text"
                    placeholder="Titre"
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    value={newNote.title}
                    onChange={(e) =>
                      setNewNote({ ...newNote, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Contenu de la note"
                    className="w-full p-2 border border-gray-300 rounded-md mb-3 h-32"
                    value={newNote.content}
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNote({ title: "", content: "" });
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                      onClick={handleAddNote}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}

              {notes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={(note) => {
                        setNewNote({
                          title: note.title,
                          content: note.content,
                        });
                        setIsAddingNote(true);
                        // Dans une implémentation réelle, vous ajouteriez un état pour le mode d'édition
                      }}
                      onDelete={(id) => {
                        setNotes(notes.filter((note) => note.id !== id));
                        // Dans une implémentation réelle, vous feriez un appel API pour supprimer
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Vous n'avez pas encore de notes. Commencez par en créer une !
                </div>
              )}
            </div>
          )}

          {activeTab === "links" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Mes Liens
                </h2>
                <button
                  className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600"
                  onClick={() => setIsAddingLink(!isAddingLink)}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Ajouter un lien
                </button>
              </div>

              {isAddingLink && (
                <div className="bg-white p-4 rounded-md shadow-md mb-4">
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Titre (optionnel)"
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    value={newLink.title}
                    onChange={(e) =>
                      setNewLink({ ...newLink, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Description (optionnelle)"
                    className="w-full p-2 border border-gray-300 rounded-md mb-3 h-20"
                    value={newLink.description}
                    onChange={(e) =>
                      setNewLink({ ...newLink, description: e.target.value })
                    }
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => {
                        setIsAddingLink(false);
                        setNewLink({ url: "", title: "", description: "" });
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                      onClick={handleAddLink}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              )}

              {links.length > 0 ? (
                <div className="space-y-4">
                  {links.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onEdit={(link) => {
                        setNewLink({
                          url: link.url,
                          title: link.title,
                          description: link.description || "",
                        });
                        setIsAddingLink(true);
                        // Dans une implémentation réelle, vous ajouteriez un état pour le mode d'édition
                      }}
                      onDelete={(id) => {
                        setLinks(links.filter((link) => link.id !== id));
                        // Dans une implémentation réelle, vous feriez un appel API pour supprimer
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Vous n'avez pas encore de liens sauvegardés. Commencez par en
                  ajouter un !
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
