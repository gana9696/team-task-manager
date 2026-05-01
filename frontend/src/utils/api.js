import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Projects
export const getProjects = () => API.get('/projects');
export const createProject = (data) => API.post('/projects', data);
export const getProject = (id) => API.get(`/projects/${id}`);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addMember = (id, data) => API.post(`/projects/${id}/members`, data);
export const removeMember = (id, userId) => API.delete(`/projects/${id}/members/${userId}`);

// Tasks
export const getTasks = (projectId) => API.get(`/tasks${projectId ? `?projectId=${projectId}` : ''}`);
export const getMyTasks = () => API.get('/tasks/my');
export const createTask = (data) => API.post('/tasks', data);
export const getTask = (id) => API.get(`/tasks/${id}`);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const submitTask = (id, data) => API.post(`/tasks/${id}/submit`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const getDashboardStats = () => API.get('/tasks/dashboard');
export const addComment = (id, data) => API.post(`/tasks/${id}/comments`, data);

// Users
export const getAllUsers = () => API.get('/users');
export const getMembers = () => API.get('/users/members');
export const updateUserRole = (id, data) => API.put(`/users/${id}/role`, data);

export default API;
