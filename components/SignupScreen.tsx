import React, { useState } from 'react';
// User type no longer needed here as data is passed directly.
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, UserPlusIcon } from './icons/FluentIcons';
import { APP_NAME } from '../constants';

interface SignupScreenProps {
  onSignupSubmit: (fullName: string, email: string, contact: string, password: string) => Promise<string | void>; // Prop to call App.tsx API handler
  onSignupSuccess: () => void; // Callback to signal completion of signup flow (UI part)
  onNavigateToLogin: () => void; 
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSubmit, onSignupSuccess, onNavigateToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !contact || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    if (!/^(?:\+256|0)\d{9}$/.test(contact.replace(/\s/g, ''))) { // Basic Ugandan phone regex
        setError('Please enter a valid Ugandan phone number (e.g., 07XXXXXXXX or +256XXXXXXXXX).');
        return;
    }
    if (password.length < 6) { // Basic password length
        setError('Password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);
    const apiError = await onSignupSubmit(fullName, email, contact, password);
    setIsLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setSuccess('Signup successful! Redirecting to login...');
      setFullName('');
      setEmail('');
      setContact('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onSignupSuccess(); // Call this to signal internal flow completion (e.g., LoginSelectionScreen can hide this form)
                           // App.tsx's handler (onUserSignupSuccessNav) will then take over for app-level navigation.
      }, 1500); // Shorter timeout as API call is already done
    }
  };

  return (
     <Card title={`User Signup - Join ${APP_NAME}`} className="w-full space-y-8 bg-brand-bg-alt">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-brand-primary">
            Create your User account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md" role="alert">{error}</p>}
          {success && <p className="text-center text-sm text-green-600 bg-green-100 p-3 rounded-md" role="status">{success}</p>}
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<UserCircleIcon />}
            disabled={isLoading}
            aria-invalid={!!(error && error.includes("fields"))}
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<EnvelopeIcon />}
            disabled={isLoading}
            aria-invalid={!!(error && (error.includes("fields") || error.includes("email")))}
          />
          <Input
            label="Contact Phone"
            name="contact"
            type="tel"
            autoComplete="tel"
            required
            placeholder="07XXXXXXXX / +2567XXXXXXXX"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            icon={<PhoneIcon />}
            disabled={isLoading}
            aria-invalid={!!(error && (error.includes("fields")|| error.includes("phone")))}
          />
          <Input
            label="Password (min. 6 characters)"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockClosedIcon />}
            disabled={isLoading}
            aria-invalid={!!(error && (error.includes("fields") || error.includes("Password") || error.includes("Passwords do not match")))}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<LockClosedIcon />}
            disabled={isLoading}
            aria-invalid={!!(error && (error.includes("fields") || error.includes("Passwords do not match")))}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" leftIcon={<UserPlusIcon />} isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        {!isLoading && (
            <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="font-medium text-brand-primary hover:text-opacity-80 focus:outline-none focus:underline">
                Sign in
            </button>
            </p>
        )}
      </Card>
  );
};

export default SignupScreen;