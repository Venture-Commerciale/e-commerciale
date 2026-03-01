// simple fetch wrapper that handles JSON and errors
const API_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = (body && body.message) || res.statusText || 'Unknown error';
    if (body && Array.isArray(body.details) && body.details.length) {
      msg += ': ' + body.details.join('; ');
    }
    throw new Error(msg);
  }
  return body;
}

// auth
export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(data) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function refresh(token) {
  return request('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export function logout(token) {
  return request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
}

export function getMe(token) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// products / orders
export function listProducts(page = 0, size = 10, token) {
  return request(`/products?page=${page}&size=${size}`, { headers: authHeader(token) });
}

export function createOrder(data, token) {
  return request('/orders', {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function listOrders(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  return request(`/orders?${qs}`, { headers: authHeader(token) });
}

export function getOrder(id, token) {
  return request(`/orders/${id}`, { headers: authHeader(token) });
}

export function updateOrderStatus(id, status, token) {
  return request(`/orders/${id}/status`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// billing
export function getInvoice(id, token) {
  return request(`/invoices/${id}`, { headers: authHeader(token) });
}

export function getInvoiceForOrder(orderId, token) {
  return request(`/orders/${orderId}/invoice`, { headers: authHeader(token) });
}

export function getUser(id, token) {
  return request(`/users/${id}`, { headers: authHeader(token) });
}

export function createPayment(data, token) {
  return request('/payments', {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// tickets
export function createTicket(data, token) {
  return request('/tickets', {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function listTickets(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  return request(`/tickets?${qs}`, { headers: authHeader(token) });
}

export function getTicket(id, token) {
  return request(`/tickets/${id}`, { headers: authHeader(token) });
}

export function updateTicket(id, data, token) {
  return request(`/tickets/${id}`, {
    method: 'PUT',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function addComment(ticketId, data, token) {
  return request(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// admin-specific API functions
export function listAllUsers(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  return request(`/users?${qs}`, { headers: authHeader(token) });
}

export function getStaffMembers(token) {
  return request('/users?role=STAFF', { headers: authHeader(token) });
}

export function listAllOrders(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  return request(`/orders/admin/list?${qs}`, { headers: authHeader(token) }).catch(() => {
    // Fallback if admin endpoint doesn't exist, use regular endpoint
    return request(`/orders?${qs}`, { headers: authHeader(token) });
  });
}

export function listAllTickets(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  return request(`/tickets/admin/list?${qs}`, { headers: authHeader(token) }).catch(() => {
    // Fallback if admin endpoint doesn't exist
    return request(`/tickets?${qs}`, { headers: authHeader(token) });
  });
}

export function listAllInvoices(params = {}, token) {
  const qs = new URLSearchParams(params).toString();
  return request(`/invoices?${qs}`, { headers: authHeader(token) });
}
