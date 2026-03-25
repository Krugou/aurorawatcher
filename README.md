# Aurora Watcher

Real-time aurora borealis monitoring application for Finland, collecting data from various observatories (FMI, Hankasalmi, etc.).
Consists of a **Web Application** for visualization and a **Discord Bot** for notifications.

## 📂 Project Structure

- `web/`: React + Vite web application.
- `bot/`: Discord bot (Node.js + TypeScript).
- `admin/`: Standalone admin tool for managing images.
- `.github/workflows/`: CI/CD pipelines.

## 🌐 Web Application

### Prerequisites
- Node.js (v18+)
- npm

### Setup
```bash
cd web
npm install
```

### Development
```bash
npm run dev
```
Runs the app at `http://localhost:5173`.

### Testing
- **Unit Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npm run test:e2e` (Cypress)

### Features
- **Real-time Map**: Magnetic disturbance visualization.
- **Observatory Cams**: Live feeds from Muonio, Nyrölä, etc.
- **Dark Mode**: Toggle via top-right icon.
- **Localization**: English (EN) and Finnish (FI).

## 🤖 Discord Bot

### Prerequisites
- Node.js (v18+)
- Discord Bot Token
- `.env` file in `bot/`

### Setup
1. Create `.env` in `bot/`:
   ```env
   DISCORD_TOKEN=your_token_here
   CLIENT_ID=your_client_id
   # Channels to post updates to
   AURORA_CHANNEL_ID=...
   START_MESSAGE_CHANNEL_ID=...
   ```
2. Install dependencies:
   ```bash
   cd bot
   npm install
   ```

### Running
- **Development**: `npm run dev` (Watch mode)
- **Production**: `npm run build && npm start`

### Commands
- `/ping`: Check bot latency.
- `/status`: View current monitoring status.
- `/force`: Force an immediate aurora check.

### Deployment
To register slash commands:
```bash
npm run deploy
```

## 🛠️ Admin Tool (Local)

Standalone tool for repository image management.

### Prerequisites
- Node.js (v18+)

### Setup
```bash
npm install
```

### Running
```bash
npm run dev -w admin
```
Starts backend on `3001` and frontend on `3000`.

### Features
- Image preview & deletion.
- Auto-updates `history_index.json`.
- Multi-language (EN/FI).

## 🚀 CI/CD

GitHub Actions are configured to:
- Lint and Test the Web App.
- Build the Bot to ensure type safety.
