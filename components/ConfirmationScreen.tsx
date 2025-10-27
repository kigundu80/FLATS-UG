
import React from 'react';
import { BookingDetails } from '../types';
import Button from './Button';
import Card from './Card';
import { MapPinIcon, ClockIcon, CarIcon, SparklesIcon, ChevronRightIcon, TicketIcon, InformationCircleIcon } from './icons/FluentIcons';
import { AVAILABLE_SERVICES } from '../../constants'; // Import from constants

interface ConfirmationScreenProps {
  bookingDetails: BookingDetails;
  onTrackRide: () => void;
  onGoHome: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ bookingDetails, onTrackRide, onGoHome }) => {
  const { id, pickup, dropoff, rideType, estimatedFare, estimatedArrivalTime, driver, originatingServiceTitle, serviceTypeForApi, status } = bookingDetails;
  const isRideService = serviceTypeForApi === 'RIDE';
  const serviceIcon = AVAILABLE_SERVICES.find(s => s.title === originatingServiceTitle)?.icon || <CarIcon />;


  return (
    <div className="max-w-lg mx-auto text-center animate-fadeIn">
      <Card>
        <div className="p-6">
          <SparklesIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            {isRideService ? (driver ? "Your ride is on its way!" : "Request Confirmed!") : "Service Request Submitted!"}
          </h2>
          <p className="text-text-secondary mb-6">
            {isRideService 
              ? (driver ? `Your driver, ${driver.name}, will arrive shortly.` : "We're finding you a driver. You'll be notified once assigned.")
              : `Thank you for choosing FLATS UG. We will contact you shortly regarding your ${originatingServiceTitle?.toLowerCase() || 'service'} request.`
            }
          </p>

          <div className="text-left space-y-3 bg-background p-4 rounded-lg mb-6">
            {id && (
                 <div className="flex items-center">
                    <TicketIcon className="w-5 h-5 text-text-secondary mr-3 shrink-0" />
                    <div>
                        <span className="font-medium text-sm text-text-secondary">REQUEST ID:</span> {id}
                    </div>
                </div>
            )}
            {isRideService || (pickup && pickup.address) ? (
              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0" />
                <div>
                  <span className="font-medium text-sm text-text-secondary">PICKUP:</span><br/> {pickup.address || 'N/A for this service'}
                </div>
              </div>
            ) : null}
            {isRideService || (dropoff && dropoff.address) ? (
              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-red-500 mr-3 mt-1 shrink-0" />
                <div>
                  <span className="font-medium text-sm text-text-secondary">DROPOFF:</span><br/> {dropoff.address || 'N/A for this service'}
                </div>
              </div>
            ) : null}
            
            {isRideService && (
              <>
                <div className="flex items-center">
                  <CarIcon className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-medium text-sm text-text-secondary">RIDE:</span> {rideType}
                  </div>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-medium text-sm text-text-secondary">DRIVER ETA:</span> {driver ? estimatedArrivalTime : (status === 'PENDING_ASSIGNMENT' ? 'Searching...' : 'Awaiting confirmation')}
                  </div>
                </div>
              </>
            )}
            {!isRideService && originatingServiceTitle && (
                <div className="flex items-center">
                    {React.cloneElement(serviceIcon, { className: "w-5 h-5 text-primary mr-3 shrink-0"})}
                    <div>
                        <span className="font-medium text-sm text-text-secondary">SERVICE:</span> {originatingServiceTitle}
                    </div>
                </div>
            )}
            {status && (
                 <div className="flex items-center">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                    <div>
                        <span className="font-medium text-sm text-text-secondary">STATUS:</span> {status.replace(/_/g, ' ')}
                    </div>
                </div>
            )}
          </div>
          
          {isRideService && estimatedFare > 0 && (
            <div className="p-3 bg-primary bg-opacity-10 rounded-lg mb-6">
              <p className="text-lg font-bold text-primary">Fare: UGX {estimatedFare.toLocaleString()}</p>
            </div>
          )}
           {!isRideService && (
             <div className="p-3 bg-primary bg-opacity-10 rounded-lg mb-6">
              <p className="text-lg font-bold text-primary">Price On Request</p>
              <p className="text-xs text-text-secondary">We will contact you with a quote.</p>
            </div>
          )}


          <div className="space-y-3">
            {isRideService && driver && (status === 'ACCEPTED' || status === 'DRIVER_EN_ROUTE' || status === 'ONGOING') && (
              <Button 
                onClick={onTrackRide} 
                variant="primary" 
                size="lg" 
                className="w-full"
                rightIcon={<ChevronRightIcon className="w-5 h-5"/>}
              >
                Track Your Ride
              </Button>
            )}
             {isRideService && (!driver || status === 'PENDING_ASSIGNMENT' || status === 'AWAITING_DRIVER_ACCEPTANCE') && (
              <p className="text-sm text-text-secondary p-3 bg-yellow-100 rounded-md">
                Tracking will be available once your driver is en route. Current status: <strong className="capitalize">{status?.replace(/_/g, ' ').toLowerCase() || 'Processing'}</strong>.
              </p>
            )}
            <Button 
              onClick={onGoHome} 
              variant="ghost" 
              size="lg" 
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationScreen;