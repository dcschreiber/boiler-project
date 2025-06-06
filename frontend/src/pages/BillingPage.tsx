import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/services/api'
import toast from 'react-hot-toast'

const STRIPE_ENABLED = import.meta.env.VITE_STRIPE_ENABLED === 'true'

export default function BillingPage() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      if (!STRIPE_ENABLED) return null
      const response = await api.get('/api/billing/subscription')
      return response.data
    },
    enabled: STRIPE_ENABLED,
  })

  const createCheckoutSession = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await api.post('/api/billing/create-checkout-session', {
        price_id: priceId,
      })
      return response.data
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: () => {
      toast.error('Failed to create checkout session')
    },
  })

  const createPortalSession = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/billing/create-portal-session')
      return response.data
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
    onError: () => {
      toast.error('Failed to open billing portal')
    },
  })

  if (!STRIPE_ENABLED) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('billing.title')}</h1>
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-600">Billing is not enabled for this application.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('billing.title')}</h1>

      {/* Current Plan */}
      <div className="card mb-8">
        <div className="card-body">
          <h2 className="text-xl font-semibold mb-4">{t('billing.currentPlan')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subscription?.status === 'active' ? t('billing.premium') : t('billing.free')}
              </p>
              {subscription?.status === 'active' && (
                <p className="text-sm text-gray-600">
                  Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            {subscription?.status === 'active' && (
              <button
                onClick={() => createPortalSession.mutate()}
                className="btn-outline"
              >
                {t('billing.manage')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      {(!subscription || subscription.status !== 'active') && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-2">{t('billing.free')}</h3>
              <p className="text-3xl font-bold mb-6">
                $0<span className="text-base font-normal text-gray-600">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                {t('billing.features.free', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button disabled className="btn-outline w-full opacity-50 cursor-not-allowed">
                Current Plan
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="card border-primary-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Recommended
              </span>
            </div>
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-2">{t('billing.premium')}</h3>
              <p className="text-3xl font-bold mb-6">
                $29<span className="text-base font-normal text-gray-600">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                {t('billing.features.premium', { returnObjects: true }).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => createCheckoutSession.mutate('price_monthly')}
                disabled={createCheckoutSession.isPending}
                className="btn-primary w-full"
              >
                {createCheckoutSession.isPending ? t('common.loading') : t('billing.subscribe')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}