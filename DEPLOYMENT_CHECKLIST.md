# ✅ Dokploy Deployment Checklist

## 📦 Files Created for Deployment

- [x] `backend/Dockerfile` - Backend container configuration
- [x] `Dockerfile` - Frontend container configuration  
- [x] `docker-compose.yml` - Complete stack configuration
- [x] `nginx.conf` - Frontend web server config
- [x] `.env.example` - Environment variables template
- [x] `.dockerignore` - Frontend build exclusions
- [x] `backend/.dockerignore` - Backend build exclusions
- [x] `DOKPLOY_DEPLOYMENT.md` - Complete deployment guide
- [x] `backend/requirements.txt` - Updated with asyncpg & requests

---

## 🚀 Quick Deployment Steps

### 1. **Prepare Environment** (5 minutes)
```bash
# Copy environment template
cp .env.example .env

# Generate secrets
python -c "import secrets; print('SECRET_KEY:', secrets.token_urlsafe(32))"
python -c "import secrets; print('POSTGRES_PASSWORD:', secrets.token_urlsafe(24))"

# Update .env file with generated values
```

### 2. **Push to Git** (2 minutes)
```bash
git init
git add .
git commit -m "Ready for Dokploy deployment"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. **Deploy on Dokploy** (10 minutes)

#### A. Create Database
- Service Type: PostgreSQL 15
- Name: `hotelier-db`
- Database: `hotelier_hub`
- User: `hotelier`
- Password: `<from .env>`

#### B. Deploy Backend
- Service Type: Application (Dockerfile)
- Repository: `<your-git-repo>`
- Build Path: `/backend`
- Dockerfile: `backend/Dockerfile`
- Port: `8003`
- Environment Variables:
  ```
  DATABASE_URL=postgresql+asyncpg://hotelier:<password>@hotelier-db:5432/hotelier_hub
  SECRET_KEY=<from .env>
  CORS_ORIGINS=https://your-domain.com
  DEBUG=false
  ```

#### C. Deploy Frontend
- Service Type: Application (Dockerfile)
- Repository: `<your-git-repo>`
- Build Path: `/`
- Dockerfile: `Dockerfile`
- Port: `80`
- Build Args:
  ```
  VITE_API_URL=https://api.your-domain.com/api/v1
  ```

### 4. **Configure Domains** (5 minutes)
- Backend: `api.your-domain.com` → Port 8003
- Frontend: `your-domain.com` → Port 80
- Enable SSL for both

### 5. **Test Deployment** (5 minutes)
```bash
# Test backend
curl https://api.your-domain.com/health

# Test frontend
curl https://your-domain.com/health

# Test API docs
open https://api.your-domain.com/docs
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Changed `SECRET_KEY` from default
- [ ] Changed `POSTGRES_PASSWORD` from default
- [ ] Set `DEBUG=false`
- [ ] Updated `CORS_ORIGINS` with actual domain
- [ ] Enabled HTTPS/SSL
- [ ] Database not publicly accessible
- [ ] Firewall configured
- [ ] Backup strategy in place

---

## 📊 Environment Variables Reference

### Required for Backend:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SECRET_KEY=<32+ character random string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://your-domain.com
DEBUG=false
```

### Required for Frontend:
```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start
**Solution**: Check DATABASE_URL is correct and database is running
```bash
docker logs hotelier-backend
```

### Issue: Frontend shows CORS error
**Solution**: Add frontend domain to CORS_ORIGINS in backend
```env
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Issue: Database connection failed
**Solution**: Wait 30s for database to initialize, then restart backend

### Issue: Build fails
**Solution**: Check Dockerfile paths and ensure all files are in Git

---

## 📱 Test Your Deployment

### 1. **Backend Health**
```bash
curl https://api.your-domain.com/health
# Expected: {"status":"healthy","version":"1.0.0"}
```

### 2. **API Documentation**
Visit: `https://api.your-domain.com/docs`

### 3. **Frontend**
Visit: `https://your-domain.com`
- Should see login page
- No console errors

### 4. **Create Account**
- Go to `/signup`
- Create test account
- Verify login works

### 5. **Integration System**
- Login to dashboard
- Go to `/integration`
- Generate API key
- Copy widget code
- Test on external site

---

## 🔄 Updating Your Deployment

### Code Updates:
```bash
# Make changes
git add .
git commit -m "Update: description"
git push

# In Dokploy: Click "Redeploy" on each service
```

### Environment Variable Updates:
1. Update in Dokploy UI
2. Restart affected service

### Database Migrations:
```bash
# If using Alembic
docker exec -it hotelier-backend alembic upgrade head
```

---

## 💾 Backup Strategy

### Automated Backups (Recommended):
```bash
# Daily database backup
0 2 * * * docker exec hotelier-db pg_dump -U hotelier hotelier_hub > /backups/db_$(date +\%Y\%m\%d).sql
```

### Manual Backup:
```bash
docker exec hotelier-db pg_dump -U hotelier hotelier_hub > backup.sql
```

### Restore:
```bash
docker exec -i hotelier-db psql -U hotelier hotelier_hub < backup.sql
```

---

## 📈 Monitoring

### Health Checks:
- Backend: `https://api.your-domain.com/health`
- Frontend: `https://your-domain.com/health`
- Database: `docker exec hotelier-db pg_isready`

### Logs:
```bash
# Backend logs
docker logs -f hotelier-backend

# Frontend logs
docker logs -f hotelier-frontend

# Database logs
docker logs -f hotelier-db
```

---

## 🎉 Deployment Complete!

Your Hotelier Hub is now live! 🚀

**URLs**:
- Dashboard: https://your-domain.com
- API: https://api.your-domain.com
- Docs: https://api.your-domain.com/docs

**Next Steps**:
1. Create your first hotel account
2. Add rooms and configure pricing
3. Set up integration on your hotel website
4. Start accepting bookings!

---

## 📞 Support

**Documentation**:
- `DOKPLOY_DEPLOYMENT.md` - Full deployment guide
- `SYSTEM_SUMMARY.md` - System overview
- `QUICK_START.md` - Usage guide

**Logs Location**:
- Backend: Check Dokploy logs
- Frontend: Check Dokploy logs
- Database: Check Dokploy logs

**Need Help?**
- Check deployment guide
- Review container logs
- Verify environment variables
- Test database connection

---

**Status**: ✅ Ready for Deployment
**Estimated Time**: 30 minutes
**Difficulty**: Easy (with Dokploy)

**Good Luck! 🎊**
