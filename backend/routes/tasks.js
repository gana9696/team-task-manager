const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth');

const {
  getTasks,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  getDashboardStats   // ✅ FIX: add this
} = require('../controllers/taskController');

// ✅ IMPORTANT: specific routes first
router.get('/dashboard', protect, getDashboardStats);
router.get('/my', protect, getMyTasks);

// ✅ normal routes
router.get('/', protect, getTasks);
router.post('/', protect, adminOnly, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);
router.post('/:id/submit', protect, submitTask);

module.exports = router;