'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as api from '@/lib/api';
import { MailIcon } from '@/components/icons/MailIcon';
import Spinner from '@/components/Spinner';

export default function ResendVerificationPage() {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email');
    
    const [email, setEmail] = useState(emailParam || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            if (!email) {
                setError('Please enter your email address');
                return;
            }

            const response = await api.resendVerificationEmail(email);
            setMessage(response.message);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <MailIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Resend Verification</h1>
                    <p className="text-gray-600 mt-2">
                        Didn't receive the verification email? Enter your email to receive a new one.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <div className="text-red-600 mr-3 mt-0.5">⚠️</div>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {message && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
                        <div className="text-green-600 mr-3 mt-0.5">✓</div>
                        <div>
                            <p className="text-green-700 text-sm">{message}</p>
                            <p className="text-green-600 text-xs mt-1">Check your inbox and spam folder.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleResend} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <MailIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Spinner />
                                Sending...
                            </>
                        ) : (
                            'Resend Verification Email'
                        )}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-2">
                    <Link
                        href="/login"
                        className="block text-indigo-600 hover:text-indigo-700 font-medium transition"
                    >
                        Back to Login
                    </Link>
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
