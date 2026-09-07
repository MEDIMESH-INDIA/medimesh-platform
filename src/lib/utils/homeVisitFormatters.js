export function formatVisitDate(date, time) {
  if (!date) return 'Date unavailable';
  const value = new Date(`${date}T${time || '00:00:00'}`);
  const formatted = value.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = time ? value.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';
  return `${formatted}${formattedTime ? ` · ${formattedTime}` : ''}`;
}

