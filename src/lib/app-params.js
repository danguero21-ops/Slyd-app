/**
 * app-params.js — lightweight app configuration.
 *
 * Set VITE_API_BASE_URL in your .env file to point to your backend.
 * Example:
 *   VITE_API_BASE_URL=https://your-api.vercel.app/api
 */

export const appParams = {
  apiBaseUrl: typeof window !== 'undefined'
    ? (import.meta.env.VITE_API_BASE_URL || '/api')
    : '',
};
