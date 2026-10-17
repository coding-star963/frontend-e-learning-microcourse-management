// Every account uses a Gmail address (mirrors the API's GmailAddress rule).
export const GMAIL_ERROR = 'Only Gmail addresses (ending in @gmail.com) are allowed.';

export function isGmail(email) {
  return /^[^@\s]+@gmail\.com$/i.test((email || '').trim());
}
