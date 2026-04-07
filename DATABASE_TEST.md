# Firebase Database Connection Test Guide

## 🔍 Testing Your Firebase Connection

Since Node.js doesn't have direct browser access for Firebase Auth, you can test in these ways:

### **Option 1: Test via Browser Console (Recommended)**

1. **Open the app**: Visit `http://localhost:5174`
2. **Open Browser Console**: Press `F12` or `Cmd+Option+J` (Mac)
3. **Run the test**:
   ```javascript
   import { runDatabaseTests } from './testDatabase.ts';
   runDatabaseTests();
   ```

Or use the test through the UI:
1. Sign up with an email
2. Create a product listing
3. Check if product appears in the database

### **Option 2: Add Test Button to App (Temporary)**

Add this to your `src/App.tsx` during development:

```tsx
import { runDatabaseTests } from './testDatabase';

// In your component:
<button onClick={runDatabaseTests}>
  🧪 Test Firebase
</button>
```

### **Option 3: Check Firestore Console Directly**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **loopit-572b5** project
3. Navigate to **Firestore Database**
4. Check the `products` collection for any documents

---

## 📋 What the Test Does

✅ **Authentication Tests:**
- Creates a new test user (signup)
- Logs in with the test user
- Logs out the user
- Verifies session management

✅ **Database Tests:**
- Creates a test product document
- Reads all products from Firestore
- Deletes the test product (cleanup)

✅ **Error Handling:**
- Reports network errors
- Shows permission issues
- Provides helpful tips

---

## ⚠️ Common Issues & Solutions

### **Issue: `permission-denied` Error**

**Cause:** Firestore security rules are too restrictive.

**Solution:**
1. Go to Firebase Console → Firestore → Rules
2. Replace with these rules (for testing):

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

3. Click "Publish"

### **Issue: `auth/network-request-failed` (Node.js)**

**Cause:** Node.js doesn't have browser context for Firebase Auth.

**Solution:** Run tests in browser console or use UI interactions instead.

### **Issue: `auth/email-already-in-use`**

**Cause:** Test email was already created.

**Solution:** The test creates unique emails with timestamps, so this is rare. Just run again.

---

## ✅ Success Indicators

After running the test, you should see:
- ✅ User registration successful
- ✅ Document created in Firestore
- ✅ Document read from Firestore
- ✅ Document cleanup completed
- ✅ User login successful
- ✅ All tests passed message

---

## 📊 Quick Verification

After signup/login on the app:

1. **Open Firebase Console**
2. **Go to Firestore Database**
3. **Check `users` collection** → Should have your user doc
4. **Create a product listing** → Check `products` collection
5. **Verify images upload** → Go to Storage → Check for files

---

## 🚀 Ready for Deployment?

When all tests pass:
- ✅ Push changes to GitHub
- ✅ Deploy frontend to Vercel
- ✅ Configure environment variables
- ✅ Update API endpoints if needed
