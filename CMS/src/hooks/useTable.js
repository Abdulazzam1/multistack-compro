import { useState } from 'react';

export function useTable(initialPage = 1, initialLimit = 20) {
  const [page, setPage]   = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const totalPages = (total) => Math.max(1, Math.ceil(total / limit));
  return { page, setPage, limit, setLimit, totalPages };
}
