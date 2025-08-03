import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Politique de Confidentialité
            </h1>

            <div className="prose prose-lg">
              <p className="text-gray-500 mb-8">
                Dernière mise à jour : Mai 2025
              </p>

              <p className="mb-4">
                Nous accordons une grande importance à la protection de vos
                données personnelles. Cette politique de confidentialité vous
                informe sur la manière dont nous recueillons, utilisons et
                protégeons vos informations lorsque vous utilisez notre service.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Informations que nous collectons
              </h2>

              <p className="mb-4">
                Lorsque vous vous inscrivez sur My Web Companion, nous
                collectons les informations suivantes :
              </p>

              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>
                  Informations d'identification (nom, prénom, adresse e-mail)
                </li>
                <li>Informations fournies lors de la création d'un compte</li>
                <li>
                  Contenu que vous créez, téléchargez ou recevez d'autres
                  utilisateurs
                </li>
                <li>Informations sur votre utilisation de notre service</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Comment nous utilisons vos informations
              </h2>

              <p className="mb-4">
                Nous utilisons les informations que nous collectons pour :
              </p>

              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Fournir, maintenir et améliorer nos services</li>
                <li>Créer et gérer votre compte</li>
                <li>Traiter et compléter vos transactions</li>
                <li>
                  Vous envoyer des informations techniques et des mises à jour
                </li>
                <li>
                  Comprendre comment vous utilisez nos services pour les
                  améliorer
                </li>
                <li>
                  Détecter, prévenir et résoudre les problèmes techniques ou de
                  sécurité
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Partage et divulgation d'informations
              </h2>

              <p className="mb-4">
                Nous ne vendons, n'échangeons ni ne transférons vos informations
                personnelles à des tiers sans votre consentement, sauf dans les
                cas suivants :
              </p>

              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>
                  Pour se conformer à la loi, à une procédure judiciaire ou à
                  une demande gouvernementale
                </li>
                <li>
                  Pour protéger les droits, la propriété ou la sécurité de notre
                  entreprise, de nos utilisateurs ou du public
                </li>
                <li>
                  En cas de fusion, acquisition ou vente d'actifs (les
                  utilisateurs seront informés avant le transfert)
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Sécurité des données
              </h2>

              <p className="mb-4">
                La sécurité de vos données est importante pour nous. Nous
                mettons en œuvre des mesures de sécurité adaptées pour protéger
                vos informations personnelles contre l'accès, l'altération, la
                divulgation ou la destruction non autorisés.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">Vos droits</h2>

              <p className="mb-4">
                Vous avez le droit d'accéder, de corriger ou de supprimer vos
                données personnelles. Vous pouvez également vous opposer au
                traitement de vos données, demander la limitation du traitement
                ou la portabilité de vos données.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Modifications de cette politique
              </h2>

              <p className="mb-4">
                Nous pouvons mettre à jour notre politique de confidentialité de
                temps à autre. Nous vous informerons de tout changement en
                publiant la nouvelle politique de confidentialité sur cette page
                et en vous informant par e-mail, si nécessaire.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                Nous contacter
              </h2>

              <p className="mb-4">
                Si vous avez des questions concernant cette politique de
                confidentialité, veuillez nous contacter à l'adresse suivante :
                privacy@mywebcompanion.com
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
