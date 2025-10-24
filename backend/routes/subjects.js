const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('createdBy', 'name email');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get single subject
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Create subject
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, code, maxMarks } = req.body;

    // Check if subject code already exists
    const subjectExists = await Subject.findOne({ code });
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }

    const subject = await Subject.create({
      name,
      code,
      maxMarks,
      createdBy: req.admin._id
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, code, maxMarks } = req.body;

    subject.name = name || subject.name;
    subject.code = code || subject.code;
    subject.maxMarks = maxMarks || subject.maxMarks;

    const updatedSubject = await subject.save();
    res.json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;