
import React, { useState, useEffect, useCallback } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { RIDE_OPTIONS } from '../constants';
import { RideType } from '../types';
import { SearchIcon, MapPinIcon, SparklesIcon, ListBulletIcon, InformationCircleIcon, ClockIcon, ArrowsRightLeftIcon } from './icons/FluentIcons';
import { getEstimatedDistanceAndRoute } from '../services/geminiService';
import { calculateFare } from '../services/fareService';


interface HomeScreenProps {
  onBookNow: (pickup: string, dropoff: string, rideType: RideType, distance: number) => void;
  onShowServices: () => void;
  isOnline: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onBookNow, onShowServices, isOnline }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [selectedRideType, setSelectedRideType] = useState<RideType>(RideType.Standard);
  const [distance, setDistance] = useState<number>(0);
  const [estimatedFare, setEstimatedFare] = useState<number>(0);

  const [isEstimatingDistance, setIsEstimatingDistance] = useState(false);
  const [routeSummary, setRouteSummary] = useState<string | null>(null);
  const [estimationError, setEstimationError] = useState<string | null>(null);


  const handleBookNow = () => {
    if (!isOnline) {
      alert("You are offline. Please connect to the internet to book a ride.");
      return;
    }
    if (pickupLocation && dropoffLocation && distance > 0) {
      onBookNow(pickupLocation, dropoffLocation, selectedRideType, distance);
    } else if (!pickupLocation || !dropoffLocation) {
      alert('Please enter both pickup and drop-off locations.');
    } else if (distance <=0 && !isEstimatingDistance) {
      alert('Please wait for distance estimation or enter distance manually if estimation fails.');
    } else if (isEstimatingDistance) {
      alert('Still estimating distance, please wait.');
    }
  };

  const handleDistanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualDistance = parseFloat(e.target.value);
    setDistance(manualDistance >= 0 ? manualDistance : 0);
    // If user types manually, it implies AI failed or they are offline.
    // We don't need to clear AI's routeSummary here because input is only enabled if AI failed or offline.
  };

  const attemptDistanceEstimation = useCallback(async () => {
    if (!isOnline) {
      setEstimationError("Offline: Cannot estimate distance. Please check your connection or enter manually.");
      setIsEstimatingDistance(false);
      // setDistance(0); // Keep existing manual distance if any, or 0
      setRouteSummary(null);
      return;
    }
    if (pickupLocation.trim().length > 2 && dropoffLocation.trim().length > 2) {
      setIsEstimatingDistance(true);
      setRouteSummary(null);
      setEstimationError(null);
      setDistance(0); 
      setEstimatedFare(0);

      const result = await getEstimatedDistanceAndRoute(pickupLocation, dropoffLocation);
      
      if (result.distance !== null) {
        setDistance(result.distance);
        setRouteSummary(result.routeSummary || null); // Keep it null if not provided
        setEstimationError(null);
      } else {
        setDistance(0); 
        setRouteSummary(null);
        setEstimationError(result.routeSummary || result.error || "Failed to estimate distance. Please enter manually.");
      }
      setIsEstimatingDistance(false);
    } else {
        // Clear previous estimates if locations are too short or invalid
        setDistance(0);
        setRouteSummary(null);
        setEstimationError(null);
        setEstimatedFare(0);
    }
  }, [pickupLocation, dropoffLocation, isOnline]);

  useEffect(() => {
    const handler = setTimeout(() => {
        attemptDistanceEstimation();
    }, 1000); 

    return () => {
        clearTimeout(handler);
    };
  }, [attemptDistanceEstimation]);
  
  useEffect(() => {
    if (distance > 0 && selectedRideType) {
      const fare = calculateFare(selectedRideType, distance);
      setEstimatedFare(fare);
    } else {
      setEstimatedFare(0);
    }
  }, [distance, selectedRideType]);

  const isDistanceInputDisabled = isEstimatingDistance || (isOnline && distance > 0 && !estimationError);
  let distanceLabel = "Distance (km)";
  let distancePlaceholder = "Enter distance or let AI estimate";
  if (isEstimatingDistance && isOnline) {
      distanceLabel = "Estimating Distance...";
      distancePlaceholder = "Estimating with AI...";
  } else if (isOnline && distance > 0 && !estimationError) {
      distanceLabel = `Estimated Distance (AI)`;
  }


  return (
    <div className="space-y-8">
      <Card title="Plan Your Journey" className="animate-fadeIn">
        <div className="space-y-5">
          <Input
            label="Pickup Location"
            name="pickup"
            placeholder="Enter pickup address (e.g., Acacia Mall)"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            icon={<MapPinIcon />}
            disabled={!isOnline && (pickupLocation.trim().length === 0 && dropoffLocation.trim().length === 0)}
          />
          <Input
            label="Drop-off Location"
            name="dropoff"
            placeholder="Enter drop-off address (e.g., Entebbe Airport)"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            icon={<MapPinIcon />}
            disabled={!isOnline && (pickupLocation.trim().length === 0 && dropoffLocation.trim().length === 0)}
          />

          {isEstimatingDistance && isOnline && (
            <div className="flex items-center text-sm text-text-secondary p-3 bg-yellow-100 rounded-md">
              <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
              Estimating distance and route with Gemini AI...
            </div>
          )}
          
          {routeSummary && !estimationError && isOnline && (
            <div className="text-sm text-purple-700 p-3 bg-purple-50 rounded-md italic">
              <SparklesIcon className="w-5 h-5 mr-2 inline" />
              <strong>AI Route Suggestion:</strong> {routeSummary}
            </div>
          )}

          {estimationError && !isEstimatingDistance && (
            <div className="text-sm text-danger p-3 bg-red-50 rounded-md">
              <InformationCircleIcon className="w-5 h-5 mr-2 inline" />
              {estimationError} {isOnline && "Please enter distance manually below."}
            </div>
          )}
          {!isOnline && !isEstimatingDistance && (
            <div className="text-sm text-yellow-800 p-3 bg-yellow-100 rounded-md">
                <InformationCircleIcon className="w-5 h-5 mr-2 inline" />
                You are offline. Distance estimation is unavailable. Please enter manually.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Choose Ride Type</label>
            <div className="grid grid-cols-3 gap-3">
              {RIDE_OPTIONS.map((option) => (
                 <div
                  key={option.id}
                  onClick={() => setSelectedRideType(option.id)}
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all duration-200 border
                    ${selectedRideType === option.id 
                      ? 'bg-primary text-white shadow-lg scale-105 border-primary-dark' 
                      : 'bg-surface hover:bg-gray-50 shadow-sm border-gray-200 text-text-primary'
                    }`}
                  role="radio"
                  aria-checked={selectedRideType === option.id}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && setSelectedRideType(option.id)}
                  >
                  <div className="flex justify-center mb-1">
                    {option.icon && React.cloneElement(option.icon, { className: "w-7 h-7"})}
                  </div>
                  <span className="font-semibold text-sm">{option.name}</span>
                  <p className={`text-xs ${selectedRideType === option.id ? 'text-green-200' : 'text-text-secondary'}`}>
                    ~{option.baseFare.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-text-secondary mb-1">
                {distanceLabel}
            </label>
            <Input
              type="number"
              name="distance"
              id="distance"
              value={distance > 0 ? distance.toFixed(1) : (isEstimatingDistance && isOnline ? "" : "0")}
              onChange={handleDistanceInputChange}
              min="0"
              icon={<ArrowsRightLeftIcon />}
              placeholder={distancePlaceholder}
              disabled={isDistanceInputDisabled}
              className={isDistanceInputDisabled ? "bg-gray-200 italic" : ""}
            />
             { isOnline && distance > 0 && !estimationError && 
                <p className="text-xs text-text-secondary mt-1">Distance automatically estimated by AI.</p>
             }
          </div>

          {estimatedFare > 0 && (
            <div className="p-4 bg-primary bg-opacity-10 rounded-lg text-center">
                <p className="text-sm text-text-secondary">Estimated Fare</p>
                <p className="text-3xl font-bold text-primary">UGX {estimatedFare.toLocaleString()}</p>
            </div>
          )}


          <Button 
            onClick={handleBookNow} 
            variant="primary" 
            size="lg" 
            className="w-full"
            leftIcon={<SearchIcon className="w-5 h-5"/>}
            disabled={!pickupLocation || !dropoffLocation || distance <= 0 || (isEstimatingDistance && isOnline) || !isOnline}
            isLoading={(isEstimatingDistance && isOnline)}
            title={!isOnline ? "Cannot book ride: You are offline." : (isEstimatingDistance ? "Estimating distance..." : (!pickupLocation || !dropoffLocation || distance <=0 ? "Please fill all fields and ensure distance is estimated." : "Proceed to book"))}
          >
            {isEstimatingDistance && isOnline ? 'Estimating...' : 'Find Ride & Proceed'}
          </Button>
        </div>
      </Card>
      
      <Card title="Explore More">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-background p-4 rounded-lg">
              <h3 className="font-semibold text-text-primary mb-2">Our Services</h3>
              <p className="text-text-secondary text-sm mb-3">
                  FLATS UG offers a wide range of transport solutions tailored to your needs.
              </p>
              <Button 
                  onClick={onShowServices} 
                  variant="ghost" 
                  size="sm"
                  className="w-full"
                  leftIcon={<ListBulletIcon className="w-5 h-5"/>}
              >
                  View All Services
              </Button>
          </div>
           <div className="bg-background p-4 rounded-lg">
              <h3 className="font-semibold text-text-primary mb-2">Why Choose Us?</h3>
              <ul className="space-y-2 text-text-secondary text-sm">
                  <li className="flex items-start"><SparklesIcon className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" /> Reliable and timely pickups.</li>
                  <li className="flex items-start"><SparklesIcon className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" /> Professional and courteous drivers.</li>
                  <li className="flex items-start"><SparklesIcon className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" /> Competitive and transparent pricing.</li>
              </ul>
          </div>
        </div>
      </Card>
      
    </div>
  );
};

export default HomeScreen;