// API service for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface User {
  _id: string;
  profile_name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  assignedProfiles: User[];
  eventTimezone: string;
  startDateTime: string;
  endDateTime: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface EventLog {
  _id: string;
  eventId: string;
  changedBy: User;
  timestamp: string;
  previousValues: any;
  updatedValues: any;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Health check
export const healthCheck = async (): Promise<ApiResponse> => {
  return apiRequest('/health');
};

// User API functions
export const userApi = {
  // Get all users
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return apiRequest('/api/users');
  },

  // Create a new user
  create: async (userData: { profile_name: string }): Promise<ApiResponse<User>> => {
    return apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Event API functions
export const eventApi = {
  // Get all events
  getAll: async (): Promise<ApiResponse<Event[]>> => {
    return apiRequest('/api/events');
  },

  // Get events for a specific user
  getByUser: async (userId: string): Promise<ApiResponse<Event[]>> => {
    return apiRequest(`/api/events/user/${userId}`);
  },

  // Create a new event
  create: async (eventData: {
    assignedProfiles: string[];
    eventTimezone: string;
    startDateTime: string;
    endDateTime: string;
    createdBy: string;
  }): Promise<ApiResponse<Event>> => {
    return apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Update an event
  update: async (
    eventId: string,
    eventData: {
      assignedProfiles?: string[];
      eventTimezone?: string;
      startDateTime?: string;
      endDateTime?: string;
      updatedBy: string;
    }
  ): Promise<ApiResponse<Event>> => {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Get event logs
  getLogs: async (eventId: string, userId: string): Promise<ApiResponse<EventLog[]>> => {
    return apiRequest(`/api/events/${eventId}/logs?userId=${userId}`);
  },
};

// Connection test function
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await healthCheck();
    return response.success;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export default {
  userApi,
  eventApi,
  healthCheck,
  testConnection,
};