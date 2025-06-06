import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mt-4">
          {t('errors.404')}
        </p>
        <p className="text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary">
          Go back home
        </Link>
      </div>
    </div>
  )
}