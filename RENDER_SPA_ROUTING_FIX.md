# 🔄 Fix: Hard Refresh Calls Frontend URL Instead of Backend

## The Problem

- **Initial load**: Works perfectly, calls backend API ✅
- **Hard refresh (F5)**: Calls frontend URL instead of backend ❌

This happens because Render doesn't know how to handle SPA (Single Page Application) routing.

---

## The Solution: Add `_redirects` File

The `_redirects` file tells Render to serve `index.html` for all routes, which is required for React Router to work properly.

### What We Added:

**File**: `frontend/public/_redirects`
```
/*    /index.html   200
```

This means: "For any route (`/*`), serve `index.html` with a 200 status code"

---

## How It Works

### Without `_redirects`:
1. User visits `/contacts`
2. Render looks for `/contacts` file → Not found
3. Returns 404 or serves wrong content
4. React Router doesn't initialize properly
5. API calls use relative paths → calls frontend URL ❌

### With `_redirects`:
1. User visits `/contacts`
2. Render serves `index.html` (because of redirect rule)
3. React app loads
4. React Router handles `/contacts` route
5. API calls use configured backend URL ✅

---

## Deploy the Fix

### Step 1: Commit and Push

```bash
git add frontend/public/_redirects frontend/vite.config.js
git commit -m "fix: Add _redirects file for SPA routing on Render"
git push origin main
```

### Step 2: Verify on Render

1. Go to your Frontend service on Render
2. Wait for automatic deployment
3. Check logs for successful build

### Step 3: Test

1. Visit your frontend URL
2. Navigate to `/contacts` or any route
3. **Hard refresh (Ctrl+R or F5)**
4. Check browser console - should still call backend API
5. Check Network tab - API calls should go to backend URL

---

## Verify It's Working

### Browser Console Should Show:
```
[API] Base URL: https://reelocampaings-backend.onrender.com/api/v1
[Socket] Connecting to: https://reelocampaings-backend.onrender.com
```

### Network Tab Should Show:
```
GET https://reelocampaings-backend.onrender.com/api/v1/contacts
```

**NOT**:
```
GET https://reelocampaings-frontend.onrender.com/contacts
```

---

## Alternative: Render Dashboard Configuration

If `_redirects` doesn't work, you can also configure it in Render dashboard:

1. Go to Frontend service → **Settings**
2. Scroll to **"Redirects/Rewrites"** section
3. Add rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: `rewrite`
   - **Status**: `200`

---

## Common Issues

### Issue: Still calling frontend URL after hard refresh
**Solution**:
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Verify `_redirects` file is in `frontend/public/` folder
3. Check Render build logs - should see `_redirects` being copied to dist
4. Try incognito/private window

### Issue: 404 on routes
**Solution**:
- Verify `_redirects` file has correct content (no extra spaces)
- Check it's in `public` folder, not root
- Redeploy with "Clear build cache"

### Issue: Works on homepage but not on other routes
**Solution**:
- This confirms `_redirects` is not working
- Double-check file location: `frontend/public/_redirects`
- Ensure no typos in filename (no extension, just `_redirects`)

---

## Why This Happens

React Router uses **client-side routing**:
- Routes like `/contacts`, `/campaigns` don't exist as actual files
- They're handled by JavaScript in the browser
- When you hard refresh, the browser asks the server for that specific path
- Without `_redirects`, server returns 404 or wrong content
- With `_redirects`, server always returns `index.html`, letting React Router handle it

---

## Files Changed

1. ✅ `frontend/public/_redirects` - SPA routing configuration
2. ✅ `frontend/vite.config.js` - Ensures public folder is copied to dist

---

## Next Steps

1. ✅ Commit and push changes
2. ✅ Wait for Render deployment
3. ✅ Test hard refresh on all routes
4. ✅ Verify API calls in Network tab
5. ✅ Clear browser cache if needed

Your app should now work perfectly even after hard refresh! 🎉
