export const LOGGED_IN_HOME = '/chatter'

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
