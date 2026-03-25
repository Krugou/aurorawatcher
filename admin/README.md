# AuroraWatcher Admin

Standalone admin application for managing images in the AuroraWatcher repository.

## Features

- View all history entries (images).
- Filter images by Camera ID.
- Delete images from the filesystem and update `history_index.json`.
- Full translation support (English & Finnish).
- Local only tool.

## Prerequisites

- Node.js (Latest LTS recommended)
- npm

## Setup & Running

1.  Install dependencies from the root:
    ```bash
    npm install
    ```

2.  Run the admin tool in development mode:
    ```bash
    npm run dev -w admin
    ```

    This will start:
    - Admin Backend: `http://localhost:3001`
    - Admin Frontend: `http://localhost:3000`

3.  Access the admin UI at `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts both backend and frontend for development.
- `npm run build`: Builds the project for production.
- `npm start`: Runs the production build.
- `npm test`: Runs the tests.

## Security Note

This tool is intended for **local use only**. It does not include authentication. Ensure it is not exposed to the public internet.
