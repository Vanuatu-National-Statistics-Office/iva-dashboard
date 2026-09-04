# IVA Dashboard

Trial International Visitor Arrivals dashboard for February 2026.

## Run locally

1. Install Node.js 20 or newer.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
npm run dev
```

Vite will give you a local URL such as `http://localhost:5173`.

## Publish to GitHub Pages

1. Create a **public** GitHub repository named exactly:

   `iva-dashboard`

2. Upload/push all files in this project to the repository.

3. In GitHub open:

   **Settings → Pages → Build and deployment → Source → GitHub Actions**

4. Go to the **Actions** tab and wait for the deployment workflow to finish.

5. Your site should be available at:

   `https://YOUR-GITHUB-USERNAME.github.io/iva-dashboard/`

## Important

The repository name currently must be `iva-dashboard` because `vite.config.ts` contains:

```ts
base: '/iva-dashboard/'
```

If you use another repository name, change that value to match it.

## Trial data

The first version contains February 2026 figures from the VBoS International Visitor Arrivals infographic.

Future steps:
- Add January, March, April, etc.
- Move data into CSV/JSON files.
- Make the Year and Month filters interactive.
- Add monthly trend charts.
- Add VBoS logo and official branding.
- Add download/data table section.
