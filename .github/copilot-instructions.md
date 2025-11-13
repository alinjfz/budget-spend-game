## Counter Tracker Web App

A mobile-first counter tracking application with React frontend and FastAPI backend.

### Project Structure

- **Frontend**: React + TypeScript + Vite with Tailwind CSS
- **Backend**: Python FastAPI with JWT authentication
- **Features**: Real-time counter updates, user roles, push notifications, offline support

### Key Components

- Frontend: `/frontend` - React app with mobile-first design
- Backend: `/backend` - FastAPI server with authentication
- Service Worker: Offline support and notifications

### Running the Project

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Demo Credentials

- User A: `A` / `password`
- User Z: `Z` / `password`
- Admin: `admin` / `password`

### Theme

- Primary: `#2293bf`
- Gradient: `radial-gradient(circle, rgba(34, 147, 191, 1) 0%, rgba(134, 178, 178, 1) 100%)`
