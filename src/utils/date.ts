const nzDateFormatter = new Intl.DateTimeFormat('en-NZ', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Pacific/Auckland',
});

export function formatNzDate(value) {
  if (!value) return 'Unknown date';
  return nzDateFormatter.format(new Date(value));
}
