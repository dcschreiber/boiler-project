import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { name?: string; language?: string }) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAdmin: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Check if this is the admin user based on email or metadata
        const isAdminByEmail = session.user.email === 'daniel@getwithai.com' || 
                              session.user.user_metadata?.is_admin === true
        
        // Set user immediately
        set({ 
          user: session.user, 
          isAdmin: isAdminByEmail,
          isLoading: false 
        })
        
        // Optional: Try to get profile data but don't fail if table doesn't exist
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
          
          if (!error && profile) {
            // Update admin status if we got profile data
            set({ 
              user: session.user, 
              isAdmin: profile.is_admin || isAdminByEmail,
              isLoading: false 
            })
          }
        } catch (profileError) {
          console.log('Profile table not available during initialization, using email-based admin check')
          // Keep the user logged in with email-based admin status
        }
      } else {
        set({ isLoading: false })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          set({ user: null, isAdmin: false })
          return
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email)
          
          // Check if this is the admin user based on email
          const isAdminByEmail = session.user.email === 'daniel@getwithai.com' || 
                                session.user.user_metadata?.is_admin === true
          
          // Set user immediately without waiting for profile query
          set({ 
            user: session.user, 
            isAdmin: isAdminByEmail 
          })
          
          // Optional: Try to get profile data but don't fail if table doesn't exist
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single()
            
            if (!error && profile) {
              // Update admin status if we got profile data
              set({ 
                user: session.user, 
                isAdmin: profile.is_admin || isAdminByEmail 
              })
            }
          } catch (profileError) {
            console.log('Profile table not available, using email-based admin check')
            // Keep the user logged in with email-based admin status
          }
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed for:', session.user.email)
          // Keep existing user state, don't clear it
          const currentState = get()
          if (!currentState.user) {
            set({ user: session.user, isAdmin: false })
          }
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    
    // Wait for the auth state to be updated
    return new Promise<void>((resolve) => {
      const checkAuth = () => {
        const state = get()
        if (state.user) {
          resolve()
        } else {
          setTimeout(checkAuth, 50)
        }
      }
      checkAuth()
    })
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
  },

  signup: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, isAdmin: false })
  },

  updateProfile: async (data) => {
    const user = get().user
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) throw error
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },
}))