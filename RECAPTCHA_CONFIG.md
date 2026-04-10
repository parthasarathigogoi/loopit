# reCAPTCHA Configuration

## Keys

### Site Key (Frontend)
```
6LcS7rAsAAAAABFRqL5UHevgX8I5krUiYuHumIcY
```
- Used in: `index.html`
- Used for: Rendering reCAPTCHA widget in browser

### Secret Key (Backend)
```
6LcS7rAsAAAAAJYWwuDrUjr9DCHauOYs5dUckAbG
```
- Stored in: `.env.local` (frontend) and `backend/.env.recaptcha`
- Used for: Server-side verification of reCAPTCHA tokens
- ⚠️ Keep this secret! Never expose in frontend code

## Files Updated

1. **index.html** - Updated with new site key for reCAPTCHA Enterprise script
2. **.env.local** - Frontend environment variables (includes Site Key)
3. **backend/.env.recaptcha** - Backend environment variables (includes Secret Key)

## Usage

### Frontend
The reCAPTCHA script is automatically loaded in `index.html`. Firebase Auth uses it for phone authentication.

### Backend (If needed)
To verify reCAPTCHA tokens on the server, use the secret key from `.env.recaptcha`.

## Security Notes
- Site Key is public (safe to expose in HTML)
- Secret Key is private (never commit unencrypted)
- Add `.env.local` to `.gitignore`
- Add `backend/.env.recaptcha` to `.gitignore`
