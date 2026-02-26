# Plan: Project Cleanup

This plan outlines the steps to remove unnecessary standalone scripts, SQL files, and documentation while preserving the core Frontend (FE) application and environment configuration.

## Proposed Changes

### [Cleanup] Core Project

The goal is to move from a cluttered root directory to a clean, frontend-focused structure.

#### [KEEP] Essential Files & Directories
- `.env` (Environment variables)
- `src/` (Frontend source code)
- `public/` (Static assets)
- `package.json` & `package-lock.json` (Dependencies)
- `vite.config.js` (Vite config)
- `tailwind.config.js` (Tailwind config)
- `postcss.config.js` (PostCSS config)
- `jsconfig.json` (JS path config)
- `index.html` (Entry point)
- `.git/` (Version control)
- `.agent/` (AI Assistant config)
- `.gitignore`
- `.firebaserc` & `firebase.json` (Firebase config)
- `vercel.json` (Vercel config)

#### [DELETE] Unnecessary Files
All standalone files with the following extensions in the root directory (excluding those in the "KEEP" list):
- `*.js` (Standalone scripts like `check-users.js`, `server.js` if not used by FE)
- `*.sql` (Database migrations and scripts)
- `*.md` (Documentation files like `DATABASE_URLS.md`, except `README.md` if present and needed)
- `*.json` (Data snapshots like `sample-data.json`, `permission_audit_report.json`)
- `*.txt` (Log files like `sync_log.txt`)

## Implementation Steps

1. **Safety Check:** Confirm no critical backend logic is being mistakenly deleted (e.g., `server.js` or `api/` directory if required for local development/deployment).
2. **Batch Deletion:** Use shell commands to safely remove targeted files.
3. **Ghost Files Check:** Ensure no broken references remain in the remaining files.

## Verification Plan

### Manual Verification
- Run `npm run dev` (or equivalent) to ensure the FE application still builds and runs locally.
- Check the root directory to confirm only the "KEEP" list remains.
- Verify `.env` is intact.
