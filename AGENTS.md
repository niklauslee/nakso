# AGENTS.md

## Project overview

Nakso is a lightweight, offline-first desktop whiteboard for instant idea visualization.
Frontend: React 19 + TypeScript + Vite, using `@dgmjs` for the drawing engine, Zustand for state, Tailwind CSS v4 for styling.
Shell: Tauri 2 (Rust, `src-tauri/`) for the native desktop app.

## Setup commands

- Install deps: `npm install`
- Start dev server (web only): `npm run dev`
- Start desktop app (Tauri): `npm run tauri dev`
- Type-check + build: `npm run build`
- Preview production build: `npm run preview`

## Project structure

- `src/components/` — UI, grouped by feature (editor, sidebar, header, explorer, dialogs, settings, menu, ui)
- `src/store/` — Zustand stores (editor, app, explorer, settings, favorites, recents, etc.)
- `src/engine/` — command manager, keymap manager, auto-saver
- `src/api/` — Tauri command wrappers (window, system, workspace)
- `src/lib/` — shared utilities (storage, file helpers, events)
- `src-tauri/` — Rust/Tauri backend and native config

## Code style

- TypeScript strict mode
- Path alias `@/*` maps to `src/*`

## Release

See `README.md` for the version bump checklist and build/publish commands (`npm run release:build`, `npm run release:publish`).
