
import React from 'react';
import { UserScreenView } from '../types'; // Changed from ScreenView
import { HomeIcon, ListBulletIcon, MapPinIcon as TrackIcon, SparklesIcon } from './icons/FluentIcons';
import BottomNavItem from './BottomNavItem';

interface BottomNavbarProps {
  onNavigate: (screen: UserScreenView) => void;
  currentScreen: UserScreenView;
  isBookingActive: boolean;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onNavigate, currentScreen, isBookingActive }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-surface border-t border-gray-200 shadow-top z-40" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto h-full flex justify-around items-stretch px-2">
        <BottomNavItem 
          screen={UserScreenView.Home} 
          currentScreen={currentScreen} 
          onClick={() => onNavigate(UserScreenView.Home)} 
          icon={<HomeIcon />} 
          label="Home"
          ariaLabel="Go to Home screen"
        />
        <BottomNavItem 
          screen={UserScreenView.Services} 
          currentScreen={currentScreen} 
          onClick={() => onNavigate(UserScreenView.Services)} 
          icon={<ListBulletIcon />} 
          label="Services"
          ariaLabel="Go to Services screen"
        />
        <BottomNavItem 
          screen={UserScreenView.AiChat} 
          currentScreen={currentScreen} 
          onClick={() => onNavigate(UserScreenView.AiChat)} 
          icon={<SparklesIcon />} 
          label="AI Chat"
          ariaLabel="Go to AI Chat screen"
        />
        {isBookingActive && (
          <BottomNavItem 
            screen={UserScreenView.Tracking} 
            currentScreen={currentScreen} 
            onClick={() => onNavigate(UserScreenView.Tracking)} 
            icon={<TrackIcon />} 
            label="Track Ride"
            ariaLabel="Go to Track Ride screen"
          />
        )}
      </div>
    </nav>
  );
};

export default BottomNavbar;
