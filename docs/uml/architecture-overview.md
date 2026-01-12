# Diagramme UML - Architecture Globale

## Vue d'ensemble de l'architecture

```mermaid
graph TB
    subgraph "Présentation Layer"
        Pages[Pages<br/>Public & Protected Routes]
        Components[Shared Components<br/>UI Elements]
    end

    subgraph "Application Layer"
        Router[React Router<br/>Navigation]
        AppContext[App Context<br/>Global State]
        ProtectedRoute[Protected Route<br/>Auth Guard]
    end

    subgraph "Features Layer"
        Auth[Auth Feature<br/>Authentication]
        Tasks[Tasks Feature<br/>Task Management]
        Notes[Notes Feature<br/>Note Management]
        Notebooks[Notebooks Feature<br/>Organization]
        Labels[Labels Feature<br/>Tagging System]
        Links[Links Feature<br/>Bookmarks]
        Calendar[Calendar Feature<br/>Events & Tasks]
        BlocNote[BlocNote Feature<br/>Quick Notes]
        Tools[Tools Feature<br/>Timer & Utils]
    end

    subgraph "Service Layer"
        HttpService[HTTP Service<br/>API Client]
        AuthService[Auth Service<br/>Token Management]
        StorageService[Storage Service<br/>LocalStorage]
    end

    subgraph "Backend API"
        RestAPI[REST API<br/>Backend Services]
    end

    Pages --> Router
    Pages --> Components
    Pages --> AppContext
    Router --> ProtectedRoute
    ProtectedRoute --> Auth

    Pages --> Tasks
    Pages --> Notes
    Pages --> Notebooks
    Pages --> Labels
    Pages --> Links
    Pages --> Calendar
    Pages --> BlocNote
    Pages --> Tools

    Tasks --> HttpService
    Notes --> HttpService
    Notebooks --> HttpService
    Labels --> HttpService
    Links --> HttpService
    Calendar --> HttpService
    BlocNote --> HttpService
    Auth --> AuthService

    AuthService --> HttpService
    AuthService --> StorageService
    HttpService --> RestAPI

    classDef presentation fill:#e1f5ff,stroke:#01579b
    classDef application fill:#f3e5f5,stroke:#4a148c
    classDef features fill:#fff3e0,stroke:#e65100
    classDef services fill:#e8f5e9,stroke:#1b5e20
    classDef backend fill:#fce4ec,stroke:#880e4f

    class Pages,Components presentation
    class Router,AppContext,ProtectedRoute application
    class Auth,Tasks,Notes,Notebooks,Labels,Links,Calendar,BlocNote,Tools features
    class HttpService,AuthService,StorageService services
    class RestAPI backend
```

## Architecture en couches

### 1. Présentation Layer
- **Pages**: Composants de page (publiques et protégées)
- **Shared Components**: Composants UI réutilisables (Layout, Sidebar, Header, etc.)

### 2. Application Layer
- **React Router**: Gestion de la navigation
- **App Context**: État global de l'application (UI state, filters, theme)
- **Protected Route**: Garde d'authentification pour les routes protégées

### 3. Features Layer
Chaque feature est organisée selon le pattern:
- **types.ts**: Interfaces et types TypeScript
- **api.ts**: Couche API pour les requêtes HTTP
- **hooks/**: Custom hooks React pour la gestion d'état
- **components/**: Composants React spécifiques à la feature

Features disponibles:
- **Auth**: Authentification et autorisation
- **Tasks**: Gestion des tâches avec priorités et échéances
- **Notes**: Création et édition de notes riches
- **Notebooks**: Organisation des notes en carnets
- **Labels**: Système d'étiquetage avec couleurs
- **Links**: Gestion des favoris/bookmarks
- **Calendar**: Calendrier avec événements et tâches
- **BlocNote**: Widget de notes rapides avec auto-save
- **Tools**: Utilitaires (timer, etc.)

### 4. Service Layer
- **HTTP Service**: Client API centralisé avec authentification Bearer
- **Auth Service**: Gestion des tokens et refresh automatique
- **Storage Service**: Interface pour localStorage

### 5. Backend API
- REST API avec authentification JWT
- Refresh automatique des tokens sur erreur 401
