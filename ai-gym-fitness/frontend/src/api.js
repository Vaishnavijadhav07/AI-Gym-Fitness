import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// User
export const registerUser = (data) => API.post('/users/register', data);
export const loginUser = (data) => API.post('/users/login', data);
export const getUser = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);

// Dashboard
export const getDashboard = (id) => API.get(`/dashboard/${id}`);

// Workouts
export const getWorkoutPlan = (goal) => API.get(`/workouts/plan/${goal}`);
export const logWorkout = (data) => API.post('/workouts/log', data);
export const getWorkoutHistory = (id) => API.get(`/workouts/history/${id}`);
export const getWorkoutStats = (id) => API.get(`/workouts/stats/${id}`);
export const analyzeForm = (data) => API.post('/workouts/analyze-form', data);

// Diet
export const getDietPlan = (data) => API.post('/diet/plan', data);
export const logMeal = (data) => API.post('/diet/log', data);
export const getDietHistory = (id) => API.get(`/diet/history/${id}`);
export const dietChat = (data) => API.post('/diet/chat', data);

// Habits
export const logHabit = (data) => API.post('/habits/log', data);
export const getStreak = (id) => API.get(`/habits/streak/${id}`);
export const getNudge = (id) => API.get(`/habits/nudge/${id}`);
export const getHabitHistory = (id) => API.get(`/habits/history/${id}`);
export const predictSkip = (id) => API.get(`/habits/predict/${id}`);

// Performance
export const recordScore = (data) => API.post('/performance/score', data);
export const getPerformanceHistory = (id) => API.get(`/performance/history/${id}`);
export const getWeeklyReport = (id) => API.get(`/performance/weekly-report/${id}`);
export const getGymRecommendations = (data) => API.post('/performance/gym-recommendations', data);
