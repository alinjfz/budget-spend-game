# Counter Tracker Web App

A mobile-first web application for tracking two counters with real-time notifications. Built with React + TypeScript frontend and Python FastAPI backend.

## Features

- **Mobile-First Design**: Fully responsive UI optimized for iOS and mobile devices
- **User Roles**: Support for User A, User Z, and Admin with different permissions
- **Real-time Counters**: Live counter tracking with percentage display
- **Notifications**: Push notifications when counters are updated
- **Service Worker**: Offline support and background notifications
- **Authentication**: JWT-based user authentication with "Remember Me" option
- **Custom Theme**: Professional blue gradient theme (#2293bf)

## Project Structure

```
ghahrApp/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Login and Main pages
│   │   ├── services/      # API services
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── sw.js          # Service Worker
│   ├── package.json
│   └── index.html
└── backend/           # Python FastAPI
    ├── main.py
    ├── requirements.txt
    └── .env
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Demo Credentials

- **User A**: username: `A`, password: `password`
- **User Z**: username: `Z`, password: `password`
- **Admin**: username: `admin`, password: `password`

## User Permissions

- **User A**: Can only modify left counter (A)
- **User Z**: Can only modify right counter (Z)
- **Admin**: Can modify both counters and reset the game

## How to Use

1. Open the app in a web browser
2. Login with one of the demo credentials
3. Each user can increase (+) or decrease (−) their respective counter
4. When a counter reaches 0, the game is over
5. Other users receive notifications of counter changes
6. Admin can reset the game to start fresh

## iOS PWA Installation

1. Open the app in Safari on iOS
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will work offline with service worker caching

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Game

- `GET /game/state` - Get current game state
- `POST /game/update` - Update counter (delta parameter)
- `POST /game/reset` - Reset game (admin only)

## Theme Colors

- Primary Color: `#2293bf`
- Gradient: `radial-gradient(circle, rgba(34, 147, 191, 1) 0%, rgba(134, 178, 178, 1) 100%)`
- Danger Red: `#ff4444`
- Success Green: `#4caf50`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+ (including iOS Safari)

## Future Enhancements

- WebSocket support for real-time updates
- Push notification integration
- Persistent storage for game state
- Leaderboard and statistics
- Sound effects and animations
- Dark mode
