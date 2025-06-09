import axios from 'axios'

// Determine if we're running in the same domain or cross-domain
const isSameDomain =
  window.location.origin === process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL === undefined

// Set up axios with the right config for standard requests
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Set up axios with the right config for requests that use Multipart Form Data
export const apiClientFormData = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Set up axios with the right config
export const authClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/auth',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Get CSRF token before certain requests
export const fetchCSRFToken = async () => {
  try {
    // Only needed for cross-domain setup when using CSRF protection
    if (!isSameDomain) {
      const res = await authClient.get('/csrf/')
      const csrfToken = res.data.csrf_token

      // Update both clients with the CSRF token
      apiClient.defaults.headers.common['X-CSRFToken'] = csrfToken
      authClient.defaults.headers.common['X-CSRFToken'] = csrfToken

      return csrfToken
    }
  } catch (error) {
    console.error('Error fetching CSRF token:', error)
  }
}

// Optionally export isSameDomain if you need it elsewhere
export { isSameDomain }
