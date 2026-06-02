'use client';

import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ResultPage from '../search/components/ResultPage';
import { Loader2 } from 'lucide-react';

const SearchResult = () => {
  const searchParams = useSearchParams();
  const search = searchParams?.get('q') ?? null;

  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!search) return;
    setIsLoading(true);
    axios
      .post('/api/fulltext-search', { data: search })
      .then((res) => setResults(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Recherche en cours…</span>
      </div>
    );
  }

  return <ResultPage search={search} results={results} />;
};

export default SearchResult;
