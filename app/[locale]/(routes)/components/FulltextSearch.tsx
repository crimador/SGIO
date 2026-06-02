'use client';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const FulltextSearch = () => {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = async () => {
    router.push(`/fulltext-search?q=${search}`);
    setSearch('');
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder={'Rechercher...'}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        type="submit"
        onClick={handleSearch}
        className="flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
      >
        <span className="hidden sm:flex">Rechercher</span>
        <SearchIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FulltextSearch;
