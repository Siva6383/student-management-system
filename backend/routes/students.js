const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all students
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('marks.subject', 'name code maxMarks')
      .populate('createdBy', 'name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('marks.subject', 'name code maxMarks')
      .populate('createdBy', 'name email');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students
// @desc    Create student
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, rollNo, email, dob, marks } = req.body;

    // Check if student with rollNo or email already exists
    const studentExists = await Student.findOne({ 
      $or: [{ rollNo }, { email }] 
    });

    if (studentExists) {
      return res.status(400).json({ 
        message: 'Student with this Roll No or Email already exists' 
      });
    }

    const student = await Student.create({
      name,
      rollNo,
      email,
      dob,
      marks: marks || [],
      createdBy: req.admin._id
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('marks.subject', 'name code maxMarks');

    res.status(201).json(populatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { name, rollNo, email, dob, marks } = req.body;

    student.name = name || student.name;
    student.rollNo = rollNo || student.rollNo;
    student.email = email || student.email;
    student.dob = dob || student.dob;
    
    if (marks) {
      student.marks = marks;
    }

    const updatedStudent = await student.save();
    
    const populatedStudent = await Student.findById(updatedStudent._id)
      .populate('marks.subject', 'name code maxMarks');

    res.json(populatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id/marks
// @desc    Update student marks
// @access  Private
router.put('/:id/marks', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { marks } = req.body;
    student.marks = marks;

    const updatedStudent = await student.save();
    
    const populatedStudent = await Student.findById(updatedStudent._id)
      .populate('marks.subject', 'name code maxMarks');

    res.json(populatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;