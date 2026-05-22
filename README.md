# Godtime Benson - Minimalist Developer Portfolio

A responsive, and high-performance developer portfolio featuring dual-theme layouts, micro-interactions, responsive sidebars, customized visualizer cards, and streamlined contact request forms.

## ✨ Highlights & Features

- **Dual Canvas Presentation**: Seamless conversion between deep obsidian-dark and high-contrast light modes.
- **Fluid Layout**: Adapts automatically between wide monitors, laptops, tablets, and smartphones.
- **Micro-Animations**: Handcrafted entering micro-motion, section scrolling transitions, and active nav underlines.
- **Skills Directory**: Filterable skill categorization representing Frontend, Backend, and Tooling masteries.
- **Contact Request Handler**: Direct mail drafts ready to submit directly to your mailbox (`godtimebenson09@gmail.com`).

## 🛠️ Built With

- **React** with **TypeScript** for absolute type-safety.
- **Tailwind CSS (v4)** for modern CSS styling.
- **Motion** (`motion/react`) for smooth spring animations.
- **Lucide Icons** for vector interface indicators.

## 🚀 Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or download this project
2. Install the package dependencies:
   ```bash
   npm install
   ```

### Running Locally

To launch the development server and edit the project in real-time:
```bash
npm run dev
```

The application will run and be accessible in your browser at `http://localhost:3000`.

### Production Build

To compile a highly optimized production bundler build:
```bash
npm run build
```

This places highly compressed, minified assets into the local `dist/` directory, ready to be hosted on Netlify, Vercel, Cloud Run, or custom servers.

## 🎨 Personalization Guide

All personal descriptors, projects, experience items, and categories are defined centrally inside `/src/data.ts` and `/src/App.tsx`. Simply update those files to reflect your personal profile, credentials, and works!
