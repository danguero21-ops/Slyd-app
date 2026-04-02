/**
 * apiClient.js — drop-in replacement for the Base44 SDK db object.
 *
 * This client talks to your own backend via REST. Implement the matching routes
 * in your server (e.g. Next.js API routes, Express, etc.).
 *
 * Set VITE_API_BASE_URL in .env (defaults to /api for same-origin deployment).
 *
 * Required backend routes:
 *   GET  /api/auth/me                              → returns current user object
 *   GET  /api/auth/status                          → returns { isAuthenticated: boolean }
 *   POST /api/auth/logout                          → clears session/cookie
 *   GET  /api/entities/:entity?field=value         → filter records
 *   GET  /api/entities/:entity/:id                 → get single record
 *   POST /api/entities/:entity                     → create record
 *   PATCH /api/entities/:entity/:id               → update record
 *   DELETE /api/entities/:entity/:id              → delete record
 *   POST /api/upload                               → upload file, returns { file_url }
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const error = new Error(payload.message || `Request failed: ${res.status}`);
    error.status = res.status;
    error.data = payload;
    throw error;
  }

  return res.json();
}

function buildQuery(filter = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function createEntityClient(entityName) {
  return {
    /** Returns an array of matching records. */
    filter: (query = {}) =>
      request('GET', `/entities/${entityName}${buildQuery(query)}`),

    /** Returns a single record by id. */
    get: (id) =>
      request('GET', `/entities/${entityName}/${id}`),

    /** Creates a new record and returns it. */
    create: (data) =>
      request('POST', `/entities/${entityName}`, data),

    /** Updates a record by id and returns the updated record. */
    update: (id, data) =>
      request('PATCH', `/entities/${entityName}/${id}`, data),

    /** Deletes a record by id. */
    delete: (id) =>
      request('DELETE', `/entities/${entityName}/${id}`),
  };
}

export const db = {
  auth: {
    /**
     * Returns true if the current session is authenticated.
     * Backend: GET /api/auth/status → { isAuthenticated: boolean }
     */
    isAuthenticated: () =>
      request('GET', '/auth/status')
        .then((r) => r.isAuthenticated)
        .catch(() => false),

    /**
     * Returns the current user object.
     * Backend: GET /api/auth/me → user object (e.g. { id, email, name, ... })
     * Throws 401 if not authenticated.
     */
    me: () => request('GET', '/auth/me'),

    /**
     * Logs out the current user.
     * Backend: POST /api/auth/logout → clears the session cookie.
     * If redirectUrl is provided, redirects there after logout.
     */
    logout: (redirectUrl) => {
      request('POST', '/auth/logout').catch(() => {}).finally(() => {
        window.location.href = redirectUrl || '/';
      });
    },

    /**
     * Redirects the user to the login page.
     * Adjust the login URL to match your auth implementation.
     */
    redirectToLogin: (returnUrl) => {
      const dest = returnUrl
        ? `/login?returnTo=${encodeURIComponent(returnUrl)}`
        : '/login';
      window.location.href = dest;
    },
  },

  /**
   * Entity clients — call like: db.entities.UserProfile.filter({ user_email: '...' })
   * Each entity name maps to /api/entities/:entityName on your backend.
   */
  entities: new Proxy(
    {},
    {
      get(_, entityName) {
        return createEntityClient(entityName);
      },
    }
  ),

  integrations: {
    Core: {
      /**
       * Uploads a file and returns its URL.
       * Backend: POST /api/upload (multipart/form-data, field: "file")
       *          → { file_url: 'https://...' }
       *
       * Usage:
       *   const { file_url } = await db.integrations.Core.UploadFile({ file: fileObject });
       *   // OR:
       *   const { file_url } = await db.integrations.Core.UploadFile(fileObject);
       */
      UploadFile: async (input) => {
        const file = input instanceof File ? input : input?.file;
        if (!file) throw new Error('UploadFile: expected a File object');

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${BASE_URL}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'File upload failed');
        }

        return res.json(); // { file_url: '...' }
      },
    },
  },
};

export const base44 = db; // legacy alias
export default db;
