'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import * as api from '@/lib/api';
import Spinner from '@/components/Spinner';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { MailIcon } from '@/components/icons/MailIcon';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await api.verifyEmail(token, email);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                // Store user data and redirect to home
                localStorage.setItem('hanziflow_user', JSON.stringify(response));
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage((err as Error).message || 'Failed to verify email');
            }
        };

        verifyEmail();
    }, [token, email, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
                {status === 'verifying' && (
                    <>
                        <Spinner />
                        <h1 className="text-2xl font-bold text-gray-800 mt-4">Verifying Email</h1>
                        <p className="text-gray-600 mt-2">Please wait while we verify your email address...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-green-600 mt-4">Email Verified!</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirecting you to the app in 3 seconds...</p>
                        <Link
                            href="/"
                            className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            Go to Home
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <MailIcon className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-red-600 mt-4">Verification Failed</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <div className="mt-6 space-y-3">
                            <Link
                                href={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                            >
                                Resend Verification Email
                            </Link>
                            <p className="text-sm text-gray-500">
                                Or{' '}
                                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                    back to Login
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
