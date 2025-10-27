import React from 'react';
import { DriverScreenView } from '../../types';
import { HomeIcon, WalletIcon, UserCircleIcon, PlayCircleIcon } from '../icons/FluentIcons';
import DriverBottomNavItem from './DriverBottomNavItem';

interface DriverBottomNavbarProps {
  onNavigate: (screen: DriverScreenView) => void;
  currentScreen: DriverScreenView;
  isRequestActive: boolean;
  activeRideId: string | null | undefined;
}

const DriverBottomNavbar: React.FC<DriverBottomNavbarProps> = ({ onNavigate, currentScreen, isRequestActive, activeRideId }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full h-16 bg-surface border-t border-gray-200 shadow-top z-40" role="navigation" aria-label="Driver navigation">
      <div className="container mx-auto h-full flex justify-around items-stretch px-2">
        <DriverBottomNavItem 
          screen={DriverScreenView.Dashboard} 
          currentScreen={currentScreen} 
          onClick={() => onNavigate(DriverScreenView.Dashboard)} 
          icon={<HomeIcon />} 
          label="Dashboard"
          ariaLabel="Go to Dashboard"
          disabled={isRequestActive}
        />
        {activeRideId && (
           <DriverBottomNavItem 
              screen={DriverScreenView.ActiveRide} 
              currentScreen={currentScreen} 
              onClick={() => onNavigate(DriverScreenView.ActiveRide)} 
              icon={<PlayCircleIcon />} 
              label="Active Ride"
              ariaLabel="Go to Active Ride"
              disabled={isRequestActive}
            />
        )}
        <DriverBottomNavItem 
          screen={DriverScreenView.Earnings} 
          currentScreen={currentScreen} 
          onClick={() => onNavigate(DriverScreenView.Earnings)} 
          icon={<WalletIcon />} 
          label="Earnings"
          ariaLabel="Go to Earnings screen"
          disabled={isRequestActive || !!activeRideId}
        />
        <DriverBottomNavItem 
          screen={DriverScreenView.Profile} 
          currentScreen={currentScreen} 
          onClick={() => onNavigate(DriverScreenView.Profile)} 
          icon={<UserCircleIcon />} 
          label="Profile"
          ariaLabel="Go to Profile screen"
          disabled={isRequestActive}
        />
      </div>
    </nav>
  );
};

export default DriverBottomNavbar;