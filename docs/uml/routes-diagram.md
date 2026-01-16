# Diagramme UML - Routes et Navigation

## Structure de navigation

```mermaid
graph TD
    Root["/"]
    Login["/login"]
    Signup["/signup"]
    VerifyEmail["/verify-email"]
    About["/about"]
    Privacy["/privacy"]

    Dashboard["/dashboard"]
    Settings["/dashboard/settings"]

    NotesNew["/dashboard/notes/new"]
    NotesEdit["/dashboard/notes/:id"]
    NotesView["/dashboard/notes/:id/view"]

    LinksNew["/dashboard/links/new"]
    LinksEdit["/dashboard/links/:id"]

    TasksNew["/dashboard/tasks/new"]

    Calendar["/dashboard/calendar"]

    Root --> Login
    Root --> Signup
    Root --> VerifyEmail
    Root --> About
    Root --> Privacy
    Root --> Dashboard

    Dashboard --> Settings
    Dashboard --> NotesNew
    Dashboard --> NotesEdit
    Dashboard --> NotesView
    Dashboard --> LinksNew
    Dashboard --> LinksEdit
    Dashboard --> TasksNew
    Dashboard --> Calendar

    classDef public fill:#e1f5ff,stroke:#01579b
    classDef protected fill:#fff3e0,stroke:#e65100
    classDef nested fill:#f3e5f5,stroke:#4a148c

    class Root,Login,Signup,VerifyEmail,About,Privacy public
    class Dashboard,Settings protected
    class NotesNew,NotesEdit,NotesView,LinksNew,LinksEdit,TasksNew,Calendar nested
```

## Routes publiques vs protégées

```mermaid
graph LR
    subgraph "Routes Publiques"
        Home[Home<br/>/]
        LoginPage[Sign In<br/>/login]
        SignupPage[Sign Up<br/>/signup]
        VerifyEmailPage[Verify Email<br/>/verify-email]
        AboutPage[About<br/>/about]
        PrivacyPage[Privacy<br/>/privacy]
    end

    subgraph "Routes Protégées"
        DashboardPage[Dashboard<br/>/dashboard]
        SettingsPage[Settings<br/>/dashboard/settings]

        subgraph "Notes Routes"
            NotesCreate[Create Note<br/>/dashboard/notes/new]
            NotesEdit2[Edit Note<br/>/dashboard/notes/:id]
            NotesView2[View Note<br/>/dashboard/notes/:id/view]
        end

        subgraph "Links Routes"
            LinksCreate[Create Link<br/>/dashboard/links/new]
            LinksEdit2[Edit Link<br/>/dashboard/links/:id]
        end

        subgraph "Tasks Routes"
            TasksCreate[Create Task<br/>/dashboard/tasks/new]
        end

        CalendarPage[Calendar<br/>/dashboard/calendar]
    end

    Home -.Non authentifié.-> LoginPage
    LoginPage -.Authentifié.-> DashboardPage
    SignupPage -.Nouveau compte.-> DashboardPage

    DashboardPage --> SettingsPage
    DashboardPage --> NotesCreate
    DashboardPage --> LinksCreate
    DashboardPage --> TasksCreate
    DashboardPage --> CalendarPage
```

## Composants de navigation

```mermaid
classDiagram
    class Router {
        +BrowserRouter
        +Routes
        +Route[]
    }

    class PublicRoute {
        +path: string
        +element: ReactElement
        +isPublic: true
    }

    class ProtectedRoute {
        +path: string
        +element: ReactElement
        +requiresAuth: true
        +checkAuthentication()
        +redirectToLogin()
    }

    class Layout {
        +Header
        +Sidebar
        +Main Content
        +Footer
    }

    class Header {
        +Logo
        +Navigation
        +UserMenu
        +ThemeToggle
    }

    class Sidebar {
        +NavigationLinks[]
        +QuickActions
        +BlocNoteWidget
        +TimerWidget
        +collapsed: boolean
    }

    Router --> PublicRoute : contains
    Router --> ProtectedRoute : contains
    ProtectedRoute --> Layout : wraps
    Layout --> Header : includes
    Layout --> Sidebar : includes
```

## Flux d'authentification et navigation

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant ProtectedRoute
    participant AuthService
    participant LoginPage
    participant Dashboard

    User->>Router: Accède à /dashboard
    Router->>ProtectedRoute: Vérifie route protégée
    ProtectedRoute->>AuthService: isAuthenticated()?

    alt Non authentifié
        AuthService-->>ProtectedRoute: false
        ProtectedRoute->>LoginPage: Redirect to /login
        LoginPage-->>User: Affiche formulaire
        User->>LoginPage: Soumet credentials
        LoginPage->>AuthService: login(email, password)
        AuthService-->>LoginPage: Token + User
        LoginPage->>Router: Navigate to /dashboard
    else Authentifié
        AuthService-->>ProtectedRoute: true
        ProtectedRoute->>Dashboard: Render Dashboard
        Dashboard-->>User: Affiche contenu
    end

    User->>Dashboard: Clique sur "Create Note"
    Dashboard->>Router: Navigate to /dashboard/notes/new
    Router->>ProtectedRoute: Vérifie auth (toujours valide)
    ProtectedRoute->>Dashboard: Render NotesNew page
```

## Carte des routes détaillée

| Route                       | Type      | Composant    | Description                      | Authentification |
| --------------------------- | --------- | ------------ | -------------------------------- | ---------------- |
| `/`                         | Public    | Home         | Page d'accueil avec présentation | Non              |
| `/login`                    | Public    | SignIn       | Formulaire de connexion          | Non              |
| `/signup`                   | Public    | SignUp       | Formulaire d'inscription         | Non              |
| `/verify-email`             | Public    | VerifyEmail  | Vérification d'email             | Non              |
| `/about`                    | Public    | About        | À propos de l'application        | Non              |
| `/privacy`                  | Public    | Privacy      | Politique de confidentialité     | Non              |
| `/dashboard`                | Protected | Dashboard    | Vue d'ensemble principale        | Oui              |
| `/dashboard/settings`       | Protected | UserSettings | Paramètres utilisateur           | Oui              |
| `/dashboard/notes/new`      | Protected | CreateNote   | Créer une nouvelle note          | Oui              |
| `/dashboard/notes/:id`      | Protected | EditNote     | Éditer une note existante        | Oui              |
| `/dashboard/notes/:id/view` | Protected | ViewNote     | Visualiser une note              | Oui              |
| `/dashboard/links/new`      | Protected | CreateLink   | Ajouter un nouveau lien          | Oui              |
| `/dashboard/links/:id`      | Protected | EditLink     | Éditer un lien existant          | Oui              |
| `/dashboard/tasks/new`      | Protected | CreateTask   | Créer une nouvelle tâche         | Oui              |
| `/dashboard/calendar`       | Protected | Calendar     | Vue calendrier                   | Oui              |

## Navigation dans le Dashboard

```mermaid
graph TD
    Dashboard[Dashboard]

    subgraph "Section Notes"
        NotesList[Liste des notes]
        NotebookFilter[Filtre carnets]
        LabelFilter[Filtre étiquettes]
        SearchNotes[Recherche notes]
    end

    subgraph "Section Tasks"
        TasksList[Liste des tâches]
        TasksToday[Tâches aujourd'hui]
        TasksUpcoming[Tâches à venir]
        TasksOverdue[Tâches en retard]
    end

    subgraph "Section Links"
        LinksList[Liste des liens]
        LinksByCategory[Par catégorie]
        LinksByTags[Par tags]
    end

    subgraph "Widgets"
        BlocNoteWidget[Bloc-notes rapide]
        TimerWidget[Timer/Chronomètre]
    end

    Dashboard --> NotesList
    Dashboard --> TasksList
    Dashboard --> LinksList
    Dashboard --> BlocNoteWidget
    Dashboard --> TimerWidget

    NotesList --> NotebookFilter
    NotesList --> LabelFilter
    NotesList --> SearchNotes

    TasksList --> TasksToday
    TasksList --> TasksUpcoming
    TasksList --> TasksOverdue

    LinksList --> LinksByCategory
    LinksList --> LinksByTags
```

## Menu de navigation principal (Sidebar)

```mermaid
mindmap
  root((Sidebar))
    Dashboard
      Vue d'ensemble
      Statistiques
    Notes
      Toutes les notes
      Par carnet
      Par étiquette
      Épinglées
    Tasks
      Aujourd'hui
      À venir
      En retard
      Complétées
    Links
      Tous les liens
      Par catégorie
      Favoris
    Calendar
      Vue mois
      Vue semaine
      Vue jour
    Tools
      Timer
      Bloc-note rapide
    Settings
      Profil
      Préférences
      Thème
```

## Redirections et gestion d'erreurs

```mermaid
graph TD
    Request[Requête utilisateur]

    Request --> CheckAuth{Authentifié?}

    CheckAuth -->|Non| IsPublicRoute{Route publique?}
    CheckAuth -->|Oui| IsProtectedRoute{Route protégée?}

    IsPublicRoute -->|Oui| RenderPublic[Render page publique]
    IsPublicRoute -->|Non| RedirectLogin[Redirect → /login]

    IsProtectedRoute -->|Oui| CheckToken{Token valide?}
    IsProtectedRoute -->|Non| Render404[Render 404]

    CheckToken -->|Oui| RenderProtected[Render page protégée]
    CheckToken -->|Non| RefreshToken{Refresh possible?}

    RefreshToken -->|Oui| GetNewToken[Obtenir nouveau token]
    RefreshToken -->|Non| ForceLogout[Déconnecter et redirect → /login]

    GetNewToken --> RenderProtected

    RenderPublic --> Success[✓ Succès]
    RenderProtected --> Success
    RedirectLogin --> Success
    Render404 --> Success
    ForceLogout --> Success
```

## Paramètres de routes dynamiques

| Route                       | Paramètre | Type   | Exemple                        | Utilisation                        |
| --------------------------- | --------- | ------ | ------------------------------ | ---------------------------------- |
| `/dashboard/notes/:id`      | `:id`     | string | `/dashboard/notes/abc123`      | Identifiant unique de la note      |
| `/dashboard/notes/:id/view` | `:id`     | string | `/dashboard/notes/abc123/view` | Identifiant pour vue lecture seule |
| `/dashboard/links/:id`      | `:id`     | string | `/dashboard/links/xyz789`      | Identifiant unique du lien         |

## Query parameters supportés

| Route                 | Query Param | Type   | Exemple            | Description                          |
| --------------------- | ----------- | ------ | ------------------ | ------------------------------------ |
| `/dashboard`          | `view`      | string | `?view=grid`       | Mode d'affichage (grid/list/compact) |
| `/dashboard`          | `notebook`  | string | `?notebook=abc123` | Filtre par carnet                    |
| `/dashboard`          | `label`     | string | `?label=xyz789`    | Filtre par étiquette                 |
| `/dashboard`          | `search`    | string | `?search=react`    | Terme de recherche                   |
| `/dashboard/calendar` | `date`      | string | `?date=2026-01-12` | Date sélectionnée                    |
| `/dashboard/calendar` | `view`      | string | `?view=month`      | Vue du calendrier (month/week/day)   |

## Breadcrumbs et navigation contextuelle

```mermaid
graph LR
    Home[Home] --> Dashboard[Dashboard]
    Dashboard --> Notes[Notes]
    Notes --> EditNote[Edit: Mon titre]

    Dashboard --> Tasks[Tasks]
    Tasks --> CreateTask[Create Task]

    Dashboard --> Calendar[Calendar]
    Calendar --> EventDetails[Event Details]
```

Exemple de breadcrumbs :

- **Home** > **Dashboard** > **Notes** > **Edit Note**
- **Home** > **Dashboard** > **Tasks** > **Create Task**
- **Home** > **Dashboard** > **Calendar** > **January 2026**
