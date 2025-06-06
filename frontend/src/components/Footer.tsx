import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-6">
            <Link
              to="/privacy"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              {t('footer.terms')}
            </Link>
            <a
              href="mailto:support@example.com"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              {t('footer.contact')}
            </a>
          </div>
          <p className="text-sm text-gray-500">
            {t('footer.copyright', { year: currentYear, company: t('app.name') })}
          </p>
        </div>
      </div>
    </footer>
  )
}