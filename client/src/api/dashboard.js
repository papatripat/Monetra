import api from './axios';

export const getDashboardSummary = (params) => api.get('/dashboard/summary', { params });
export const getExpenseByCategory = (params) => api.get('/dashboard/expense-by-category', { params });
export const getMonthlyTrend = () => api.get('/dashboard/monthly-trend');
export const getBudgetStatus = (params) => api.get('/dashboard/budget-status', { params });
export const getFiftyThirtyTwenty = (params) => api.get('/dashboard/fifty-thirty-twenty', { params });
