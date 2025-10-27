
import React from 'react';
import { IncomingRideRequest } from '../../driver_types';

interface IncomingRideRequestScreenProps {
  request: IncomingRideRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  countdown?: number; // Optional: for a visual timer
}

// Placeholder Icons (could be imported from a shared icon library or defined here)
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-1.5a1.99 1.99 0 01-1.402-.519l-2.43-2.43a3.75 3.75 0 00-5.304 0l-2.43 2.43a1.99 1.99 0 01-1.402.519A3 3 0 002.25 18.25a9.094 9.094 0 003.741.479m0 0H18m-4.502-8.571a3.75 3.75 0 10-6.498 0M15 9.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;


const IncomingRideRequestScreen: React.FC<IncomingRideRequestScreenProps> = ({ request, onAccept, onReject, countdown = 30 }) => {
  // Simple countdown logic (can be made more precise)
  const [timeLeft, setTimeLeft] = React.useState(countdown);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      // Potentially auto-reject or notify of timeout
      // For now, just stops countdown
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAccept = () => {
    onAccept(request.id);
  };

  const handleReject = () => {
    onReject(request.id);
  };

  return (
    <div className="fixed inset-0 bg-driver-primary bg-opacity-90 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-fadeIn">
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
                <span className="text-lg text-gray-800">{request.pickupLocation.address}</span>
              </div>
            </div>
            {request.dropoffLocation.address && (
              <div className="flex items-start">
                <MapPinIcon className="w-6 h-6 text-red-500 mr-3 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-sm text-gray-500 block">TO:</span>
                  <span className="text-lg text-gray-800">{request.dropoffLocation.address}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-semibold text-blue-700 block">Est. Fare:</span>
              <span className="text-xl font-bold text-blue-800">UGX {request.estimatedFare.toLocaleString()}</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="font-semibold text-purple-700 block">Distance:</span>
              <span className="text-xl font-bold text-purple-800">{request.distance.toFixed(1)} km</span>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="bg-indigo-50 p-3 rounded-lg">
                <span className="font-semibold text-indigo-700 block">Ride Type:</span>
                <span className="text-lg font-bold text-indigo-800">{request.rideType}</span>
            </div>
             <div className="bg-pink-50 p-3 rounded-lg">
                <span className="font-semibold text-pink-700 block">Passengers:</span>
                <span className="text-lg font-bold text-pink-800 flex items-center"><UsersIcon className="w-5 h-5 mr-1"/> {request.passengers}</span>
            </div>
          </div>


          <div className="border-t pt-4 mt-4">
             <div className="flex items-center text-gray-700">
                <UserIcon className="w-5 h-5 mr-2 text-gray-500"/>
                <span>Passenger: {request.passengerName}</span>
                {request.passengerRating && (
                    <span className="ml-auto flex items-center text-sm">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-1"/> {request.passengerRating.toFixed(1)}
                    </span>
                )}
            </div>
            {request.passengerContact && (
                 <div className="flex items-center text-gray-700 text-sm mt-1">
                    <span>Contact: {request.passengerContact} (Provided by user)</span>
                </div>
            )}
          </div>
        </div>
        
        <div className="text-center my-6">
          <p className="text-4xl font-mono font-bold text-driver-primary">{timeLeft}s</p>
          <p className="text-xs text-gray-500">Time to respond</p>
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

export default IncomingRideRequestScreen;
