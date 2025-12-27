# 🚀 Dokploy Deployment Guide - Hotelier Hub

## 📋 Prerequisites

1. **Dokploy Installed** on your server
2. **Docker** running on your server
3. **Domain** (optional but recommended)
4. **Git Repository** (GitHub/GitLab/Bitbucket)

---

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push code to Git**:
```bash
cd d:\gadget4mein\hotelier-hub
git init
git add .
git commit -m "Initial commit - Ready for Dokploy deployment"
git remote add origin <your-git-repo-url>
git push -u origin main
```

2. **Create `.env` file** (don't commit this!):
```bash
cp .env.example .env
```

3. **Generate secrets**:
```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate POSTGRES_PASSWORD
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

4. **Update `.env`** with generated values

---

### Step 2: Create Project in Dokploy

1. **Login to Dokploy Dashboard**
   - Open your Dokploy URL (e.g., `https://dokploy.your-server.com`)
   - Login with credentials

2. **Create New Project**
   - Click "New Project"
   - Name: `hotelier-hub`
   - Description: "Hotel Management System"

---

### Step 3: Deploy Database (PostgreSQL)

1. **Add Database Service**
   - Click "Add Service" → "Database"
   - Type: PostgreSQL
   - Name: `hotelier-db`
   - Version: `15-alpine`

2. **Configure Database**:
   ```
   Database Name: hotelier_hub
   Username: hotelier
   Password: <use-strong-password>
   Port: 5432
   ```

3. **Deploy Database**
   - Click "Deploy"
   - Wait for database to be healthy

4. **Note Database Connection**:
   ```
   Internal URL: postgresql://hotelier:<password>@hotelier-db:5432/hotelier_hub
   ```

---

### Step 4: Deploy Backend API

1. **Add Backend Service**
   - Click "Add Service" → "Application"
   - Type: Docker Compose or Dockerfile
   - Name: `hotelier-backend`

2. **Configure Git Repository**:
   ```
   Repository: <your-git-repo-url>
   Branch: main
   Build Path: /backend
   Dockerfile: backend/Dockerfile
   ```

3. **Set Environment Variables**:
   ```env
   DATABASE_URL=postgresql+asyncpg://hotelier:<password>@hotelier-db:5432/hotelier_hub
   SECRET_KEY=<your-generated-secret>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   DEBUG=false
   CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
   APP_NAME=Hotelier Hub API
   APP_VERSION=1.0.0
   ```

4. **Configure Port**:
   ```
   Container Port: 8003
   Public Port: 8003 (or use reverse proxy)
   ```

5. **Deploy Backend**
   - Click "Deploy"
   - Wait for build to complete
   - Check logs for any errors

6. **Verify Backend**:
   - Open `http://your-server:8003/docs`
   - Should see Swagger UI

---

### Step 5: Deploy Frontend

1. **Add Frontend Service**
   - Click "Add Service" → "Application"
   - Type: Dockerfile
   - Name: `hotelier-frontend`

2. **Configure Git Repository**:
   ```
   Repository: <your-git-repo-url>
   Branch: main
   Build Path: /
   Dockerfile: Dockerfile
   ```

3. **Set Build Arguments** (if needed):
   ```
   VITE_API_URL=https://api.your-domain.com/api/v1
   ```

4. **Configure Port**:
   ```
   Container Port: 80
   Public Port: 80 (or 443 for HTTPS)
   ```

5. **Deploy Frontend**
   - Click "Deploy"
   - Wait for build to complete

6. **Verify Frontend**:
   - Open `http://your-server`
   - Should see login page

---

### Step 6: Configure Domains (Optional but Recommended)

1. **Add Domain for Backend**:
   - In Dokploy, go to Backend service
   - Add domain: `api.your-domain.com`
   - Enable SSL (Let's Encrypt)

2. **Add Domain for Frontend**:
   - In Dokploy, go to Frontend service
   - Add domain: `your-domain.com`
   - Enable SSL (Let's Encrypt)

3. **Update Environment Variables**:
   - Update `CORS_ORIGINS` in backend
   - Update `VITE_API_URL` in frontend
   - Redeploy both services

---

### Step 7: Setup Reverse Proxy (if using Dokploy's Traefik)

Dokploy usually handles this automatically, but verify:

1. **Backend Labels**:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.backend.rule=Host(`api.your-domain.com`)"
  - "traefik.http.services.backend.loadbalancer.server.port=8003"
```

2. **Frontend Labels**:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
  - "traefik.http.services.frontend.loadbalancer.server.port=80"
```

---

## 🔧 Alternative: Using Docker Compose Directly

If Dokploy supports docker-compose.yml:

1. **Upload docker-compose.yml** to Dokploy
2. **Set environment variables** in Dokploy UI
3. **Deploy stack**

---

## ✅ Post-Deployment Checklist

### 1. **Test Backend API**
```bash
curl https://api.your-domain.com/health
# Should return: {"status":"healthy","version":"1.0.0"}
```

### 2. **Test Frontend**
- Open `https://your-domain.com`
- Try to login
- Check browser console for errors

### 3. **Test Database Connection**
```bash
# SSH into backend container
docker exec -it hotelier-backend bash

# Test database
python -c "from app.core.database import engine; print('DB Connected!')"
```

### 4. **Create First User**
- Go to `/signup`
- Create account
- Verify login works

### 5. **Test Integration System**
- Login to dashboard
- Go to Integration page
- Generate API key
- Copy widget code
- Test on external site

---

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check logs
docker logs hotelier-backend

# Common issues:
# 1. Database not ready - wait 30s and retry
# 2. Wrong DATABASE_URL - check connection string
# 3. Missing SECRET_KEY - add to env vars
```

### Frontend not loading?
```bash
# Check logs
docker logs hotelier-frontend

# Common issues:
# 1. Wrong VITE_API_URL - update and rebuild
# 2. CORS error - add domain to CORS_ORIGINS
# 3. Build failed - check Node version (need 18+)
```

### Database connection failed?
```bash
# Check database is running
docker ps | grep postgres

# Test connection
docker exec -it hotelier-db psql -U hotelier -d hotelier_hub

# If fails, check:
# 1. Database service is healthy
# 2. Correct credentials in DATABASE_URL
# 3. Network connectivity between containers
```

### CORS errors?
```bash
# Update backend CORS_ORIGINS
# Add your frontend domain
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Redeploy backend
```

---

## 🔐 Security Checklist

- [ ] Changed default SECRET_KEY
- [ ] Changed default POSTGRES_PASSWORD
- [ ] Set DEBUG=false
- [ ] Configured CORS_ORIGINS properly
- [ ] Enabled HTTPS (SSL certificates)
- [ ] Firewall configured (only 80, 443 open)
- [ ] Database not publicly accessible
- [ ] Regular backups configured
- [ ] Monitoring setup

---

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl https://api.your-domain.com/health

# Frontend health
curl https://your-domain.com/health

# Database health
docker exec hotelier-db pg_isready -U hotelier
```

### Logs
```bash
# View backend logs
docker logs -f hotelier-backend

# View frontend logs
docker logs -f hotelier-frontend

# View database logs
docker logs -f hotelier-db
```

---

## 🔄 Updates & Redeployment

### Update Code
```bash
# Push to Git
git add .
git commit -m "Update: <description>"
git push

# In Dokploy:
# 1. Go to service
# 2. Click "Redeploy"
# 3. Wait for build
```

### Database Migrations
```bash
# SSH into backend container
docker exec -it hotelier-backend bash

# Run migrations (if using Alembic)
alembic upgrade head
```

---

## 💾 Backup & Restore

### Backup Database
```bash
# Create backup
docker exec hotelier-db pg_dump -U hotelier hotelier_hub > backup.sql

# Or use Dokploy's backup feature
```

### Restore Database
```bash
# Restore from backup
docker exec -i hotelier-db psql -U hotelier hotelier_hub < backup.sql
```

---

## 🎉 You're Done!

Your Hotelier Hub is now deployed on Dokploy! 🚀

**Access your app**:
- Frontend: https://your-domain.com
- Backend API: https://api.your-domain.com
- API Docs: https://api.your-domain.com/docs

**Default credentials** (if you created them):
- Email: owner@myhotel.com
- Password: Owner@123

---

## 📞 Need Help?

1. Check Dokploy logs
2. Check container logs
3. Verify environment variables
4. Test database connection
5. Check CORS settings

**Common Dokploy Resources**:
- Docs: https://docs.dokploy.com
- GitHub: https://github.com/Dokploy/dokploy
- Discord: Dokploy Community

---

**Happy Deploying! 🎊**
