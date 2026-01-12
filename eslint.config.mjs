import next from 'eslint-config-next'
import reactCompiler from 'eslint-plugin-react-compiler'
import sonarjs from 'eslint-plugin-sonarjs'

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      'src/shared/db/types.ts',
      'report/**',
    ],
  },
  ...next,
  {
    plugins: {
      'react-compiler': reactCompiler,
      sonarjs,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      ...sonarjs.configs.recommended.rules,
    },
  },
  {
    rules: {
      // React
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never' },
      ],
      'react/self-closing-comp': ['warn', { component: true, html: true }],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'object-shorthand': 'warn',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
    },
  },
]

export default eslintConfig
