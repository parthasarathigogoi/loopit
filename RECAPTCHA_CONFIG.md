# Firebase reCAPTCHA Configuration

## Using Firebase Auth's Built-in reCAPTCHA

This project uses **Firebase Auth's RecaptchaVerifier** for reCAPTCHA protection on phone authentication. No external Google reCAPTCHA configuration is needed.

## How It Works

1. **Frontend (`phoneAuth.ts`):**
   ```typescript
   import { RecaptchaVerifier } from 'firebase/auth';
   
   window.recaptchaVerifier = new RecaptchaVerifier(
     auth,
     'recaptcha-container',
     { size: 'invisible' }
   );
   ```

2. **HTML Container:**
   ```html
   <div id="recaptcha-container"></div>
   ```

3. **Phone Authentication:**
   - RecaptchaVerifier automatically handles reCAPTCHA validation
   - No secret key needed on backend
   - Firebase handles all verification

## Files

- `index.html` - Contains the reCAPTCHA container div
- `src/services/phoneAuth.ts` - Firebase reCAPTCHA setup
- `src/pages/PhoneLogin.tsx` - Uses phone auth with reCAPTCHA

## Requirements

- Firebase Auth enabled in Firebase Console
- reCAPTCHA enabled in Authentication > Sign-in method > Phone
- Internet connection for reCAPTCHA to load

## No External Keys Needed

Firebase handles everything internally. No Google reCAPTCHA Enterprise keys required.

