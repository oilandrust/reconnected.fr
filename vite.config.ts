import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/reconnected.fr/
// Custom domain (later): set GITHUB_PAGES=false and base stays '/'
const base = process.env.GITHUB_PAGES === 'true' ? '/reconnected.fr/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
})
