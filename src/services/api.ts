import {
  Equipment,
  MaintenanceRecord,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  MaintenanceSummary,
  StatusOption,
  MaintenanceTypeOption,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const BACKEND_URL = API_URL.replace('/api', '');

export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

// Equipment API
export const equipmentAPI = {
  getAll: async (includeInactive = false): Promise<{ equipment: Equipment[] }> => {
    const url = includeInactive 
      ? `${API_URL}/maintenance/equipment?includeInactive=true`
      : `${API_URL}/maintenance/equipment`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch equipment');
    return response.json();
  },

  getById: async (id: number): Promise<{ equipment: Equipment }> => {
    const response = await fetch(`${API_URL}/maintenance/equipment/${id}`);
    if (!response.ok) throw new Error('Equipment not found');
    return response.json();
  },

  create: async (data: Partial<Equipment>): Promise<{ equipment: Equipment }> => {
    const response = await fetch(`${API_URL}/maintenance/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create equipment');
    }
    return response.json();
  },

  update: async (id: number, data: Partial<Equipment>): Promise<{ equipment: Equipment }> => {
    const response = await fetch(`${API_URL}/maintenance/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update equipment');
    }
    return response.json();
  },

  delete: async (id: number, permanent = false): Promise<{ success: boolean }> => {
    const url = permanent 
      ? `${API_URL}/maintenance/equipment/${id}?permanent=true`
      : `${API_URL}/maintenance/equipment/${id}`;
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete equipment');
    }
    return response.json();
  },
};

// Maintenance Records API
export const maintenanceAPI = {
  // Get all records (returns formatted array for dashboard compatibility)
  getAll: async (status?: string): Promise<MaintenanceRecord[]> => {
    const url = status
      ? `${API_URL}/maintenance/records?status=${status}`
      : `${API_URL}/maintenance/records`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch records');
    return response.json();
  },

  // Get summary stats
  getSummary: async (): Promise<MaintenanceSummary> => {
    const response = await fetch(`${API_URL}/maintenance/summary`);
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  },

  // Get record detail
  getById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/maintenance/records/${id}`);
    if (!response.ok) throw new Error('Record not found');
    return response.json();
  },

  // Create record (supports FormData for multiple images)
  create: async (data: FormData): Promise<any> => {
    const response = await fetch(`${API_URL}/maintenance/records`, {
      method: 'POST',
      body: data,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create record');
    }
    return response.json();
  },

  // Update record (Supports FormData for status changes with images)
  update: async (id: string, data: UpdateMaintenanceDto | FormData): Promise<{ id: string; status: string }> => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/maintenance/records/${id}`, {
      method: 'PATCH',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update record');
    }
    return response.json();
  },

  // Add comment
  addComment: async (id: string, userId: number, comment: string): Promise<any> => {
    const response = await fetch(`${API_URL}/maintenance/records/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, comment }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  // Delete record
  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/maintenance/records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete record');
    return response.json();
  },

  // Add progress update (with optional image)
  addProgressUpdate: async (id: string, formData: FormData): Promise<any> => {
    const response = await fetch(`${API_URL}/maintenance/records/${id}/update`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update progress');
    }
    return response.json();
  },

  // Update status
  updateStatus: async (id: string, status: string, data: any): Promise<any> => {
    const response = await fetch(`${API_URL}/status/records/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...data }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }
    return response.json();
  },
};

// Status API
export const statusAPI = {
  // Get status options
  getOptions: async (): Promise<{
    statuses: StatusOption[];
    priorities: StatusOption[];
    categories: { value: string; label: string }[];
    maintenanceTypes: MaintenanceTypeOption[];
  }> => {
    const response = await fetch(`${API_URL}/status/options`);
    if (!response.ok) throw new Error('Failed to fetch options');
    return response.json();
  },
};

// Auth API
export const authAPI = {
  verify: async (accessToken: string): Promise<{ success: boolean; user: any }> => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }
    return response.json();
  },

  registerUser: async (lineUserId: string, displayName?: string, email?: string): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineUserId, displayName, email }),
    });
    return response.json();
  },
};

// Users API (for moderators)
export const usersAPI = {
  getAll: async (): Promise<{ users: any[] }> => {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  updateRole: async (id: number, role: string): Promise<any> => {
    const response = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update role');
    return response.json();
  },

  delete: async (id: number): Promise<any> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },
};
