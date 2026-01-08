# Music Caching Project

This project is an exploration of different caching algorithms. It includes implementations of FIFO, LFU, and LRU caching strategies.

The project is divided into two main parts:
- A `backend` server that serves music data and uses different caching algorithms.
- A `frontend` application that displays the music data.

## Backend

The backend is a Node.js application that uses Express. It has a simple JSON database and different caching implementations.

## Frontend

The frontend is a React application built with Vite. It fetches music data from the backend and displays it.

## Running the project

1.  Install dependencies for both the `backend` and `frontend`:
    ```bash
    npm install
    cd backend
    npm install
    cd ../frontend
    npm install
    ```
2.  Start Redis with Docker (recommended):
    - Ensure Docker Desktop is running on Windows.
    - From the project root, bring up Redis:
    ```powershell
    docker compose up -d redis
    ```
    Redis will be available on `localhost:6379`.

3.  (Optional) Configure a custom Redis URL:
    - The backend reads `REDIS_URL` if set; defaults to `redis://127.0.0.1:6379`.
    - Example for PowerShell:
    ```powershell
    $env:REDIS_URL = "redis://127.0.0.1:6379"
    ```

4.  Run the backend server:
    ```bash
    cd backend
    npm start
    ```
5.  Run the frontend application:
    ```bash
    cd frontend
    npm run dev
    ```

## Troubleshooting (Windows)

- Docker engine not running:
    - Launch Docker Desktop and wait for "Engine running".
    - Run an elevated PowerShell (Run as Administrator) and start the service:
        ```powershell
        Start-Service com.docker.service
        ```
    - Verify:
        ```powershell
        docker version
        docker info
        ```

- WSL 2 not set up (required for Linux containers):
    - Enable features and install WSL:
        ```powershell
        dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
        dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
        wsl --install
        wsl --set-default-version 2
        wsl --update
        ```
    - Reboot Windows after enabling features.

- After Docker is running, start Redis:
    ```powershell
    cd D:\Icog_Lab_internship\Training\Music
    docker compose up -d redis
    docker compose ps
    docker exec -it music-redis redis-cli ping
    ```
