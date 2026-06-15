# InfoLib Client

`lib-mgmt/` is the React + Vite + Tauri client for the library system.

## Modes

- Web mode: runs in the browser and talks to the shared API in `../server`.
- Desktop mode: runs through Tauri and uses the Rust backend plus local desktop-only features.

## Local development

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the shared API from the repo root:
   ```powershell
   npm run dev:api
   ```
4. Start the web client from the repo root:
   ```powershell
   npm run dev:web
   ```
5. For the desktop shell instead of browser mode:
   ```powershell
   npm run dev:desktop
   ```

## Environment

- `VITE_API_BASE_URL`: shared API base URL for browser mode. Local default is `http://localhost:8787/api`.
- `DATABASE_URL`: compile-time database URL used by Rust tooling.
- `DEV_DATABASE_URL`: runtime database URL override for Tauri development.

## Commands

```powershell
npm run dev
npm run build
npm run typecheck
npm run lint
npm run tauri:dev
```
