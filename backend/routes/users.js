const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllUsers, getMembers, updateRole } = require('../controllers/userController');

router.get('/', protect, adminOnly, getAllUsers);
router.get('/members', protect, getMembers);
router.put('/:id/role', protect, adminOnly, updateRole);

module.exports = router;
