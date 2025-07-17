# Moodio

A music companion app that helps you log your mood, discover music, and visualize your emotional journey. Built with the PERN stack, Spotify OAuth, OpenAI, and more.

## Features
- Spotify OAuth authentication
- Mood logging (manual + AI-assisted via OpenAI)
- Dashboard visualizations (Chart.js)
- Song & artist data from Spotify & Genius
- Search & filter by mood, artist, genre

## Tech Stack
**Frontend:** React, TypeScript, Tailwind CSS, Chart.js, React Router DOM, Axios
**Backend:** Express, TypeScript, Knex.js, PostgreSQL, OpenAI API, Spotify Web API, Genius API, cookie-session, dotenv

## Folder Structure
```
Moodio/
├── .env.example
├── package.json
├── README.md
├── backend/
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── server.ts
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── db/
│       ├── utils/
│       ├── types/
│       └── config/
├── frontend/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       └── components/
```

## Setup
1. Copy `.env.example` to `.env` and fill in your secrets.
2. Install dependencies in root, backend, and frontend.
3. Run DB migrations and seeds.
4. Start backend and frontend (see scripts in each package.json).

---
MIT License