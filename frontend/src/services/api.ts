import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Issue endpoints
  async createIssue(data: any) {
    return this.client.post('/issues', data);
  }

  async getIssues(params?: any) {
    return this.client.get('/issues', { params });
  }

  async getIssueById(id: string) {
    return this.client.get(`/issues/${id}`);
  }

  async getMyIssues(params?: any) {
    return this.client.get('/issues/user/my-issues', { params });
  }

  async getAssignedIssues(params?: any) {
    return this.client.get('/issues/officer/assigned', { params });
  }

  async updateIssueStatus(id: string, data: any) {
    return this.client.put(`/issues/${id}/status`, data);
  }

  // Announcement endpoints
  async createAnnouncement(data: any) {
    return this.client.post('/announcements', data);
  }

  async getAnnouncements(params?: any) {
    return this.client.get('/announcements', { params });
  }

  async getAnnouncementById(id: string) {
    return this.client.get(`/announcements/${id}`);
  }

  async getMyAnnouncements(params?: any) {
    return this.client.get('/announcements/user/my-announcements', { params });
  }

  async updateAnnouncement(id: string, data: any) {
    return this.client.put(`/announcements/${id}`, data);
  }

  async deleteAnnouncement(id: string) {
    return this.client.delete(`/announcements/${id}`);
  }

  // User endpoints
  async getUsers(params?: any) {
    return this.client.get('/users', { params });
  }

  async getUserById(id: string) {
    return this.client.get(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.client.put(`/users/${id}`, data);
  }

  async deactivateUser(id: string) {
    return this.client.put(`/users/${id}/deactivate`);
  }

  async activateUser(id: string) {
    return this.client.put(`/users/${id}/activate`);
  }

  async deleteUser(id: string) {
    return this.client.delete(`/users/${id}`);
  }

  // Department endpoints
  async getDepartments() {
    return this.client.get('/departments');
  }

  async getDepartmentById(id: string) {
    return this.client.get(`/departments/${id}`);
  }

  // Generic methods
  async get(endpoint: string, config?: any) {
    return this.client.get(endpoint, config);
  }

  async post(endpoint: string, data?: any, config?: any) {
    return this.client.post(endpoint, data, config);
  }

  async put(endpoint: string, data?: any, config?: any) {
    return this.client.put(endpoint, data, config);
  }

  async delete(endpoint: string, config?: any) {
    return this.client.delete(endpoint, config);
  }
}

const api = new ApiClient();

export default api;
export { api };
