import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en/common.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: enTranslations,
  },
} as const

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n