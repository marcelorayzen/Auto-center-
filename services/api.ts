const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const getUserHeader = () => {
  const id = localStorage.getItem('currentUserId');
  return id ? { 'x-user-id': id } : {};
};

export const api: any = {
  async getServiceOrders() {
    const res = await fetch(`${BASE}/service-orders`);
    if (!res.ok) throw new Error('Failed to fetch service orders');
    return res.json();
  },

  async createServiceOrder(data: any) {
    const res = await fetch(`${BASE}/service-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create service order');
    return res.json();
  },

  async getInventory() {
    const res = await fetch(`${BASE}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async createInventoryItem(data: any) {
    const res = await fetch(`${BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create inventory item');
    return res.json();
  },

  async getCustomers() {
    const res = await fetch(`${BASE}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getVehicles() {
    const res = await fetch(`${BASE}/vehicles`);
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  }
};

export default api;

// Auth & Wash APIs
api.login = async (payload: { id?: number; email?: string }) => {
  const res = await fetch(`${BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Login failed');
  const user = await res.json();
  // store id for subsequent requests
  if (user?.id) localStorage.setItem('currentUserId', String(user.id));
  return user;
};

api.getWashes = async () => {
  const res = await fetch(`${BASE}/washes`, { headers: { ...getUserHeader() } });
  if (!res.ok) throw new Error('Failed to fetch washes');
  return res.json();
};

api.createWash = async (payload: any) => {
  const res = await fetch(`${BASE}/washes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getUserHeader() }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to create wash');
  return res.json();
};

api.finalizeWash = async (id: number) => {
  const res = await fetch(`${BASE}/washes/${id}/finalize`, { method: 'POST', headers: { ...getUserHeader() } });
  if (!res.ok) throw new Error('Failed to finalize wash');
  return res.json();
};
