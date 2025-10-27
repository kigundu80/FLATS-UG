import React from 'react';
import { DriverAvailabilityStatus } from '../../types'; // Adjusted import path

interface AvailabilityToggleProps {
  currentStatus: DriverAvailabilityStatus;
  onToggle: (newStatus: DriverAvailabilityStatus) => void;
  disabled?: boolean;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ currentStatus, onToggle, disabled }) => {
  const isOnline = currentStatus === DriverAvailabilityStatus.Online;

  const handleToggle = () => {
    if (disabled) return;
    onToggle(isOnline ? DriverAvailabilityStatus.Offline : DriverAvailabilityStatus.Online);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || currentStatus === DriverAvailabilityStatus.OnTrip}
      className={`
        px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-150
        flex items-center justify-center
        ${disabled || currentStatus === DriverAvailabilityStatus.OnTrip ? 'bg-gray-400 cursor-not-allowed' : (isOnline ? 'bg-status-offline hover:bg-red-700' : 'bg-status-online hover:bg-green-700')}
      `}
      aria-pressed={isOnline}
      aria-label={isOnline ? "Go Offline" : "Go Online"}
    >
      <span className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-white' : 'bg-white'}`}></span>
      {currentStatus === DriverAvailabilityStatus.OnTrip ? 'On Trip' : (isOnline ? 'Go Offline' : 'Go Online')}
    </button>
  );
};

export default AvailabilityToggle;