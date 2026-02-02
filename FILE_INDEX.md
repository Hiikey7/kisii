# E-County System - File Index & Navigation Guide

## 📋 Quick Navigation

### 📖 Documentation (Read First)
1. **[README.md](README.md)** - Project overview and tech stack
2. **[QUICK_START.md](QUICK_START.md)** ⭐ Start here! 5-minute setup guide
3. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - What has been built
4. **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Complete development reference
5. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - All API endpoints documented
6. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - How to deploy to production

---

## 🏗️ Backend Structure

### Backend Root: `backend/`

#### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`.env.example`** - Environment variables template
- **`vercel.json`** - Vercel deployment configuration

#### Source Code: `backend/src/`

##### Database Models: `models/`
- **`User.js`** - User schema with authentication
- **`Issue.js`** - Issue reporting schema with GPS
- **`Announcement.js`** - Announcements schema
- **`Department.js`** - Department schema
- **`Feedback.js`** - User feedback schema
- **`Notification.js`** - Notifications schema

##### API Routes: `routes/`
- **`auth.js`** - Authentication endpoints (register, login)
- **`issues.js`** - Issue CRUD endpoints
- **`announcements.js`** - Announcement endpoints
- **`users.js`** - User management endpoints (admin)

##### Business Logic: `controllers/`
- **`authController.js`** - Login/register logic
- **`issueController.js`** - Issue operations
- **`announcementController.js`** - Announcement operations
- **`userController.js`** - User management

##### Middleware: `middleware/`
- **`auth.js`** - JWT verification & role authorization
- **`errorHandler.js`** - Global error handling

##### Configuration: `config/`
- **`database.js`** - MongoDB connection setup

##### Utilities: `utils/`
- **`jwt.js`** - JWT token generation
- **`email.js`** - Email service (Nodemailer)

##### Entry Point
- **`server.js`** - Express app setup and startup

---

## 🎨 Frontend Structure

### Frontend Root: `frontend/`

#### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`tsconfig.node.json`** - Node TypeScript config

#### Public Assets: `public/`
- **`index.html`** - HTML entry point with Leaflet CSS

#### Source Code: `frontend/src/`

##### Pages: `pages/`
- **`LandingPage.tsx`** - Public landing page (hero, announcements, FAQ)
- **`RegisterPage.tsx`** - User registration page
- **`LoginPage.tsx`** - User login page
- **`ReportIssuePage.tsx`** - Issue reporting with GPS map
- **`CitizenDashboard.tsx`** - Citizen dashboard with issue tracking

##### Components: `components/`
- **`Navbar.tsx`** - Navigation bar with auth display
- **`ProtectedRoute.tsx`** - Route guard for authenticated pages

##### Services: `services/`
- **`api.ts`** - Axios API client with all endpoints

##### Context: `context/`
- **`AuthContext.tsx`** - Authentication state management

##### Styles: `styles/`
- **`global.css`** - Global styles and utilities
- **`landing.css`** - Landing page styles
- **`auth.css`** - Authentication page styles
- **`report.css`** - Issue report page styles
- **`dashboard.css`** - Dashboard styles
- **`navbar.css`** - Navigation bar styles

##### Types: `types/`
- **`index.ts`** - TypeScript interfaces (User, Issue, Announcement, etc.)

##### Utilities: `utils/`
- Available for future utility functions

##### Entry Points
- **`App.tsx`** - Main app component with routing
- **`main.tsx`** - React DOM render entry point

---

## 📁 Project Root

```
E-COUNTY SYSTEM/
├── backend/              (Node.js API server)
├── frontend/             (React application)
├── README.md             (Project overview)
├── QUICK_START.md        (Setup guide)
├── PROJECT_SUMMARY.md    (What was built)
├── DEVELOPMENT_GUIDE.md  (Dev reference)
├── API_DOCUMENTATION.md  (API reference)
├── DEPLOYMENT_GUIDE.md   (Deployment instructions)
├── .gitignore            (Git configuration)
└── FILE_INDEX.md         (This file)
```

---

## 🎯 Getting Started

### For New Developers
1. Read: `QUICK_START.md`
2. Read: `DEVELOPMENT_GUIDE.md`
3. Setup: Follow QUICK_START steps
4. Test: Use API_DOCUMENTATION.md to test endpoints

### For DevOps/Deployment
1. Read: `DEPLOYMENT_GUIDE.md`
2. Prepare: MongoDB Atlas account
3. Configure: Environment variables
4. Deploy: Follow deployment steps

### For API Integration
1. Read: `API_DOCUMENTATION.md`
2. Test: Use Postman or curl
3. Integrate: Use frontend API service as reference

---

## 🔍 Finding Specific Features

### Issue Reporting
- **Frontend**: `frontend/src/pages/ReportIssuePage.tsx`
- **Backend**: `backend/src/controllers/issueController.js`
- **Routes**: `backend/src/routes/issues.js`
- **Model**: `backend/src/models/Issue.js`
- **Styles**: `frontend/src/styles/report.css`

### Announcements
- **Frontend**: Component in `LandingPage.tsx`
- **Backend**: `backend/src/controllers/announcementController.js`
- **Routes**: `backend/src/routes/announcements.js`
- **Model**: `backend/src/models/Announcement.js`

### Authentication
- **Frontend**: `frontend/src/pages/LoginPage.tsx`, `RegisterPage.tsx`
- **Backend**: `backend/src/controllers/authController.js`
- **Routes**: `backend/src/routes/auth.js`
- **Context**: `frontend/src/context/AuthContext.tsx`
- **Middleware**: `backend/src/middleware/auth.js`

### GPS/Maps
- **Implementation**: `frontend/src/pages/ReportIssuePage.tsx`
- **Database**: GeoJSON in `backend/src/models/Issue.js`
- **Styles**: `frontend/src/styles/report.css`

### User Dashboard
- **Frontend**: `frontend/src/pages/CitizenDashboard.tsx`
- **Styles**: `frontend/src/styles/dashboard.css`
- **API**: See issue endpoints in `API_DOCUMENTATION.md`

---

## 🔑 Key Files to Modify

### To Add New API Endpoint
1. Create controller method in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Update `API_DOCUMENTATION.md`

### To Add New Page
1. Create page in `frontend/src/pages/`
2. Add CSS to `frontend/src/styles/`
3. Import in `frontend/src/App.tsx`
4. Add route to Router

### To Change Styling
1. Edit CSS in `frontend/src/styles/`
2. Use CSS variables from `global.css`
3. Follow existing naming conventions

### To Add Database Field
1. Update schema in `backend/src/models/`
2. Update controller if needed
3. Update TypeScript types in `frontend/src/types/index.ts`
4. Test with API

---

## 📊 Code Statistics

| Category | Count |
|----------|-------|
| Backend Files | 17 |
| Frontend Files | 24 |
| Documentation | 6 |
| Total Lines of Code | 3,500+ |
| API Endpoints | 20+ |
| Database Collections | 6 |
| Components | 6 |
| Pages | 5 |
| CSS Files | 8 |

---

## 🚀 Development Workflow

### Backend Development
```bash
cd backend
npm run dev  # Start server with nodemon
# Edit files in src/
# Server auto-reloads on save
```

### Frontend Development
```bash
cd frontend
npm start    # Start dev server
# Edit files in src/
# Page auto-reloads on save
```

### Testing
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
# Creates optimized build in frontend/build/
```

---

## 🔗 Important Links

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Leaflet Maps](https://leafletjs.com)

### Services Used
- [Vercel Deployment](https://vercel.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Gmail SMTP](https://support.google.com/mail/answer/185833)

### Tools
- [Postman API Testing](https://www.postman.com)
- [VS Code Editor](https://code.visualstudio.com)
- [GitHub](https://github.com)
- [Git Documentation](https://git-scm.com)

---

## 📝 File Naming Conventions

### Backend
- **Models**: PascalCase (User.js, Issue.js)
- **Controllers**: camelCaseController.js (authController.js)
- **Routes**: lowercase-plural.js (issues.js, users.js)
- **Middleware**: camelCase.js (errorHandler.js)

### Frontend
- **Pages**: PascalCase.tsx (LandingPage.tsx)
- **Components**: PascalCase.tsx (Navbar.tsx)
- **Styles**: kebab-case.css (landing-page.css)
- **Services**: camelCase.ts (api.ts)
- **Types**: index.ts

---

## ✅ Pre-Deployment Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] API endpoints tested with Postman
- [ ] Frontend builds without errors
- [ ] Responsive design tested on mobile
- [ ] Error handling tested
- [ ] Email service configured
- [ ] All documentation read
- [ ] Deployment guide followed

---

## 🆘 Troubleshooting Guide

### Issue: Cannot find module
- **Solution**: Run `npm install` in backend or frontend directory

### Issue: Port 3000 or 5000 already in use
- **Solution**: See QUICK_START.md → Troubleshooting

### Issue: MongoDB connection error
- **Solution**: Check MONGODB_URI in .env file

### Issue: CORS errors
- **Solution**: Verify FRONTEND_URL in backend .env

### Issue: GPS not working
- **Solution**: Must be HTTPS, check browser permissions

---

## 📞 Support

For questions about:
- **Setup**: See QUICK_START.md
- **Development**: See DEVELOPMENT_GUIDE.md
- **API**: See API_DOCUMENTATION.md
- **Deployment**: See DEPLOYMENT_GUIDE.md
- **Specific Files**: See this FILE_INDEX.md

---

**Last Updated:** January 25, 2026  
**Version:** 1.0.0

---

**Happy Coding! 🚀**
