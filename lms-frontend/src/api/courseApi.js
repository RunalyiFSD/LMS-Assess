import api from '../services/api';

export const courseApi = {
  // Courses
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  // Enrollments
  enroll: (courseId) => api.post('/courses/enroll', { courseId }),
  getMyEnrollments: () => api.get('/courses/enrollments/me'),
  unenroll: (courseId) => api.delete(`/courses/${courseId}/unenroll`),

  // Materials
  getMaterials: (courseId) => api.get(`/courses/${courseId}/materials`),
  addMaterial: (courseId, data) => api.post(`/courses/${courseId}/materials`, data),
  deleteMaterial: (courseId, materialId) => api.delete(`/courses/${courseId}/materials/${materialId}`),
};
