# Note de Frais

Application web de gestion des notes de frais, conçue pour les consultants SCIAM.

🚀 **[Accéder à l'application déployée](https://sunix.github.io/note-frais-sciam-old/)**

## Fonctionnalités

- Créer et gérer des notes de frais par collaborateur et par mois
- Ajouter des dépenses (déjeuner, petit déjeuner, dîner, collation, autres) avec justificatifs
- Générer un PDF de la note de frais
- Exporter / importer les données au format JSON
- Application PWA installable, fonctionne hors ligne
- Toutes les données sont stockées localement dans le navigateur (IndexedDB)

## Captures d'écran

### Accueil — liste des notes de frais

![Accueil avec une note de frais](https://github.com/user-attachments/assets/7e54c2db-7fe9-4e72-94f3-6e4fa1879d42)

### Créer une nouvelle note de frais

![Formulaire de création d'une note de frais](https://github.com/user-attachments/assets/1b903b7d-232b-4c1d-85ce-d66ec5766ced)

### Liste des dépenses

![Liste des dépenses d'une note](https://github.com/user-attachments/assets/18eac982-f6ec-48fd-b818-fe193eb6fbe1)

### Ajouter une dépense

![Formulaire d'ajout d'une dépense](https://github.com/user-attachments/assets/959e8fc3-892a-47b1-8c4a-20e4b23b36d2)

## Stack technique

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [Dexie](https://dexie.org/) (IndexedDB)
- [pdf-lib](https://pdf-lib.js.org/) pour la génération PDF
- Déployé sur [GitHub Pages](https://pages.github.com/)

## Développement local

```bash
npm install
npm run dev
```

## Build & déploiement

```bash
npm run build
```

Le déploiement sur GitHub Pages est automatique à chaque push sur `main` via GitHub Actions.
