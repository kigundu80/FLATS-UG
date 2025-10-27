import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { BookingDetails, BackendRide } from '../types';
import Card from './Card';
import { MapPinIcon, ClockIcon, StarIcon, ArrowsRightLeftIcon, PhoneIcon } from './icons/FluentIcons';
import { API_BASE_URL, LOCAL_STORAGE_USER_TOKEN_KEY } from '../constants';
import { InformationCircleIcon } from './icons/FluentIcons';

interface TrackingScreenProps {
  bookingDetails: BookingDetails;
}

const parseEtaToMinutes = (etaString: string): number => {
  const match = etaString.match(/(\d+)\s*mins?/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 15; // Default if not "X mins"
};

const formatTimeFromMinutes = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return "Arriving soon";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
};

// Helper to define parameters for each ride stage
const getRideStageDetails = (status: string | undefined, bookingDetails: BookingDetails) => {
    // These are mocks because backend doesn't provide driver's ETA to user pickup
    const MOCK_ETA_TO_PICKUP_MINS = 7; 
    const MOCK_DISTANCE_TO_PICKUP_KM = 3.2;

    switch(status) {
        case 'ACCEPTED':
        case 'DRIVER_EN_ROUTE':
        case 'ARRIVED':
            return {
                stageTitle: "Driver is arriving at pickup",
                initialMinutes: MOCK_ETA_TO_PICKUP_MINS,
                initialDistance: MOCK_DISTANCE_TO_PICKUP_KM,
                isTerminal: false,
            };
        case 'ONGOING':
            return {
                stageTitle: "En route to your destination",
                initialMinutes: parseEtaToMinutes(bookingDetails.estimatedArrivalTime),
                initialDistance: bookingDetails.distance,
                isTerminal: false,
            };
        case 'COMPLETED':
        case 'CANCELLED_BY_USER':
        case 'CANCELLED_BY_DRIVER':
            return {
                stageTitle: `Ride ${status.toLowerCase().replace(/_/g, ' ')}`,
                initialMinutes: 0,
                initialDistance: 0,
                isTerminal: true,
            }
        default:
             return {
                stageTitle: `Status: ${status?.toLowerCase().replace(/_/g, ' ') || 'Loading...'}`,
                initialMinutes: parseEtaToMinutes(bookingDetails.estimatedArrivalTime),
                initialDistance: bookingDetails.distance,
                isTerminal: true, // Don't start a countdown for unknown or pending states
            };
    }
}


const TrackingScreen: React.FC<TrackingScreenProps> = ({ bookingDetails: initialBookingDetails }) => {
  const [currentBookingDetails, setCurrentBookingDetails] = useState<BookingDetails>(initialBookingDetails);
  const { id: rideId, pickup, dropoff, driver } = currentBookingDetails;

  const [mapImageUrl, setMapImageUrl] = useState('https://picsum.photos/seed/map/800/400');
  
  const [timeRemainingMinutes, setTimeRemainingMinutes] = useState(0);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(0);
  const [currentRideStatus, setCurrentRideStatus] = useState<string | undefined>(initialBookingDetails.status);
  
  const intervalRef = useRef<number | null>(null);

  const fetchRideUpdate = useCallback(async () => {
    if (!rideId) return;
    const token = localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY);
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const rideData: BackendRide = await response.json();
        const updatedDriverDetails = rideData.driverId && rideData.driverName ? {
          name: rideData.driverName,
          rating: rideData.driverRating || 0,
          vehicleModel: rideData.driverVehicle || 'N/A',
          licensePlate: rideData.driverLicensePlate || 'N/A',
          imageUrl: rideData.driverImageUrl || `https://picsum.photos/seed/${rideData.driverId}/100/100`,
          phone: rideData.driverPhone || 'N/A',
        } : null;

        setCurrentBookingDetails(prev => ({
          ...prev,
          driver: updatedDriverDetails,
          status: rideData.status,
        }));
        setCurrentRideStatus(rideData.status);
      }
    } catch (error) {
      console.error("Error fetching ride update:", error);
    }
  }, [rideId]);

  // Initial fetch and periodic refresh of ride status
  useEffect(() => {
    fetchRideUpdate();
    const intervalId = setInterval(fetchRideUpdate, 15000);
    return () => clearInterval(intervalId);
  }, [fetchRideUpdate]);


  // Real-time counter effect that adjusts to ride status
  useEffect(() => {
    const stageDetails = getRideStageDetails(currentRideStatus, currentBookingDetails);
    
    setTimeRemainingMinutes(stageDetails.initialMinutes);
    setDistanceRemainingKm(stageDetails.initialDistance);

    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    if (stageDetails.isTerminal || stageDetails.initialMinutes <= 0) {
      return;
    }

    const totalDurationSeconds = stageDetails.initialMinutes * 60;
    const distanceDecrementPerSecond = stageDetails.initialDistance / (totalDurationSeconds || 1);

    intervalRef.current = setInterval(() => {
      setTimeRemainingMinutes(prevTime => (prevTime > 1/60 ? prevTime - 1/60 : 0));
      setDistanceRemainingKm(prevDist => (prevDist > distanceDecrementPerSecond ? prevDist - distanceDecrementPerSecond : 0));
    }, 1000) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentRideStatus, currentBookingDetails]);
  
  useEffect(() => {
    const mapUpdateInterval = setInterval(() => {
        setMapImageUrl(`https://picsum.photos/seed/${Date.now()}/800/400`);
    }, 30000); 
    return () => clearInterval(mapUpdateInterval);
  }, []);

  if (!driver) {
    return (
      <Card title="Tracking Information">
        <p className="p-4">Driver details are not yet available or ride is not active for tracking. Current status: <strong className="capitalize">{currentRideStatus?.replace(/_/g, ' ').toLowerCase() || 'Loading...'}</strong></p>
         {rideId && <p className="p-4 text-xs">Ride ID: {rideId}</p>}
      </Card>
    );
  }
  
  const stageDetails = getRideStageDetails(currentRideStatus, currentBookingDetails);
  const formattedTimeRemaining = formatTimeFromMinutes(Math.ceil(timeRemainingMinutes));
  const displayStatus = currentRideStatus ? currentRideStatus.replace(/_/g, ' ') : 'Loading...';

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card>
        <div className="aspect-w-16 aspect-h-9 mb-6 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={mapImageUrl}
            alt="Live map placeholder showing driver location" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="text-center mb-4">
             <h2 className="text-2xl font-bold text-primary capitalize">{displayStatus}</h2>
             <p className="text-text-secondary">{stageDetails.stageTitle}</p>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
          <Card title="Driver Information">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img src={driver.imageUrl} alt={driver.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary" />
              <div>
                <p className="text-lg sm:text-xl font-semibold text-text-primary">{driver.name}</p>
                <div className="flex items-center text-sm text-text-secondary">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-1" /> {driver.rating.toFixed(1)}
                </div>
                <p className="text-sm text-text-secondary">{driver.vehicleModel} - {driver.licensePlate}</p>
                <a href={`tel:${driver.phone}`} className="inline-flex items-center text-sm text-primary hover:underline cursor-pointer mt-1">
                  <PhoneIcon className="w-4 h-4 mr-1" /> Contact Driver
                </a>
              </div>
            </div>
          </Card>

          <Card title="Trip Status">
            <div className="space-y-4">
               <div className="flex items-center">
                <ClockIcon className="w-6 h-6 text-primary mr-4 shrink-0" />
                <div>
                  <p className="text-sm text-text-secondary">Time Remaining</p>
                  <p className="text-xl font-semibold text-text-primary">{formattedTimeRemaining}</p>
                </div>
              </div>
               <div className="flex items-center">
                <ArrowsRightLeftIcon className="w-6 h-6 text-primary mr-4 shrink-0" />
                <div>
                  <p className="text-sm text-text-secondary">Distance Remaining</p>
                  <p className="text-xl font-semibold text-text-primary">
                    {distanceRemainingKm.toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Route">
             <div className="space-y-4">
                <div className="flex items-start">
                    <MapPinIcon className="w-6 h-6 text-green-500 mr-4 mt-1 shrink-0" />
                    <div>
                    <p className="text-sm text-text-secondary">Pickup</p>
                    <p className="text-md font-medium text-text-primary">{pickup.address}</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <MapPinIcon className="w-6 h-6 text-red-500 mr-4 mt-1 shrink-0" />
                    <div>
                    <p className="text-sm text-text-secondary">Drop-off</p>
                    <p className="text-md font-medium text-text-primary">{dropoff.address}</p>
                    </div>
                </div>
             </div>
        </Card>
        
        { stageDetails.isTerminal && (currentRideStatus === 'COMPLETED' || currentRideStatus === 'CANCELLED_BY_USER' || currentRideStatus === 'CANCELLED_BY_DRIVER') &&
            <p className="text-center text-lg font-semibold text-primary mt-4 p-3 bg-yellow-100 rounded-md">This ride has {currentRideStatus.toLowerCase().replace(/_/g, ' ')}.</p>
        }
        <p className="text-center text-xs text-gray-400 mt-6">
          Real-time tracking is partially simulated. Map and ETA will update. Status is fetched from backend.
        </p>
    </div>
  );
};

export default TrackingScreen;
