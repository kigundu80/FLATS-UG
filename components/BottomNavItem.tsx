import React from 'react';
import { UserScreenView } from '../types'; // Changed from ScreenView

interface BottomNavItemProps {
  screen: UserScreenView; // Changed from ScreenView
  currentScreen: UserScreenView; // Changed from ScreenView
  onClick: () => void;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  label: string;
  ariaLabel?: string;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ screen, currentScreen, onClick, icon, label, ariaLabel }) => {
  const isActive = screen === currentScreen;
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel || label}
      className={`flex flex-col items-center justify-center flex-1 py-1 pt-2 group transition-colors duration-150 ease-in-out 
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-md
                  ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
    >
      {React.cloneElement(icon, { className: `w-6 h-6 mb-0.5 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}` })}
      <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>{label}</span>
    </button>
  );
};

export default BottomNavItem;