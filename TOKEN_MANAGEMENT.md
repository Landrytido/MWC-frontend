# Gestion automatique de l'expiration des tokens JWT

## 🔧 Système implémenté

Ce système résout le problème des tokens JWT expirés en implémentant plusieurs mécanismes de détection et de récupération automatiques.

## 🚀 Fonctionnalités

### 1. **Vérification automatique périodique**

- Vérification du token toutes les 5 minutes
- Auto-refresh quand le token expire dans moins de 10 minutes
- Déconnexion automatique si le refresh échoue

### 2. **Interception des erreurs HTTP**

- Détection des erreurs 401 (Unauthorized)
- Tentative automatique de rafraîchissement du token
- Redirection vers login si le refresh échoue

### 3. **Vérification lors du retour d'activité**

- Vérification du token quand l'utilisateur revient sur l'onglet
- Vérification lors du focus de la fenêtre
- Détection de session expirée après inactivité

### 4. **Notifications utilisateur**

- Notification discrète lors du rafraîchissement automatique
- Alerte en cas d'expiration de session
- Messages informatifs pour l'utilisateur

## 📖 Comment utiliser

### Dans un composant protégé

```tsx
import { useTokenNotifications, TokenNotification } from "../features/auth";

function App() {
  const { notification, hideNotification } = useTokenNotifications();

  return (
    <div>
      {/* Votre contenu */}

      <TokenNotification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
}
```

### Vérification manuelle du token

```tsx
import { useAuth } from "../features/auth";

function SomeComponent() {
  const { checkTokenValidity } = useAuth();

  const handleSensitiveAction = async () => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      // Token invalide, l'utilisateur sera redirigé
      return;
    }

    // Procéder avec l'action
  };
}
```

## 🔄 Flux de fonctionnement

1. **Démarrage de l'app** → Vérification initiale du token
2. **Activité normale** → Vérification toutes les 5 minutes
3. **Token proche expiration** → Rafraîchissement automatique
4. **Erreur 401 détectée** → Tentative de rafraîchissement
5. **Refresh échoué** → Déconnexion et redirection
6. **Retour d'inactivité** → Vérification immédiate

## ⚙️ Configuration

### Intervalles de vérification

- **Vérification automatique** : 5 minutes
- **Seuil de rafraîchissement** : 10 minutes avant expiration
- **Vérification en route protégée** : 2 minutes

### Points de vérification

- Au démarrage de l'application
- Toutes les 5 minutes (en arrière-plan)
- Lors du retour de focus/visibilité
- Sur les erreurs HTTP 401
- Dans les routes protégées

## 🛡️ Sécurité

- Les tokens sont automatiquement supprimés lors de l'expiration
- Redirection immédiate vers la page de connexion
- Nettoyage complet du localStorage
- Arrêt des vérifications après déconnexion

## 🔍 Debug

Pour suivre l'activité du système :

```javascript
// Dans la console du navigateur
localStorage.setItem("debug-auth", "true");
```

Les logs apparaîtront dans la console pour le debugging.
