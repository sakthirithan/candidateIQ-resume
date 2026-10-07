const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables explicitly from server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiTestRoutes = require('./routes/aiTestRoutes');
const mockInterviewRoutes = require('./routes/mockInterviewRoutes');
const improvementActivityRoutes = require('./routes/improvementActivityRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/mock-interviews', mockInterviewRoutes);
app.use('/api', improvementActivityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiTestRoutes);

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'AI Candidate Profiling Platform API',
    databaseConnected: getDBStatus(),
    timestamp: new Date().toISOString()
  });
});

// Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Backend API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

module.exports = app;
