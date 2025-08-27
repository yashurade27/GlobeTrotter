'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gray-50">
      <div className="flex flex-col items-center max-w-md mx-auto text-center">
        <div className="p-4 rounded-full bg-red-100 mb-6">
          <Shield className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
          Access Denied
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          You don&apos;t have permission to access this page. Please contact an administrator if you believe this is a mistake.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}