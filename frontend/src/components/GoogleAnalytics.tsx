import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}

export function GoogleAnalytics() {
  const location = useLocation()
  const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID

  useEffect(() => {
    if (!gaId || !window.gtag) return

    window.gtag('config', gaId, {
      page_path: location.pathname + location.search,
    })
  }, [location, gaId])

  useEffect(() => {
    if (!gaId) return

    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    
    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `

    document.head.appendChild(script1)
    document.head.appendChild(script2)

    return () => {
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [gaId])

  return null
}