
import React from 'react';
import { APP_NAME } from '../constants';
import { UserScreenView } from '../types';

interface FooterProps {
  onNavigate: (screen: UserScreenView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-transparent text-text-secondary py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <div className="flex justify-center items-center space-x-4 mt-3">
          <button
            onClick={() => onNavigate(UserScreenView.TermsAndConditions)}
            className="text-xs text-gray-500 hover:text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
          >
            Terms & Conditions
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => onNavigate(UserScreenView.PrivacyPolicy)}
            className="text-xs text-gray-500 hover:text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
          >
            Privacy Policy
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Your Trusted Partner in Transportation.</p>
      </div>
    </footer>
  );
};

export default Footer;
