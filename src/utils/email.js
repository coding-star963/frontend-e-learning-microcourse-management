// Student accounts must use a Gmail address (mirrors the API's GmailAddress rule).
export const GMAIL_ERROR = 'Student accounts must use a Gmail address (ending in @gmail.com).';

export function isGmail(email) {
  return /^[^@\s]+@gmail\.com$/i.test((email || '').trim());
}
