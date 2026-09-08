const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./src/config/database');

dotenv.config();

// Import Middleware
const requestLogger = require('./src/middleware/logger');
const { notFoundHandler, globalErrorHandler } = require('./src/middleware/errorHandler');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const buildingRoutes = require('./src/routes/buildingRoutes');
const floorRoutes = require('./src/routes/floorRoutes');
const floorSideRoutes = require('./src/routes/floorSideRoutes');
const lectureHallRoutes = require('./src/routes/lectureHallRoutes');
const moduleRoutes = require('./src/routes/moduleRoutes');
const lecturerRoutes = require('./src/routes/lecturerRoutes');
const lectureSessionRoutes = require('./src/routes/lectureSessionRoutes');
const digitalDisplayRoutes = require('./src/routes/digitalDisplayRoutes');
const signageRoutes = require('./src/routes/signageRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ============ SYSTEM & TEST ROUTES ============

// Root route
app.get('/', (req, res) => {
    res.send('🚀 ScheduleMate Backend API is Running!');
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            success: true,
            message: '✅ Database connected successfully!',
            time: result.rows[0]
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({
            success: false,
            message: '❌ Database connection failed',
            error: err.message
        });
    }
});

// ============ API ROUTE MODULES ============

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/floor-sides', floorSideRoutes);
app.use('/api/lecture-halls', lectureHallRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/sessions', lectureSessionRoutes);
app.use('/api/displays', digitalDisplayRoutes);
app.use('/api/signage', signageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============ ERROR HANDLING MIDDLEWARE ============

app.use(notFoundHandler);
app.use(globalErrorHandler);

// ============ START SERVER ============

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🔗 http://localhost:${port}`);
});

module.exports = app;