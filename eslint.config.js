import { defineConfig } from '@king-3/eslint-config'

export default defineConfig(
  {
    typescript: true,
    react: true
  },
  {
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
)
