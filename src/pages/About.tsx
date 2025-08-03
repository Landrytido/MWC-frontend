import React from "react";
import Header from "../shared/components/layout/Header";
import Footer from "../shared/components/layout/Footer";

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Pourquoi My Web Companion ?
            </h1>

            <div className="prose prose-lg">
              <p className="mb-4">
                Dans un monde où nous sommes constamment inondés d'informations,
                il devient de plus en plus difficile de garder une trace de tout
                ce qui nous intéresse ou qui pourrait nous être utile plus tard.
              </p>

              <p className="mb-4">
                My Web Companion est né d'une idée simple : créer un espace
                personnel où vous pouvez organiser vos pensées, vos découvertes
                et vos ressources web favorites, accessible partout et en tout
                temps.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Notre Mission</h2>

              <p className="mb-4">
                Nous croyons que notre cerveau n'est pas fait pour stocker des
                informations, mais plutôt pour réfléchir et créer. En offrant un
                outil simple et intuitif pour externaliser vos pensées et vos
                découvertes, My Web Companion vous aide à libérer votre esprit
                et à vous concentrer sur ce qui compte vraiment.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Caractéristiques Principales
              </h2>

              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>
                  <strong>Prenez des notes simplement :</strong> Capturez
                  rapidement vos idées, réflexions et tâches à accomplir.
                </li>
                <li>
                  <strong>Sauvegardez des liens web :</strong> Enregistrez et
                  organisez vos articles, tutoriels et sites préférés pour les
                  consulter plus tard.
                </li>
                <li>
                  <strong>Accessible partout :</strong> Consultez vos notes et
                  liens depuis n'importe quel appareil, n'importe où.
                </li>
                <li>
                  <strong>Simple et intuitif :</strong> Une interface épurée qui
                  vous permet de vous concentrer sur votre contenu.
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">Notre Vision</h2>

              <p className="mb-4">
                À long terme, nous souhaitons faire évoluer My Web Companion
                pour qu'il devienne votre véritable "second cerveau" - un outil
                qui non seulement stocke vos informations, mais vous aide
                également à faire des connexions entre elles, à découvrir de
                nouvelles idées et à approfondir votre compréhension des sujets
                qui vous intéressent.
              </p>

              <p className="mb-4">
                Nous sommes ravis de vous accompagner dans cette aventure et
                nous espérons que My Web Companion vous aidera à mieux organiser
                votre vie numérique.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
