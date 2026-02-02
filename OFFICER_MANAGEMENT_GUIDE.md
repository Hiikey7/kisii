# Field Officer Management - Implementation Guide

## Overview
This document describes the new features added to the E-County system for managing field officers and their announcement creation permissions.

## New Features

### 1. Admin-Controlled Officer Creation
- **Endpoint**: `POST /api/admin/users/create`
- **Description**: Admins can now create field officers for various departments
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "0712345678",
  "role": "officer",
  "department": "department_id"
}
```
- **Response**: Returns the created user with a temporary password sent to email

### 2. Officer Announcement Permission Control
- **Endpoint**: `PUT /api/admin/officers/:id/announcement-permission`
- **Description**: Admin can enable/disable announcement creation permission for field officers
- **Request Body**:
```json
{
  "canCreateAnnouncement": true
}
```
- **Response**: Returns updated officer with permission status

### 3. Get Officers with Permissions
- **Endpoint**: `GET /api/admin/officers/with-permissions`
- **Description**: Retrieve all field officers with their announcement permissions
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 20)
  - `canCreateAnnouncement` (optional): Filter by permission status (true/false)
- **Response**: Returns paginated list of officers with their details

### 4. Permission Enforcement in Announcements
- **Endpoint**: `POST /api/announcements`
- **Changes**:
  - Field officers without permission will receive 403 error
  - Only officers with `canCreateAnnouncement: true` can create announcements
  - Admins can always create announcements
- **Error Response**:
```json
{
  "success": false,
  "message": "You do not have permission to create announcements. Please contact the administration."
}
```

## User Model Changes

### New Field: `canCreateAnnouncement`
- **Type**: Boolean
- **Default**: 
  - `true` for admins
  - `false` for officers (until admin enables)
  - N/A for citizens
- **Purpose**: Controls whether an officer can create and publish announcements

```javascript
canCreateAnnouncement: {
  type: Boolean,
  default: function() {
    return this.role === 'admin';
  },
}
```

## Frontend Features

### Officer Management Page
- **Path**: `/officers-management`
- **Component**: `OfficerManagement.tsx`
- **Features**:
  - Create new field officers
  - Search and filter officers
  - Toggle announcement permissions
  - View officer details
  - Deactivate officers

### Admin Dashboard Updates
- **New Tab**: "👮 Field Officers"
- **Features**:
  - Quick statistics (total officers, announcement enabled count)
  - Officer grid view with permission badges
  - Create new officer button
  - Direct access to manage officers

## Permission Matrix

| Role | Create Officers | Manage Permissions | Create Announcements | View Announcements |
|------|-----------------|-------------------|----------------------|-------------------|
| Admin | ✓ | ✓ | ✓ | ✓ |
| Officer (Enabled) | ✗ | ✗ | ✓ | ✓ |
| Officer (Disabled) | ✗ | ✗ | ✗ | ✓ |
| Citizen | ✗ | ✗ | ✗ | ✓ |

## Workflow Example

### 1. Admin Creates a Field Officer
```bash
POST /api/admin/users/create
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@county.gov",
  "phone": "0787654321",
  "role": "officer",
  "department": "5f8f9c8c8c8c8c8c8c8c8c01"
}
```

### 2. Officer Tries to Create Announcement
- Officer logs in
- Attempts to create announcement
- If `canCreateAnnouncement: false`, receives 403 error

### 3. Admin Enables Permission
```bash
PUT /api/admin/officers/officer_id/announcement-permission
{
  "canCreateAnnouncement": true
}
```
- Email notification sent to officer
- Officer can now create announcements

### 4. Officer Creates Announcement
```bash
POST /api/announcements
{
  "title": "Road Maintenance Update",
  "description": "Update on ongoing road maintenance",
  "content": "The road maintenance project...",
  "visibleTo": "all"
}
```
- Announcement is published immediately
- Citizens and other officers can view it

## Email Notifications

### Officer Created
- **Recipient**: New officer
- **Subject**: E-County System Account Created
- **Contains**: Login credentials and temporary password

### Permission Changed
- **Recipient**: Officer
- **Subject**: Announcement Permission Update
- **Notifies**: Whether permission was enabled or disabled

## Security Considerations

1. **Authorization**: Only admins can manage officers and permissions
2. **Validation**: Email uniqueness is enforced
3. **Password Security**: Temporary passwords are auto-generated
4. **Audit Trail**: All permission changes are recorded in the database
5. **Email Notifications**: Officers are notified of permission changes

## Route Updates

### Admin Routes (`/api/admin`)
```
GET    /officers                        - List all officers
GET    /officers/with-permissions       - List officers with permission details
PUT    /officers/:id/announcement-permission - Toggle announcement permission
POST   /users/create                    - Create new user (officer/admin/citizen)
PUT    /users/:id/deactivate           - Deactivate user
```

### Announcement Routes (`/api/announcements`)
- New permission check added to `POST /api/announcements`
- Returns 403 if officer lacks permission

## API Status Codes

- **200**: Success
- **201**: Resource created
- **400**: Bad request (missing fields, invalid data)
- **403**: Forbidden (permission denied)
- **404**: Resource not found
- **500**: Server error

## Testing Checklist

- [ ] Admin can create field officers
- [ ] Temporary password is sent via email
- [ ] Officer login works with received credentials
- [ ] Officer without permission cannot create announcements
- [ ] Admin can toggle announcement permission
- [ ] Permission change email is sent to officer
- [ ] Officer can create announcements after permission enabled
- [ ] Officer can view but not create announcements after permission disabled
- [ ] Admin can always create announcements
- [ ] Citizens cannot create or toggle permissions
- [ ] Get officers endpoint respects filters
- [ ] Officer list shows correct permission status
