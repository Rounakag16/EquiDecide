# EquiDecide - Women Techies Hackathon 2026

EquiDecide is a context-aware applicant evaluation platform built for the Women Techies Hackathon 2026. This repository contains the frontend single-page application (SPA).

## 🚀 How to Download and Run locally on your PC

Follow these steps to get the project up and running on your local machine:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (which includes `npm`) installed on your computer.

### Step 1: Download or Clone the Repository
You can clone the project using Git from your terminal:
```bash
git clone <your-repository-url>
cd EquiDecide
```
*(Alternatively, you can download the project as a ZIP file from the repository, extract it, and open the extracted folder in your terminal).*

### Step 2: Install Dependencies
Inside the project directory, run the following command to install all the required packages:
```bash
npm install
```

### Step 3: Run the Development Server
Start the local development server by running:
```bash
npm run dev
```

### Step 4: Open in Browser
Open your browser and navigate to the local URL provided in your terminal (usually `http://localhost:5173/` or something similar).

---

*(Below is the default Vite + React + TypeScript documentation)*

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
