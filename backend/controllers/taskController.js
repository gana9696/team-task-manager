const Task = require('../models/Task');

// ✅ GET ALL TASKS (ADMIN)
exports.getTasks = async (req, res) => {
  try {
    let query = {};

    // 🔥 Project filter
    if (req.query.projectId) {
      query.project = req.query.projectId;
    }

    // 🔥 MEMBER → only own tasks
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    res.json({ success: true, tasks });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET MY TASKS (MEMBER ONLY)
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id   // 🔥 MAIN FIX
    })
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    res.json({ success: true, tasks });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      priority,
      deadline,
      status: 'todo'
    });

    res.status(201).json({ success: true, task });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ success: true, task });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ SUBMIT TASK
exports.submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // 🔥 FIX 1: check assignedTo exists
    if (!task.assignedTo) {
      return res.status(400).json({ success: false, message: 'Task is not assigned to anyone' });
    }

    // 🔥 FIX 2: safe compare
    if (String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit this task' });
    }

    // 🔥 FIX 3: status check
    if (task.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Task must be in progress to submit' });
    }

    // 🔥 UPDATE
    task.status = 'review';
    task.submissionNote = req.body.submissionNote || '';
    task.submittedAt = new Date();

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    res.json({ success: true, task: updatedTask });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query);

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== 'completed'
      ).length,
    };

    res.json({ success: true, stats });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};