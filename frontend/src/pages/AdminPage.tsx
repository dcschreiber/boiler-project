import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/api/admin/stats')
      return response.data
    },
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', page, searchTerm, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      })
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      
      const response = await api.get(`/api/admin/users?${params}`)
      return response.data
    },
  })

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      await api.put(`/api/admin/users/${userId}/admin`, { is_admin: isAdmin })
    },
    onSuccess: () => {
      toast.success('User role updated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/admin/users/${userId}`)
    },
    onSuccess: () => {
      toast.success('User deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setShowDeleteModal(false)
      setSelectedUser(null)
    },
  })

  const exportUsers = async () => {
    try {
      const response = await api.get('/api/admin/users/export', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'users.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Failed to export users')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.title')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <p className="text-sm font-medium text-gray-600">{t('admin.stats.totalUsers')}</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm font-medium text-gray-600">{t('admin.stats.newThisWeek')}</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.newUsersThisWeek || 0}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm font-medium text-gray-600">{t('admin.stats.newThisMonth')}</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.newUsersThisMonth || 0}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm font-medium text-gray-600">{t('admin.stats.activeToday')}</p>
            <p className="text-2xl font-semibold text-gray-900">{stats?.activeUsersToday || 0}</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">{t('admin.users.title')}</h2>
            <div className="flex gap-2">
              <button onClick={exportUsers} className="btn-outline text-sm">
                {t('admin.users.export')}
              </button>
              <a
                href={import.meta.env.VITE_GOOGLE_ANALYTICS_ID ? 'https://analytics.google.com' : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-sm"
              >
                {t('admin.analytics')}
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder={t('admin.users.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input w-full sm:w-auto"
            >
              <option value="">{t('admin.users.filter')}</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.users.columns.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.users.columns.email')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.users.columns.role')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.users.columns.createdAt')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.users.columns.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users?.users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleAdminMutation.mutate({ userId: user.id, isAdmin: !user.is_admin })}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            {user.is_admin ? t('admin.users.removeAdmin') : t('admin.users.makeAdmin')}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteModal(true)
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t('admin.users.deleteUser')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {users && users.total > users.per_page && (
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-outline text-sm"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="flex items-center px-4">
                    Page {page} of {Math.ceil(users.total / users.per_page)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(users.total / users.per_page)}
                    className="btn-outline text-sm"
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{t('admin.users.deleteUser')}</h3>
            <p className="text-gray-600 mb-6">
              {t('admin.users.confirmDelete')}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              User: {selectedUser.email}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="btn-outline"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                disabled={deleteUserMutation.isPending}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {deleteUserMutation.isPending ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}