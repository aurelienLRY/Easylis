# APIEXTERNE - Stockage photos sessions

API Express dédiée au stockage des photos de sessions Easylis.

## Installation

```bash
cd APIEXTERNE
npm install
cp .env.example .env
npm run start
```

## Variables d'environnement

- `PORT`: port HTTP de l'API
- `PHOTO_STORAGE_ROOT`: dossier de stockage local
- `PHOTO_STORAGE_BASE_URL`: URL publique de l'API pour construire les URLs de fichiers

## Endpoints

- `POST /photos/upload` (multipart)
  - champs: `sessionId`, `fileName`, `file`
- `GET /photos?sessionId=<id>`
- `DELETE /photos`
  - body JSON: `{ "sessionId": "...", "fileName": "..." }`
- `GET /health`

## Rétention 3 mois

Les photos sont supprimées physiquement après 3 mois.
La purge est exécutée automatiquement à chaque appel d'endpoint.
