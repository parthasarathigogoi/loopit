# Firebase Storage - Image Upload Setup Guide

## 🔧 How to Fix Image Upload Issues

Your image upload can fail due to **Firebase Storage security rules**. Here's how to fix it:

## ✅ Step 1: Open Firebase Console

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Select your project: **loopit-572b5**
3. Click **Storage** in left sidebar (not Firestore - Storage!)
4. Click **Rules** tab at the top

## ✅ Step 2: Update Storage Security Rules

Replace everything in the Rules editor with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read images
    match /products/{allPaths=**} {
      allow read;
      allow write: if request.auth != null && 
                      request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

## ✅ Step 3: Publish the Rules

1. Click **Publish** button (blue button in top right)
2. Wait for "Rules updated successfully" message
3. Done! ✅

## 📝 What These Rules Do

- **`allow read`** - Anyone can view images (no auth needed)
- **`allow write: if request.auth != null`** - Only logged-in users can upload
- **`request.resource.size < 10 * 1024 * 1024`** - Max 10MB per image

## 🧪 Test It Now

1. Go back to your app at `localhost:5175`
2. Click "Sell Item"
3. Click "Add Photo" to select an image
4. Fill in other fields (title, category, price, location, description)
5. Click "Post Item"
6. **It should work now!** ✅

## ⚠️ Troubleshooting

### Issue: Still can't upload after updating rules
**Solution:**
1. Wait 1-2 minutes for rules to propagate
2. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Clear browser cache
4. Try uploading again

### Issue: "User not authenticated" error
**Solution:**
- Make sure you're logged in before uploading
- Try logging out and logging back in
- Check browser console (F12) for error details

### Issue: Image uploads but doesn't appear
**Solution:**
- Check browser console for errors
- Verify image file size < 10MB
- Try a different image format (JPG, PNG)

## 🔒 For Production (Extra Security)

If you want stricter security for your production deployment:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{userId}/{allPaths=**} {
      // Only owner and admins can write
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

✅ Your app is now ready for image uploads!
