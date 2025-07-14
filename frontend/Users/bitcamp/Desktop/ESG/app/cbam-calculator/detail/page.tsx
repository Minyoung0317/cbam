"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ClientComponent() {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    const params = useSearchParams();
    setSearchParams(params);
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {searchParams && <div>{/* Render something with searchParams */}</div>}
    </Suspense>
  );
}

export default ClientComponent; 