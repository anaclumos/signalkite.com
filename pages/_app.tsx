import 'nextra-theme-docs/style.css'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import '../styles.css'

export default function Nextra({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <Script src="https://sa.cho.sh/latest.js" strategy="afterInteractive" />
    </>
  )
}
