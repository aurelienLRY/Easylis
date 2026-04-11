# API services externes — site marchand

Ce dossier expose des routes consommées par des systèmes tiers (dont le **site marchand**). Toutes les URLs commencent par :

`https://<votre-domaine-easylis>/api/services/external/`

---

## Photos d’une session (`session-photos`)

Permet au site marchand d’afficher la **liste des photos** d’une session, après qu’un client a reçu le **lien par email** (même `token` que dans ce lien).

### Méthode et URL

| Élément | Valeur |
|--------|--------|
| **Méthode** | `GET` |
| **Chemin** | `/api/services/external/session-photos` |

### Ce que le site marchand doit envoyer

#### 1. En-tête HTTP (obligatoire)

| En-tête | Format | Description |
|---------|--------|-------------|
| `Authorization` | `Bearer <clé>` | Clé partagée **identique** à la variable d’environnement Easylis `NEXT_API_OUT_SERVICES`. Sans cet en-tête, le middleware renvoie **401**. |

**Ne jamais** mettre cette clé dans le JavaScript du navigateur ni dans une page statique. Appelez Easylis depuis une **route API**, un **middleware** ou un **Server Component** du site marchand.

#### 2. Paramètres de requête (query string, obligatoires)

| Paramètre | Exemple | Description |
|-----------|---------|-------------|
| `sessionId` | `674a1b2c3d4e5f6789012345` | Identifiant MongoDB de la session (même valeur que celle utilisée côté Easylis). |
| `token` | `eyJ...` (longue chaîne) | Jeton signé présent dans l’URL du lien « photos » envoyé par email. **Encoder** le token dans l’URL si besoin (`encodeURIComponent`). |

Les deux paramètres sont **requis**. S’il en manque un → **400**.

### Exemple de requête (cURL)

Remplacez `EASYLIS_ORIGIN`, `VOTRE_CLE_API` et les valeurs de `sessionId` / `token`.

```bash
curl -sS -G "https://EASYLIS_ORIGIN/api/services/external/session-photos" \
  --data-urlencode "sessionId=VOTRE_SESSION_ID" \
  --data-urlencode "token=VOTRE_TOKEN_DU_LIEN_EMAIL" \
  -H "Authorization: Bearer VOTRE_CLE_API"
```

### Exemple (Node.js, côté serveur marchand)

```ts
const base = process.env.EASYLIS_API_ORIGIN; // ex. https://app.easylis.fr
const apiKey = process.env.EASYLIS_OUT_SERVICES_KEY; // même valeur que NEXT_API_OUT_SERVICES côté Easylis

const url = new URL(`${base}/api/services/external/session-photos`);
url.searchParams.set("sessionId", sessionId);
url.searchParams.set("token", tokenFromQuery);

const res = await fetch(url.toString(), {
  method: "GET",
  headers: { Authorization: `Bearer ${apiKey}` },
});

const body = await res.json();
```

### Réponse en cas de succès (`200`)

```json
{
  "success": true,
  "data": [
    {
      "_id": "…",
      "fileUrl": "https://…",
      "fileName": "…",
      "uploadedAt": "2026-04-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "sessionId": "…",
    "count": 1
  }
}
```

- `data` : photos **non supprimées** et **non expirées** (rétention Easylis), triées par `uploadedAt` décroissant.
- Tableau vide si aucune photo éligible.

### Erreurs courantes

| Code HTTP | `success` | Signification probable |
|-----------|-----------|-------------------------|
| **400** | `false` | `sessionId` ou `token` manquant dans la query. |
| **401** | — | Absence ou mauvaise valeur de `Authorization: Bearer` (middleware Easylis). |
| **403** | `false` | Token invalide, expiré, ou ne correspond pas au `sessionId` ; ou réservation client introuvable / annulée. |
| **500** | `false` | Erreur serveur Easylis. |

Corps d’erreur typique :

```json
{ "success": false, "error": "Message explicatif en français" }
```

### Rappel sécurité

1. **Clé API** (`NEXT_API_OUT_SERVICES`) : uniquement **serveur marchand** ↔ Easylis.  
2. **Token** : transmis au marchand via l’URL du mail ; il lie **une réservation client** à une **session** ; ne pas le logger en clair en production si possible.  
3. Le token est signé côté Easylis (`PHOTO_SHARE_LINK_SECRET` ou repli sur `NEXTAUTH_SECRET`).

---

## Autres routes du dossier `external`

Les routes `activities`, `spots`, `sessions`, `booking` suivent la même règle d’en-tête **`Authorization: Bearer <NEXT_API_OUT_SERVICES>`**. Le détail de chaque endpoint reste documenté dans [`../../README.md`](../../README.md) (section *services/external*).

Pour un aperçu JSON des chemins exposés : `GET /api/services/external` (avec la même authentification Bearer).
