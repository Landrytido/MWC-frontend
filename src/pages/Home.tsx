import React from "react";
import { Link } from "react-router-dom";
import Header from "../shared/components/layout/Header";
import Footer from "../shared/components/layout/Footer";
import heroImage from "../../src/assets/hero-image.png";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row items-center">
          {/* Left content */}
          <div className="lg:w-1/2 lg:pr-12">
            <h1 className="text-4xl font-script text-teal-500 mb-6">
              My Web Companion : Votre compagnon numérique
            </h1>

            {/* Feature 1 */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Accessible partout
              </h2>
              <p className="text-gray-600 mb-4">
                Transportez vos notes et vos sites web de références partout où
                vous allez. Prenez facilement des notes à la volée ou ajouter un
                site internet dont vous venez d'entendre parler pour le
                consulter plus tard à tête reposée et sans risque de le perdre
                ou l'oublier
              </p>
            </div>

            {/* Feature 2 */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Videz vous la tête
              </h2>
              <p className="text-gray-600 mb-4">
                Plus besoin de retenir un nombre important d'informations tout
                au long de votre journée. Prenez des notes, videz vous la tête,
                vous n'oublierez plus rien en enregistrant les informations clef
                plutôt qu'en tentant de tout retenir.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex space-x-4">
              <Link
                to="/signup"
                className="px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-md transition-colors"
              >
                Inscription
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-teal-400 hover:bg-teal-500 text-white rounded-md transition-colors"
              >
                Connexion
              </Link>
            </div>
          </div>

          {/* Right content - Image */}
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <img
              src={heroImage}
              alt="My Web Companion sur différents appareils"
              className="w-full h-auto shadow-xl rounded-md"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
