
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import Spinner from './Spinner';
import { MailIcon } from './icons/MailIcon';
import { LockIcon } from './icons/LockIcon';
import { UserIcon } from './icons/UserIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

// --- Input Field Component ---
// Moved outside AuthScreen to prevent re-creation on every render, which caused focus loss.
interface InputFieldProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    Icon: React.FC<{ className?: string }>;
    error: string;
    isTouched: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ id, type, placeholder, value, onChange, onBlur, Icon, error, isTouched }) => {
  const isValid = isTouched && !error;
  const isInvalid = isTouched && !!error;
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 ${isInvalid ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
      <input
        id={id}
        name={id}
        type={type}
        required
        className={`appearance-none block w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors
          ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${isValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500' : ''}
          ${!isTouched ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' : ''}
        `}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isInvalid && <XIcon className="h-5 w-5 text-red-500" />}
        {isValid && <CheckIcon className="h-5 w-5 text-green-500" />}
      </div>
    </div>
  );
};


const AuthScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Validation state
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });

  if (!context) return <div>Loading context...</div>;
  const { login, register, state } = context;

  // --- Validation Logic ---
  const validate = useCallback(() => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    // Name validation (only for register)
    if (mode === 'register' && name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters long.';
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }

    // Password validation
    if (!password) {
        newErrors.password = 'Password is required.';
    } else if (mode === 'register') {
        if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
        else if (!/(?=.*[a-z])/.test(password)) newErrors.password = 'Must contain a lowercase letter.';
        else if (!/(?=.*[A-Z])/.test(password)) newErrors.password = 'Must contain an uppercase letter.';
        else if (!/(?=.*\d)/.test(password)) newErrors.password = 'Must contain a number.';
        else if (!/(?=.*[\W_])/.test(password)) newErrors.password = 'Must contain a special character.';
    }

    // Confirm Password validation
    if (mode === 'register' && !confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
    } else if (mode === 'register' && password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(x => x === '');
  }, [name, email, password, confirmPassword, mode]);

  useEffect(() => {
    if (touched.name || touched.email || touched.password || touched.confirmPassword) {
        validate();
    }
  }, [name, email, password, confirmPassword, touched, validate]);

  const handleBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true }); // Mark all as touched on submit
    
    if (validate()) {
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password, rememberMe);
      }
    }
  };

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'login' ? 'register' : 'login');
    // Clear fields and validation state on mode switch
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({ name: '', email: '', password: '', confirmPassword: '' });
    setTouched({ name: false, email: false, password: false, confirmPassword: false });
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Decorative Panel */}
      <div className="hidden lg:flex w-1/2 bg-indigo-700 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute bg-indigo-800 rounded-full w-96 h-96 -top-10 -left-16 opacity-50"></div>
        <div className="absolute bg-indigo-800 rounded-full w-80 h-80 -bottom-24 -right-10 opacity-50"></div>
        <div className="z-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight">Welcome to HanziFlow</h1>
          <p className="mt-4 text-lg opacity-80">Master Chinese characters with smart flashcards and interactive quizzes. Your journey to fluency starts here.</p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="rounded-md shadow-sm space-y-4">
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mode === 'register' ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                {mode === 'register' && (
                    <div className='space-y-4'>
                        <div>
                            <InputField id="name" type="text" placeholder="Your Name" value={name} 
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => handleBlur('name')}
                                Icon={UserIcon} error={errors.name} isTouched={touched.name}
                            />
                            {touched.name && errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
                        </div>
                    </div>
                )}
              </div>
              
              <div>
                <InputField id="email" type="email" placeholder="Email address" value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    Icon={MailIcon} error={errors.email} isTouched={touched.email}
                />
                {touched.email && errors.email && <p className="mt-2 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <InputField id="password" type="password" placeholder="Password" value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    Icon={LockIcon} error={errors.password} isTouched={touched.password}
                />
                {touched.password && errors.password && <p className="mt-2 text-xs text-red-600">{errors.password}</p>}
              </div>

               <div className={`transition-all duration-500 ease-in-out overflow-hidden ${mode === 'register' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                 {mode === 'register' && (
                    <div>
                        <InputField id="confirmPassword" type="password" placeholder="Confirm Password" value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => handleBlur('confirmPassword')}
                            Icon={LockIcon} error={errors.confirmPassword} isTouched={touched.confirmPassword}
                        />
                        {touched.confirmPassword && errors.confirmPassword && <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>}
                    </div>
                 )}
               </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={state.isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-transform transform hover:scale-105"
              >
                {state.isLoading ? <Spinner /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleMode} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;