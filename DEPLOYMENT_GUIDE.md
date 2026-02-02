# E-County Deployment Guide

## Deployment Platforms

This system can be deployed on:

1. **Vercel** (Frontend + Backend) - Recommended
2. **Heroku** (Backend)
3. **AWS** (Frontend + Backend)
4. **DigitalOcean** (Frontend + Backend)

---

## Vercel Deployment (Recommended)

### Prerequisites

- GitHub account with repository
- Vercel account (free tier available)
- MongoDB Atlas account (cloud database)

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: E-County System"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/e-county-system.git
git branch -M main
git push -u origin main
```

### Step 2: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Store securely (don't commit to GitHub!)

### Step 3: Deploy Backend to Vercel

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Connect GitHub account
   - Select repository

2. **Configure Settings**
   - Framework: Other
   - Root Directory: `backend`
   - Build Command: Skip (Node.js doesn't require build)

3. **Set Environment Variables**
   - Add in Vercel dashboard:
   ```
   MONGODB_URI = your_atlas_uri
   JWT_SECRET = your_random_secret_key
   NODE_ENV = production
   API_PORT = 5000
   FRONTEND_URL = https://yourdomain.vercel.app
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASS = your_app_password
   ```

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Your backend API will be at: `https://your-project.vercel.app/api`

### Step 4: Deploy Frontend to Vercel

1. **New Vercel Project**
   - Click "New Project" in Vercel dashboard
   - Select same repository
   - Root Directory: `frontend`

2. **Configure Settings**
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL = https://your-backend-project.vercel.app/api
   ```

4. **Deploy**
   - Frontend will be at: `https://your-project.vercel.app`

---

## Heroku Deployment

### Backend Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create Heroku app
heroku create your-app-name-api

# Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your_secret"
heroku config:set NODE_ENV="production"
heroku config:set FRONTEND_URL="https://your-frontend.vercel.app"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment

Use Vercel as above (Heroku has removed free tier)

---

## AWS Deployment

### Amplify (Easiest for Full Stack)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize project
amplify init

# Add hosting
amplify add hosting

# Add API
amplify add api

# Publish
amplify publish
```

### Alternative: EC2 + S3

1. **Frontend on S3 + CloudFront**
   - Build: `npm run build`
   - Upload to S3
   - Create CloudFront distribution

2. **Backend on EC2**
   - Launch Ubuntu instance
   - Install Node.js, MongoDB
   - Git clone repository
   - Setup environment variables
   - Run with PM2 for persistence

```bash
# On EC2
sudo apt update
sudo apt install nodejs npm
npm install -g pm2

cd backend
npm install
pm2 start src/server.js --name "e-county-api"
pm2 save
```

---

## DigitalOcean Deployment

### Using App Platform (Easiest)

1. **Connect GitHub**
   - Login to DigitalOcean
   - Create new App
   - Connect GitHub account

2. **Configure Services**
   - Backend service (Node.js)
   - Frontend service (Static site)
   - Database (MongoDB managed or add)

3. **Deploy**
   - Automatic deployment on push

---

## Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Use HTTPS everywhere
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Add rate limiting
- [ ] Use environment variables for secrets
- [ ] Never commit .env files

### Performance
- [ ] Enable gzip compression
- [ ] Optimize database indexes
- [ ] Cache static assets
- [ ] Use CDN for images
- [ ] Optimize bundle size
- [ ] Enable database backups

### Monitoring
- [ ] Setup error logging (Sentry)
- [ ] Monitor API performance (New Relic)
- [ ] Setup uptime monitoring
- [ ] Configure email alerts
- [ ] Regular backups scheduled

### Database
- [ ] MongoDB Atlas backup enabled
- [ ] Regular snapshots
- [ ] IP whitelist configured
- [ ] Strong database password
- [ ] Read replicas if needed

### Domain & SSL
- [ ] Register domain
- [ ] Setup DNS records
- [ ] Configure SSL/TLS
- [ ] Auto-renewal enabled

---

## Environment Variables for Production

### Backend

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=generate_with_cryptostrong_random_string
JWT_EXPIRE=7d

API_PORT=5000
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_secure_password
EMAIL_FROM=noreply@yourdomain.com

MAX_FILE_SIZE=5242880
UPLOAD_DIR=/tmp/uploads

ITEMS_PER_PAGE=10
```

### Frontend

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## Post-Deployment

### 1. Test All Features
- Register new user
- Login
- Report issue
- Update status
- Create announcement
- Admin functions

### 2. Setup Monitoring
```bash
# Sentry Error Tracking
npm install --save @sentry/react

# New Relic APM
npm install --save newrelic
```

### 3. Setup CI/CD
- GitHub Actions for automated testing
- Automatic deployment on merge to main
- Pre-deployment tests

### 4. Database Maintenance
- Schedule backups
- Monitor disk usage
- Optimize indexes
- Archive old data

### 5. Performance Monitoring
- Track API response times
- Monitor error rates
- Check database performance
- Analyze user behavior

---

## Scaling for Multiple Counties

Current system designed for single county. To scale:

1. **Add county field to database**
   ```javascript
   // In User, Issue, Issue models
   county: {
     type: String,
     required: true,
     default: 'Kisii'
   }
   ```

2. **Update API routes**
   ```javascript
   // Filter issues by county
   const issues = await Issue.find({ county: req.user.county });
   ```

3. **Multi-tenant database**
   - Shared database with county field
   - Or separate database per county

4. **Subdomain per county**
   - kisii.ecounty.go.ke
   - nakuru.ecounty.go.ke

---

## Rollback Procedure

### If deployment fails:

**Vercel:**
```bash
# In Vercel dashboard
# Click "Deployments" → Select previous working version → "Redeploy"
```

**Heroku:**
```bash
heroku releases
heroku rollback v3
```

**AWS:**
- Revert CloudFormation stack
- Restore from snapshot

---

## Cost Estimation (Monthly)

### Vercel (Recommended for Startups)
- Frontend: Free tier available
- Backend: $20-100/month
- Database: $57-100/month (MongoDB Atlas)
- **Total: $77-200/month**

### Heroku
- Backend: Free tier removed (min $7/month)
- Database: $57-100/month
- Frontend: Free (Vercel)
- **Total: $64-200/month**

### AWS
- EC2: $5-50/month
- RDS: $10-50/month
- S3/CloudFront: $1-20/month
- **Total: $16-120/month**

### DigitalOcean
- App Platform: $12-50/month
- Managed Database: $15-50/month
- **Total: $27-100/month**

---

## Maintenance Schedule

- **Daily**: Monitor error logs
- **Weekly**: Performance review
- **Monthly**: Security audit, backup verification
- **Quarterly**: Load testing, capacity planning
- **Annually**: Disaster recovery drill

---

## Support & Updates

1. Keep dependencies updated
2. Monitor security advisories
3. Regular database optimization
4. User feedback implementation
5. Feature releases quarterly

---

## Contacts for Support

- **Vercel Support**: vercel.com/support
- **MongoDB Support**: mongodb.com/support
- **GitHub Issues**: github.com/your-org/e-county/issues

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**API URL:** ___________  
**Frontend URL:** ___________
