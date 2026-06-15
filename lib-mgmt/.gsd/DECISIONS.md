# Decisions Register

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | tech | UI Framework | React + Vite | Modern, standard, fast dev cycle | No |
| D002 | M001 | style | Styling | Tailwind CSS | Utility-first, easy to match bevels | No |
| D003 | M001 | icons | Icon Set | Lucide-React | Clean, consistent, modern | No |
| D004 | M001 | state | State Management | Zustand | Lightweight, fits project scale | Yes |
| D005 | M001 | parity | UI Aesthetics | High-Density / Beveled | Matching legacy wireframe-1 exactly | No |
| D041 | M007 | brand | Color Scheme | GJC Green/Gold | School identity alignment (#00401A, #C5A059) | No |
| D042 | M007 | deploy | Bundle Strategy | NSIS installerHooks | Inject dependency install via .nsh hooks (not full template) | Yes |
| D046 | M007 | deploy | Installer Credentials | NSIS Custom Page | Writes db_config.json to %APPDATA% during install | No |
| D047 | M007 | deploy | Dependency Packaging | Bundled in EXE | PG+Ollama extracted to $INSTDIR subdirs for portability | No |
| D048 | M007 | deploy | System Detection | NSIS Auto-Detect | Skip bundled install if system PG/Ollama already present | No |
| D049 | M007 | ux | App Boot Flow | Login First | Removed SetupPage intercept; Settings accessible from Toolbar | No |
