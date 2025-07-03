# Gestion des connexions MongoDB - Easylis

## 🚨 Problème résolu

**Erreur** : `MongoNotConnectedError: Client must be connected before running operations`

**Cause** : Requêtes simultanées tentant d'utiliser la même connexion MongoDB avec des déconnexions fréquentes.

## ✅ Solution implémentée

### 1. **Connexion optimisée** (`src/libs/database/setting.mongoose.ts`)

#### Fonction `connectDBOnce()` pour les routes externes :
- ✅ **Connexion unique** : Une seule connexion maintenue
- ✅ **Gestion concurrente** : Évite les reconnexions multiples
- ✅ **Pool de connexions** : Optimisé pour les requêtes simultanées
- ✅ **Pas de déconnexion** : Maintient la connexion active

#### Configuration optimisée :
```typescript
const options = {
  maxPoolSize: 10,           // Pool de 10 connexions
  serverSelectionTimeoutMS: 5000,  // Timeout de sélection
  socketTimeoutMS: 45000,    // Timeout des sockets
  bufferMaxEntries: 0,       // Pas de buffering
  bufferCommands: false,     // Pas de buffering des commandes
};
```

### 2. **Routes API externes optimisées**

#### Routes modifiées :
- ✅ `/api/services/external/sessions/route.ts`
- ✅ `/api/services/external/activities/route.ts`
- ✅ `/api/services/external/spots/route.ts`

#### Changements :
- ✅ Utilisation de `connectDBOnce()` au lieu de `connectDB()`
- ✅ Suppression des appels à `disconnectDB()`
- ✅ Gestion optimisée des requêtes concurrentes

### 3. **Gestion des événements**

#### Événements MongoDB surveillés :
- ✅ `connected` : Connexion réussie
- ✅ `error` : Erreur de connexion
- ✅ `disconnected` : Déconnexion
- ✅ `SIGINT` : Fermeture propre de l'application

## 🔧 Utilisation

### Pour les routes API externes (haute concurrence) :
```typescript
import { connectDBOnce } from "@/libs/database/setting.mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDBOnce(); // Connexion optimisée
    // ... logique métier
  } catch (error) {
    // ... gestion d'erreur
  }
}
```

### Pour les autres routes (connexion standard) :
```typescript
import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // ... logique métier
  } catch (error) {
    // ... gestion d'erreur
  } finally {
    await disconnectDB(); // Déconnexion en développement
  }
}
```

## 📊 Avantages

- **🚀 Performance** : Réduction des temps de connexion
- **🔄 Concurrence** : Support des requêtes simultanées
- **💾 Ressources** : Optimisation de l'utilisation mémoire
- **🛡️ Stabilité** : Moins d'erreurs de connexion
- **📈 Scalabilité** : Support de la charge élevée

## 🔍 Monitoring

Les logs suivent l'état des connexions :
```
MongoDB connected successfully
MongoDB disconnected
MongoDB connection error: [détails]
```

## ⚠️ Notes importantes

1. **Développement** : `disconnectDB()` ne fonctionne qu'en mode développement
2. **Production** : Les connexions sont maintenues pour optimiser les performances
3. **Pool** : Maximum 10 connexions simultanées par défaut
4. **Timeout** : 5 secondes pour la sélection du serveur, 45 secondes pour les sockets 