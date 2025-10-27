import React from 'react';
import { ActiveRideDetails } from '../../types';
import Card from '../Card';
import Button from '../Button';
import { MapPinIcon, UserCircleIcon, StarIcon, PhoneIcon, PaperAirplaneIcon, CheckCircleIcon, PlayCircleIcon, InformationCircleIcon } from '../icons/FluentIcons';
import MapView from '../MapView';

interface ActiveRideScreenProps {
  activeRide: ActiveRideDetails;
  onArrive: () => void;
  onStart: () => void;
  onCompleteRide: () => void;
}

const ActiveRideScreen: React.FC<ActiveRideScreenProps> = ({ activeRide, onArrive, onStart, onCompleteRide }) => {
  const { 
    passengerName, passengerContact, passengerRating,
    pickupAddress, pickupLat, pickupLng,
    dropoffAddress, dropoffLat, dropoffLng,
    status
  } = activeRide;

  const handleNavigate = () => {
    const destination = (status === 'ACCEPTED' && pickupLat && pickupLng)
      ? `${pickupLat},${pickupLng}`
      : (dropoffLat && dropoffLng ? `${dropoffLat},${dropoffLng}` : dropoffAddress);
      
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(mapsUrl, '_blank');
  };

  const getRideStatusInfo = () => {
    switch(status) {
      case 'ACCEPTED':
        return {
          instruction: 'Drive to Pickup Location',
          actionText: "I've Arrived",
          actionHandler: onArrive,
          actionIcon: <CheckCircleIcon />,
          actionVariant: 'primary' as const,
          disabled: false,
        };
      case 'ARRIVED':
        return {
          instruction: 'Confirm Passenger and Start Ride',
          actionText: 'Start Ride',
          actionHandler: onStart,
          actionIcon: <PlayCircleIcon />,
          actionVariant: 'primary' as const,
          disabled: false,
        };
      case 'ONGOING':
        return {
          instruction: 'En Route to Destination',
          actionText: 'Complete Ride',
          actionHandler: onCompleteRide,
          actionIcon: <CheckCircleIcon />,
          actionVariant: 'primary' as const,
          actionClassName: 'bg-status-online hover:bg-primary-dark',
          disabled: false,
        };
      default:
        return {
          instruction: `Status: ${status?.replace(/_/g, ' ') || 'Unknown'}`,
          actionText: 'Status Update',
          actionHandler: () => {},
          actionIcon: <InformationCircleIcon />,
          actionVariant: 'ghost' as const,
          disabled: true
        };
    }
  };
  
  const rideStatusInfo = getRideStatusInfo();

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="p-0 overflow-hidden">
        <div className="h-80 w-full">
            <MapView 
              pickupLocation={{address: pickupAddress, lat: pickupLat, lng: pickupLng }}
              dropoffLocation={{address: dropoffAddress, lat: dropoffLat, lng: dropoffLng}}
            />
        </div>
      </Card>

       <Card>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-secondary">{rideStatusInfo.instruction}</p>
            <div className="flex items-center justify-center text-lg text-text-primary mt-1 font-semibold">
               <MapPinIcon className={`w-5 h-5 mr-2 shrink-0 ${status === 'ONGOING' ? 'text-danger' : 'text-green-500'}`} />
               <span>
                {status === 'ONGOING' ? dropoffAddress : pickupAddress}
               </span>
            </div>
          </div>
        </Card>

      <Card title="Passenger Details">
        <div className="flex items-center space-x-4">
            <UserCircleIcon className="w-12 h-12 text-gray-400" />
            <div>
                <p className="font-bold text-lg text-text-primary">{passengerName}</p>
                <div className="flex items-center space-x-4">
                    {passengerRating !== undefined && (
                        <div className="flex items-center text-sm text-text-secondary">
                            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" /> {passengerRating.toFixed(1)}
                        </div>
                    )}
                    {passengerContact && (
                          <a href={`tel:${passengerContact}`} className="flex items-center text-sm text-driver-primary hover:underline">
                            <PhoneIcon className="w-4 h-4 mr-1" /> Call Passenger
                        </a>
                    )}
                </div>
            </div>
        </div>
      </Card>

      <div className="space-y-3">
          {/* FIX: The `variant` prop was causing a type error because TypeScript inferred its type as a generic 'string'.
           The fix in `getRideStatusInfo` ensures it's a specific literal type ('primary' | 'ghost'), which is compatible with the Button's props. */}
          <Button 
              onClick={rideStatusInfo.actionHandler} 
              variant={rideStatusInfo.actionVariant} 
              size="lg"
              className={`w-full ${rideStatusInfo.actionClassName || ''}`}
              leftIcon={rideStatusInfo.actionIcon}
              disabled={rideStatusInfo.disabled}
          >
              {rideStatusInfo.actionText}
          </Button>
          <Button onClick={handleNavigate} variant="ghost" size="md" className="w-full" leftIcon={<PaperAirplaneIcon/>}>
            Navigate with Google Maps
          </Button>
      </div>
      
       {/* Spacer for bottom nav */}
       <div className="h-16"></div> 
    </div>
  );
};

export default ActiveRideScreen;