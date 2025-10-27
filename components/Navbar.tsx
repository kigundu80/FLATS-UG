import React from 'react';
import { UserScreenView } from '../types'; 
import { APP_NAME } from '../constants';
import { ArrowLeftOnRectangleIcon } from './icons/FluentIcons'; 
import Button from './Button';

interface NavbarProps {
  onNavigate: (screen: UserScreenView) => void;
  currentScreen: UserScreenView;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, isAuthenticated, onLogout }) => {
  return (
    <header className="bg-surface shadow-sm h-16 sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <span 
              className="font-extrabold text-2xl text-primary cursor-pointer" 
              onClick={() => onNavigate(UserScreenView.Home)}
              aria-label={`${APP_NAME} Home`}
            >
              {APP_NAME}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <Button onClick={onLogout} variant="ghost" size="sm" className="text-text-secondary hover:bg-gray-100 px-2 sm:px-3" aria-label="Logout">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;