
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon as UserIdIcon, ArrowRightOnRectangleIcon, UserPlusIcon } from './icons/FluentIcons';
import UserSignupScreen from './SignupScreen'; 

interface LoginSelectionScreenProps {
  onUserLogin: (email: string, password: string) => Promise<string | void>; // Returns error message or void
  onUserSignup: (fullName: string, email: string, contact: string, password: string) => Promise<string | void>; // Returns error message or void
  onDriverLogin: (driverId: string, password: string) => Promise<string | void>;  // Returns error message or void
  onUserSignupSuccessNav: () => void; // Called after signup process completes, to navigate
}

const LoginSelectionScreen: React.FC<LoginSelectionScreenProps> = ({ 
  onUserLogin, 
  onUserSignup,
  onDriverLogin, 
  onUserSignupSuccessNav 
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'driver'>('user');
  const [showUserSignupForm, setShowUserSignupForm] = useState(false);

  // User Login states
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userLoginError, setUserLoginError] = useState('');
  const [isUserLoginLoading, setIsUserLoginLoading] = useState(false);

  // Driver Login states
  const [driverId, setDriverId] = useState('DRV001');
  const [driverPassword, setDriverPassword] = useState('password123');
  const [driverError, setDriverError] = useState('');
  const [isDriverLoginLoading, setIsDriverLoginLoading] = useState(false);


  const handleUserLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoginError('');
    if (!userEmail || !userPassword) {
      setUserLoginError('Please enter both email and password.');
      return;
    }
    setIsUserLoginLoading(true);
    const errorMsg = await onUserLogin(userEmail, userPassword);
    setIsUserLoginLoading(false);
    if (errorMsg) {
      setUserLoginError(errorMsg);
    }
    // On success, App.tsx handles navigation.
  };

  const handleDriverLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDriverError('');
    if (!driverId || !driverPassword) {
      setDriverError('Please enter both Driver ID and password.');
      return;
    }
    setIsDriverLoginLoading(true);
    const errorMsg = await onDriverLogin(driverId, driverPassword);
    setIsDriverLoginLoading(false);
    if (errorMsg) {
      setDriverError(errorMsg);
    }
    // On success, App.tsx handles navigation.
  };

  // This function is passed to UserSignupScreen
  const handleUserSignupFormSubmit = async (fullName: string, email: string, contact: string, password: string): Promise<string | void> => {
    // onUserSignup is the prop from App.tsx which makes the API call
    const errorMsg = await onUserSignup(fullName, email, contact, password);
    if (errorMsg) {
      return errorMsg; // Return error to UserSignupScreen for display
    }
    // If successful (no errorMsg), UserSignupScreen will handle its success message and then call its onSignupSuccess prop.
  };

  // This function is called by UserSignupScreen's onSignupSuccess prop
  const handleUserSignupFormCompleted = () => {
    onUserSignupSuccessNav(); // Tell App.tsx to navigate (e.g., back to AuthSelection main view)
    setShowUserSignupForm(false); // Hide signup form, show login form
  };
  
  const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void, colorClass: string }> = ({ label, isActive, onClick, colorClass }) => (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className={`py-3 px-6 font-semibold text-center w-1/2 transition-all duration-200 rounded-t-lg border-b-2
                  ${isActive ? `${colorClass} text-white border-transparent` : 'bg-gray-200 text-text-secondary hover:bg-gray-300 border-gray-300'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">{APP_NAME}</h1>
            <p className="text-text-secondary mt-2">Your Journey, Your Way. Login or Sign Up.</p>
        </div>
        
        <div className="flex">
          <TabButton label="User" isActive={activeTab === 'user'} onClick={() => { setActiveTab('user'); }} colorClass="bg-primary" />
          <TabButton label="Driver" isActive={activeTab === 'driver'} onClick={() => setActiveTab('driver')} colorClass="bg-driver-primary" />
        </div>

        {activeTab === 'user' && (
          <div className="animate-fadeIn">
            {showUserSignupForm ? (
                <UserSignupScreen 
                    onSignupSubmit={handleUserSignupFormSubmit} 
                    onSignupSuccess={handleUserSignupFormCompleted}
                    onNavigateToLogin={() => setShowUserSignupForm(false)} 
                />
            ) : (
             <Card className="rounded-t-none shadow-xl">
                <h2 className="text-xl font-bold text-text-primary text-center mb-6">User Sign In</h2>
                <form className="space-y-6" onSubmit={handleUserLoginSubmit} noValidate>
                  {userLoginError && <p className="text-center text-sm text-danger bg-red-50 p-3 rounded-md" role="alert">{userLoginError}</p>}
                  <Input
                    label="Email address"
                    name="userEmail"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    icon={<EnvelopeIcon />}
                    disabled={isUserLoginLoading}
                  />
                  <Input
                    label="Password"
                    name="userPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    icon={<LockClosedIcon />}
                    disabled={isUserLoginLoading}
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full" leftIcon={<ArrowRightOnRectangleIcon />} isLoading={isUserLoginLoading} disabled={isUserLoginLoading}>
                    {isUserLoginLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-text-secondary">
                  New User?{' '}
                  <button onClick={() => { setShowUserSignupForm(true); setUserLoginError('');}} className="font-semibold text-primary hover:underline focus:outline-none focus:underline">
                    Create an account <UserPlusIcon className="w-4 h-4 inline"/>
                  </button>
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'driver' && (
          <div className="animate-fadeIn">
          <Card className="rounded-t-none shadow-xl">
            <h2 className="text-xl font-bold text-text-primary text-center mb-6">Driver Sign In</h2>
            <p className="text-xs text-center text-text-secondary mb-4 p-2 bg-gray-100 rounded-md">Driver accounts are created by an administrator. Use your provided credentials below.</p>
            <form className="space-y-6" onSubmit={handleDriverLoginSubmit} noValidate>
              {driverError && <p className="text-center text-sm text-danger bg-red-50 p-3 rounded-md" role="alert">{driverError}</p>}
              <Input
                label="Driver ID"
                name="driverId"
                type="text"
                autoComplete="username" 
                required
                placeholder="e.g., DRV001"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                icon={<UserIdIcon />}
                disabled={isDriverLoginLoading}
              />
              <Input
                label="Password"
                name="driverPassword"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                icon={<LockClosedIcon />}
                disabled={isDriverLoginLoading}
              />
              <Button type="submit" variant="primary" size="lg" className="w-full bg-driver-primary hover:bg-driver-primary-dark focus:ring-driver-primary" leftIcon={<ArrowRightOnRectangleIcon />} isLoading={isDriverLoginLoading} disabled={isDriverLoginLoading}>
                {isDriverLoginLoading ? 'Signing In...' : 'Driver Sign In'}
              </Button>
            </form>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSelectionScreen;
