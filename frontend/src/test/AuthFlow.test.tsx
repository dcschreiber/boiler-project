import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import DashboardPage from '../pages/DashboardPage'
import api from '../services/api'

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

// Mock the supabase service
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: null } })),
      signOut: vi.fn(),
    },
  },
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('Authentication Flow Issues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset auth store
    useAuthStore.setState({ user: null, isAdmin: false, isLoading: false })
  })

  it('should handle API 401 errors without triggering logout loop', async () => {
    // Mock a logged-in user
    const mockUser = {
      id: 'user-id',
      email: 'daniel@getwithai.com',
      created_at: new Date().toISOString(),
    }
    
    useAuthStore.setState({ 
      user: mockUser, 
      isAdmin: true, 
      isLoading: false 
    })

    // Mock API call that returns 401
    const mockError = {
      response: { status: 401 },
      message: 'Unauthorized',
    }
    vi.mocked(api.get).mockRejectedValue(mockError)

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    // Verify the page renders
    expect(screen.getByText('dashboard.welcome')).toBeInTheDocument()

    // Wait for the API call to be made and fail
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/users/stats')
    })

    // The user should still be in the store (no automatic logout)
    const { user } = useAuthStore.getState()
    expect(user).not.toBeNull()
    expect(user?.email).toBe('daniel@getwithai.com')
  })

  it('should gracefully handle missing profiles table', async () => {
    // Mock a logged-in user
    const mockUser = {
      id: 'user-id',
      email: 'daniel@getwithai.com',
      created_at: new Date().toISOString(),
    }
    
    useAuthStore.setState({ 
      user: mockUser, 
      isAdmin: true, 
      isLoading: false 
    })

    // Mock API call that returns profile not found (404)
    const mockError = {
      response: { status: 404 },
      message: 'Profile not found',
    }
    vi.mocked(api.get).mockRejectedValue(mockError)

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    // Verify the page renders even with profile errors
    expect(screen.getByText('dashboard.welcome')).toBeInTheDocument()

    // The user should still be in the store
    const { user } = useAuthStore.getState()
    expect(user).not.toBeNull()
  })

  it('should handle successful API calls after login', async () => {
    // Mock a logged-in user
    const mockUser = {
      id: 'user-id',
      email: 'daniel@getwithai.com',
      created_at: new Date().toISOString(),
    }
    
    useAuthStore.setState({ 
      user: mockUser, 
      isAdmin: true, 
      isLoading: false 
    })

    // Mock successful API response
    const mockStats = {
      data: {
        totalUsers: 1,
        newUsersThisWeek: 0,
        activeUsersToday: 1,
      },
    }
    vi.mocked(api.get).mockResolvedValue(mockStats)

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    // Verify the page renders and stats are displayed
    expect(screen.getByText('dashboard.welcome')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/users/stats')
    })

    // The user should still be in the store
    const { user } = useAuthStore.getState()
    expect(user).not.toBeNull()
  })
}) 