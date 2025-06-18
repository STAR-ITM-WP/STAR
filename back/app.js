const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

const reservationRoutes = require('./routes/reservationRoutes');

const timetableRoutes = require('./routes/timetableRoutes');

const buildingRoutes = require('./routes/buildingRoutes');

const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();


// Middleware
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
//   }));
app.use(cors({
    origin: 'https://star-client-brown.vercel.app',  // 프론트 주소
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('STAR backend server is running!');
});


module.exports = app;