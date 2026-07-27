import { defineConfig } from '@king-3/prettier-config'

export default defineConfig({
  tailwindStylesheet: './src/styles/global.css',
  plugins: ['@prettier/plugin-oxc', 'prettier-plugin-tailwindcss']
})
