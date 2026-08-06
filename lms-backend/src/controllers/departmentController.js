const Department = require('../models/Department');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get all departments with aggregated metrics (Admin / Protected)
// @route   GET /api/departments
// @access  Protected
exports.getAllDepartments = async (req, res, next) => {
  try {
    let departments = await Department.find()
      .populate('headOfDepartment', 'name email role department')
      .sort({ name: 1 });

    const adminUser = await User.findOne({ role: 'admin' });
    const instructorUsers = await User.find({ role: 'instructor' });

    // Auto-seed default departments if collection is currently empty
    if (departments.length === 0 && adminUser) {
      const defaultDepts = [
        {
          name: 'Computer Science & Engineering',
          code: 'CSE',
          description: 'Core computing, algorithms, software systems, and data structures.',
          headOfDepartment: instructorUsers[0]?._id || null,
          createdBy: adminUser._id,
        },
        {
          name: 'Information Technology',
          code: 'IT',
          description: 'Web development, database management systems, and networking.',
          headOfDepartment: instructorUsers[1]?._id || null,
          createdBy: adminUser._id,
        },
        {
          name: 'Simulation Engineering',
          code: 'SE',
          description: 'Real-time simulations, graphics engines, and algorithmic modeling.',
          headOfDepartment: instructorUsers[2]?._id || null,
          createdBy: adminUser._id,
        },
        {
          name: 'Electronics & Communication',
          code: 'ECE',
          description: 'Hardware architecture, signal processing, and embedded systems.',
          headOfDepartment: null,
          createdBy: adminUser._id,
        },
        {
          name: 'Mechanical Engineering',
          code: 'MECH',
          description: 'Robotics, physical dynamics, and computer-aided engineering.',
          headOfDepartment: null,
          createdBy: adminUser._id,
        },
      ];

      await Department.insertMany(defaultDepts);
      departments = await Department.find()
        .populate('headOfDepartment', 'name email role department')
        .sort({ name: 1 });
    }

    // Aggregate student and instructor counts for each department dynamically
    const allUsers = await User.find().select('role department');

    const departmentsWithMetrics = departments.map((dept) => {
      const deptObj = dept.toObject();

      const studentsInDept = allUsers.filter((u) => {
        if (u.role !== 'student' || !u.department) return false;
        const userDept = u.department.toLowerCase().trim();
        const dName = dept.name.toLowerCase().trim();
        const dCode = dept.code.toLowerCase().trim();
        return (
          userDept === dName ||
          userDept === dCode ||
          (dCode === 'cse' && (userDept === 'cs' || userDept === 'computer science')) ||
          (dCode === 'it' && userDept === 'information technology') ||
          (dCode === 'se' && userDept === 'simulation engineering')
        );
      }).length;

      const instructorsInDept = allUsers.filter((u) => {
        if (u.role !== 'instructor' || !u.department) return false;
        const userDept = u.department.toLowerCase().trim();
        const dName = dept.name.toLowerCase().trim();
        const dCode = dept.code.toLowerCase().trim();
        return (
          userDept === dName ||
          userDept === dCode ||
          (dCode === 'cse' && (userDept === 'cs' || userDept === 'computer science')) ||
          (dCode === 'it' && userDept === 'information technology') ||
          (dCode === 'se' && userDept === 'simulation engineering')
        );
      }).length;

      return {
        ...deptObj,
        studentCount: studentsInDept,
        instructorCount: instructorsInDept,
      };
    });

    res.status(200).json({
      status: 'success',
      results: departmentsWithMetrics.length,
      data: {
        departments: departmentsWithMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Protected
exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'headOfDepartment',
      'name email role department'
    );

    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        department,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Admin
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment } = req.body;

    // Check duplicate code or name
    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return next(new AppError('Department code already exists', 400));
    }

    const existingName = await Department.findOne({ name });
    if (existingName) {
      return next(new AppError('Department name already exists', 400));
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headOfDepartment: headOfDepartment || null,
      createdBy: req.user._id,
    });

    const populatedDept = await Department.findById(department._id).populate(
      'headOfDepartment',
      'name email role'
    );

    res.status(201).json({
      status: 'success',
      data: {
        department: populatedDept,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department by ID
// @route   PUT /api/departments/:id
// @access  Admin
exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    if (code && code.toUpperCase() !== department.code) {
      const codeExists = await Department.findOne({ code: code.toUpperCase() });
      if (codeExists) {
        return next(new AppError('Department code already in use', 400));
      }
      department.code = code.toUpperCase();
    }

    if (name && name !== department.name) {
      const nameExists = await Department.findOne({ name });
      if (nameExists) {
        return next(new AppError('Department name already in use', 400));
      }
      department.name = name;
    }

    if (description !== undefined) department.description = description;
    if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment || null;

    await department.save();

    const updatedDept = await Department.findById(department._id).populate(
      'headOfDepartment',
      'name email role'
    );

    res.status(200).json({
      status: 'success',
      message: 'Department updated successfully',
      data: {
        department: updatedDept,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department by ID
// @route   DELETE /api/departments/:id
// @access  Admin
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
