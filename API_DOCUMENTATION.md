# E-County API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Public** - No authentication required

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique, valid email)",
  "phone": "string (required)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match password)",
  "role": "string (optional, default: citizen)",
  // Valid roles: 'citizen', 'officer'
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

### Login
**POST** `/auth/login`

**Public** - No authentication required

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

**Protected** - Requires valid JWT token

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "254712345678",
    "role": "citizen",
    "profilePicture": null,
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

## Issue Endpoints

### Create Issue
**POST** `/issues`

**Protected** - Requires citizen role

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  // Valid categories: 'roads', 'water', 'waste', 'drainage', 'lighting', 'health', 'education', 'other'
  "longitude": "number (required, valid coordinate)",
  "latitude": "number (required, valid coordinate)",
  "address": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Issue reported successfully",
  "issue": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Pothole on Main Street",
    "description": "Large pothole blocking traffic",
    "category": "roads",
    "status": "pending",
    "priority": "medium",
    "reportedBy": "507f1f77bcf86cd799439011",
    "location": {
      "type": "Point",
      "coordinates": [34.7744, -0.6753],
      "address": "Main Street, Kisii"
    },
    "photos": [],
    "updates": [],
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Get All Issues
**GET** `/issues`

**Public** - No authentication required

**Query Parameters:**
- `status` - Filter by status (pending, verified, assigned, in_progress, resolved)
- `category` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /issues?status=pending&category=roads&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "total": 45,
  "page": 1,
  "pages": 5,
  "issues": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Pothole on Main Street",
      "description": "Large pothole blocking traffic",
      "category": "roads",
      "status": "pending",
      "priority": "medium",
      "reportedBy": {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "254712345678"
      },
      "createdAt": "2024-01-25T10:30:00Z"
    }
  ]
}
```

---

### Get Single Issue
**GET** `/issues/:id`

**Public** - No authentication required

**Path Parameters:**
- `id` - Issue ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "issue": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Pothole on Main Street",
    "description": "Large pothole blocking traffic",
    "category": "roads",
    "status": "in_progress",
    "priority": "medium",
    "reportedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe"
    },
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "location": {
      "type": "Point",
      "coordinates": [34.7744, -0.6753],
      "address": "Main Street, Kisii"
    },
    "photos": [
      {
        "url": "https://example.com/photo.jpg",
        "uploadedAt": "2024-01-25T10:30:00Z"
      }
    ],
    "updates": [
      {
        "status": "verified",
        "comment": "Issue verified by admin",
        "updatedBy": {
          "_id": "507f1f77bcf86cd799439014",
          "firstName": "Admin",
          "lastName": "User"
        },
        "timestamp": "2024-01-25T11:00:00Z"
      }
    ],
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Get My Issues (Citizen)
**GET** `/issues/user/my-issues`

**Protected** - Requires citizen role

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "pages": 1,
  "issues": [...]
}
```

---

### Get Assigned Issues (Officer)
**GET** `/issues/officer/assigned`

**Protected** - Requires officer role

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "total": 12,
  "page": 1,
  "pages": 2,
  "issues": [...]
}
```

---

### Update Issue Status
**PUT** `/issues/:id/status`

**Protected** - Requires officer or admin role

**Request Body:**
```json
{
  "status": "string (required)",
  // Valid statuses: 'pending', 'verified', 'assigned', 'in_progress', 'resolved'
  "comment": "string (optional)",
  "photos": ["array of strings (optional)"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Issue status updated",
  "issue": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "resolved",
    "updates": [
      {
        "status": "resolved",
        "comment": "Issue has been fixed",
        "updatedBy": "507f1f77bcf86cd799439013",
        "timestamp": "2024-01-25T15:00:00Z"
      }
    ]
  }
}
```

---

## Announcement Endpoints

### Create Announcement
**POST** `/announcements`

**Protected** - Requires officer or admin role

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "content": "string (required)",
  "image": "string (optional, URL)",
  "department": "string (optional, department ID)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Announcement created successfully",
  "announcement": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Road Repair Update",
    "description": "Main street repairs scheduled",
    "content": "Detailed content...",
    "author": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "status": "draft",
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Get All Announcements
**GET** `/announcements`

**Public** - No authentication required

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "total": 20,
  "page": 1,
  "pages": 2,
  "announcements": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Road Repair Update",
      "description": "Main street repairs scheduled",
      "author": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "publishedAt": "2024-01-25T10:30:00Z",
      "viewCount": 150
    }
  ]
}
```

---

### Get Single Announcement
**GET** `/announcements/:id`

**Public** - No authentication required

**Success Response (200):**
```json
{
  "success": true,
  "announcement": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Road Repair Update",
    "description": "Main street repairs scheduled",
    "content": "Detailed content about road repairs...",
    "author": {
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "status": "published",
    "viewCount": 151,
    "publishedAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Update Announcement
**PUT** `/announcements/:id`

**Protected** - Requires author or admin role

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "content": "string (optional)",
  "image": "string (optional)",
  "status": "string (optional)"
}
```

---

### Delete Announcement
**DELETE** `/announcements/:id`

**Protected** - Requires author or admin role

**Success Response (200):**
```json
{
  "success": true,
  "message": "Announcement deleted successfully"
}
```

---

## User Endpoints (Admin)

### Get All Users
**GET** `/users`

**Protected** - Requires admin role

**Query Parameters:**
- `role` - Filter by role (citizen, officer, admin)
- `department` - Filter by department ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "pages": 15,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "citizen",
      "isActive": true,
      "createdAt": "2024-01-25T10:30:00Z"
    }
  ]
}
```

---

### Get User by ID
**GET** `/users/:id`

**Protected** - Requires valid JWT

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "254712345678",
    "role": "citizen",
    "isActive": true,
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

### Update User
**PUT** `/users/:id`

**Protected** - Requires user own account or admin role

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phone": "string (optional)",
  "profilePicture": "string (optional, URL)"
}
```

---

### Deactivate User
**PUT** `/users/:id/deactivate`

**Protected** - Requires admin role

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": false
  }
}
```

---

### Activate User
**PUT** `/users/:id/activate`

**Protected** - Requires admin role

**Success Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": true
  }
}
```

---

### Delete User
**DELETE** `/users/:id`

**Protected** - Requires admin role

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Should be added in production:

```javascript
// Example: 100 requests per 15 minutes per IP
const rateLimit = require('express-rate-limit');
```

---

## Version

**API Version:** 1.0.0  
**Last Updated:** January 2024

---

**For more information, see DEVELOPMENT_GUIDE.md**
