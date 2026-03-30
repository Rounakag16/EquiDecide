# EquiDecide Frontend

React + Vite + Tailwind CSS SPA for the EquiDecide platform.

See the [project README](../README.md) for full documentation, setup instructions, and architecture details.

## Quick Start

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. Requires the Flask backend running on port 5000.

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero, problem statement, solution overview |
| `/form` | Static Eval | Traditional intake form → side-by-side comparison |
| `/dynamic` | Dynamic Eval | 3-step chat form with streaming explanations |
| `/demo` | Demo Mode | Pre-loaded scenarios for judging demonstrations |

## Tech Stack

- **React 19** with TypeScript
- **Vite 8** for dev/build
- **Tailwind CSS 4** for styling
- **Chart.js** for equity gauge
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Router DOM** for client routing
