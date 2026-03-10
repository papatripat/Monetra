import api from './axios';

export const getBudgets = (params) => api.get('/budgets', { params });
export const createOrUpdateBudget = (data) => api.post('/budgets', data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
