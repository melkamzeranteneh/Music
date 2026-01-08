# Music Caching Project

A small full-stack demo that compares FIFO, LFU, and LRU caching for serving a music library. The stack is:
- Backend: Node.js + Express + Redis cache + JSON file DB
- Frontend: React (Vite) + Tailwind

## Quick start (Windows-friendly)

1) Install dependencies
```powershell
# from project root
npm install
cd backend; npm install; cd ..
cd frontend; npm install; cd ..
```

2) Start Redis with Docker (recommended)
```powershell
docker compose up -d redis
```
Redis listens on localhost:6379. Ensure Docker Desktop is running.

3) Run the backend (port 3000)
```powershell
cd backend
npm start
```

4) Run the frontend (port 5173)
```powershell
cd frontend
npm run dev
```

## How it works
- Cache strategies live in [backend/src/cache](backend/src/cache) (`FifoCache.js`, `LfuCache.js`, `LruCache.js`).
- Music data comes from a lightweight JSON store in [backend/src/db/music_db.json](backend/src/db/music_db.json).
- The frontend queries the backend API and shows the current cache state so you can see hits/misses per algorithm.

## Configuration
- `REDIS_URL` (optional): defaults to `redis://127.0.0.1:6379`.
- To set in PowerShell for one session:
```powershell
$env:REDIS_URL = "redis://127.0.0.1:6379"
```

## Useful scripts
- Backend: `npm start` (dev server)
- Frontend: `npm run dev` (Vite dev server)
- Docker: `docker compose up -d redis` / `docker compose down`

## Troubleshooting (Windows)
- Docker not running: start Docker Desktop; if needed run elevated PowerShell `Start-Service com.docker.service`, then `docker version`.
- WSL 2 missing (for Linux containers):
```powershell
dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
wsl --install
wsl --set-default-version 2
wsl --update
```
Reboot after enabling features.

- Redis health check:
```powershell
docker compose ps
docker exec -it music-redis redis-cli ping
```
