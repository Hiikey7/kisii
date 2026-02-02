# E-County Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment

**Backend (.env)**
```bash
cd backend
cp .env.example .env

# Edit .env and set:
MONGODB_URI=mongodb://localhost:27017/e-county-kisii
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=development
API_PORT=5000
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend (.env)**
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### Step 3: Start MongoDB

Make sure MongoDB is running (locally or use MongoDB Atlas):
```bash
# Local MongoDB
mongod

# Or use cloud MongoDB Atlas and set MONGODB_URI in .env
```

### Step 4: Run Backend

```bash
cd backend
npm run dev
# ✅ Server starts on http://localhost:5000
```

### Step 5: Run Frontend

Open new terminal:
```bash
cd frontend
npm start
# ✅ App opens on http://localhost:3000
```

## 📝 Test the System

### Create Test Accounts

1. **Citizen Account**
   - Go to http://localhost:3000/register
   - Fill form and select "Citizen" role
   - Click "Create Account"

2. **Officer Account** (For testing)
   - Manually create in MongoDB or ask admin to create
   - Use same registration with "Field Officer" role (if enabled)

3. **Admin Account** (Requires database access)
   - Must be created directly in MongoDB
   - Or add manually in Users collection

### Test Citizen Features

1. **Login** as citizen → http://localhost:3000/login
2. **Report an Issue** → Click "Report Issue" button
   - Fill title, description, category
   - Click on map to select location (or auto GPS)
   - Submit
3. **View Dashboard** → "My Dashboard"
   - See your reported issues
   - Track status updates
4. **View Announcements** → "Announcements" page

### Test Public Features

1. Visit landing page → http://localhost:3000
2. View trending announcements
3. Read FAQ section
4. See call-to-action without logging in

## 🛠️ Key Endpoints to Test with Postman

### Register User
```bash
POST http://localhost:5000/api/auth/register
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "254712345678",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "citizen"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Report Issue
```bash
POST http://localhost:5000/api/issues
Headers: Authorization: Bearer <token>
Body: {
  "title": "Pothole on Main Street",
  "description": "Large pothole blocking the road",
  "category": "roads",
  "longitude": 34.7744,
  "latitude": -0.6753,
  "address": "Main Street, Kisii"
}
```

### Get Issues
```bash
GET http://localhost:5000/api/issues
GET http://localhost:5000/api/issues?status=pending&category=roads&page=1&limit=10
```

## 🔒 Default Test Credentials

After deployment, admin should create these accounts:

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@test.com | test123456 |
| Officer | officer@test.com | test123456 |
| Admin | admin@test.com | test123456 |

## 📱 Mobile Testing

The system is responsive. Test on mobile:
```bash
# Frontend automatically accessible on:
http://localhost:3000
```

On mobile device:
- Get your PC IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Visit: `http://YOUR_IP:3000`

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process if needed, then restart
```

### Frontend won't start
```bash
# Check if port 3000 is in use
# Try running on different port:
PORT=3001 npm start
```

### MongoDB connection error
```bash
# Verify MongoDB is running:
mongosh  # connects to localhost:27017

# Or check Atlas URI in .env
```

### CORS errors
- Verify FRONTEND_URL in backend .env matches your frontend URL
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito mode

### GPS not working
- Must use HTTPS (localhost works in development)
- Allow location permission in browser
- Check browser console for errors

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Leaflet Maps](https://leafletjs.com)

## 🎯 Next Steps

1. **Customize Colors** → Update CSS variables in `frontend/src/styles/global.css`
2. **Add Logo** → Replace brand icon in Navbar component
3. **Configure Email** → Set up Gmail app password or other SMTP provider
4. **Deploy Frontend** → Connect GitHub repo to Vercel
5. **Deploy Backend** → Deploy to Vercel or any Node.js hosting

## 🚢 Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Update all email credentials
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure MongoDB Atlas backup
- [ ] Set up CI/CD pipeline
- [ ] Test all features in production
- [ ] Set up monitoring and logging

## 📞 Support

For issues:
1. Check console for error messages
2. Check backend logs for API errors
3. Verify .env variables are correct
4. Check MongoDB connection
5. Read DEVELOPMENT_GUIDE.md for detailed info

---

**Good luck! Happy coding! 🎉**
