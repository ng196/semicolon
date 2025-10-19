const API_BASE_URL = 'http://localhost:3000';

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

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const hubsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/hubs`);
    return handleResponse(response);
  },

  getById: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/hubs/${id}`);
    return handleResponse(response);
  },

  create: async (hubData: HubData) => {
    const response = await fetch(`${API_BASE_URL}/hubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubData),
    });
    return handleResponse(response);
  },

  update: async (id: string | number, hubData: Partial<HubData>) => {
    const response = await fetch(`${API_BASE_URL}/hubs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubData),
    });
    return handleResponse(response);
  },

  delete: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/hubs/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export const usersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(response);
  },

  getById: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(response);
  },
};

export const eventsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/events`);
    return handleResponse(response);
  },

  getById: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    return handleResponse(response);
  },

  create: async (eventData: Partial<HubData>) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },
};

export const marketplaceApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/marketplace`);
    return handleResponse(response);
  },

  getById: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/marketplace/${id}`);
    return handleResponse(response);
  },

  create: async (itemData: Partial<HubData>) => {
    const response = await fetch(`${API_BASE_URL}/marketplace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    return handleResponse(response);
  },
};

export const requestsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/requests`);
    return handleResponse(response);
  },

  getById: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`);
    return handleResponse(response);
  },

  create: async (requestData: Partial<HubData>) => {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  update: async (id: string | number, requestData: Partial<HubData>) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  delete: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

