const courseRepository = require('../repositories/courseRepository');

class CourseService {
  async getAllCourses(filters) {
    return await courseRepository.findAll(filters);
  }

  async getCourseById(id) {
    return await courseRepository.findById(id);
  }

  async createCourse(teacherId, courseData) {
    return await courseRepository.create({
      ...courseData,
      teacher_id: teacherId,
    });
  }

  async updateCourse(id, teacherId, role, updateData) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Auth Check: only the teacher of the course or an admin can update
    if (course.teacher_id !== teacherId && role !== 'admin') {
      throw new Error('Unauthorized to update this course');
    }

    return await courseRepository.update(id, updateData);
  }

  async deleteCourse(id, teacherId, role) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.teacher_id !== teacherId && role !== 'admin') {
      throw new Error('Unauthorized to delete this course');
    }

    await courseRepository.delete(id);
  }

  // --- Enrollments ---
  async enrollStudent(studentId, courseId) {
    const course = await courseRepository.findById(courseId);
    if (!course || course.status !== 'published') {
      throw new Error('Course is not available for enrollment');
    }
    return await courseRepository.enrollStudent(studentId, courseId);
  }

  async getStudentEnrollments(studentId) {
    return await courseRepository.findStudentEnrollments(studentId);
  }

  async unenrollStudent(studentId, courseId) {
    return await courseRepository.updateEnrollmentStatus(studentId, courseId, 'dropped');
  }

  // --- Materials ---
  async getCourseMaterials(courseId, userId, role) {
    // Basic verification - RLS will handle the strong enforcement, but good to have application logic layer
    return await courseRepository.findCourseMaterials(courseId);
  }

  async addCourseMaterial(courseId, materialData, teacherId, role) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.teacher_id !== teacherId && role !== 'admin') {
      throw new Error('Unauthorized to modify materials for this course');
    }

    return await courseRepository.addMaterial({
      ...materialData,
      course_id: courseId
    });
  }

  async deleteCourseMaterial(materialId, courseId, teacherId, role) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    if (course.teacher_id !== teacherId && role !== 'admin') {
      throw new Error('Unauthorized to delete materials for this course');
    }

    await courseRepository.removeMaterial(materialId);
  }
}

module.exports = new CourseService();
