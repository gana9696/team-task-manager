const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth');

const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  addMember,
  removeMember,
  deleteProject
} = require('../controllers/projectController');

// Routes
router.get('/', protect, getProjects);
router.post('/', protect, adminOnly, createProject);
router.get('/:id', protect, getProject);
router.put('/:id', protect, adminOnly, updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);
router.post('/:id/members', protect, adminOnly, addMember);
router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

module.exports = router;