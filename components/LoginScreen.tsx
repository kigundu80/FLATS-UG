import React, { useState } from 'react';
import { User } from '../types'; 
import { LOCAL_STORAGE_USERS_DB_KEY } from '../constants';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from './icons/FluentIcons';
import { APP_NAME } from '../constants';


interface LoginScreenProps {
  onLogin: (user: User) => void; // This will be called by App.tsx/LoginSelectionScreen
  onNavigateToSignup: () => void;
}

// This component is now primarily for UI, actual login logic is elevated.
// It might be used within LoginSelectionScreen or replaced by it.
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const usersDb = localStorage.getItem(LOCAL_STORAGE_USERS_DB_KEY);
    if (usersDb) {
      try {
        const users: User[] = JSON.parse(usersDb);
        const foundUser = users.find(user => user.email === email);

        if (foundUser && foundUser.password === password) { 
          const { password: _, ...userToLogin } = foundUser;
          onLogin(userToLogin); // Callback to App.tsx or parent
        } else {
          setError('Invalid email or password.');
        }
      } catch (parseError) {
        console.error("Error parsing users DB:", parseError);
        setError("An error occurred while trying to log in. Please try again.");
      }
    } else {
      setError('No users registered. Please sign up.');
    }
  };

  return (
    // This styling might need adjustment based on how LoginSelectionScreen integrates it.
    // Assuming LoginSelectionScreen handles overall page centering.
    <Card title={`User Login - ${APP_NAME}`} className="w-full space-y-8 bg-brand-bg-alt">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-brand-primary">
            Sign in as a User
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md" role="alert">{error}</p>}
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
            aria-describedby={error ? "email-error" : undefined}
            aria-invalid={!!error}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockClosedIcon />}
            aria-describedby={error ? "password-error" : undefined}
            aria-invalid={!!error}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" leftIcon={<ArrowRightOnRectangleIcon />}>
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignup} className="font-medium text-brand-primary hover:text-opacity-80 focus:outline-none focus:underline">
            Sign up here
          </button>
        </p>
      </Card>
  );
};

export default LoginScreen;