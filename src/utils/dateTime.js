// Converts between API timestamps (ISO, UTC) and <input type="datetime-local"> values (local time).

export function toLocalInputValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function toIsoString(localValue) {
  return localValue ? new Date(localValue).toISOString() : '';
}

export function formatDateTime(isoString) {
  return isoString ? new Date(isoString).toLocaleString() : '';
}
