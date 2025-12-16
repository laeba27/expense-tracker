'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wallet, CheckCircle, AlertCircle, Loader } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');
        
        // Check if there's already a result in URL
        const error = searchParams.get('error');
        const success = searchParams.get('success');

        if (success === 'verified') {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => router.push('/auth/login?success=verified'), 2000);
          return;
        }

        if (error) {
          setStatus('error');
          if (error === 'no-token') setMessage('No verification token found.');
          else if (error === 'invalid-token') setMessage('Token has expired or is invalid.');
          else if (error === 'verification-failed') setMessage('Verification failed. Please try again.');
          else if (error === 'user-not-found') setMessage('User account not found.');
          else setMessage('An error occurred during verification.');
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('No verification token provided.');
          return;
        }

        // Call verify API endpoint
        console.log('🔍 [VERIFY-CLIENT] Calling verification endpoint with token...');
        
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
          method: 'GET',
        });

        console.log('📊 [VERIFY-CLIENT] Response status:', response.status);

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          console.log('✅ [VERIFY-CLIENT] Verification successful!');
          setTimeout(() => router.push('/auth/login?success=verified'), 2000);
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
          console.error('❌ [VERIFY-CLIENT] Verification failed:', data);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ [VERIFY-CLIENT] Error:', errorMsg);
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <main className="w-full min-h-screen bg-slate-950 text-white flex flex-col">
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition">
              <Wallet className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </Link>
        </div>
      </nav>

      {/* ============ VERIFICATION CARD ============ */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 pt-32">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">Email Verification</h1>
            <p className="text-slate-400">Verifying your email address</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-12 text-center">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader className="w-12 h-12 text-emerald-400 animate-spin" />
                </div>
                <p className="text-slate-300">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-emerald-400" />
                </div>
                <p className="text-emerald-300 font-medium">{message}</p>
                <p className="text-sm text-slate-400">Redirecting to login...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <AlertCircle className="w-16 h-16 text-red-400" />
                </div>
                <p className="text-red-300 font-medium">{message}</p>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium rounded-lg transition"
                  >
                    Back to Registration
                  </button>
                  <Link href="/auth/login" className="block px-4 py-2 border border-slate-600 text-slate-300 hover:text-white font-medium rounded-lg transition text-center">
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default VerifyContent;
