# LoopIt Admin Panel - Setup Guide

## Overview
The Admin Panel allows authorized administrators to review, approve, reject, and delete user-uploaded products before they become visible to the public.

## Features

### ✅ Implemented Features
- **Protected Routes:** Only users with admin email can access `/admin`
- **Real-Time Updates:** Uses Firebase `onSnapshot` for instant product updates
- **Product Management:**
  - Approve pending products
  - Reject products
  - Delete products
- **Tab Navigation:** Filter products by status (Pending, Approved, Rejected)
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Product Visibility Control:** Regular users only see approved products

## Setup Instructions

### 1. Set Your Admin Email
Edit the `ADMIN_EMAIL` constant in `src/pages/AdminPanel.tsx`:

```typescript
// Line 22 in AdminPanel.tsx
const ADMIN_EMAIL = 'your-admin-email@loopit.com';
```

### 2. Initialize Firestore Database
Make sure you have a Firestore database set up with the following collection structure:

**Collection: `products`**
Each document should have:
```javascript
{
  title: string,           // Product name
  price: number,           // Product price
  location: string,        // Location (e.g., "Hostel C")
  image: string,          // Image URL
  userId: string,         // Firebase UID of seller
  status: string,         // 'pending', 'approved', or 'rejected'
  description: string,    // Product description
  category: string,       // Product category
  createdAt: timestamp,   // Firestore timestamp
  updatedAt: timestamp    // Firestore timestamp
}
```

### 3. Create Test Admin Account
1. Go to Firebase Console → Authentication
2. Create a new user with your admin email and password
3. Example: `admin@loopit.com` / `admin123`

### 4. Set Firestore Security Rules
Update your Firestore rules to allow proper access. Use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /products/{productId} {
      // Admins can read all products
      allow read: if request.auth.email == 'admin@loopit.com';
      
      // Regular users can only read approved products
      allow read: if request.auth != null && resource.data.status == 'approved';
      
      // Any authenticated user can create products (new products default to 'pending')
      allow create: if request.auth != null && !('status' in request.resource.data);
      
      // Only the owner or admin can update/delete their product
      allow update, delete: if request.auth.uid == resource.data.userId || request.auth.email == 'admin@loopit.com';
    }
  }
}
```

## File Structure

```
src/
├── pages/
│   └── AdminPanel.tsx           # Main admin dashboard component
├── components/
│   └── ProtectedAdminRoute.tsx  # Route protection component
└── App.tsx                      # Updated with admin route
```

## How It Works

### A. Admin Access Flow
1. User attempts to access `/admin`
2. `ProtectedAdminRoute` component checks authentication
3. Component verifies user email matches `ADMIN_EMAIL`
4. If authorized → Shows `AdminPanel`
5. If not authorized → Redirects to home page `/`

### B. Product Management Flow
1. **New Products:** Created with `status: 'pending'` (hidden from public)
2. **Admin Review:** Admin views pending products in the "Pending" tab
3. **Approval:** Click "Approve" → `status` changes to `'approved'` → Product appears in public listings
4. **Rejection:** Click "Reject" → `status` changes to `'rejected'` → Product hidden from public
5. **Deletion:** Click "Delete" → Document removed from database

### C. Visibility Rules
- **Regular Users:** Can only see products with `status === 'approved'`
- **Admins:** Can see all products in any status
- **New Products:** Default to `status: 'pending'` and are invisible to regular users

## Usage

### Access the Admin Panel
1. Sign in with your admin account email
2. Navigate to `/admin`
3. You'll immediately see the Admin Dashboard

### Review Pending Products
1. Click the "Pending" tab
2. See all products awaiting approval
3. Click "Approve" to make visible to public
4. Click "Reject" to mark as rejected
5. Click "Delete" to remove completely

### View Approved/Rejected Products
1. Click "Approved" or "Rejected" tab
2. See products in that status
3. Optionally delete products
4. Approved products are live to public users

### Expandable Product Details
- Click "Details" button on any product card
- View full product ID, seller ID, and creation date
- Helpful for tracking and debugging

## Real-Time Updates

The Admin Panel uses Firebase `onSnapshot` listeners for real-time updates:
- When another admin approves a product, your screen instantly updates
- Product counts update automatically
- No page refresh needed

## Component Details

### AdminPanel.tsx
- **Purpose:** Main dashboard and product management UI
- **Features:**
  - Tab-based filtering (Pending/Approved/Rejected)
  - Card-based product layout
  - Real-time Firestore listeners
  - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Icon badges showing product count per tab
- **Key Functions:**
  - `handleApprove()` → Updates product status to 'approved'
  - `handleReject()` → Updates product status to 'rejected'
  - `handleDelete()` → Removes product document

### ProtectedAdminRoute.tsx
- **Purpose:** Protect the `/admin` route from unauthorized access
- **Features:**
  - Firebase Auth listener
  - Email verification against `adminEmail` prop
  - Loading state while checking authentication
  - Redirects to home if unauthorized

### App.tsx
- **Updated:** Added AdminPanel import and route
- **Route Protection:** `/admin` wrapped with `ProtectedAdminRoute`
- **Navbar Hiding:** Navbar hidden on `/admin` path for cleaner UI

## Testing Checklist

- [ ] Created test admin account
- [ ] Set admin email in `AdminPanel.tsx`
- [ ] Updated Firestore security rules
- [ ] Can log in with admin account
- [ ] Can access `/admin` route
- [ ] Pending products visible in Pending tab
- [ ] Can approve a product
- [ ] Approved product appears in Listings for regular users
- [ ] Can reject a product
- [ ] Can delete a product
- [ ] Real-time updates work (open in 2 browser tabs)
- [ ] Regular users cannot access `/admin`

## Troubleshooting

### Admin Panel shows "No pending products"
- ✅ Check Firestore database → products collection
- ✅ Verify products have `status: 'pending'`
- ✅ Check Firestore security rules allow admin to read

### Cannot log in with admin email
- ✅ Verify admin account exists in Firebase Authentication
- ✅ Check email and password are correct
- ✅ Ensure `ADMIN_EMAIL` const matches exactly

### Updates not appearing in real-time
- ✅ Check Firestore connection
- ✅ Verify security rules allow reads
- ✅ Check browser console for errors
- ✅ Try hard-refresh (Cmd+Shift+R on Mac)

### Non-admin users can see admin panel
- ✅ Verify `ADMIN_EMAIL` is set correctly
- ✅ Check ProtectedAdminRoute is wrapping AdminPanel in App.tsx
- ✅ Clear localStorage and re-login
- ✅ Check browser console for auth errors

### Products still visible after rejection
- ✅ Check `fetchProducts()` in `src/api.ts` filters by `status == 'approved'`
- ✅ Verify Firestore security rules restrict visibility
- ✅ Clear browser cache and reload

## Customization

### Change Admin Email
Edit `src/pages/AdminPanel.tsx` line 22:
```typescript
const ADMIN_EMAIL = 'your-email@example.com';
```

### Allow Multiple Admins
Replace the single email check with an array:
```typescript
const ADMIN_EMAILS = ['admin1@loopit.com', 'admin2@loopit.com'];
const isAdmin = ADMIN_EMAILS.includes(user.email);
```

### Customize Card Layout
Edit the grid in `AdminPanel.tsx` line 165:
```typescript
// Change from: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
// To: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
```

### Add More Admin Features
- Analytics dashboard
- Bulk operations (approve/reject multiple)
- User management
- Sales reports
- Product statistics

## Security Notes

⚠️ **Important:** 
- Admin email is visible in frontend code (OK - it's a configuration value, not a secret)
- Firebase rules enforce actual authorization on backend
- Users cannot bypass rules through frontend tampering
- Always set proper Firestore security rules
- Consider implementing rate limiting for production
- Add audit logging for admin actions (future enhancement)

## Support

For issues or questions:
1. Check Firestore console for data integrity
2. Review browser console for JavaScript errors
3. Check Firebase emulator if testing locally
4. Verify all environment variables are set

---

**Last Updated:** April 2026
**Version:** 1.0
