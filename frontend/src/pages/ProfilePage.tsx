import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import toast from 'react-hot-toast'

interface ProfileForm {
  name: string
  language: string
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, updateProfile } = useAuthStore()
  const queryClient = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await api.get('/api/users/me')
      return response.data
    },
    enabled: !!user,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      name: profile?.name || '',
      language: profile?.language || 'en',
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await api.put('/api/users/me', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(t('profile.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      if (data.language !== i18n.language) {
        i18n.changeLanguage(data.language)
      }
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/api/users/me')
    },
    onSuccess: () => {
      toast.success('Account deleted')
      // Sign out and redirect
      window.location.href = '/'
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('profile.title')}</h1>

      <div className="card mb-8">
        <div className="card-body">
          <h2 className="text-xl font-semibold mb-6">{t('profile.personalInfo')}</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="label">{t('profile.email')}</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-gray-50"
              />
            </div>

            <div>
              <label className="label">{t('profile.name')}</label>
              <input
                {...register('name')}
                type="text"
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="label">{t('profile.language')}</label>
              <select {...register('language')} className="input">
                <option value="en">English</option>
                {/* Add more languages as needed */}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-primary"
              >
                {updateMutation.isPending ? t('common.loading') : t('profile.updateButton')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-red-200">
        <div className="card-body">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <p className="text-gray-600 mb-4">{t('profile.deleteAccountWarning')}</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-outline border-red-500 text-red-500 hover:bg-red-50"
          >
            {t('profile.deleteAccount')}
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Account Deletion</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? t('common.loading') : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}