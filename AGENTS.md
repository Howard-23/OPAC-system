# Repository Guide

## Structure

- `server/`: Node.js API backed by PostgreSQL. This is the Railway deploy target.
- `lib-mgmt/`: React + Vite + Tauri client. Browser mode uses the shared API; desktop mode uses Tauri commands.
- `railway.json`: root Railway config that installs and starts the API service from `server/`.

## Local commands

- `npm run setup`: install API and client dependencies.
- `npm run dev:api`: start the shared API on port `8787`.
- `npm run dev:web`: start the Vite client on port `5173`.
- `npm run dev:desktop`: start the Tauri desktop client.
- `npm run build`: build the web client.
- `npm run typecheck`: run the client TypeScript check.

## Environment

- Browser mode defaults to `http://localhost:8787/api`.
- Set `lib-mgmt/.env` `VITE_API_BASE_URL` when the client should target a deployed API.
- Set `server/.env` `DATABASE_URL` for the shared API.
- Set `server/.env` `CORS_ALLOWED_ORIGINS` to a comma-separated list of deployed client origins.

## Constraints

- Do not edit checked-in `node_modules` content.
- Desktop-only features remain unavailable in browser mode.
- API sessions are stored in memory; service restarts clear active logins.
