const API_BASE_URL = 'http://localhost:3000';

// Types
interface HubData {
  name: string;
  type: string;
  description: string;
  creator_id: number;
  icon?: string;
  specialization?: string;
  year?: string;
  color?: string;
  interests?: string[];
}

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  retries?: number;
}

// API Middleware Functions
class ApiClient {
  private baseURL: string;
  private defaultRetries: number = 3;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Get JWT token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Check if user is authenticated (simple check - just if token exists)
  private isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Build headers with JWT token injection
  private buildHeaders(options: ApiRequestOptions = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Inject JWT token if available and required
    if (options.requiresAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Enhanced response handler with better error handling
  private async handleResponse(response: Response): Promise<any> {
    // Handle 401 - Unauthorized (token expired/invalid)
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      // Redirect to login if not already on auth page
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }

      throw new Error('Authentication required. Please log in again.');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses (like DELETE operations)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    return response.json();
  }

  // Main request method with retry logic
  private async makeRequest(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<any> {
    const { requiresAuth = true, retries = this.defaultRetries, ...fetchOptions } = options;

    // Don't validate token on frontend - let backend handle it
    // Just send the token if it exists

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options);

    let lastError: Error;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        return await this.handleResponse(response);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication errors or client errors (4xx)
        if (error instanceof Error) {
          if (error.message.includes('Authentication required') ||
            error.message.includes('HTTP 4')) {
            throw error;
          }
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          break;
        }

        // Exponential backoff: wait 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  }

  // Public API methods
  async get(endpoint: string, options: ApiRequestOptions = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options: ApiRequestOptions = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any, options: ApiRequestOptions = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, data?: any, options: ApiRequestOptions = {}) {
    return this.makeRequest(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create singleton API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Legacy function for backward compatibility
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Enhanced API endpoints with middleware support
export const hubsApi = {
  getAll: async () => {
    return apiClient.get('/hubs');
  },

  getById: async (id: string | number) => {
    return apiClient.get(`/hubs/${id}`);
  },

  create: async (hubData: HubData) => {
    return apiClient.post('/hubs', hubData);
  },

  update: async (id: string | number, hubData: Partial<HubData>) => {
    return apiClient.put(`/hubs/${id}`, hubData);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(`/hubs/${id}`);
  },

  getMembers: async (id: string | number) => {
    return apiClient.get(`/hubs/${id}/members`);
  },

  addMember: async (id: string | number, memberData: { user_id: number; role?: string }) => {
    return apiClient.post(`/hubs/${id}/members`, memberData);
  },

  removeMember: async (id: string | number, memberData: { user_id: number }) => {
    return apiClient.delete(`/hubs/${id}/members`, memberData);
  },
};

export const usersApi = {
  getAll: async () => {
    return apiClient.get('/users');
  },

  getById: async (id: string | number) => {
    return apiClient.get(`/users/${id}`);
  },

  update: async (id: string | number, userData: any) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(`/users/${id}`);
  },
};

export const eventsApi = {
  getAll: async () => {
    return apiClient.get('/events');
  },

  getById: async (id: string | number) => {
    return apiClient.get(`/events/${id}`);
  },

  create: async (eventData: any) => {
    return apiClient.post('/events', eventData);
  },

  update: async (id: string | number, eventData: any) => {
    return apiClient.put(`/events/${id}`, eventData);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(`/events/${id}`);
  },
};

export const marketplaceApi = {
  getAll: async () => {
    return apiClient.get('/marketplace');
  },

  getById: async (id: string | number) => {
    return apiClient.get(`/marketplace/${id}`);
  },

  create: async (itemData: any) => {
    return apiClient.post('/marketplace', itemData);
  },

  update: async (id: string | number, itemData: any) => {
    return apiClient.put(`/marketplace/${id}`, itemData);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(`/marketplace/${id}`);
  },
};

export const requestsApi = {
  getAll: async () => {
    return apiClient.get('/requests');
  },

  getById: async (id: string | number) => {
    return apiClient.get(`/requests/${id}`);
  },

  create: async (requestData: any) => {
    return apiClient.post('/requests', requestData);
  },

  update: async (id: string | number, requestData: any) => {
    return apiClient.put(`/requests/${id}`, requestData);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(`/requests/${id}`);
  },
};

// Authentication API
export const authApi = {
  login: async (credentials: { email: string; password: string; remember?: boolean }) => {
    return apiClient.post('/auth/login', credentials, { requiresAuth: false });
  },

  signup: async (userData: { email: string; password: string;[key: string]: any }) => {
    return apiClient.post('/auth/signup', userData, { requiresAuth: false });
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  refreshToken: async () => {
    return apiClient.post('/auth/refresh');
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email }, { requiresAuth: false });
  },

  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/auth/reset-password', { token, password }, { requiresAuth: false });
  },

  verifyEmail: async (token: string) => {
    return apiClient.post('/auth/verify-email', { token }, { requiresAuth: false });
  },

  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiClient.put('/auth/profile', profileData);
  },
};

// Export the API client for advanced usage
export { apiClient };


// Clubs API
export const clubsApi = {
  // Club settings
  getSettings: async (clubId: string | number) => {
    return apiClient.get(`/clubs/${clubId}/settings`);
  },

  updateSettings: async (clubId: string | number, settings: { is_private?: boolean; auto_approve_members?: boolean }) => {
    return apiClient.put(`/clubs/${clubId}/settings`, settings);
  },

  // Membership
  joinPublicClub: async (clubId: string | number) => {
    return apiClient.post(`/clubs/${clubId}/join`);
  },

  leaveClub: async (clubId: string | number) => {
    return apiClient.delete(`/clubs/${clubId}/leave`);
  },

  updateMemberRole: async (clubId: string | number, userId: number, role: string) => {
    return apiClient.put(`/clubs/${clubId}/members/${userId}/role`, { role });
  },

  // Join requests
  requestToJoin: async (clubId: string | number, message?: string) => {
    return apiClient.post(`/clubs/${clubId}/join-requests`, { message });
  },

  getJoinRequests: async (clubId: string | number, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get(`/clubs/${clubId}/join-requests${query}`);
  },

  approveJoinRequest: async (clubId: string | number, requestId: number) => {
    return apiClient.put(`/clubs/${clubId}/join-requests/${requestId}/approve`);
  },

  rejectJoinRequest: async (clubId: string | number, requestId: number) => {
    return apiClient.put(`/clubs/${clubId}/join-requests/${requestId}/reject`);
  },

  // Club posts
  getPosts: async (clubId: string | number) => {
    return apiClient.get(`/clubs/${clubId}/posts`);
  },

  createPost: async (clubId: string | number, post: { title?: string; content: string; type?: string }) => {
    return apiClient.post(`/clubs/${clubId}/posts`, post);
  },

  updatePost: async (clubId: string | number, postId: number, post: { title?: string; content?: string; type?: string }) => {
    return apiClient.put(`/clubs/${clubId}/posts/${postId}`, post);
  },

  deletePost: async (clubId: string | number, postId: number) => {
    return apiClient.delete(`/clubs/${clubId}/posts/${postId}`);
  },

  pinPost: async (clubId: string | number, postId: number, pinned: boolean) => {
    return apiClient.put(`/clubs/${clubId}/posts/${postId}/pin`, { pinned });
  },

  // Club events
  getEvents: async (clubId: string | number) => {
    return apiClient.get(`/clubs/${clubId}/events`);
  },

  createEvent: async (clubId: string | number, event: { event_id: number; visibility?: string; target_audience?: string }) => {
    return apiClient.post(`/clubs/${clubId}/events`, event);
  },

  updateEventVisibility: async (clubId: string | number, eventId: number, visibility: string) => {
    return apiClient.put(`/clubs/${clubId}/events/${eventId}/visibility`, { visibility });
  },
};
