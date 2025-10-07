// Load environment variables in Node.js environment (for tests and server-side)
// This won't run in the browser
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config()
  } catch {
    // dotenv not available or already loaded, that's okay
  }
}

export const LOGGED_IN_HOME = '/dashboard'

export const COMPANY_NAME = 'Mindful Eye'

export const APP_PREFIX = 'MindfulEye'

export const RUNTIME_ENV = process.env.NEXT_PUBLIC_RUNTIME_ENV as string


export function generateRandomString(length: any) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
