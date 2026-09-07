import { defineConfig } from '@king3/prettier-config'

export default defineConfig({
  tailwindStylesheet: './src/styles/global.css',
  plugins: ['prettier-plugin-tailwindcss']
})
