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
2.  Run the backend server:
    ```bash
    cd backend
    npm start
    ```
3.  Run the frontend application:
    ```bash
    cd frontend
    npm run dev
    ```
