import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function CookieConsent() {
  const { t } = useTranslation()
  const [showBanner, setShowBanner] = useState(false)
  const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID

  useEffect(() => {
    // Only show if analytics is enabled and consent not given
    if (gaId && !localStorage.getItem('cookieConsent')) {
      setShowBanner(true)
    }
  }, [gaId])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShowBanner(false)
    // Disable GA
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{t('cookies.title')}</h3>
          <p className="text-sm text-gray-600">{t('cookies.description')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="btn-outline text-sm"
          >
            {t('cookies.decline')}
          </button>
          <button
            onClick={handleAccept}
            className="btn-primary text-sm"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}