# 🔧 Setting Environment Variables on Render

## The Issue
Your app is trying to connect to `localhost:6379` instead of your Upstash Redis URL because the `REDIS_URL` environment variable is not set on Render.

---

## Quick Fix Steps

### 1. Go to Render Dashboard
Visit: https://dashboard.render.com

### 2. Select Your Backend Service
Click on your `campaign-backend` service

### 3. Go to Environment Tab
Click on **"Environment"** in the left sidebar

### 4. Add REDIS_URL Variable

Click **"Add Environment Variable"** and add:

**Key**: `REDIS_URL`  
**Value**: `rediss://default:gQAAAAAAARNJAAIgcDIzYzdkMjc3NzQzZWM0MDA0YmE1OWU3NWQ4MzBmNjkxNg@tough-seal-70473.upstash.io:6379`

### 5. Save Changes
Click **"Save Changes"** - This will automatically trigger a redeploy

### 6. Repeat for Worker Service
If you have a separate worker service, repeat steps 2-5 for the worker.

---

## Complete Environment Variables for Render

### Backend Service Environment Variables:

```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/campaign_db?retryWrites=true&w=majority
MONGO_DB_NAME=campaign_db
REDIS_URL=rediss://default:gQAAAAAAARNJAAIgcDIzYzdkMjc3NzQzZWM0MDA0YmE1OWU3NWQ4MzBmNjkxNg@tough-seal-70473.upstash.io:6379
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.onrender.com
QUEUE_NAME=campaign_queue
WORKER_CONCURRENCY=5
BATCH_SIZE=500
PUBSUB_CHANNEL_PREFIX=campaign
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=200
LOG_LEVEL=info
```

### Worker Service Environment Variables:

```env
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/campaign_db?retryWrites=true&w=majority
MONGO_DB_NAME=campaign_db
REDIS_URL=rediss://default:gQAAAAAAARNJAAIgcDIzYzdkMjc3NzQzZWM0MDA0YmE1OWU3NWQ4MzBmNjkxNg@tough-seal-70473.upstash.io:6379
QUEUE_NAME=campaign_queue
WORKER_CONCURRENCY=5
PUBSUB_CHANNEL_PREFIX=campaign
NODE_ENV=production
MAX_MESSAGE_RETRIES=3
```

### Frontend Service Environment Variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Verify Connection

After redeployment, check the logs. You should see:

```
[Redis] Connecting to: Cloud Redis (TLS)
[Redis] TLS enabled: true
[Redis] ✓ Client connected successfully
[Redis] ✓ Client ready
[Redis] ✓ Subscriber connected
[Redis] ✓ Publisher connected
```

Instead of:
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

---

## Alternative: Use Render's Redis

If you prefer to use Render's managed Redis instead of Upstash:

1. **Create Redis Instance on Render**:
   - Dashboard → New → Redis
   - Choose plan (Free or Starter)
   - Note the **Internal Redis URL**

2. **Use Internal URL**:
   ```env
   REDIS_URL=redis://red-xxxxx:6379
   ```

3. **Benefits**:
   - Lower latency (same datacenter)
   - No external dependencies
   - Simpler setup

---

## Troubleshooting

### Still seeing localhost:6379?
1. Check environment variable is saved
2. Trigger manual redeploy
3. Check logs for `[Redis] Current URL:` to see what URL is being used

### Connection timeout?
1. Verify Upstash Redis is active
2. Check Upstash dashboard for connection limits
3. Try Render's Redis instead

### TLS errors?
The code now handles TLS automatically for `rediss://` URLs. If you still see errors:
1. Verify the URL starts with `rediss://` (with double 's')
2. Check Upstash dashboard for correct URL

---

## Next Steps

1. ✅ Add `REDIS_URL` to Backend service
2. ✅ Add `REDIS_URL` to Worker service  
3. ✅ Save and wait for redeploy
4. ✅ Check logs for successful connection
5. ✅ Test your application

---

## Need Help?

If you're still having issues:
1. Check Render logs for the exact error
2. Verify all environment variables are set
3. Try using Render's managed Redis
4. Contact Render support or check their docs
