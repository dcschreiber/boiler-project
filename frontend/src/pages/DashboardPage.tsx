import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/api/users/stats')
      return response.data
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.welcome', { name: user?.email?.split('@')[0] })}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.stats.users')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : stats?.totalUsers || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.stats.newUsers')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : stats?.newUsersThisWeek || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('dashboard.stats.activeUsers')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : stats?.activeUsersToday || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/profile" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-500">Manage your account settings</p>
                  </div>
                </div>
              </a>
              <a href="/billing" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Billing & Subscription</p>
                    <p className="text-sm text-gray-500">Manage your subscription plan</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <p className="ml-3 text-gray-600">Account created</p>
                <p className="ml-auto text-gray-500">Just now</p>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                </div>
                <p className="ml-3 text-gray-600">Logged in</p>
                <p className="ml-auto text-gray-500">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}