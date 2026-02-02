# E-County System - Development Guide

## Project Overview

The E-County Issue Reporting and Tracking System is a full-stack web application built with React, Node.js, and MongoDB. It enables citizens to report county issues, field officers to resolve them, and administrators to manage the entire system.

## Project Structure

```
E-COUNTY SYSTEM/
├── frontend/                 # React TypeScript frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service calls
│   │   ├── context/         # React Context (Auth)
│   │   ├── types/           # TypeScript interfaces
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # React entry point
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js Express backend
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Express app setup
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── .gitignore
└── README.md
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Leaflet & React-Leaflet** - Maps and GPS
- **CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email service

## Getting Started

### Prerequisites
- Node.js v16+ and npm
- MongoDB (local or cloud instance)
- Git
- Code editor (VS Code recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd E-COUNTY\ SYSTEM
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file from template
   cp .env.example .env
   
   # Edit .env with your configurations
   # - MongoDB connection string
   # - JWT secret
   # - Email credentials
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file if needed
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

## Running the Application

### Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm start
# App opens on http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Issues
- `POST /api/issues` - Create new issue (citizen)
- `GET /api/issues` - Get all issues (public)
- `GET /api/issues/:id` - Get issue details
- `GET /api/issues/user/my-issues` - Get citizen's issues
- `GET /api/issues/officer/assigned` - Get officer's assigned issues
- `PUT /api/issues/:id/status` - Update issue status (officer/admin)

### Announcements
- `POST /api/announcements` - Create announcement (officer/admin)
- `GET /api/announcements` - Get all published announcements (public)
- `GET /api/announcements/:id` - Get announcement details
- `GET /api/announcements/user/my-announcements` - Get user's announcements
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/deactivate` - Deactivate user
- `PUT /api/users/:id/activate` - Activate user
- `DELETE /api/users/:id` - Delete user

## Database Models

### User
- firstName, lastName, email, phone
- password (hashed), role (citizen/officer/admin)
- department (for officers/admins), isActive, createdAt

### Issue
- title, description, category, status, priority
- location (GeoJSON point with coordinates and address)
- reportedBy, assignedTo, photos, updates, feedback
- createdAt, resolvedAt

### Announcement
- title, description, content, image
- author, department, status (draft/published/archived)
- publishedAt, viewCount, createdAt

### Department
- name, description, email, phone
- manager (User reference), isActive

### Feedback
- issue (reference), submittedBy (User reference)
- rating (1-5), comment, createdAt

### Notification
- recipient, type, issue, title, message
- isRead, emailSent, createdAt

## Authentication Flow

1. User registers → password hashed with bcrypt → user created in DB
2. User logs in → credentials verified → JWT token generated
3. Token stored in localStorage
4. All subsequent requests include token in Authorization header
5. Backend verifies token → request processed or rejected

## Role-Based Access

### Citizen
- Report issues with GPS location
- View own issues and track status
- Provide feedback on resolved issues
- View public announcements

### Field Officer
- View assigned issues
- Update issue status with comments/photos
- Create and manage announcements
- Access officer dashboard with workload

### Administrator
- Create and manage all users
- View all issues across county
- Verify and assign issues
- Generate analytics and reports
- Moderate announcements

## Key Features

### Issue Reporting
1. Citizens fill out form with details
2. GPS location auto-detected and pin-able on map
3. Issue saved with coordinates
4. Confirmation email sent to citizen
5. Issue appears on admin dashboard for verification

### Status Tracking
- Pending → Verified → Assigned → In Progress → Resolved
- Each status change triggers email notification
- Update history with timestamps and comments

### Announcements
- Officers create announcements (draft status)
- Admins can auto-publish or moderate
- Public can view published announcements
- View counts tracked for analytics

## Testing

### Manual Testing Checklist
- [ ] User registration and email verification
- [ ] Login with different roles
- [ ] Issue reporting with GPS
- [ ] Issue status updates
- [ ] Email notifications
- [ ] Role-based access control
- [ ] Announcement creation and publishing
- [ ] Responsive design on mobile

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

## Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Connect Vercel to GitHub repo
3. Set environment variables
4. Deploy automatically on push

### Backend Deployment (Vercel)
1. Add `vercel.json` configuration
2. Set MongoDB URI in Vercel environment
3. Deploy backend as serverless functions

### Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb://...
NODE_ENV=production
JWT_SECRET=your_secret_key
API_PORT=5000
FRONTEND_URL=https://yourdomain.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend (.env)**
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Common Issues & Solutions

### MongoDB Connection Error
- Check MongoDB URI in .env
- Ensure MongoDB is running
- Verify network access (if using Atlas)

### CORS Errors
- Check CORS configuration in backend
- Verify FRONTEND_URL matches your frontend URL
- Clear browser cache

### GPS Not Working
- Check HTTPS (required for Geolocation API)
- Verify user granted location permission
- Test in Chrome/Firefox

### Email Not Sending
- Verify email credentials in .env
- Use Gmail app passwords (not regular password)
- Check spam folder

## Development Best Practices

1. **Code Organization**
   - Keep components small and reusable
   - Separate business logic into services
   - Use TypeScript for type safety

2. **Git Workflow**
   - Create feature branches
   - Write descriptive commit messages
   - Submit pull requests for review

3. **Error Handling**
   - Always use try-catch
   - Return meaningful error messages
   - Log errors for debugging

4. **Security**
   - Never commit .env files
   - Use HTTPS in production
   - Validate inputs on both frontend and backend
   - Hash passwords with bcrypt

5. **Performance**
   - Optimize images
   - Lazy load components
   - Paginate list results
   - Use database indexes

## Future Enhancements

- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Photo storage (AWS S3)
- [ ] Real-time notifications (Socket.io)
- [ ] Offline support (PWA)
- [ ] Multiple language support
- [ ] Advanced filtering and search

## Support & Contact

For questions or issues, contact:
- Email: support@ecounty-kisii.gov.ke
- Phone: +254 (0) xxx xxx xxx
- Website: https://www.kisii.go.ke

## License

Government of Kisii County - All Rights Reserved

---

**Last Updated:** January 2024
**Version:** 1.0.0
