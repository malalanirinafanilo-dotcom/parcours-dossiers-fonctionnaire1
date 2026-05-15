// src/services/adminService.ts
import api from './api';
import { AdminDashboardStats, AdminLog, SystemSetting } from '../types';

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get('/admin/dashboard/stats/');
    return response.data;
  },

  async getRecentActivity(): Promise<any> {
    const response = await api.get('/admin/dashboard/recent_activity/');
    return response.data;
  },

  async getLogs(params?: any): Promise<{ results: AdminLog[]; count: number }> {
    const response = await api.get('/admin/logs/', { params });
    return response.data;
  },

  async getSettings(): Promise<SystemSetting[]> {
    const response = await api.get('/admin/settings/');
    return response.data;
  },

  async updateSetting(id: string, value: string): Promise<SystemSetting> {
    const response = await api.patch(`/admin/settings/${id}/`, { value });
    return response.data;
  },
};