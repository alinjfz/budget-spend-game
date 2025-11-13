# Deployment Guide

## Deployment Options

### Option 1: Local Development

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

### Option 2: Production with Docker

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY .env .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Deployment

#### Backend on Railway/Heroku

1. Create `Procfile`:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Create `runtime.txt`:

```
python-3.11.6
```

3. Deploy:

```bash
git push heroku main
```

#### Frontend on Vercel/Netlify

```bash
cd frontend
npm run build
# Deploy dist folder
```

### Option 4: Docker Compose (Recommended for Testing)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your-secret-key
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  db:
```

Run:

```bash
docker-compose up
```

## Environment Variables

### Backend (.env)

```
SECRET_KEY=your-production-secret-key
ENVIRONMENT=production
```

### Frontend (.env.local)

```
VITE_API_URL=https://api.yourdomain.com
```

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Use HTTPS/SSL certificates
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Use strong passwords for demo users
- [ ] Implement database with proper authentication
- [ ] Add input validation and sanitization
- [ ] Enable CSRF protection
- [ ] Use security headers
- [ ] Set up monitoring and logging

## Performance Optimization

### Frontend

- Minify and bundle with Vite
- Use code splitting
- Lazy load components
- Enable gzip compression
- Cache static assets

### Backend

- Use connection pooling
- Cache frequently accessed data
- Implement pagination
- Use async operations
- Monitor API response times

## Scaling Considerations

- Use WebSockets for real-time updates
- Implement Redis for state management
- Database for persistent storage
- Load balancing with multiple instances
- CDN for static assets
- Message queue for notifications

## Monitoring

### Backend Monitoring

- Log aggregation (ELK, Datadog)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring

### Frontend Monitoring

- Error tracking
- Performance metrics
- User analytics
- Real User Monitoring (RUM)

## Backup & Disaster Recovery

- Regular database backups
- Environment-specific configurations
- Version control for all code
- Document recovery procedures
- Test backup restoration
