'use client';

import { useRouter } from 'next/navigation';

const TryAgain = () => {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
      style={{ color: '#1E1D3D' }}
    >
      Try again
    </button>
  );
};

export default TryAgain;
