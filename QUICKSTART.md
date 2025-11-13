# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

## Installation & Running

### Option 1: Run Both Frontend and Backend (Recommended)

1. **Clone or navigate to the project**

```bash
cd /Users/ali/Desktop/Codes/ghahrApp
```

2. **Install all dependencies**

```bash
npm run install:all
```

3. **Start both servers** (in separate terminals or use the combined command)

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. **Access the application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Backend Only (API Development)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Frontend Only (UI Development)

```bash
cd frontend
npm install
npm run dev
```

## Test Credentials

| Role   | Username | Password |
| ------ | -------- | -------- |
| User A | A        | password |
| User Z | Z        | password |
| Admin  | admin    | password |

## Features

✅ **Login Page**

- Username/Password authentication
- Remember me checkbox
- Demo credentials display

✅ **Main Game Page**

- Split screen showing Counter A (left) and Counter Z (right)
- Real-time percentage display
- User-specific permissions
- Game over detection

✅ **User Permissions**

- User A: Can only modify left counter
- User Z: Can only modify right counter
- Admin: Can modify both and reset game

✅ **Mobile Responsive**

- Optimized for iOS Safari
- Touch-friendly buttons
- Responsive layout for all screen sizes
- Service Worker for offline support

✅ **Notifications**

- Real-time counter update notifications
- Game over notifications
- Background notification support via Service Worker

## Project Structure

```
ghahrApp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Counter.tsx      # Counter display component
│   │   ├── pages/
│   │   │   ├── Login.tsx        # Login page
│   │   │   └── Main.tsx         # Main game page
│   │   ├── services/            # API services
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── public/
│   │   └── sw.js                # Service Worker
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt
│   └── .env
├── README.md
├── package.json
└── QUICKSTART.md
```

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Game

- `GET /game/state` - Get current game state
- `POST /game/update` - Update counter
- `POST /game/reset` - Reset game (admin only)

## Theme Colors

- **Primary Blue**: #2293bf
- **Gradient**: radial-gradient(circle, rgba(34, 147, 191, 1) 0%, rgba(134, 178, 178, 1) 100%)
- **Success Green**: #4caf50
- **Danger Red**: #ff4444

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000 (backend)
lsof -i :8000
# Find process using port 5173 (frontend)
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

### CORS Issues

- Make sure backend is running on http://localhost:8000
- Frontend proxy is configured in vite.config.ts

## Deployment

### Frontend (Static Build)

```bash
cd frontend
npm run build
# Output in frontend/dist
```

### Backend (Heroku, Railway, or any Python host)

```bash
cd backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Support

For issues or questions, check:

1. Backend logs: `uvicorn main:app --reload`
2. Frontend console: F12 in browser
3. Network tab in browser DevTools for API calls
4. API documentation: http://localhost:8000/docs
