# Brewery Search BFF Demo

This project demonstrates a Python Django backend and a Next.js frontend connected through the Backend-for-Frontend (BFF) pattern.

## Architecture

- Frontend UI runs in Next.js and exposes a BFF API route at `/api/breweries`
- The Next.js route proxies requests to the Django backend
- Django calls the Open Brewery DB API, caches the response locally, and returns JSON to the frontend

## Run locally

## Run with Podman

If you are using Podman instead of Docker, run the stack with:

```bash
podman machine init --cpus 4 --memory 4096
podman machine start
podman compose up --build
```

Then open http://localhost:3000 and search for breweries.

To stop the stack:

```bash
podman compose down
```

If you prefer the legacy Compose plugin name, the equivalent command is:

```bash
podman-compose up --build
```

## Run locally without containers

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 and search for breweries.

## Notes

- The Django backend caches brewery search results for 5 minutes in memory.
- The Next.js BFF route also caches response payloads for the same window to reduce duplicate traffic.
- Search requests are routed through the BFF instead of calling the public API from the browser.
