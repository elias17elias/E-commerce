const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  .replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let refreshRequest;

export function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = api('/auth/refresh', { method: 'POST' })
      .finally(() => {
        refreshRequest = undefined;
      });
  }
  return refreshRequest;
}

export async function api(path, { token, body, method, signal, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    credentials: 'include',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  let result = null;
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new ApiError('The server returned an invalid response.', response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      result?.error || result?.message || 'Something went wrong. Please try again.',
      response.status,
    );
  }

  return result;
}

export const formatMoney = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(Number(value) || 0);
