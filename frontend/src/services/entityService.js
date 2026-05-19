import api from './api';
import axios from 'axios';

const PUBLIC_API = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api';

export const entityService = {
    /* Public — no auth (for dropdowns in public forms) */
    getPublic: () =>
        axios.get(`${PUBLIC_API}/entities/public`).then((r) => r.data),

    /* Protected */
    getAll: () => api.get('/entities').then((r) => r.data),
    getOne: (id) => api.get(`/entities/${id}`).then((r) => r.data),
    create: (data) => api.post('/entities', data).then((r) => r.data),
    update: (id, d) => api.put(`/entities/${id}`, d).then((r) => r.data),
    remove: (id) => api.delete(`/entities/${id}`).then((r) => r.data),
};
