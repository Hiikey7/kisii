# Testing Guide - Field Officer Management

## 📋 Test Scenarios & Procedures

### Part 1: Backend API Testing

#### Test 1.1: Create a Field Officer
**Objective**: Verify admin can create officers

**Prerequisites**:
- Admin user exists and logged in
- Department exists in database

**Steps**:
1. Send POST request to `/api/admin/users/create`
2. Include admin authorization token
3. Send officer details with role="officer"

**Request**:
```bash
curl -X POST http://localhost:3001/api/admin/users/create \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@county.gov",
    "phone": "0712345678",
    "role": "officer",
    "department": "dept_id_here"
  }'
```

**Expected Results**:
- ✓ HTTP 201 Created
- ✓ User object returned
- ✓ Email sent with credentials
- ✓ canCreateAnnouncement: false (default)

**Success Criteria**:
```json
{
  "success": true,
  "message": "User created successfully. Credentials sent to email.",
  "user": {
    "id": "new_id",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@county.gov",
    "role": "officer"
  }
}
```

---

#### Test 1.2: Get Officers with Permissions
**Objective**: Retrieve officers list with permission details

**Prerequisites**:
- At least 2 officers created
- Admin logged in

**Steps**:
1. Send GET request to `/api/admin/officers/with-permissions`
2. Include optional filters (page, limit, canCreateAnnouncement)

**Request**:
```bash
curl -X GET "http://localhost:3001/api/admin/officers/with-permissions?page=1&limit=20" \
  -H "Authorization: Bearer admin_token_here"
```

**Expected Results**:
- ✓ HTTP 200 OK
- ✓ Officers array returned
- ✓ Each officer has canCreateAnnouncement field
- ✓ Pagination info included

**Success Criteria**:
```json
{
  "success": true,
  "total": 2,
  "page": 1,
  "pages": 1,
  "officers": [
    {
      "_id": "officer_id_1",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice@county.gov",
      "phone": "0712345678",
      "canCreateAnnouncement": false,
      "isActive": true,
      "department": {
        "_id": "dept_id",
        "name": "Health"
      }
    }
  ]
}
```

---

#### Test 1.3: Toggle Announcement Permission
**Objective**: Enable/disable announcement creation for officer

**Prerequisites**:
- Officer exists with canCreateAnnouncement: false
- Admin logged in

**Steps**:
1. Send PUT request to `/api/admin/officers/{officer_id}/announcement-permission`
2. Include officer ID in URL
3. Send canCreateAnnouncement: true

**Request**:
```bash
curl -X PUT http://localhost:3001/api/admin/officers/officer_id_here/announcement-permission \
  -H "Authorization: Bearer admin_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "canCreateAnnouncement": true
  }'
```

**Expected Results**:
- ✓ HTTP 200 OK
- ✓ Officer updated
- ✓ Email sent to officer
- ✓ canCreateAnnouncement changed to true

**Success Criteria**:
```json
{
  "success": true,
  "message": "Officer announcement permission enabled successfully",
  "user": {
    "id": "officer_id",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@county.gov",
    "role": "officer",
    "canCreateAnnouncement": true
  }
}
```

---

#### Test 1.4: Announcement Creation - With Permission
**Objective**: Officer with permission can create announcement

**Prerequisites**:
- Officer exists with canCreateAnnouncement: true
- Officer logged in

**Steps**:
1. Login as officer
2. Send POST request to `/api/announcements`
3. Include announcement details

**Request**:
```bash
curl -X POST http://localhost:3001/api/announcements \
  -H "Authorization: Bearer officer_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Health Initiative",
    "description": "New health program",
    "content": "Details about health program...",
    "visibleTo": "all"
  }'
```

**Expected Results**:
- ✓ HTTP 201 Created
- ✓ Announcement published
- ✓ Status set to "published"
- ✓ Timestamp recorded

---

#### Test 1.5: Announcement Creation - Without Permission
**Objective**: Officer without permission cannot create announcement

**Prerequisites**:
- Officer exists with canCreateAnnouncement: false
- Officer logged in

**Steps**:
1. Login as officer without permission
2. Attempt to create announcement

**Request**:
```bash
curl -X POST http://localhost:3001/api/announcements \
  -H "Authorization: Bearer officer_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test",
    "content": "Test"
  }'
```

**Expected Results**:
- ✓ HTTP 403 Forbidden
- ✓ Clear error message

**Success Criteria**:
```json
{
  "success": false,
  "message": "You do not have permission to create announcements. Please contact the administration."
}
```

---

### Part 2: Frontend Component Testing

#### Test 2.1: Officer Management Page Load
**Objective**: Page loads correctly with admin login

**Steps**:
1. Login as admin
2. Navigate to `/admin/officers`
3. Wait for data to load

**Expected Results**:
- ✓ Page header displays
- ✓ Officers list loads
- ✓ Search and filter visible
- ✓ Create button visible
- ✓ No console errors

---

#### Test 2.2: Create Officer Modal
**Objective**: Modal opens and form works

**Steps**:
1. On Officer Management page
2. Click "➕ Create New Officer"
3. Fill in form fields
4. Select department from dropdown
5. Check "Allow announcements" checkbox
6. Click "Create Officer"

**Expected Results**:
- ✓ Modal opens with smooth animation
- ✓ Department dropdown populated
- ✓ Form validation works
- ✓ Success message displays
- ✓ New officer appears in list

---

#### Test 2.3: Search Functionality
**Objective**: Search filters officers correctly

**Steps**:
1. On Officer Management page
2. Type officer name in search box
3. Observe list updates
4. Clear search
5. Search by email

**Expected Results**:
- ✓ List filters in real-time
- ✓ Only matching officers shown
- ✓ Case-insensitive search works
- ✓ Partial name matching works

---

#### Test 2.4: Permission Filter
**Objective**: Filter buttons work correctly

**Steps**:
1. On Officer Management page
2. Click "✓ Announcement Enabled"
3. Observe list shows only enabled
4. Click "✕ Announcement Disabled"
5. Observe list shows only disabled
6. Click "All Officers"

**Expected Results**:
- ✓ Filters apply correctly
- ✓ Active filter button highlighted
- ✓ List updates immediately
- ✓ Badge colors correct

---

#### Test 2.5: Permission Toggle Modal
**Objective**: Officer permission management modal works

**Steps**:
1. On Officer Management page
2. Click "📝 Manage" on officer card
3. Modal opens
4. Click "Enable Announcement Permission" button
5. Observe success message
6. Close modal
7. Verify officer status updated in list

**Expected Results**:
- ✓ Modal displays officer details
- ✓ Permission button correct color
- ✓ Click toggles permission
- ✓ Success message shows
- ✓ List updated
- ✓ Officer notified via email

---

#### Test 2.6: Officer Deactivation
**Objective**: Officers can be deactivated

**Steps**:
1. Click "📝 Manage" on officer
2. Scroll to "Account Status" section
3. Click "Deactivate Officer"
4. Confirm action
5. Check list (should still show but status changed)

**Expected Results**:
- ✓ Confirmation dialog appears
- ✓ Officer deactivated
- ✓ Status badge updates to "Inactive"
- ✓ Officer cannot log in

---

#### Test 2.7: Admin Dashboard Integration
**Objective**: Officers tab in admin dashboard works

**Steps**:
1. Login as admin
2. Go to Admin Dashboard
3. Click "👮 Field Officers" tab
4. Verify officer stats
5. Verify officer cards display
6. Click "Create New Officer" button

**Expected Results**:
- ✓ Tab loads correctly
- ✓ Statistics accurate
- ✓ Officer cards display
- ✓ Permission badges visible
- ✓ Create button works

---

### Part 3: User Workflow Testing

#### Test 3.1: Complete Officer Creation and Permission Flow
**Objective**: Full workflow from creation to announcement

**Steps**:

**Step 1: Admin Creates Officer**
1. Login as admin
2. Go to Officer Management
3. Create new officer
4. Verify email received
5. ✓ Check: Officer appears in list with disabled permission

**Step 2: Officer Logs In**
1. Officer opens email
2. Notes credentials
3. Logs in at login page
4. Changes temporary password
5. ✓ Check: Access to Officer Dashboard

**Step 3: Officer Attempts Announcement (Disabled)**
1. Officer goes to announcements section
2. Clicks "Create Announcement"
3. Sees error or button disabled
4. ✓ Check: Error message clear

**Step 4: Admin Enables Permission**
1. Admin opens Officer Management
2. Finds officer in list
3. Clicks "📝 Manage"
4. Clicks "Enable Announcement Permission"
5. ✓ Check: Success message
6. ✓ Check: Officer receives email

**Step 5: Officer Creates Announcement**
1. Officer checks email (optional notification)
2. Logs in to Officer Dashboard
3. Clicks "Create Announcement"
4. Fills form (title, description, content)
5. Selects visibility
6. Clicks "Publish"
7. ✓ Check: Announcement published
8. ✓ Check: Announcement visible to citizens

**Step 6: Citizen Views Announcement**
1. Citizen logs in
2. Goes to announcements
3. Sees officer's announcement
4. ✓ Check: Announcement displays correctly
5. ✓ Check: Officer name shows

---

#### Test 3.2: Permission Revocation Flow
**Objective**: Admin can disable officer announcements

**Steps**:

**Step 1: Officer Has Permission**
1. Officer with enabled permission exists
2. ✓ Check: Can create announcements

**Step 2: Admin Disables Permission**
1. Admin goes to Officer Management
2. Finds officer
3. Clicks "📝 Manage"
4. Toggles to disable
5. ✓ Check: Email sent

**Step 3: Officer Notified**
1. Officer receives email
2. ✓ Check: Email says permission disabled

**Step 4: Officer Cannot Create**
1. Officer tries to create announcement
2. ✓ Check: Receives error or disabled button
3. ✓ Check: Existing announcements still visible

---

### Part 4: Edge Cases & Error Handling

#### Test 4.1: Invalid Email on Officer Creation
**Scenario**: Duplicate email

**Steps**:
1. Create officer with email
2. Try to create another with same email
3. ✓ Expected: Error "Email already registered"

---

#### Test 4.2: Missing Required Fields
**Scenario**: Submit form without required data

**Steps**:
1. Open create officer modal
2. Leave first name empty
3. Click "Create Officer"
4. ✓ Expected: Validation error

---

#### Test 4.3: Non-Admin Access to Officer Management
**Scenario**: Non-admin tries to access officer management

**Steps**:
1. Login as officer/citizen
2. Try to navigate to `/admin/officers`
3. ✓ Expected: Redirect to login

---

#### Test 4.4: Invalid Officer ID
**Scenario**: Try to manage non-existent officer

**Steps**:
1. Modify URL with fake officer ID
2. Navigate
3. ✓ Expected: Error or 404 response

---

### Part 5: Mobile & Responsive Testing

#### Test 5.1: Mobile View (375px width)
**Steps**:
1. Open DevTools
2. Set viewport to iPhone 12 (375x812)
3. Navigate to Officer Management
4. ✓ Check: No horizontal scroll
5. ✓ Check: All buttons accessible
6. ✓ Check: Text readable
7. ✓ Check: Modals fit screen
8. ✓ Check: Touch-friendly buttons

---

#### Test 5.2: Tablet View (768px width)
**Steps**:
1. Set viewport to iPad (768x1024)
2. Open Officer Management
3. ✓ Check: Proper spacing
4. ✓ Check: Grid layout works
5. ✓ Check: Table scrollable if needed

---

### Part 6: Performance Testing

#### Test 6.1: Load 100 Officers
**Objective**: Page performance with many officers

**Steps**:
1. Create 100+ officers in database
2. Load Officer Management page
3. ✓ Check: Page loads < 3 seconds
4. ✓ Check: No lag on scroll
5. ✓ Check: Search responsive

---

#### Test 6.2: Search Performance
**Objective**: Search is fast

**Steps**:
1. Type in search box
2. ✓ Check: Results update < 200ms

---

### Part 7: Browser Compatibility

| Browser | Test | Pass |
|---------|------|------|
| Chrome 120+ | Full functionality | ✓ |
| Firefox 121+ | Full functionality | ✓ |
| Safari 17+ | Full functionality | ✓ |
| Edge 120+ | Full functionality | ✓ |

---

## 🧪 Test Data Setup

### Database Seeding Script
```javascript
// Create test data
const testOfficers = [
  {
    firstName: "Test",
    lastName: "Officer1",
    email: "test.officer1@localhost.test",
    phone: "+254700000001",
    role: "officer",
    department: dept_id,
    canCreateAnnouncement: false,
    password: "hashed_password"
  },
  {
    firstName: "Test",
    lastName: "Officer2",
    email: "test.officer2@localhost.test",
    phone: "+254700000002",
    role: "officer",
    department: dept_id,
    canCreateAnnouncement: true,
    password: "hashed_password"
  }
];

db.users.insertMany(testOfficers);
```

---

## ✅ Test Checklist

### Backend
- [ ] Create officer endpoint works
- [ ] Officers list retrieval works
- [ ] Permission toggle works
- [ ] Permission enforcement in announcements
- [ ] Email notifications sent
- [ ] Validation errors returned
- [ ] Authorization checks work
- [ ] Database updates correctly

### Frontend
- [ ] Component loads
- [ ] Officers display
- [ ] Create modal works
- [ ] Permission modal works
- [ ] Search filters correctly
- [ ] Permission filter works
- [ ] Modals open/close smoothly
- [ ] Success messages display
- [ ] Error messages display
- [ ] Admin dashboard integration works

### User Workflows
- [ ] Full officer creation flow
- [ ] Permission enabled announcement creation
- [ ] Permission disabled prevents announcement
- [ ] Admin can toggle permission
- [ ] Officer deactivation works
- [ ] Email notifications sent
- [ ] Citizen views announcements

### Edge Cases
- [ ] Duplicate email error
- [ ] Missing fields error
- [ ] Non-admin blocked
- [ ] Invalid officer ID
- [ ] Wrong password error
- [ ] Session timeout handled

### Mobile/Responsive
- [ ] Mobile view (375px)
- [ ] Tablet view (768px)
- [ ] Desktop view (1920px)
- [ ] Touch interactions work
- [ ] No horizontal scroll on mobile
- [ ] All buttons accessible

### Performance
- [ ] Page loads < 3 seconds
- [ ] Search responsive
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] No console errors

### Security
- [ ] Only admin can manage officers
- [ ] Only officers can create announcements (if enabled)
- [ ] Tokens validated
- [ ] CORS working
- [ ] Input validated
- [ ] XSS prevented

---

## 📊 Test Report Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]
Browser: [Browser/Version]

Test Results:
✓ Tests Passed: [Number]
✗ Tests Failed: [Number]
⚠ Issues Found: [Number]

Issues:
1. [Issue description]
   - Severity: [Low/Medium/High]
   - Status: [Open/Fixed]

Sign-off: [Tester Name] - [Date]
```

---

## 🎯 Success Criteria

All tests must pass for production deployment:
- ✓ 100% backend API tests pass
- ✓ 100% frontend component tests pass
- ✓ 100% workflow tests pass
- ✓ 0 security issues
- ✓ 0 critical bugs
- ✓ Performance acceptable
- ✓ Mobile responsive
- ✓ Cross-browser compatible

---

**Test Status**: Ready for execution  
**Last Updated**: January 28, 2026
