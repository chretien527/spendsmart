# SpendSmart

SpendSmart is a React expense tracker for logging spending, reviewing category trends, and managing monthly budgets.

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Vite will print a local URL, usually `http://localhost:5173`.

## Production build

Create the production bundle:

```bash
npm run build
```

The compiled site is written to `dist/`.

Preview the production build locally:

```bash
npm run preview
```

## Deploy on Vercel

This project is configured for Vercel as a static Vite app.

- Build command: `npm run build`
- Output directory: `dist`

The repository also includes `vercel.json` so the output folder is explicit.
