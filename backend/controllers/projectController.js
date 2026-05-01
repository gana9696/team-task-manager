const Project = require('../models/Project');
const User = require('../models/User');

// ✅ GET ALL PROJECTS
exports.getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.find({ admin: req.user._id })
        .populate('members.user', 'name email')
        .populate('admin', 'name email');
    } else {
      projects = await Project.find({
        members: {
          $elemMatch: { user: req.user._id }
        }
      })
        .populate('members.user', 'name email')
        .populate('admin', 'name email');
    }

    res.json({ success: true, projects });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET SINGLE PROJECT
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email role')
      .populate('admin', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name required' });
    }

    const project = await Project.create({
      name,
      description,
      deadline,
      admin: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    res.status(201).json({ success: true, project });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADD MEMBER
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const alreadyMember = project.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    project.members.push({ user: user._id, role: 'member' });
    await project.save();

    await project.populate('members.user', 'name email');

    res.json({ success: true, project });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ REMOVE MEMBER
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({ success: true, message: 'Member removed' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};