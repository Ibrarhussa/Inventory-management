# Product Management System

This repository is now fully split into two independent apps:

- `frontend` in the project root (`src/`, Vite + React)
- `backend` in `server/` (Express + MongoDB + TypeScript)

## Architecture

- Frontend only calls backend via HTTP (`VITE_API_URL`).
- Backend owns database, business logic, and file uploads.
- Frontend and backend can run/build/deploy separately.

## Folder Layout

```text
.
|-- src/                 # Frontend source code
|-- public/              # Frontend static files
|-- package.json         # Frontend package
|-- .env                 # Frontend env (VITE_API_URL)
|-- server/              # Backend app
|   |-- src/
|   |-- package.json
|   |-- .env
|   `-- uploads/
`-- README.md
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB running locally or remotely

## Environment Variables

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/product-management
JWT_SECRET=change_this_secret
NODE_ENV=development
```

## Install

Frontend dependencies:

```bash
npm install
```

Backend dependencies:

```bash
npm --prefix server install
```

## Run in Development

Terminal 1 (backend):

```bash
npm --prefix server run dev
```

Terminal 2 (frontend):

```bash
npm run dev
```

## Build

Frontend build:

```bash
npm run build
```

Backend build:

```bash
npm --prefix server run build
```

## Root Scripts

Frontend:

- `npm run dev`
- `npm run build`
- `npm run preview`

Backend helper scripts from root:

- `npm run backend:dev`
- `npm run backend:build`
- `npm run backend:start`
- `npm run backend:seed`

