# Project Setup — Run Locally in VS Code

This is the complete project. Follow these steps exactly and it will run on your machine the same way it runs online.

## 1. Requirements

Install once on your computer:

- **Node.js 18 or higher** — https://nodejs.org/
- **VS Code** — https://code.visualstudio.com/
- (Optional) **Bun** — https://bun.sh (faster, but `npm` works fine)

Check they work:
```bash
node -v
npm -v
```

## 2. Open the project

1. Unzip the folder.
2. Open the unzipped folder in VS Code (`File → Open Folder`).
3. Open the integrated terminal (`Ctrl + ` ` or `View → Terminal`).

## 3. Install dependencies

In the terminal at the project root, run **one** of these:

```bash
npm install
```
or
```bash
bun install
```

This creates the `node_modules/` folder. Wait until it finishes (1–3 minutes).

## 4. Environment variables (already included)

A `.env` file is included in this folder with the keys needed to connect to the backend:

```
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
```

**Do not delete or rename this file.** If it's missing, the app will fail to load with errors like “supabaseUrl is required”.

## 5. Run the app

```bash
npm run dev
```

You will see something like:
```
  ➜  Local:   http://localhost:8080/
```

Open that URL in your browser. The app should load with the same UI you saw online.

## 6. Build for production

```bash
npm run build
npm run preview
```

The production-ready files will be in the `dist/` folder.

---

## Deploying to Vercel (fixes the common error)

The error you saw on Vercel happens because Vercel does **not** read your local `.env` file. You must add the same variables in the Vercel dashboard.

### Steps

1. Push the project to GitHub.
2. In Vercel → **New Project** → import the GitHub repo.
3. Framework Preset: **Vite** (auto-detected).
4. Before clicking Deploy, expand **Environment Variables** and add **all three**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_PROJECT_ID` | (copy from `.env`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | (copy from `.env`) |
| `VITE_SUPABASE_URL` | (copy from `.env`) |

5. Click **Deploy**.

If you already deployed and got an error: open the project in Vercel → **Settings → Environment Variables** → add the three variables above → go to **Deployments** → click the latest one → **Redeploy**.

---

## Common errors & fixes

| Error | Cause | Fix |
|---|---|---|
| `supabaseUrl is required` | `.env` missing or wrong | Make sure `.env` is in the project root |
| `Cannot find module ...` | Dependencies not installed | Run `npm install` again |
| `Port 8080 already in use` | Another app is using the port | Close it, or edit `vite.config.ts` and change `port` |
| White screen on Vercel | Env vars not set in Vercel | Add them in Vercel dashboard, redeploy |
| `command not found: npm` | Node.js not installed | Install Node.js 18+ |

---

## Project structure

```
├── src/                  # Frontend (React + TypeScript)
│   ├── components/       # UI components (DetectionTabs, ImageDetection, etc.)
│   ├── pages/            # Index, Documentation
│   └── integrations/     # Backend client
├── supabase/
│   └── functions/        # Edge Functions (analyze-image, analyze-video, send-telegram-alert)
├── public/               # Static assets
├── .env                  # Environment variables (KEEP THIS)
├── package.json          # Dependencies
└── vite.config.ts        # Build config
```

That's it. After `npm install` and `npm run dev`, the app runs identically to the online version.
