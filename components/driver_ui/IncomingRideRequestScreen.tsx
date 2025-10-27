import React from 'react';
import { IncomingRideRequest } from '../../types';
import { MapPinIcon, UsersIcon, UserCircleIcon, StarIcon, ClockIcon } from '../icons/FluentIcons';

interface IncomingRideRequestScreenProps {
  request: IncomingRideRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string, autoRejected?: boolean) => void;
  countdown?: number; 
}

const IncomingRideRequestScreenComponent: React.FC<IncomingRideRequestScreenProps> = ({ request, onAccept, onReject, countdown = 30 }) => {
  const [timeLeft, setTimeLeft] = React.useState(countdown);
  const [showRating, setShowRating] = React.useState(false);

  React.useEffect(() => {
    setTimeLeft(countdown); 
    setShowRating(false); // Reset on new request
  }, [request, countdown]);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAccept = () => {
    onAccept(request.id);
  };

  const handleReject = () => {
    onReject(request.id, false);
  };
  
  // Calculate a rough ride duration. E.g., 2.5 mins per km + 5 mins base.
  const rideDurationMinutes = Math.round(request.distance * 2.5 + 5);

  return (
    <div className="fixed inset-0 bg-driver-primary bg-opacity-90 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-driver-primary">New Ride Request!</h2>
          <p className="text-gray-600">You have a new ride opportunity.</p>
        </div>

        <div className="space-y-4 my-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start mb-2">
              <MapPinIcon className="w-6 h-6 text-green-500 mr-3 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-sm text-gray-500 block">FROM:</span>
                <span className="text-lg text-gray-800">{request.pickupAddress}</span>
              </div>
            </div>
            {request.dropoffAddress && (
              <div className="flex items-start">
                <MapPinIcon className="w-6 h-6 text-red-500 mr-3 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-sm text-gray-500 block">TO:</span>
                  <span className="text-lg text-gray-800">{request.dropoffAddress}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-semibold text-blue-700 block text-xs">Est. Fare</span>
              <span className="text-lg font-bold text-blue-800">UGX {request.estimatedFare.toLocaleString()}</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="font-semibold text-purple-700 block text-xs">Distance</span>
              <span className="text-lg font-bold text-purple-800">{request.distance.toFixed(1)} km</span>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
                <span className="font-semibold text-teal-700 block text-xs">Est. Duration</span>
                <span className="text-lg font-bold text-teal-800 flex items-center justify-center"><ClockIcon className="w-4 h-4 mr-1"/>~{rideDurationMinutes} min</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-center">
             <div className="bg-indigo-50 p-3 rounded-lg">
                <span className="font-semibold text-indigo-700 block text-xs">Ride Type</span>
                <span className="text-lg font-bold text-indigo-800">{request.rideType}</span>
            </div>
             <div className="bg-pink-50 p-3 rounded-lg">
                <span className="font-semibold text-pink-700 block text-xs">Passengers</span>
                <span className="text-lg font-bold text-pink-800 flex items-center justify-center"><UsersIcon className="w-5 h-5 mr-1"/> {request.passengers}</span>
            </div>
          </div>


          <div className="border-t pt-4 mt-4">
             <div className="flex items-center text-gray-700">
                <UserCircleIcon className="w-5 h-5 mr-2 text-gray-500"/>
                <span>Passenger: {request.passengerName}</span>
                {request.passengerRating !== undefined && !showRating && (
                    <button onClick={() => setShowRating(true)} className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors">
                        View Rating
                    </button>
                )}
                {request.passengerRating !== undefined && showRating && (
                    <div className="ml-auto flex items-center text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-1"/> Rating: {request.passengerRating.toFixed(1)}
                    </div>
                )}
            </div>
            {request.passengerContact && (
                 <div className="flex items-center text-gray-700 text-sm mt-1">
                    <span>Contact: {request.passengerContact} (Provided by user)</span>
                </div>
            )}
          </div>
        </div>
        
        <div className="my-6">
          <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="45" className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" />
                  {/* Progress circle */}
                  <circle
                      cx="50" cy="50" r="45"
                      className="text-driver-primary"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      strokeDasharray={282.7}
                      strokeDashoffset={282.7 * (1 - (timeLeft / countdown))}
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-4xl font-mono font-bold text-driver-primary">{timeLeft < 0 ? 0 : timeLeft}s</span>
              </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Time to respond</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleReject}
            disabled={timeLeft <= 0}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150 ease-in-out disabled:opacity-50"
            aria-label="Reject Ride"
          >
            REJECT
          </button>
          <button
            onClick={handleAccept}
            disabled={timeLeft <= 0}
            className="flex-1 bg-status-online hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150 ease-in-out disabled:opacity-50"
            aria-label="Accept Ride"
          >
            ACCEPT
          </button>
        </div>
        {timeLeft <= 0 && <p className="text-center text-red-600 mt-2 text-sm">Request timed out.</p>}
      </div>
    </div>
  );
};

export default IncomingRideRequestScreenComponent;