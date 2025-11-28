# reactaform (workspace package)

This folder is a workspace package for the `reactaform` library.

Move the existing library source (the files currently in the repo root `src/` and related build config) into this folder at `packages/reactaform/src/` and adjust paths in `tsconfig`/Vite config accordingly.

Suggested next steps:

- Move `src/` into `packages/reactaform/src/`.
- Update `package.json` scripts in this package or run build from workspace root.
- Run `npm install` at the repo root to refresh workspace links.
