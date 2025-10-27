import React from 'react';
import { DriverProfile, DriverAvailabilityStatus, DriverScreenView, IncomingRideRequest } from '../../types'; 
import AvailabilityToggle from './AvailabilityToggle'; 
import Card from '../Card';
import Button from '../Button';
import { PlayCircleIcon, BellIcon as FluentBellIcon, WalletIcon } from '../icons/FluentIcons'; 
import MapView from '../MapView';
const BellIcon = FluentBellIcon;

interface DriverDashboardProps {
  driverProfile: DriverProfile; 
  onToggleAvailability: (newStatus: DriverAvailabilityStatus) => void;
  onNavigate: (screen: DriverScreenView) => void;
  currentRideRequest: IncomingRideRequest | null;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driverProfile, onToggleAvailability, onNavigate, currentRideRequest }) => {
  const { availability, activeRideId } = driverProfile;

  let statusMessage = "You are Offline";
  let statusColorClass = "bg-status-offline";
  let statusTextColor = "text-white";

  if (availability === DriverAvailabilityStatus.Online) {
    statusMessage = "Online - Awaiting Ride Requests";
    statusColorClass = "bg-status-online";
    statusTextColor = "text-white";
  } else if (availability === DriverAvailabilityStatus.OnTrip) {
    statusMessage = "On Trip - Driving to Destination";
    statusColorClass = "bg-driver-primary";
    statusTextColor = "text-white";
  }

  return (
    <div className="space-y-6"> 
        <div className={`p-4 text-center font-semibold ${statusColorClass} ${statusTextColor} rounded-lg shadow-md`}>
            {statusMessage}
        </div>
        <AvailabilityToggle 
            currentStatus={availability} 
            onToggle={onToggleAvailability} 
        />

        {currentRideRequest && availability === DriverAvailabilityStatus.Online && (
          <Card 
            className="bg-yellow-100 border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-200"
            onClick={() => onNavigate(DriverScreenView.RideRequest)} 
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center">
              <BellIcon className="w-8 h-8 mr-4 text-yellow-600 animate-bounce" />
              <div>
                <h3 className="font-bold text-lg text-yellow-800">NEW RIDE REQUEST!</h3>
                <p className="text-sm text-yellow-700">Tap here to view details and respond.</p>
              </div>
            </div>
          </Card>
        )}

        {availability === DriverAvailabilityStatus.OnTrip && activeRideId && (
            <Card title="Active Ride Management">
                <p className="text-sm text-text-secondary mb-3">You are currently on an active ride.</p>
                <div className="space-y-2">
                    <Button 
                        onClick={() => onNavigate(DriverScreenView.ActiveRide)} 
                        variant="primary" 
                        size="md" 
                        className="w-full"
                        leftIcon={<PlayCircleIcon />}
                    >
                        View Active Ride Details
                    </Button>
                </div>
            </Card>
        )}

        <Card>
            <div className="h-64 rounded-lg overflow-hidden shadow-inner">
                <MapView />
            </div>
            {availability === DriverAvailabilityStatus.Online && !currentRideRequest && (
                <p className="text-center text-sm text-text-secondary mt-3">Searching for nearby ride requests...</p>
            )}
        </Card>

        <Card title="Quick Stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center">
                        <WalletIcon className="text-driver-primary mr-2"/> Today's Earnings
                    </h3>
                    <p className="text-3xl font-bold text-text-primary">UGX 0</p> 
                    <p className="text-sm text-text-secondary">0 trips completed</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Next Payout</h3>
                    <p className="text-2xl font-bold text-text-primary">UGX 0</p> 
                    <p className="text-sm text-text-secondary">Scheduled for [Date]</p>
                </div>
            </div>
        </Card>
      
        {/* Spacer for bottom nav */}
        <div className="h-16"></div> 
    </div>
  );
};

export default DriverDashboard;