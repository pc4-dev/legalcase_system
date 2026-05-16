// src/services/caseService.js
import api from './api';

export const caseService = {
  getStats: () => api.get('/cases/stats').then((r) => r.data),
  getAll: (params = {}) => api.get('/cases', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/cases/${id}`).then((r) => r.data),
  create: (data) => api.post('/cases', data).then((r) => r.data),
  update: (id, data) => api.put(`/cases/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/cases/${id}`).then((r) => r.data),

  // Adjournments
  addAdjournment: (id, data) => api.post(`/cases/${id}/adjournments`, data).then((r) => r.data),
  deleteAdjournment: (id, adjId) => api.delete(`/cases/${id}/adjournments/${adjId}`).then((r) => r.data),

  // Documents
  uploadDocument: (id, formData) =>
    api.post(`/cases/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  deleteDocument: (id, docId) => api.delete(`/cases/${id}/documents/${docId}`).then((r) => r.data),
};
