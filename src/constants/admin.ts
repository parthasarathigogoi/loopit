export const ADMIN_EMAIL = 'loopitresale@gmail.com';

export const normalizeEmail = (email?: string | null) =>
  email?.trim().toLowerCase() ?? '';
