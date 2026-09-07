import { defineConfig } from '@king3/eslint-config'

export default defineConfig(
  {
    typescript: true,
    react: true
  },
  {
    rules: {
      'react-refresh/only-export-components': 'off', // 单个文件只允许导出一个组件
      'react/set-state-in-effect': 'off' // useEffect 内不允许使用 setState
    }
  }
)
