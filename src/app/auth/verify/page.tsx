'use client';

import { Suspense } from 'react';
import VerifyContent from './content';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
