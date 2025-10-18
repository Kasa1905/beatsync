module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn'
  }
}
