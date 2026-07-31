const Batch = require('../models/Batch');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get all batches with aggregated student counts
// @route   GET /api/batches
// @access  Protected
exports.getAllBatches = async (req, res, next) => {
  try {
    let batches = await Batch.find()
      .populate('advisor', 'name email role department')
      .sort({ name: 1 });

    const adminUser = await User.findOne({ role: 'admin' });
    const instructorUsers = await User.find({ role: 'instructor' });

    // Auto-seed default batches if collection is empty
    if (batches.length === 0 && adminUser) {
      const defaultBatches = [
        {
          name: 'Batch 2024',
          academicYear: '2020 - 2024',
          department: 'Computer Science',
          advisor: instructorUsers[0]?._id || null,
          status: 'Active',
          createdBy: adminUser._id,
        },
        {
          name: 'Batch 2025',
          academicYear: '2021 - 2025',
          department: 'Information Technology',
          advisor: instructorUsers[1]?._id || null,
          status: 'Active',
          createdBy: adminUser._id,
        },
        {
          name: 'Batch 2026',
          academicYear: '2022 - 2026',
          department: 'Computer Science',
          advisor: instructorUsers[0]?._id || null,
          status: 'Active',
          createdBy: adminUser._id,
        },
        {
          name: 'Batch 2027',
          academicYear: '2023 - 2027',
          department: 'Simulation Engineering',
          advisor: instructorUsers[2]?._id || null,
          status: 'Upcoming',
          createdBy: adminUser._id,
        },
      ];

      await Batch.insertMany(defaultBatches);
      batches = await Batch.find()
        .populate('advisor', 'name email role department')
        .sort({ name: 1 });
    }

    const allStudents = await User.find({ role: 'student' }).select('batch department');

    const batchesWithMetrics = batches.map((b) => {
      const bObj = b.toObject();
      const count = allStudents.filter((s) => {
        if (!s.batch) return false;
        return (
          s.batch.toString().trim().toLowerCase() === b.name.toString().trim().toLowerCase() ||
          s.batch.toString().trim() === b.name.replace('Batch ', '').trim()
        );
      }).length;

      return {
        ...bObj,
        studentCount: count,
      };
    });

    res.status(200).json({
      status: 'success',
      results: batchesWithMetrics.length,
      data: {
        batches: batchesWithMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Admin
exports.createBatch = async (req, res, next) => {
  try {
    const { name, academicYear, department, advisor, status } = req.body;

    const existing = await Batch.findOne({ name });
    if (existing) {
      return next(new AppError('Batch name already exists', 400));
    }

    const batch = await Batch.create({
      name,
      academicYear,
      department: department || 'Computer Science',
      advisor: advisor || null,
      status: status || 'Active',
      createdBy: req.user._id,
    });

    const populatedBatch = await Batch.findById(batch._id).populate('advisor', 'name email role');

    res.status(201).json({
      status: 'success',
      data: {
        batch: populatedBatch,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch by ID
// @route   PUT /api/batches/:id
// @access  Admin
exports.updateBatch = async (req, res, next) => {
  try {
    const { name, academicYear, department, advisor, status } = req.body;

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return next(new AppError('Batch not found', 404));
    }

    if (name && name !== batch.name) {
      const nameExists = await Batch.findOne({ name });
      if (nameExists) {
        return next(new AppError('Batch name already exists', 400));
      }
      batch.name = name;
    }

    if (academicYear) batch.academicYear = academicYear;
    if (department) batch.department = department;
    if (advisor !== undefined) batch.advisor = advisor || null;
    if (status) batch.status = status;

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id).populate('advisor', 'name email role');

    res.status(200).json({
      status: 'success',
      message: 'Batch updated successfully',
      data: {
        batch: updatedBatch,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete batch by ID
// @route   DELETE /api/batches/:id
// @access  Admin
exports.deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return next(new AppError('Batch not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
