export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
};

export const truncate = (str, n = 120) =>
  str?.length > n ? str.slice(0, n).trim() + '...' : str;

export const waUrl = (phone, msg = '') =>
  `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
