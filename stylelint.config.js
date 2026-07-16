/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],

  // 忽略检查的文件目录
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '.next/**',
    'node_modules/**',
    'public/**'
  ],

  plugins: ['stylelint-order'],

  rules: {
    // 禁用类名命名规范检查
    'selector-class-pattern': null,
    // 允许空样式文件
    'no-empty-source': null,
    // 关闭选择器优先级降序检查
    'no-descending-specificity': null,

    // 强制在 CSS 规则（rule）之前空一行，提升代码可读性
    'rule-empty-line-before': [
      'always',
      {
        // 忽略注释后的规则，以及父元素内部的第一个子元素
        ignore: ['after-comment', 'first-nested']
      }
    ],

    // 允许使用已废弃的指令
    'at-rule-no-deprecated': null,
    // 对 @import 引用写法不作强制要求
    'import-notation': null,
    // 允许使用现代的媒体查询范围写法
    'media-feature-range-notation': null,

    // Allow CSS Modules pseudo-classes
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'export', 'local']
      }
    ],

    // 允许 Tailwind 特有指令
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'theme',
          'plugin',
          'utility',
          'variant',
          'apply',
          'reference',
          'layer',
          'custom-variant',
          'config'
        ]
      }
    ],
    // 允许使用 Tailwind 特有函数
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'screen']
      }
    ],

    // 内部元素排序规则
    'order/order': [
      ['custom-properties', 'at-rules', 'declarations', 'rules'],
      {
        severity: 'warning'
      }
    ]
  }
}
