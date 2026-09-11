import api from './axios';

// Auth API
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getProfile: () => api.get('/auth/me')
};

// Buildings API
export const buildingsApi = {
    getAll: () => api.get('/buildings'),
    getById: (id) => api.get(`/buildings/${id}`),
    create: (data) => api.post('/buildings', data),
    update: (id, data) => api.put(`/buildings/${id}`, data),
    delete: (id) => api.delete(`/buildings/${id}`)
};

// Floors API
export const floorsApi = {
    getAll: (buildingId) => api.get('/floors', { params: { building_id: buildingId } }),
    getById: (id) => api.get(`/floors/${id}`),
    create: (data) => api.post('/floors', data),
    update: (id, data) => api.put(`/floors/${id}`, data),
    delete: (id) => api.delete(`/floors/${id}`)
};

// Floor Sides API
export const floorSidesApi = {
    getAll: (floorId, buildingId) => api.get('/floor-sides', { params: { floor_id: floorId, building_id: buildingId } }),
    getById: (id) => api.get(`/floor-sides/${id}`),
    create: (data) => api.post('/floor-sides', data),
    update: (id, data) => api.put(`/floor-sides/${id}`, data),
    delete: (id) => api.delete(`/floor-sides/${id}`)
};

// Lecture Halls API
export const lectureHallsApi = {
    getAll: (params) => api.get('/lecture-halls', { params }),
    getById: (id) => api.get(`/lecture-halls/${id}`),
    create: (data) => api.post('/lecture-halls', data),
    update: (id, data) => api.put(`/lecture-halls/${id}`, data),
    delete: (id) => api.delete(`/lecture-halls/${id}`)
};

// Modules API
export const modulesApi = {
    getAll: (params) => api.get('/modules', { params }),
    getById: (id) => api.get(`/modules/${id}`),
    create: (data) => api.post('/modules', data),
    update: (id, data) => api.put(`/modules/${id}`, data),
    delete: (id) => api.delete(`/modules/${id}`)
};

// Lecturers API
export const lecturersApi = {
    getAll: (search) => api.get('/lecturers', { params: { search } }),
    getById: (id) => api.get(`/lecturers/${id}`),
    create: (data) => api.post('/lecturers', data),
    update: (id, data) => api.update ? api.put(`/lecturers/${id}`, data) : api.put(`/lecturers/${id}`, data),
    delete: (id) => api.delete(`/lecturers/${id}`)
};

// Lecture Sessions API
export const sessionsApi = {
    getAll: (params) => api.get('/sessions', { params }),
    getById: (id) => api.get(`/sessions/${id}`),
    create: (data) => api.post('/sessions', data),
    update: (id, data) => api.put(`/sessions/${id}`, data),
    cancel: (id, reason) => api.patch(`/sessions/${id}/cancel`, { reason }),
    reschedule: (id, data) => api.patch(`/sessions/${id}/reschedule`, data),
    delete: (id) => api.delete(`/sessions/${id}`)
};

// Digital Displays API
export const displaysApi = {
    getAll: () => api.get('/displays'),
    getById: (id) => api.get(`/displays/${id}`),
    create: (data) => api.post('/displays', data),
    update: (id, data) => api.put(`/displays/${id}`, data),
    delete: (id) => api.delete(`/displays/${id}`)
};

// Dashboard API
export const dashboardApi = {
    getStats: () => api.get('/dashboard')
};
