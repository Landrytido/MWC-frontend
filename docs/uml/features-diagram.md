# Diagramme UML - Modules Features

## Relations entre les Features

```mermaid
graph LR
    subgraph "Core Features"
        Auth[Auth]
        Dashboard[Dashboard]
    end

    subgraph "Content Management"
        Notes[Notes]
        Notebooks[Notebooks]
        Labels[Labels]
        Links[Links]
    end

    subgraph "Planning & Organization"
        Tasks[Tasks]
        Calendar[Calendar]
    end

    subgraph "Quick Access Tools"
        BlocNote[BlocNote<br/>Quick Notes]
        Tools[Tools<br/>Timer]
    end

    subgraph "Global Context"
        AppContext[App Context<br/>UI State & Filters]
    end

    Auth --> Dashboard
    Dashboard --> Notes
    Dashboard --> Tasks
    Dashboard --> Links
    Dashboard --> Calendar

    Notes --> Notebooks
    Notes --> Labels
    Notes --> AppContext

    Tasks --> Calendar
    Tasks --> AppContext

    Links --> AppContext

    BlocNote --> AppContext
    Tools --> AppContext

    Notebooks --> AppContext
    Labels --> AppContext

    classDef core fill:#e1f5ff,stroke:#01579b
    classDef content fill:#fff3e0,stroke:#e65100
    classDef planning fill:#f3e5f5,stroke:#4a148c
    classDef tools fill:#e8f5e9,stroke:#1b5e20
    classDef context fill:#fce4ec,stroke:#880e4f

    class Auth,Dashboard core
    class Notes,Notebooks,Labels,Links content
    class Tasks,Calendar planning
    class BlocNote,Tools tools
    class AppContext context
```

## Pattern d'organisation des Features

```mermaid
classDiagram
    class Feature {
        <<interface>>
        +types.ts
        +api.ts
        +hooks/
        +components/
        +index.ts
    }

    class TasksFeature {
        +types.ts: Task, TaskStatus, TaskPriority
        +api.ts: tasksApi
        +hooks/useTasks.ts
        +components/TaskList, TaskForm
    }

    class NotesFeature {
        +types.ts: Note, Comment
        +api.ts: notesApi
        +hooks/useNotes.ts
        +components/NoteEditor, NoteList
    }

    class NotebooksFeature {
        +types.ts: Notebook, NotebookUsageStats
        +api.ts: notebooksApi
        +hooks/useNotebooks.ts
        +components/NotebookSelector
    }

    class LabelsFeature {
        +types.ts: Label, LabelColorConfig
        +api.ts: labelsApi
        +hooks/useLabels.ts
        +components/LabelSelector
    }

    class LinksFeature {
        +types.ts: SavedLink, LinkGroup
        +api.ts: linksApi
        +hooks/useLinks.ts
        +components/LinkCard, LinkForm
    }

    class CalendarFeature {
        +types.ts: Event, TaskDto
        +api.ts: calendarApi
        +hooks/useCalendar.ts
        +components/CalendarView
    }

    Feature <|.. TasksFeature
    Feature <|.. NotesFeature
    Feature <|.. NotebooksFeature
    Feature <|.. LabelsFeature
    Feature <|.. LinksFeature
    Feature <|.. CalendarFeature
```

## Flux de données

```mermaid
sequenceDiagram
    participant UI as Component
    participant Hook as Custom Hook
    participant API as API Layer
    participant HTTP as HTTP Service
    participant Backend as REST API

    UI->>Hook: Appel fonction (ex: createTask)
    Hook->>API: tasksApi.create(data)
    API->>HTTP: httpService.post('/tasks', data)
    HTTP->>Backend: POST /api/tasks
    Backend-->>HTTP: Response (201)
    HTTP-->>API: Task object
    API-->>Hook: Task object
    Hook->>Hook: Update local state
    Hook-->>UI: Re-render avec nouvelles données
```

## Hooks personnalisés par Feature

| Feature       | Hook Principal   | Fonctionnalités                                                  |
| ------------- | ---------------- | ---------------------------------------------------------------- |
| **Tasks**     | `useTasks()`     | fetchTasks, createTask, updateTask, deleteTask, getTaskStats     |
| **Notes**     | `useNotes()`     | fetchNotes, createNote, updateNote, deleteNote, searchNotes      |
| **Notebooks** | `useNotebooks()` | fetchNotebooks, createNotebook, updateNotebook, deleteNotebook   |
| **Labels**    | `useLabels()`    | fetchLabels, createLabel, updateLabel, deleteLabel               |
| **Links**     | `useLinks()`     | fetchLinks, createLink, updateLink, deleteLink, groupLinks       |
| **Calendar**  | `useCalendar()`  | fetchEvents, createEvent, updateEvent, deleteEvent, getMonthView |
| **BlocNote**  | `useBlocNote()`  | fetchBlocNote, saveBlocNote, autoSave                            |
| **Auth**      | `useAuth()`      | login, signup, logout, refreshToken, getCurrentUser              |
