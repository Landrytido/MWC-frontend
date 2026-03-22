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
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 md:py-20 lg:grid-cols-2 lg:gap-14 lg:px-6">
          <div className="animate-fade-up">
            <span className="inline-flex items-center rounded-full border border-teal-200/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
              Productivité simple, partout
            </span>

            <h1 className="mt-5 text-4xl leading-tight text-slate-900 md:text-5xl">
              My Web Companion
              <span className="block text-2xl font-semibold text-teal-700 md:text-3xl">
                Votre cockpit personnel pour notes, tâches et liens
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Centralisez ce qui compte, capturez vos idées à la volée et retrouvez vos informations
              en quelques secondes. L'app est pensée pour rester claire, rapide et agréable sur mobile
              comme sur desktop.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="btn btn-secondary">
                Créer un compte
              </Link>
              <Link to="/login" className="btn btn-primary">
                Se connecter
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-4">
                <h2 className="text-lg font-semibold text-slate-800">Capture instantanée</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Une idée, un lien, une tâche: vous notez, c'est classé, c'est retrouvé.
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <h2 className="text-lg font-semibold text-slate-800">Clarté au quotidien</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Un tableau de bord net pour réduire la charge mentale et garder le cap.
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-up">
            <div className="glass-panel rounded-3xl p-3 md:p-4">
              <img
                src={heroImage}
                alt="My Web Companion sur différents appareils"
                className="w-full rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;