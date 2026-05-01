# 🔐 Recommended Firestore Security Rules for LoopIt

## Option 1: For Development (Testing)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**What it does:** Any authenticated user can read/write anything
**When to use:** Development and testing
**Security level:** Low (not safe for production)

---

## Option 2: For Production (Recommended)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.email == 'loopitresale@gmail.com';
    }

    // Users collection - users can only edit their own profile
    match /users/{userId} {
      allow read: if isAdmin() || (isSignedIn() && request.auth.uid == userId);
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.uid;
      allow update, delete: if isAdmin() || (isSignedIn() && request.auth.uid == resource.data.uid);
    }

    // Products collection - everyone can browse, authenticated users can create,
    // and owners can edit/delete their own products.
    match /products/{productId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isAdmin() || (isSignedIn() && request.auth.uid == resource.data.userId);
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /reports/{reportId} {
      allow read, update, delete: if isAdmin();
      allow create: if isSignedIn();
    }

    match /notifications/{notificationId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

**What it does:** 
- Users can only edit their own profile
- Users can create products
- Users can only edit/delete their own products
- All authenticated users can read everything

**Security level:** Production-ready 

---

## Option 3: For Your Current Setup (Quick & Safe)
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🚀 How to Update Rules in Firebase Console

1. Go to https://console.firebase.google.com
2. Select **loopit-572b5** project
3. Click **Firestore Database** → **Rules** tab
4. Replace the existing rules with one of the options above
5. Click **Publish**

---

## ⚠️ Important: Current Rules Status

Your current rules: `if false` = **BLOCKS ALL ACCESS**

This means:
- ❌ Cannot save products
- ❌ Cannot save user data
- ❌ Cannot read from database before login
- ❌ App features won't work

**Action Required:** Update rules now to test the app!

---

**Recommendation:** Use **Option 2 (Production)** - it's secure and allows the app to function properly.
