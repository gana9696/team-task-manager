const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// ================= ROUTES =================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));

// ================= HEALTH =================
app.get('/api/health', (req, res) => {
  res.send("OK");
});

// ================= ROOT =================
app.get('/', (req, res) => {
  res.send("🚀 Team Task Manager API is running...");
});

// ================= PORT (STRICT FOR RAILWAY) =================
const PORT = process.env.PORT || 3000;



// ================= DATABASE + SERVER =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });