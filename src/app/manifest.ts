import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Think India SVNIT',
    short_name: 'Think India',
    description: 'Student-driven forum promoting nationalistic spirit, leadership, and civic engagement',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#d97706',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
    categories: ['education', 'social', 'community'],
    lang: 'en-IN',
    dir: 'ltr',
  }
}
