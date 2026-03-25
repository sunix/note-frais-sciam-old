# Note de Frais

Web application for managing expense reports, designed for SCIAM consultants.

🚀 **[Open the deployed application](https://sunix.github.io/note-frais-sciam-old/)**

## Features

- Create and manage expense reports per employee and per month
- Add expenses (lunch, breakfast, dinner, snack, other) with receipts
- Generate a PDF of the expense report
- Export / import data as JSON
- Installable PWA, works offline
- All data is stored locally in the browser (IndexedDB)

## Screenshots

### Home — expense report list

![Home page with an expense report](https://github.com/user-attachments/assets/7e54c2db-7fe9-4e72-94f3-6e4fa1879d42)

### Create a new expense report

![New expense report form](https://github.com/user-attachments/assets/1b903b7d-232b-4c1d-85ce-d66ec5766ced)

### Expense list

![Expense list for a report](https://github.com/user-attachments/assets/18eac982-f6ec-48fd-b818-fe193eb6fbe1)

### Add an expense

![Add expense form](https://github.com/user-attachments/assets/959e8fc3-892a-47b1-8c4a-20e4b23b36d2)

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Dexie](https://dexie.org/) (IndexedDB)
- [pdf-lib](https://pdf-lib.js.org/) for PDF generation
- Deployed on [GitHub Pages](https://pages.github.com/)

## Local development

```bash
npm install
npm run dev
```

## Build & deployment

```bash
npm run build
```

Deployment to GitHub Pages is automated on every push to `main` via GitHub Actions.
