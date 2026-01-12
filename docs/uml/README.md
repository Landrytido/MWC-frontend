# Documentation UML - MWC Frontend

Cette documentation contient les diagrammes UML de l'application MWC Frontend, une application React TypeScript de gestion de productivité.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Diagrammes disponibles](#diagrammes-disponibles)
3. [Comment visualiser les diagrammes](#comment-visualiser-les-diagrammes)
4. [Architecture du projet](#architecture-du-projet)

## 🎯 Vue d'ensemble

MWC Frontend est une application web moderne construite avec :
- **React 19** avec TypeScript
- **Vite** pour le build
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- Architecture modulaire basée sur les features

## 📊 Diagrammes disponibles

### 1. [Architecture Overview](./architecture-overview.md)
Diagramme montrant l'architecture globale de l'application en couches :
- **Présentation Layer** : Pages et composants UI
- **Application Layer** : Router, Context, Protected Routes
- **Features Layer** : Modules métier (Tasks, Notes, Calendar, etc.)
- **Service Layer** : HTTP Service, Auth Service, Storage
- **Backend API** : Communication avec le backend REST

**Quand consulter ce diagramme** : Pour comprendre l'organisation générale et les dépendances entre les couches.

### 2. [Features Diagram](./features-diagram.md)
Diagramme détaillant :
- Les relations entre les différents modules features
- Le pattern d'organisation commun à toutes les features
- Le flux de données de l'UI vers l'API
- Les hooks personnalisés de chaque feature

**Quand consulter ce diagramme** : Pour comprendre comment les features interagissent et comment ajouter une nouvelle feature.

### 3. [Class Diagram](./class-diagram.md)
Diagrammes de classes montrant :
- Les modèles de données principaux (User, Task, Note, etc.)
- Les énumérations (TaskStatus, TaskPriority, EventMode, etc.)
- Les types utilitaires et partagés
- Les services et la couche HTTP
- Les hooks et le context
- Les formulaires de création

**Quand consulter ce diagramme** : Pour comprendre la structure des données et les relations entre les entités.

### 4. [Routes Diagram](./routes-diagram.md)
Diagramme de navigation et routes montrant :
- La structure de navigation de l'application
- Les routes publiques vs protégées
- Le flux d'authentification
- Les paramètres de routes dynamiques
- Les query parameters supportés
- La carte complète des routes avec breadcrumbs

**Quand consulter ce diagramme** : Pour comprendre la navigation de l'application et ajouter de nouvelles routes.

## 👁️ Comment visualiser les diagrammes

### Option 1 : GitHub / GitLab (Recommandé)
Les diagrammes utilisent la syntaxe **Mermaid**, qui est automatiquement rendue sur GitHub et GitLab. Il suffit d'ouvrir les fichiers `.md` pour voir les diagrammes.

### Option 2 : VS Code
Installez l'extension **Markdown Preview Mermaid Support** :
```bash
code --install-extension bierner.markdown-mermaid
```
Puis ouvrez les fichiers `.md` avec la prévisualisation Markdown (Ctrl+Shift+V).

### Option 3 : Mermaid Live Editor
Copiez le contenu des blocs ```mermaid``` et collez-le dans :
- [Mermaid Live Editor](https://mermaid.live/)

### Option 4 : PlantUML (Alternative)
Si vous préférez PlantUML, vous pouvez convertir les diagrammes ou utiliser :
- [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
- Extension VS Code : **PlantUML**

## 🏗️ Architecture du projet

### Structure des Features

Chaque feature suit un pattern cohérent :

```
/features/[feature-name]/
├── types.ts              # Interfaces TypeScript et enums
├── api.ts                # Couche API (CRUD operations)
├── hooks/
│   └── use[Feature].ts   # Hook personnalisé pour state management
├── components/
│   ├── [Feature]List.tsx
│   ├── [Feature]Form.tsx
│   └── [Feature]Card.tsx
└── index.ts              # Barrel export
```

### Flux de données typique

```
Component → Hook → API Layer → HTTP Service → Backend
    ↑                                              ↓
    └──────────── Update State ←──────────────────┘
```

### Features disponibles

| Feature | Description | Hook principal |
|---------|-------------|----------------|
| **Auth** | Authentification JWT | `useAuth()` |
| **Tasks** | Gestion des tâches | `useTasks()` |
| **Notes** | Éditeur de notes | `useNotes()` |
| **Notebooks** | Organisation en carnets | `useNotebooks()` |
| **Labels** | Système d'étiquetage | `useLabels()` |
| **Links** | Gestion des favoris | `useLinks()` |
| **Calendar** | Calendrier et événements | `useCalendar()` |
| **BlocNote** | Notes rapides | `useBlocNote()` |
| **Tools** | Timer et utilitaires | - |

## 🔑 Concepts clés

### 1. Custom Hooks Pattern
Chaque feature expose un hook personnalisé qui encapsule :
- L'état local (données, loading, erreurs)
- Les opérations CRUD
- La logique métier spécifique

### 2. API Layer
Séparation claire entre les hooks et les appels HTTP :
- Les hooks gèrent l'état UI
- Les APIs gèrent les requêtes HTTP
- Le HTTP Service gère l'authentification et les erreurs

### 3. Global Context
`AppContext` gère l'état global de l'UI :
- Theme (light/dark/auto)
- Sidebar collapsed/expanded
- Filtres actifs (notebook, labels)
- Termes de recherche
- Mode d'affichage (grid/list)

### 4. Protected Routes
Les routes protégées utilisent un composant `ProtectedRoute` qui :
- Vérifie l'authentification
- Redirige vers /login si non authentifié
- Gère le rafraîchissement automatique des tokens

## 🚀 Ajouter une nouvelle feature

Pour ajouter une nouvelle feature, suivez ce pattern :

1. **Créer la structure de dossiers**
   ```bash
   mkdir -p src/features/ma-feature/{hooks,components}
   ```

2. **Définir les types** (`types.ts`)
   ```typescript
   export interface MaFeature {
     id: string;
     // ... autres propriétés
   }
   ```

3. **Créer la couche API** (`api.ts`)
   ```typescript
   import { httpService } from '@/shared/services/http';

   export const maFeatureApi = {
     getAll: () => httpService.get<MaFeature[]>('/ma-feature'),
     // ... autres méthodes CRUD
   };
   ```

4. **Créer le hook personnalisé** (`hooks/useMaFeature.ts`)
   ```typescript
   import { useState, useEffect } from 'react';
   import { maFeatureApi } from '../api';

   export const useMaFeature = () => {
     const [data, setData] = useState<MaFeature[]>([]);
     const [isLoading, setIsLoading] = useState(false);
     // ... logique du hook
   };
   ```

5. **Créer les composants** (`components/`)
   - List component
   - Form component
   - Card/Item component

6. **Exporter depuis index.ts**
   ```typescript
   export * from './types';
   export * from './api';
   export * from './hooks/useMaFeature';
   export * from './components';
   ```

## 📝 Mise à jour des diagrammes

Pour maintenir cette documentation à jour :

1. Après avoir ajouté une nouvelle feature, mettez à jour `features-diagram.md`
2. Si vous ajoutez de nouveaux types, mettez à jour `class-diagram.md`
3. Pour des changements architecturaux majeurs, mettez à jour `architecture-overview.md`

## 🤝 Contribution

Lors de l'ajout de nouvelles fonctionnalités :
- Suivez le pattern établi des features existantes
- Maintenez la cohérence des noms et de la structure
- Documentez les nouveaux types et interfaces
- Mettez à jour les diagrammes UML si nécessaire

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mermaid Documentation](https://mermaid.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Dernière mise à jour** : 2026-01-12
**Version du projet** : React 19 + TypeScript 5.7 + Vite 6.3
