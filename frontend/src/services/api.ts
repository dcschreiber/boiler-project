import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle errors more intelligently
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Check if we actually have a session - if we do, this might be a backend issue
      const { data: { session } } = await supabase.auth.getSession()
      
      // Only sign out if we don't have a valid session
      if (!session?.access_token) {
        console.log('No valid session found, signing out')
        supabase.auth.signOut()
      } else {
        // We have a session but got 401 - likely a backend issue, don't sign out
        console.log('Got 401 but have valid session, not signing out. Error:', error.response?.data)
      }
    }
    return Promise.reject(error)
  }
)

export default api