import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthResponse {
  token: string;
  username: string;
}

export interface AlgorithmInfo {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  defaultParams: Record<string, number>;
}

export interface RequestLogEntry {
  timestamp: number;
  accepted: boolean;
  username: string;
  detail: string;
}

export interface RateLimiterState {
  algorithmName: string;
  accepted: boolean;
  acceptedCount: number;
  rejectedCount: number;
  totalRequests: number;
  algorithmState: Record<string, any>;
  recentLogs: RequestLogEntry[];
  timestamp: number;
}

export const authApi = {
  signup: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { username, password }),
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),
};

export const algorithmApi = {
  list: () => api.get<AlgorithmInfo[]>('/api/algorithms'),
  getState: (name: string) => api.get<RateLimiterState>(`/api/state/${name}`),
  simulate: (algorithmName: string, count: number = 1) =>
    api.post<RateLimiterState[]>('/api/simulate-request', { algorithmName, count }),
  updateConfig: (algorithmName: string, parameters: Record<string, any>) =>
    api.post<RateLimiterState>('/api/update-config', { algorithmName, parameters }),
  reset: (algorithmName: string) =>
    api.post<RateLimiterState>(`/api/reset/${algorithmName}`),
};

export default api;
