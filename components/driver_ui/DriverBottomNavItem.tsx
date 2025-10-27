import React from 'react';
import { DriverScreenView } from '../../types';

interface DriverBottomNavItemProps {
  screen: DriverScreenView;
  currentScreen: DriverScreenView;
  onClick: () => void;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const DriverBottomNavItem: React.FC<DriverBottomNavItemProps> = ({ screen, currentScreen, onClick, icon, label, ariaLabel, disabled }) => {
  const isActive = screen === currentScreen;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel || label}
      className={`flex flex-col items-center justify-center flex-1 py-1 pt-2 group transition-colors duration-150 ease-in-out 
                  focus:outline-none focus:ring-2 focus:ring-driver-primary focus:ring-opacity-50 rounded-md
                  ${isActive ? 'text-driver-primary' : 'text-text-secondary hover:text-driver-primary'}
                  ${disabled ? 'text-gray-400 cursor-not-allowed hover:text-gray-400' : ''}`}
    >
      {React.cloneElement(icon, { className: `w-6 h-6 mb-0.5 transition-colors ${isActive ? 'text-driver-primary' : 'text-gray-500 group-hover:text-driver-primary'} ${disabled ? 'text-gray-400 group-hover:text-gray-400' : ''}` })}
      <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
    </button>
  );
};

export default DriverBottomNavItem;
