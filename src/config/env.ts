export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/rest' : 'http://localhost:8080/rest'),
  APP_NAME: import.meta.env.VITE_APP_NAME || 'CoopPlus MCS',
} as const;
