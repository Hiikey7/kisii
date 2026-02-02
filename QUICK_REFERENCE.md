# Quick Reference - Field Officer Management

## 🚀 Quick Start (5 minutes)

### Backend Setup
1. Restart your Node.js server (changes auto-applied):
   ```bash
   npm restart
   ```

### Frontend Setup
1. Import component in `App.tsx`:
   ```tsx
   import OfficerManagement from './pages/OfficerManagement';
   ```

2. Add route:
   ```tsx
   <Route path="/admin/officers" element={<ProtectedRoute><OfficerManagement /></ProtectedRoute>} />
   ```

3. Add navigation link (optional):
   ```tsx
   <Link to="/admin/officers">👮 Officer Management</Link>
   ```

Done! ✅

---

## 🔑 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/users/create` | Create new officer |
| GET | `/api/admin/officers` | List all officers |
| GET | `/api/admin/officers/with-permissions` | List with details |
| PUT | `/api/admin/officers/:id/announcement-permission` | Toggle permission |
| PUT | `/api/admin/users/:id/deactivate` | Deactivate officer |
| POST | `/api/announcements` | Create announcement |

---

## 📊 Data Models

### Officer Object
```json
{
  "_id": "12345...",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "0712345678",
  "role": "officer",
  "department": { "_id": "...", "name": "Health" },
  "isActive": true,
  "canCreateAnnouncement": true,
  "createdAt": "2026-01-28T10:00:00Z"
}
```

---

## 🎯 Common Tasks

### Create Officer (as Admin)
```bash
curl -X POST http://localhost:3001/api/admin/users/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@county.gov",
    "phone": "0787654321",
    "role": "officer",
    "department": "department_id"
  }'
```

### Enable Announcement (as Admin)
```bash
curl -X PUT http://localhost:3001/api/admin/officers/officer_id/announcement-permission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "canCreateAnnouncement": true
  }'
```

### Create Announcement (as Officer with Permission)
```bash
curl -X POST http://localhost:3001/api/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Road Update",
    "description": "Maintenance update",
    "content": "Details...",
    "visibleTo": "all"
  }'
```

---

## 🔒 Permission Levels

```
Admin: ✓ Create officers, ✓ Manage permissions, ✓ Create announcements
Officer (Enabled): ✗ Create officers, ✗ Manage permissions, ✓ Create announcements
Officer (Disabled): ✗ Create officers, ✗ Manage permissions, ✗ Create announcements
Citizen: ✗ All admin/officer functions, ✓ View announcements
```

---

## 📝 Frontend Components

### Imports
```tsx
import OfficerManagement from './pages/OfficerManagement';
import { useAuth } from './context/AuthContext';
import api from './services/api';
```

### Usage
```tsx
<OfficerManagement />
```

### User Types
```tsx
interface Officer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department?: { _id: string; name: string };
  isActive: boolean;
  canCreateAnnouncement: boolean;
  createdAt: string;
}
```

---

## 🐛 Debugging

### Check if Backend Endpoints Work
```bash
# List officers
curl http://localhost:3001/api/admin/officers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check user permissions
curl http://localhost:3001/api/admin/officers/with-permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Frontend Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for red errors
4. Check Network tab for API failures

### Database Check
```bash
# Connect to MongoDB
mongosh

# Check users
db.users.find({ role: "officer" })

# Check specific user permissions
db.users.findOne({ email: "officer@example.com" }, { canCreateAnnouncement: 1 })
```

---

## 📧 Email Templates

### Officer Created
```
Subject: E-County System Account Created
From: system@county.gov

Dear [FirstName],
Your account has been created.
Email: [Email]
Password: [TempPassword]
Please login and change your password immediately.
```

### Permission Changed
```
Subject: Announcement Permission Updated
From: system@county.gov

Dear [FirstName],
Your announcement permission has been [ENABLED/DISABLED].
[If enabled: You can now create announcements]
[If disabled: You can no longer create announcements]
```

---

## 🎨 Styling Quick Reference

### Colors
- Primary: `#667eea` (Purple)
- Success: `#27ae60` (Green)
- Danger: `#e74c3c` (Red)
- Info: `#3498db` (Blue)
- Warning: `#f39c12` (Orange)

### Common Classes
- `.btn` - Button styling
- `.btn-primary` - Primary button
- `.btn-danger` - Danger button
- `.permission-badge` - Permission status
- `.modal` - Modal styling
- `.table-container` - Table wrapper

---

## 🧪 Test Data

### Sample Officer Creation
```json
{
  "firstName": "Test",
  "lastName": "Officer",
  "email": "test.officer@localhost.test",
  "phone": "+254700000000",
  "role": "officer",
  "department": "5f8f9c8c8c8c8c8c8c8c8c01"
}
```

### Sample Announcement
```json
{
  "title": "Test Announcement",
  "description": "This is a test",
  "content": "Test content for announcement",
  "visibleTo": "all"
}
```

---

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1024px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Mobile */
@media (max-width: 767px) { }
```

---

## 🔄 Common Workflows

### Workflow 1: Create and Enable Officer
1. Admin → Admin Dashboard
2. Click "Field Officers" tab
3. Click "➕ Create New Officer"
4. Fill form → Submit
5. Officer receives email
6. Click "📝 Manage" on officer card
7. Toggle "Enable Announcement Permission"
8. Officer receives email notification
9. Done! ✅

### Workflow 2: Disable Officer Announcements
1. Admin → Officer Management
2. Find officer in list
3. Click "📝 Manage"
4. Click "Disable Announcement Permission"
5. Officer receives notification
6. Officer can no longer create announcements
7. Done! ✅

### Workflow 3: Officer Creates Announcement
1. Officer → Officer Dashboard (must have permission)
2. Click "Create Announcement"
3. Fill form details
4. Upload image (optional)
5. Select visibility
6. Click "Publish"
7. Announcement published immediately
8. Citizens can view
9. Done! ✅

---

## ⚠️ Common Issues & Fixes

### "You do not have permission..."
**Cause**: Officer's `canCreateAnnouncement` is false  
**Fix**: Admin enables permission in Officer Management

### Officer doesn't appear in list
**Cause**: Officer may be inactive or deactivated  
**Fix**: Check `isActive` field, create new officer

### Email not received
**Cause**: Email service not configured  
**Fix**: Check `EMAIL_USER`, `EMAIL_PASSWORD` in `.env`

### API 403 Forbidden
**Cause**: Not logged in as admin  
**Fix**: Verify JWT token and user role

### Component not loading
**Cause**: Route not registered  
**Fix**: Add route to `App.tsx`

---

## 📚 File Locations

```
Backend:
├── src/models/User.js ........................ User model
├── src/controllers/adminController.js ....... Admin logic
├── src/controllers/announcementController.js Announcement logic
└── src/routes/admin.js ....................... Admin routes

Frontend:
├── src/pages/OfficerManagement.tsx .......... Officer management
├── src/styles/officer-management.css ....... Officer styles
├── src/pages/AdminDashboard.tsx ............ Admin dashboard
└── src/styles/admin-dashboard.css .......... Dashboard styles

Documentation:
├── OFFICER_MANAGEMENT_GUIDE.md ............ Full API docs
├── IMPLEMENTATION_SUMMARY.md ............. Implementation details
├── INTEGRATION_GUIDE.md .................. Integration instructions
└── QUICK_REFERENCE.md ................... This file!
```

---

## 🚀 Next Steps

1. **Integrate** component in App.tsx
2. **Test** create officer workflow
3. **Test** permission toggle
4. **Test** announcement creation
5. **Deploy** to production
6. **Monitor** logs and errors

---

## 📞 Quick Help

**Q: How do I create an officer?**  
A: Admin Dashboard → Field Officers tab → Create New Officer button

**Q: How do I enable announcements?**  
A: Officer Management → Click officer → Toggle "Announcement Permission"

**Q: Can citizens create announcements?**  
A: No, only officers with permission or admins

**Q: What if an officer can't log in?**  
A: Check if account is active (deactivated accounts can't log in)

**Q: Can I delete officers?**  
A: No, but you can deactivate them

**Q: Who sees announcements?**  
A: All citizens and officers see published announcements

---

## 🎓 Learning Resources

- **API Structure**: See OFFICER_MANAGEMENT_GUIDE.md
- **Full Details**: See IMPLEMENTATION_SUMMARY.md
- **Integration**: See INTEGRATION_GUIDE.md
- **Code**: Check `/backend` and `/frontend` directories

---

**Need help? Check the documentation files or review the code comments!**

*Last Updated: January 28, 2026*
