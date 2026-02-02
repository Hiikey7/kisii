# Frontend Router Configuration - Officer Routes

## Protected Routes Setup

The following routes should be added to your `App.tsx` or routing configuration for officer-specific pages:

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { OfficerAnnouncementCreate } from './pages/OfficerAnnouncementCreate';
import { OfficerAnnouncementManage } from './pages/OfficerAnnouncementManage';

// In your routing configuration:

// Officer Dashboard
<Route
  path="/officer/dashboard"
  element={
    <ProtectedRoute allowedRoles={['officer', 'admin']}>
      <OfficerDashboard />
    </ProtectedRoute>
  }
/>

// Officer Create Announcement
<Route
  path="/officer/announcements/create"
  element={
    <ProtectedRoute allowedRoles={['officer', 'admin']}>
      <OfficerAnnouncementCreate />
    </ProtectedRoute>
  }
/>

// Officer Manage Announcements
<Route
  path="/officer/announcements"
  element={
    <ProtectedRoute allowedRoles={['officer', 'admin']}>
      <OfficerAnnouncementManage />
    </ProtectedRoute>
  }
/>
```

## Route Navigation

### From Navbar/Menu
```tsx
// Navigation menu should include:
- "Officer Dashboard" -> /officer/dashboard
- "Manage Announcements" -> /officer/announcements
- "Create Announcement" -> /officer/announcements/create
```

### Dashboard Navigation
All navigation within the officer dashboard is handled via tabs and modals:
- Issues tab (default view)
- Workload tab
- Announcements tab (with quick buttons)
- Notifications tab

### Quick Action Buttons
Within OfficerDashboard component:
```tsx
// Announcements tab includes:
<button onClick={() => navigate('/officer/announcements/create')}>
  ➕ Create New Announcement
</button>

<button onClick={() => navigate('/officer/announcements')}>
  📋 View All My Announcements
</button>
```

## Component Hierarchy

```
App
├── ProtectedRoute (role: 'officer' or 'admin')
│   ├── OfficerDashboard
│   │   ├── Stats Grid
│   │   ├── Dashboard Tabs
│   │   │   ├── Issues Tab
│   │   │   │   ├── Issues Table
│   │   │   │   └── Issue Detail Modal
│   │   │   ├── Workload Tab
│   │   │   ├── Announcements Tab
│   │   │   └── Notifications Tab
│   │   └── Success/Error Messages
│   │
│   ├── OfficerAnnouncementCreate (page)
│   │   └── Form with fields:
│   │       ├── Title
│   │       ├── Description
│   │       ├── Content
│   │       ├── Visibility (all/officers/citizens)
│   │       └── Submit Button
│   │
│   └── OfficerAnnouncementManage
│       ├── Announcements Grid
│       │   └── Announcement Cards
│       │       ├── View Details Modal
│       │       └── Edit Modal
│       └── Action Buttons
```

## Query Parameters

The officer dashboard supports these optional query parameters:

```
/officer/dashboard?tab=issues        # Start on Issues tab
/officer/dashboard?tab=workload      # Start on Workload tab
/officer/dashboard?tab=announcements # Start on Announcements tab
/officer/dashboard?tab=notifications # Start on Notifications tab
```

## State Management

The OfficerDashboard manages its own state for:
- `assignedIssues` - List of assigned issues
- `selectedIssue` - Currently selected issue for detail view
- `notifications` - List of notifications
- `stats` - Officer workload statistics
- `activeTab` - Currently selected dashboard tab

## API Calls Made by Each Page

### OfficerDashboard
On component mount:
- `GET /api/issues/officer/assigned` - Load issues
- `GET /api/notifications` - Load notifications

On status update:
- `PUT /api/issues/:id/status` - Update issue
- `GET /api/issues/:id` - Refresh issue details

On comment add:
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/issues/:id` - Refresh issue

On notification interaction:
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### OfficerAnnouncementManage
On component mount:
- `GET /api/announcements/user/my-announcements` - Load my announcements

On update:
- `PUT /api/announcements/:id` - Update announcement
- `PUT /api/announcements/:id/archive` - Archive announcement
- `DELETE /api/announcements/:id` - Delete announcement

## Error Handling

All pages implement error handling with:
- Error message display (dismissible)
- Success message display (auto-dismiss after 3 seconds)
- Loading states during API calls
- Disabled buttons during submission

## Responsive Design

All components use the existing CSS frameworks:
- `officer-dashboard.css` for OfficerDashboard
- `announcement.css` for announcements

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Authentication

All officer routes require:
- Valid JWT token in localStorage
- User role must be 'officer' or 'admin'
- ProtectedRoute component enforces this via `authorize()` middleware

If authentication fails:
- User redirected to `/login`
- Message displayed
- Token cleared from localStorage

## Session Management

Officer session persists across page navigation:
- JWT token stored in localStorage
- User info stored in AuthContext
- Automatic logout if token expires (401 response)
- Manual logout via button clears session

## Browser Storage

LocalStorage keys used:
- `token` - JWT authentication token
- `user` - Current user object (name, id, role, etc.)

These are cleared on logout or token expiration.

## Accessibility Considerations

All pages include:
- Semantic HTML structure
- ARIA labels where applicable
- Keyboard navigation support
- Color contrast for readability
- Loading states for screen readers

## Mobile Optimization

Components are mobile-responsive:
- Stacked layout on small screens
- Touch-friendly button sizes (44px minimum)
- Scrollable tables on mobile
- Modal overlays work on mobile

## Performance Optimizations

- Pagination for issue lists (10 items per page)
- Lazy loading of notifications
- Debounced search/filter
- Memoized components (React.FC)
- Conditional rendering of modals

## Known Limitations

1. **Photo Upload**: Currently stores URLs - consider cloud storage for production
2. **Geolocation**: Shows coordinates but doesn't display on map - consider adding Google Maps
3. **Notifications**: Email-only - consider adding SMS or push notifications
4. **Offline Mode**: Not yet implemented - consider service workers for PWA

## Future Enhancements

- [ ] Add Google Maps integration for location display
- [ ] Implement real-time notifications via WebSocket
- [ ] Add offline mode with service workers
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export reports (PDF)
- [ ] Team collaboration features
- [ ] Performance dashboards

## Testing Routes

To test the officer routes:

```bash
# 1. Create an officer account via registration
# 2. Login with officer credentials
# 3. Navigate to /officer/dashboard
# 4. Test each tab and functionality
# 5. Create and manage announcements
# 6. Check notifications in dashboard
```

## Debugging

Enable console logging:
```typescript
// In api.ts or component
console.log('Officer Dashboard loaded', user);
console.log('Issues fetched:', assignedIssues);
console.log('Notifications:', notifications);
```

Check browser DevTools:
- Application → LocalStorage for token/user
- Network tab for API calls
- Console for errors

---

**Navigation Summary**:
```
Login
  ↓
Officer Dashboard (/officer/dashboard)
  ├─ Issues Tab (default)
  ├─ Workload Tab
  ├─ Announcements Tab (links to create/manage)
  └─ Notifications Tab

Announcements Management:
  ├─ Create (/officer/announcements/create)
  └─ Manage (/officer/announcements)
```
