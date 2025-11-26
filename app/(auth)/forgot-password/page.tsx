'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api';
import { MailIcon } from '@/components/icons/MailIcon';
import { KeyIcon } from '@/components/icons/KeyIcon';
import Spinner from '@/components/Spinner';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [step, setStep] = useState(token ? 'reset' : 'forgot'); // 'forgot' or 'reset'
    const [forgotEmail, setForgotEmail] = useState(email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            if (!forgotEmail) {
                setError('Please enter your email address');
                return;
            }

            const response = await api.forgotPassword(forgotEmail);
            setMessage(response.message);
            setForgotEmail('');
            // Show success for 3 seconds then go back to login
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const validatePassword = (pwd: string): string | null => {
        if (!pwd) return 'Password is required';
        if (pwd.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(pwd)) return 'Must contain a lowercase letter';
        if (!/(?=.*[A-Z])/.test(pwd)) return 'Must contain an uppercase letter';
        if (!/(?=.*\d)/.test(pwd)) return 'Must contain a number';
        if (!/(?=.*[\W_])/.test(pwd)) return 'Must contain a special character';
        return null;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            if (!token || !email) {
                setError('Invalid reset link');
                return;
            }

            const passwordError = validatePassword(newPassword);
            if (passwordError) {
                setError(passwordError);
                return;
            }

            if (newPassword !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            const response = await api.resetPassword(token, email, newPassword);
            setMessage(response.message);
            setNewPassword('');
            setConfirmPassword('');
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    {step === 'forgot' ? 'Forgot Password?' : 'Reset Password'}
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    {step === 'forgot'
                        ? "Enter your email and we'll send you a password reset link"
                        : 'Enter your new password below'}
                </p>

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
                        <p className="text-green-700 text-sm">{message}</p>
                    </div>
                )}

                {/* Forgot Password Form */}
                {step === 'forgot' ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                ) : (
                    // Reset Password Form
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                            {/* Password Requirements */}
                            {newPassword && (
                                <div className="mt-2 space-y-1">
                                    <p className={`text-xs flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                        {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                                    </p>
                                    <p className={`text-xs flex items-center gap-1 ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                        {/[a-z]/.test(newPassword) ? '✓' : '○'} Lowercase letter
                                    </p>
                                    <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                        {/[A-Z]/.test(newPassword) ? '✓' : '○'} Uppercase letter
                                    </p>
                                    <p className={`text-xs flex items-center gap-1 ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                        {/\d/.test(newPassword) ? '✓' : '○'} Number
                                    </p>
                                    <p className={`text-xs flex items-center gap-1 ${/[\W_]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                        {/[\W_]/.test(newPassword) ? '✓' : '○'} Special character
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <KeyIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    disabled={isLoading}
                                />
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                            {confirmPassword && newPassword === confirmPassword && (
                                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                )}

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-2">
                    <Link
                        href="/login"
                        className="block text-blue-600 hover:text-blue-700 font-medium transition"
                    >
                        Back to Login
                    </Link>
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
