'use client';

import { Spinner } from '@heroui/react';

interface AuthLoadingProps {
  title?: string;
}

export function AuthLoading({ title = 'Profile' }: AuthLoadingProps) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b p-4 mb-6">
        <h1 className="text-xl font-semibold text-center">{title}</h1>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}
