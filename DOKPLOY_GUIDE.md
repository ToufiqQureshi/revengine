# 🚀 Dokploy Deployment Guide - Hotelier Hub
## Based on Official Dokploy Documentation

---

## ✅ **Pre-Deployment Checklist**

### 1. **Files Ready** ✅
- [x] `docker-compose.yml` (Dokploy-compatible)
- [x] `backend/Dockerfile`
- [x] `Dockerfile` (frontend)
- [x] `nginx.conf`
- [x] `.env.example`

### 2. **Generate Secrets**
```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate POSTGRES_PASSWORD
python -c "import secrets; print(secrets.token_urlsafe(24))"
```

### 3. **Push to Git**
```bash
git init
git add .
git commit -m "Ready for Dokploy"
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 📋 **Dokploy Deployment Steps**

### **Step 1: Create Project in Dokploy**

1. Login to Dokploy dashboard
2. Click **"New Project"**
3. Name: `hotelier-hub`
4. Click **"Create"**

---

### **Step 2: Deploy Using Docker Compose**

#### **Option A: Using Git Repository (Recommended)**

1. **Create Docker Compose Service**:
   - Click **"Add Service"** → **"Docker Compose"**
   - Name: `hotelier-stack`

2. **Connect Git Repository**:
   - Repository URL: `<your-git-repo-url>`
   - Branch: `main`
   - Docker Compose Path: `/` (root)

3. **Set Environment Variables**:
   Click **"Environment"** tab and add:
   ```env
   # Database
   POSTGRES_DB=hotelier_hub
   POSTGRES_USER=hotelier
   POSTGRES_PASSWORD=<your-generated-password>
   
   # Backend
   SECRET_KEY=<your-generated-secret>
   DEBUG=false
   CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
   
   # Frontend
   VITE_API_URL=https://api.your-domain.com/api/v1
   
   # Domains (for Traefik labels)
   BACKEND_DOMAIN=api.your-domain.com
   FRONTEND_DOMAIN=your-domain.com
   ```

4. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete
   - Check logs for any errors

#### **Option B: Using Raw Docker Compose**

1. **Create Docker Compose Service**:
   - Click **"Add Service"** → **"Docker Compose"**
   - Name: `hotelier-stack`

2. **Paste Docker Compose**:
   - Go to **"General"** → **"Raw"** tab
   - Paste your `docker-compose.yml` content
   - Update environment variables inline

3. **Deploy**:
   - Click **"Deploy"**

---

### **Step 3: Configure Domains (Automatic SSL)**

Dokploy automatically handles SSL with Let's Encrypt!

#### **Method 1: Using Dokploy UI (Easiest)**

1. **For Backend**:
   - Go to your Docker Compose service
   - Click **"Domains"** tab
   - Click **"Add Domain"**
   - Domain: `api.your-domain.com`
   - Container: Select `backend`
   - Port: `8003`
   - Enable **"HTTPS"** (automatic SSL)
   - Click **"Add"**

2. **For Frontend**:
   - Click **"Add Domain"** again
   - Domain: `your-domain.com`
   - Container: Select `frontend`
   - Port: `80`
   - Enable **"HTTPS"**
   - Click **"Add"**

#### **Method 2: Using Traefik Labels (Already in docker-compose.yml)**

Labels are already configured! Just set environment variables:
```env
BACKEND_DOMAIN=api.your-domain.com
FRONTEND_DOMAIN=your-domain.com
```

---

### **Step 4: Verify Deployment**

1. **Check Service Status**:
   - All containers should show **"Running"** (green)
   - Database should be **"Healthy"**

2. **Test Backend**:
   ```bash
   curl https://api.your-domain.com/health
   # Expected: {"status":"healthy","version":"1.0.0"}
   ```

3. **Test Frontend**:
   - Open: `https://your-domain.com`
   - Should see login page
   - No console errors

4. **Test API Docs**:
   - Open: `https://api.your-domain.com/docs`
   - Should see Swagger UI

---

## 🔧 **Important Dokploy-Specific Notes**

### **1. Network Configuration**
- ✅ Using `dokploy-network` (external network)
- ✅ Traefik automatically connects to this network
- ✅ All services communicate internally

### **2. Volume Persistence**
- ✅ Database data: `../files/postgres_data`
- ✅ Dokploy manages this directory
- ✅ Data persists across deployments

### **3. Container Names**
- ✅ Removed `container_name` (Dokploy best practice)
- ✅ Dokploy auto-generates unique names
- ✅ Prevents logging conflicts

### **4. SSL Certificates**
- ✅ Automatic Let's Encrypt
- ✅ Auto-renewal
- ✅ HTTPS enforced via Traefik

---

## 📊 **Monitoring in Dokploy**

### **View Logs**:
1. Go to your service
2. Click **"Logs"** tab
3. Select container (db, backend, frontend)
4. Real-time logs appear

### **Monitor Resources**:
1. Click **"Monitoring"** tab
2. See CPU, Memory, Network usage
3. Per-container metrics

### **Check Health**:
1. Service overview shows health status
2. Green = Healthy
3. Red = Unhealthy (check logs)

---

## 🔄 **Updating Your Application**

### **Code Updates**:
```bash
# Make changes locally
git add .
git commit -m "Update: description"
git push

# In Dokploy:
# 1. Go to service
# 2. Click "Redeploy"
# 3. Wait for build
```

### **Environment Variable Updates**:
1. Go to **"Environment"** tab
2. Update variables
3. Click **"Save"**
4. Click **"Redeploy"**

### **Database Migrations**:
```bash
# Access backend container
# In Dokploy, go to service → Terminal
# Or use Docker exec

# Run migrations (if using Alembic)
alembic upgrade head
```

---

## 🐛 **Troubleshooting**

### **Issue: Services not starting**
```bash
# Check logs in Dokploy
# Common causes:
# 1. Wrong environment variables
# 2. Database not ready (wait 30s)
# 3. Build errors (check build logs)
```

### **Issue: Domain not accessible**
```bash
# Verify:
# 1. DNS A record points to server IP
# 2. Domain added in Dokploy UI
# 3. SSL certificate issued (check Traefik logs)
# 4. Firewall allows ports 80, 443
```

### **Issue: CORS errors**
```bash
# Update CORS_ORIGINS in environment variables:
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Redeploy backend
```

### **Issue: Database connection failed**
```bash
# Check:
# 1. Database service is healthy
# 2. DATABASE_URL is correct
# 3. Wait 30s for database initialization
# 4. Check database logs
```

---

## 💾 **Backup Strategy**

### **Database Backup**:
```bash
# In Dokploy terminal or SSH:
docker exec <postgres-container-name> pg_dump -U hotelier hotelier_hub > backup.sql

# Or use Dokploy's backup feature (if available)
```

### **Restore**:
```bash
docker exec -i <postgres-container-name> psql -U hotelier hotelier_hub < backup.sql
```

---

## 🎯 **Production Checklist**

Before going live:

- [ ] Changed `SECRET_KEY` from default
- [ ] Changed `POSTGRES_PASSWORD` from default
- [ ] Set `DEBUG=false`
- [ ] Updated `CORS_ORIGINS` with actual domains
- [ ] Configured custom domains
- [ ] SSL certificates issued
- [ ] Tested all features
- [ ] Database backup configured
- [ ] Monitoring setup
- [ ] Firewall configured

---

## 📈 **Expected Result**

After successful deployment:

**URLs**:
- Frontend: `https://your-domain.com`
- Backend API: `https://api.your-domain.com`
- API Docs: `https://api.your-domain.com/docs`

**Services Running**:
- ✅ PostgreSQL (database)
- ✅ FastAPI (backend)
- ✅ React + Nginx (frontend)
- ✅ Traefik (reverse proxy - managed by Dokploy)

**Features Working**:
- ✅ User signup/login
- ✅ Hotel management
- ✅ Room management
- ✅ Booking system
- ✅ Payment tracking
- ✅ Integration system
- ✅ Public booking engine

---

## 🎉 **You're Live!**

Your Hotelier Hub is now deployed on Dokploy! 🚀

**Next Steps**:
1. Create your first hotel account
2. Add rooms and configure pricing
3. Set up integration on your hotel website
4. Start accepting bookings!

---

## 📞 **Need Help?**

**Dokploy Resources**:
- Docs: https://docs.dokploy.com
- GitHub: https://github.com/Dokploy/dokploy
- Discord: Dokploy Community

**Your Documentation**:
- `SYSTEM_SUMMARY.md` - Complete system overview
- `QUICK_START.md` - Usage guide
- `DEPLOYMENT_CHECKLIST.md` - Quick reference

---

**Deployment Time**: ~15-20 minutes
**Difficulty**: Easy (Dokploy handles everything!)
**Status**: ✅ Ready to Deploy

**Happy Deploying! 🎊**
