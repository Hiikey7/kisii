# Integration Guide - Adding OfficerManagement to Your App

## Quick Start Integration

### 1. Update App.tsx Routing

Add the following import and route to your `frontend/src/App.tsx`:

```tsx
import OfficerManagement from './pages/OfficerManagement';

// Add this route in your Routes component:
<Route 
  path="/admin/officers" 
  element={<ProtectedRoute><OfficerManagement /></ProtectedRoute>} 
/>
```

### 2. Update Admin Navigation

Add a link in your Admin Dashboard or Navbar to the Officer Management page:

```tsx
<Link to="/admin/officers" className="nav-link">
  👮 Officer Management
</Link>
```

### 3. CSS Import

The styling is automatically imported in the OfficerManagement component:
```tsx
import '../styles/officer-management.css';
```

## Complete App.tsx Example

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Page imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OfficerManagement from './pages/OfficerManagement';
import OfficerAnnouncementCreate from './pages/OfficerAnnouncementCreate';
import OfficerAnnouncementManage from './pages/OfficerAnnouncementManage';
import ReportIssuePage from './pages/ReportIssuePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen Routes */}
          <Route 
            path="/dashboard/citizen" 
            element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/report-issue" 
            element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} 
          />

          {/* Officer Routes */}
          <Route 
            path="/dashboard/officer" 
            element={<ProtectedRoute><OfficerDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/announcements/create" 
            element={<ProtectedRoute><OfficerAnnouncementCreate /></ProtectedRoute>} 
          />
          <Route 
            path="/announcements/manage" 
            element={<ProtectedRoute><OfficerAnnouncementManage /></ProtectedRoute>} 
          />

          {/* Admin Routes */}
          <Route 
            path="/dashboard/admin" 
            element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/officers" 
            element={<ProtectedRoute><OfficerManagement /></ProtectedRoute>} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Component Structure

### OfficerManagement Component
```
OfficerManagement
├── Page Header
├── Alerts (Error/Success)
├── Toolbar (Create Button)
├── Filters Section
│   ├── Search Box
│   └── Filter Buttons
├── Officers List
│   ├── Loading State
│   ├── Empty State
│   └── Officers Table/Grid
├── Create Officer Modal
│   ├── Form Fields
│   └── Modal Footer
└── Permission Management Modal
    ├── Officer Details
    ├── Permission Section
    ├── Deactivate Section
    └── Modal Footer
```

## Props & State Management

### Component Props
None (Component uses React Router hooks)

### Internal State
```tsx
// Loading & Errors
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [successMessage, setSuccessMessage] = useState('');

// Officers data
const [officers, setOfficers] = useState<Officer[]>([]);
const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);

// Filters
const [searchTerm, setSearchTerm] = useState('');
const [filterPermission, setFilterPermission] = useState<'all' | 'enabled' | 'disabled'>('all');

// Modals
const [showCreateModal, setShowCreateModal] = useState(false);
const [showPermissionModal, setShowPermissionModal] = useState(false);
const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

// Form data
const [newOfficer, setNewOfficer] = useState({...});
const [departments, setDepartments] = useState<Department[]>([]);
```

## API Integration

The component uses the API service to communicate with the backend:

```tsx
// Fetch officers
GET /admin/officers/with-permissions

// Create officer
POST /admin/users/create

// Update permission
PUT /admin/officers/:id/announcement-permission

// Deactivate officer
PUT /admin/users/:id/deactivate

// Get departments
GET /departments
```

## Styling & Customization

### CSS Variables You Can Override

Edit `frontend/src/styles/officer-management.css` to customize:

```css
/* Primary color */
--primary-color: #667eea;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Status colors */
--success-color: #27ae60;
--danger-color: #e74c3c;
--warning-color: #f39c12;
--info-color: #3498db;

/* Spacing */
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* Border radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

## Authentication Requirements

The component requires:
1. User to be logged in (via `useAuth()`)
2. User role to be 'admin' (checked in useEffect)
3. Valid JWT token in localStorage/sessionStorage

If user is not admin, they will be redirected to login page.

## Accessibility Features

- ✓ Semantic HTML
- ✓ ARIA labels on buttons
- ✓ Keyboard navigation support
- ✓ Color contrast compliance
- ✓ Form validation messages
- ✓ Loading states for better UX

## Error Handling

Component handles:
- Network errors
- Missing data
- Invalid inputs
- Permission denied errors
- Server validation errors

All errors are displayed in user-friendly toast alerts.

## Performance Considerations

- Uses `useState` for state management
- `useEffect` for data fetching
- Filter logic debounced with search input
- Conditional rendering to minimize DOM nodes
- CSS transitions for smooth animations

## Troubleshooting

### Component Not Loading
```
✗ Check if user is authenticated
✗ Check if user role is 'admin'
✗ Verify route is registered in App.tsx
✗ Check console for error messages
```

### Officers Not Displaying
```
✗ Verify API endpoint is accessible
✗ Check network tab for API calls
✗ Ensure backend is running
✗ Check if officers exist in database
```

### Modals Not Opening
```
✗ Check if state is updating correctly
✗ Verify CSS is loaded
✗ Check browser console for errors
```

### Permission Changes Not Working
```
✗ Verify admin authentication
✗ Check API request payload
✗ Ensure officer ID is valid
✗ Check backend logs for errors
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Mobile Responsiveness

Component is fully responsive:
- **Desktop**: Multi-column table/grid
- **Tablet**: Single column with horizontal scroll
- **Mobile**: Stacked cards layout

## Testing Guidelines

### Unit Tests
```tsx
describe('OfficerManagement', () => {
  test('renders loading state', () => {
    // Test loading display
  });

  test('displays officers list', () => {
    // Test officers rendering
  });

  test('opens create modal', () => {
    // Test modal opening
  });

  test('creates new officer', () => {
    // Test officer creation
  });

  test('updates permission', () => {
    // Test permission update
  });
});
```

### Integration Tests
```tsx
describe('OfficerManagement Integration', () => {
  test('admin can create and manage officers', () => {
    // Full workflow test
  });

  test('filters work correctly', () => {
    // Test filtering
  });

  test('search functionality works', () => {
    // Test search
  });
});
```

## Deployment Checklist

- [ ] Component imported in App.tsx
- [ ] Route registered
- [ ] CSS file loaded
- [ ] API endpoints accessible
- [ ] Backend deployed with new endpoints
- [ ] Environment variables configured
- [ ] Email service configured
- [ ] Database migrations run
- [ ] Testing completed
- [ ] User documentation prepared

## Next Steps

1. **Import Component**: Add to App.tsx
2. **Test Routes**: Verify all routes work
3. **Test API**: Confirm backend endpoints
4. **Test UI**: Verify components render
5. **Test Workflow**: Create officer → Manage permissions → Create announcement
6. **Deploy**: Push to production
7. **Monitor**: Check logs for errors

## Support Resources

- API Documentation: See `OFFICER_MANAGEMENT_GUIDE.md`
- Implementation Summary: See `IMPLEMENTATION_SUMMARY.md`
- Component Code: See `frontend/src/pages/OfficerManagement.tsx`
- Styles: See `frontend/src/styles/officer-management.css`

---

**Ready to integrate? Follow the "Quick Start Integration" section above!**
