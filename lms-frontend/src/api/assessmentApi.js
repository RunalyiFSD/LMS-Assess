import apiClient from './client';

export const assessmentApi = {
  // Assessments
  getAll: (filters) => apiClient.get('/assessments', { params: filters }),
  getById: (id) => apiClient.get(`/assessments/${id}`),
  create: (data) => apiClient.post('/assessments', data),
  update: (id, data) => apiClient.put(`/assessments/${id}`, data),
  delete: (id) => apiClient.delete(`/assessments/${id}`),

  // Questions
  getQuestions: (assessmentId) => apiClient.get(`/questions/assessment/${assessmentId}`),
  createQuestion: (assessmentId, data) => apiClient.post(`/questions/assessment/${assessmentId}`, data),
  updateQuestion: (id, data) => apiClient.put(`/questions/${id}`, data),
  deleteQuestion: (id, assessmentId) => apiClient.delete(`/questions/${id}?assessmentId=${assessmentId}`),

  // Submissions (Student)
  startSubmission: (assessmentId) => apiClient.post('/submissions/start', { assessmentId }),
  saveAnswers: (submissionId, answers) => apiClient.put(`/submissions/${submissionId}/save`, { answers }),
  submitFinal: (submissionId, answers) => apiClient.post(`/submissions/${submissionId}/submit`, { answers }),

  // Grading (Teacher)
  getSubmissions: (assessmentId) => apiClient.get(`/submissions/assessment/${assessmentId}`),
  gradeSubmission: (submissionId, updates) => apiClient.put(`/submissions/${submissionId}/grade`, { updates }),
};
