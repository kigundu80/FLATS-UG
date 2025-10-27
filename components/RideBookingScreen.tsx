
import React, { useState, useEffect, useCallback } from 'react';
import { BookingDetails, GroundingChunk, User, RideType } from '../types';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import { MapPinIcon, ClockIcon, UserCircleIcon, StarIcon, CarIcon, InformationCircleIcon, UsersIcon, EnvelopeIcon, PhoneIcon, SparklesIcon, ArrowsRightLeftIcon, CalendarDaysIcon, BuildingOfficeIcon, GlobeAltIcon, InboxIcon, TruckIcon, TagIcon, ScaleIcon, ClockFastForwardIcon } from './icons/FluentIcons';
import { getTripSuggestions, getEstimatedDistanceAndRoute } from '../services/geminiService';
import { calculateFare } from '../services/fareService';
import { RIDE_OPTIONS } from '../constants';

// Import sub-form components
import HotelBookingForm from './service_forms/HotelBookingForm';
import FlightBookingForm from './service_forms/FlightBookingForm';
import CourierServiceForm from './service_forms/CourierServiceForm';


interface RideBookingScreenProps {
  initialBookingDetails: BookingDetails;
  onConfirmBooking: (updatedBookingDetails: BookingDetails) => void;
  onBack: () => void;
  currentUser: User | null;
  isOnline: boolean;
}

const RideBookingScreen: React.FC<RideBookingScreenProps> = ({ initialBookingDetails, onConfirmBooking, onBack, currentUser, isOnline }) => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialBookingDetails);
  
  const [tripSuggestion, setTripSuggestion] = useState<string | null>(null);
  const [suggestionSources, setSuggestionSources] = useState<GroundingChunk[] | undefined>(undefined);
  const [isLoadingGeminiSuggestion, setIsLoadingGeminiSuggestion] = useState<boolean>(false);
  const [geminiSuggestionError, setGeminiSuggestionError] = useState<string | null>(null);

  const [isEstimatingDistance, setIsEstimatingDistance] = useState(false);
  const [currentRouteSummary, setCurrentRouteSummary] = useState<string | null>(initialBookingDetails.distance > 0 ? "Route previously estimated" : null); 
  const [estimationError, setEstimationError] = useState<string | null>(null);

  const [pickupAddressChanged, setPickupAddressChanged] = useState(false);
  const [dropoffAddressChanged, setDropoffAddressChanged] = useState(false);

  const isSpecialService = bookingDetails.originatingServiceTitle === 'Hotel Bookings' ||
                           bookingDetails.originatingServiceTitle === 'Flight Booking' ||
                           bookingDetails.originatingServiceTitle === 'Courier Services';


  const handleBookingDetailChange = (name: keyof BookingDetails | string , value: any) => { // Allow string for dynamic keys from subforms
    setBookingDetails(prev => {
        let newDetails = { ...prev };

        // Handle top-level BookingDetails keys or specific address sub-fields
        if (name === "pickupAddress") {
            newDetails.pickup.address = value;
            if (value !== initialBookingDetails.pickup.address) setPickupAddressChanged(true);
        } else if (name === "dropoffAddress") {
            newDetails.dropoff.address = value;
            if (value !== initialBookingDetails.dropoff.address) setDropoffAddressChanged(true);
        } else if (name === "passengers") { // General passengers for shuttle
            newDetails.passengers = parseInt(value,10) || 1;
        } else if (name === "rideType") {
            newDetails.rideType = value as RideType;
        } else if (name === "distance") { 
            const numValue = parseFloat(value);
            newDetails.distance = numValue >= 0 ? numValue : 0;
            setCurrentRouteSummary(null); 
            setEstimationError(null);
        } else {
             // For service-specific fields passed with string keys e.g. "hotelName"
            (newDetails as any)[name] = value;
        }

        if (!isSpecialService && newDetails.distance > 0) {
            newDetails.estimatedFare = calculateFare(newDetails.rideType, newDetails.distance);
        } else if (isSpecialService) {
            newDetails.estimatedFare = 0; // "On Request"
        } else {
            newDetails.estimatedFare = 0;
        }
        return newDetails;
    });
  };

  const attemptDistanceEstimation = useCallback(async () => {
    if (isSpecialService || !isOnline) { // Don't estimate for special services or if offline
      setIsEstimatingDistance(false);
      if(!isOnline) setEstimationError("Offline: Distance estimation unavailable.");
      return;
    }

    if (bookingDetails.pickup.address.trim().length > 2 && bookingDetails.dropoff.address.trim().length > 2) {
      setIsEstimatingDistance(true);
      setCurrentRouteSummary(null); 
      setEstimationError(null); 
      
      const result = await getEstimatedDistanceAndRoute(bookingDetails.pickup.address, bookingDetails.dropoff.address);
      
      if (result.distance !== null) {
        setBookingDetails(prev => ({
          ...prev,
          distance: result.distance!,
          estimatedFare: calculateFare(prev.rideType, result.distance!)
        }));
        setCurrentRouteSummary(result.routeSummary || null);
        setEstimationError(null);
      } else {
        setBookingDetails(prev => ({
          ...prev,
          distance: prev.distance > 0 ? prev.distance : 0, 
          estimatedFare: prev.distance > 0 ? calculateFare(prev.rideType, prev.distance) : 0,
        }));
        setCurrentRouteSummary(null);
        setEstimationError(result.routeSummary || result.error || "Failed to estimate distance. Please enter manually.");
      }
      setIsEstimatingDistance(false);
      setPickupAddressChanged(false); 
      setDropoffAddressChanged(false);
    } else {
        setCurrentRouteSummary(null);
        setEstimationError(null); 
    }
  }, [bookingDetails.pickup.address, bookingDetails.dropoff.address, isOnline, bookingDetails.rideType, isSpecialService]);

  useEffect(() => {
    if (currentUser) {
      setBookingDetails(prev => ({
        ...prev, 
        clientFullName: prev.clientFullName || currentUser.fullName, 
        clientEmail: prev.clientEmail || currentUser.email,
        clientContact: prev.clientContact || currentUser.contact,
      }));
    }
  }, [initialBookingDetails, currentUser]);


  useEffect(() => {
    if (isSpecialService) return; // Skip AI distance estimation for special services

    const shouldEstimate = pickupAddressChanged || dropoffAddressChanged || 
                           (bookingDetails.pickup.address && bookingDetails.dropoff.address && bookingDetails.distance === 0 && !isEstimatingDistance);

    if (shouldEstimate) {
        const handler = setTimeout(() => {
            attemptDistanceEstimation();
        }, 1000); 
        return () => clearTimeout(handler);
    }
  }, [bookingDetails.pickup.address, bookingDetails.dropoff.address, pickupAddressChanged, dropoffAddressChanged, bookingDetails.distance, isEstimatingDistance, attemptDistanceEstimation, isSpecialService]);
  

  const fetchGeminiTripSuggestion = async () => {
    if (!isOnline) {
      setTripSuggestion("Trip insights unavailable while offline.");
      setGeminiSuggestionError("Offline");
      setSuggestionSources(undefined);
      setIsLoadingGeminiSuggestion(false);
      return;
    }
    
    let relevantLocationForSuggestion = bookingDetails.dropoff.address; // Default for rides
    if (bookingDetails.originatingServiceTitle === 'Hotel Bookings' && bookingDetails.hotelName) {
        relevantLocationForSuggestion = bookingDetails.hotelName; // Suggest for hotel if name exists
    } else if (bookingDetails.originatingServiceTitle === 'Flight Booking' && bookingDetails.arrivalAirport) {
        relevantLocationForSuggestion = bookingDetails.arrivalAirport; // Suggest for arrival city
    } else if (bookingDetails.originatingServiceTitle === 'Courier Services') {
        setTripSuggestion(null); // No suggestions for courier
        return;
    }


    if (relevantLocationForSuggestion && relevantLocationForSuggestion.trim() !== "") {
      setIsLoadingGeminiSuggestion(true);
      setGeminiSuggestionError(null);
      try {
        const suggestionResult = await getTripSuggestions(relevantLocationForSuggestion);
        if (suggestionResult.error) {
            setTripSuggestion(suggestionResult.suggestionText || "Could not load trip suggestion.");
            setGeminiSuggestionError(suggestionResult.error);
        } else {
            setTripSuggestion(suggestionResult.suggestionText);
        }
        setSuggestionSources(suggestionResult.sources);
      } catch (error) {
        setTripSuggestion("Could not load trip suggestion at this time.");
        setGeminiSuggestionError("Fetch error");
      } finally {
        setIsLoadingGeminiSuggestion(false);
      }
    } else {
      setTripSuggestion(null);
      setSuggestionSources(undefined);
      setGeminiSuggestionError(null);
    }
  };
  
  useEffect(() => {
    // Only fetch for relevant services and if a location is set.
    if (bookingDetails.originatingServiceTitle === 'Courier Services') return;
    
    let locationToFetch = bookingDetails.dropoff.address;
    if(bookingDetails.originatingServiceTitle === 'Hotel Bookings' && bookingDetails.hotelName) locationToFetch = bookingDetails.hotelName;
    if(bookingDetails.originatingServiceTitle === 'Flight Booking' && bookingDetails.arrivalAirport) locationToFetch = bookingDetails.arrivalAirport;

    if (locationToFetch && locationToFetch.trim() !== "") {
        fetchGeminiTripSuggestion();
    } else {
        setTripSuggestion(null);
        setSuggestionSources(undefined);
        setGeminiSuggestionError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDetails.dropoff.address, bookingDetails.hotelName, bookingDetails.arrivalAirport, bookingDetails.originatingServiceTitle, isOnline]);

  const { pickup, dropoff, rideType, distance, estimatedFare, estimatedArrivalTime, driver, originatingServiceTitle } = bookingDetails;

  const isRideDistanceInputDisabled = isEstimatingDistance || (isOnline && distance > 0 && !estimationError);
  let rideDistanceLabel = "Distance (km)";
  let rideDistancePlaceholder = "Enter distance or let AI estimate";
  if (isEstimatingDistance && isOnline) {
      rideDistanceLabel = "Estimating Distance...";
      rideDistancePlaceholder = "Estimating with AI...";
  } else if (isOnline && distance > 0 && !estimationError) {
      rideDistanceLabel = `Estimated Distance (AI)`;
  }
  
  const confirmButtonDisabled = 
    !isOnline ||
    (isEstimatingDistance && isOnline && !isSpecialService) ||
    (!isSpecialService && (!pickup.address || !dropoff.address || distance <= 0)) ||
    !bookingDetails.clientFullName || 
    !bookingDetails.clientEmail || 
    !bookingDetails.clientContact ||
    (bookingDetails.originatingServiceTitle === 'Hotel Bookings' && (!bookingDetails.hotelName || !bookingDetails.checkInDate || !bookingDetails.checkOutDate)) ||
    (bookingDetails.originatingServiceTitle === 'Flight Booking' && (!bookingDetails.departureAirport || !bookingDetails.arrivalAirport || !bookingDetails.departureDate)) ||
    (bookingDetails.originatingServiceTitle === 'Courier Services' && (!bookingDetails.courierPickupAddress || !bookingDetails.courierDropoffAddress || !bookingDetails.packageDescription));

  let confirmButtonTitle = "";
  if (!isOnline) confirmButtonTitle = "Cannot book: You are offline.";
  else if (isEstimatingDistance && !isSpecialService) confirmButtonTitle = "Estimating distance...";
  else if (!isSpecialService && (!pickup.address || !dropoff.address)) confirmButtonTitle = "Please enter pickup and dropoff locations for the ride.";
  else if (!isSpecialService && distance <= 0) confirmButtonTitle = "Ride distance must be > 0. Wait for AI or enter manually.";
  else if (!bookingDetails.clientFullName || !bookingDetails.clientEmail || !bookingDetails.clientContact) confirmButtonTitle = "Please fill in all contact details.";
  else if (confirmButtonDisabled) confirmButtonTitle = "Please fill all required service details.";


  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Card title={originatingServiceTitle ? `Book ${originatingServiceTitle}` : "Confirm Your Ride"}>
        <div className="space-y-6">
            {/* Render specialized form or standard ride form parts */}
            {bookingDetails.originatingServiceTitle === 'Hotel Bookings' && (
                <HotelBookingForm details={bookingDetails} onChange={handleBookingDetailChange} isOnline={isOnline} />
            )}
            {bookingDetails.originatingServiceTitle === 'Flight Booking' && (
                <FlightBookingForm details={bookingDetails} onChange={handleBookingDetailChange} isOnline={isOnline} />
            )}
            {bookingDetails.originatingServiceTitle === 'Courier Services' && (
                <CourierServiceForm details={bookingDetails} onChange={handleBookingDetailChange} isOnline={isOnline} />
            )}

            {/* Standard Ride Details */}
            {!isSpecialService && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary border-b pb-2">Ride Details</h3>
                <Input
                    label="Pickup Location"
                    name="pickupAddress"
                    placeholder="Enter pickup address"
                    value={pickup.address}
                    onChange={(e) => handleBookingDetailChange("pickupAddress", e.target.value)}
                    icon={<MapPinIcon className="text-green-500"/>}
                    required
                    disabled={!isOnline && pickup.address.trim().length === 0 && dropoff.address.trim().length === 0}
                />
                <Input
                    label="Drop-off Location"
                    name="dropoffAddress"
                    placeholder="Enter drop-off address"
                    value={dropoff.address}
                    onChange={(e) => handleBookingDetailChange("dropoffAddress", e.target.value)}
                    icon={<MapPinIcon className="text-red-500"/>}
                    required
                    disabled={!isOnline && pickup.address.trim().length === 0 && dropoff.address.trim().length === 0}
                />
                
                {isEstimatingDistance && isOnline && (
                    <div className="flex items-center text-sm text-text-secondary p-2 bg-yellow-100 rounded-md">
                    <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                    Estimating distance with Gemini AI...
                    </div>
                )}
                {currentRouteSummary && !estimationError && isOnline && !isEstimatingDistance && (
                    <div className="text-sm text-purple-700 p-2 bg-purple-50 rounded-md italic">
                    <SparklesIcon className="w-4 h-4 mr-2 inline" />
                    <strong>AI Route:</strong> {currentRouteSummary}
                    </div>
                )}
                {estimationError && !isEstimatingDistance && (
                    <div className="text-sm text-danger p-2 bg-red-50 rounded-md">
                    <InformationCircleIcon className="w-4 h-4 mr-2 inline" />
                    {estimationError} {isOnline && "Please enter distance manually below."}
                    </div>
                )}
                {!isOnline && !isEstimatingDistance && (
                    <div className="text-sm text-yellow-800 p-2 bg-yellow-100 rounded-md">
                        <InformationCircleIcon className="w-4 h-4 mr-2 inline" />
                        You are offline. AI distance estimation unavailable. Please enter manually.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Ride Type</label>
                    <select
                        name="rideType"
                        value={bookingDetails.rideType}
                        onChange={(e) => handleBookingDetailChange('rideType', e.target.value as RideType)}
                        className="form-select block w-full sm:text-sm rounded-lg border-gray-300 focus:ring-primary focus:border-primary py-3 px-3 bg-gray-50"
                        disabled={!isOnline && distance <=0}
                    >
                        {RIDE_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </select>
                    </div>
                    <div>
                    <label htmlFor="distanceManual" className="block text-sm font-medium text-text-secondary mb-1">
                        {rideDistanceLabel}
                    </label>
                    <Input
                        type="number"
                        name="distance"
                        id="distanceManual"
                        value={distance > 0 ? distance.toFixed(1) : (isEstimatingDistance && isOnline ? "" : "0")}
                        onChange={(e) => handleBookingDetailChange('distance', e.target.value)}
                        min="0"
                        icon={<ArrowsRightLeftIcon />}
                        placeholder={rideDistancePlaceholder}
                        disabled={isRideDistanceInputDisabled}
                        className={isRideDistanceInputDisabled ? "bg-gray-200 italic" : ""}
                    />
                    { isOnline && distance > 0 && !estimationError && 
                        <p className="text-xs text-text-secondary mt-1">Distance automatically estimated by AI.</p>
                    }
                    </div>
                </div>
            </div>
            )}
        </div>
      </Card>

        <Card title="Your Contact Details">
            <div className="space-y-4">
                <Input
                    label="Full Name (for this booking)"
                    name="clientFullName"
                    value={bookingDetails.clientFullName}
                    onChange={(e) => handleBookingDetailChange('clientFullName', e.target.value)}
                    icon={<UserCircleIcon />}
                    required
                />
                <Input
                    label="Email (for this booking)"
                    name="clientEmail"
                    type="email"
                    value={bookingDetails.clientEmail}
                    onChange={(e) => handleBookingDetailChange('clientEmail', e.target.value)}
                    icon={<EnvelopeIcon />}
                    required
                />
                <Input
                    label="Contact Phone (for this booking)"
                    name="clientContact"
                    type="tel"
                    value={bookingDetails.clientContact}
                    onChange={(e) => handleBookingDetailChange('clientContact', e.target.value)}
                    icon={<PhoneIcon />}
                    required
                />
            </div>
        </Card>
        
        {driver && !isSpecialService && (
           <Card title="Driver Details">
            <div className="flex items-center space-x-4">
              <img src={driver.imageUrl} alt={driver.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-lg text-text-primary">{driver.name}</p>
                <div className="flex items-center text-sm text-text-secondary">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-1" /> {driver.rating}
                </div>
                <p className="text-sm text-text-secondary">{driver.vehicleModel} ({driver.licensePlate})</p>
              </div>
            </div>
          </Card>
        )}

        <Card title={isSpecialService ? "Service Cost" : "Fare Estimate"}>
            <div className="p-4 bg-primary bg-opacity-10 rounded-lg text-center">
                {isSpecialService ? (
                    <p className="text-2xl font-bold text-primary">Price on Request</p>
                ) : (
                    <p className="text-3xl font-bold text-primary">UGX {estimatedFare > 0 ? estimatedFare.toLocaleString() : ((isEstimatingDistance && isOnline) ? '...' : '0')}</p>
                )}
                <p className="text-sm text-text-secondary mt-1">
                {isSpecialService ? "We will contact you with a quote." : (pickup.address && dropoff.address && distance > 0 ? "This is an estimate. Actual fare may vary." : "Enter details for ride fare estimate.")}
                </p>
            </div>
        </Card>
        
        { (tripSuggestion || isLoadingGeminiSuggestion || geminiSuggestionError) && 
          (bookingDetails.dropoff.address.trim() !== "" && !isSpecialService || 
           (bookingDetails.originatingServiceTitle === 'Hotel Bookings' && bookingDetails.hotelName) ||
           (bookingDetails.originatingServiceTitle === 'Flight Booking' && bookingDetails.arrivalAirport) 
          ) && (
            <Card title="Trip Insights by Gemini" className="bg-purple-50 border-purple-200 border">
                {isLoadingGeminiSuggestion && isOnline ? (
                    <div className="flex items-center justify-center p-4 text-text-secondary">
                        <SparklesIcon className="animate-pulse h-5 w-5 text-primary mr-3"/>
                        <span>Loading trip suggestion...</span>
                    </div>
                ): (
                    <>
                        <p className={`text-text-secondary italic ${geminiSuggestionError ? 'text-danger' : ''}`}>{tripSuggestion}</p>
                        {suggestionSources && suggestionSources.length > 0 && !geminiSuggestionError && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold text-text-secondary">Sources:</p>
                                <ul className="list-disc list-inside text-xs">
                                    {suggestionSources.map((source, index) => (
                                        (source.web?.uri || source.retrievedContext?.uri) && (
                                            <li key={index}>
                                                <a 
                                                    href={source.web?.uri || source.retrievedContext?.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    {source.web?.title || source.retrievedContext?.title || (source.web?.uri || source.retrievedContext?.uri)}
                                                </a>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={onBack} variant="ghost" size="lg" className="w-full sm:w-auto">
            Back
          </Button>
          <Button 
            onClick={() => {
                if (!isOnline) {
                    alert("You are offline. Please connect to confirm booking.");
                    return;
                }
                if (!bookingDetails.clientFullName || !bookingDetails.clientEmail || !bookingDetails.clientContact) {
                    alert("Please ensure your contact details (Full Name, Email, Phone) are filled in.");
                    return;
                }

                let finalBookingDetails = { ...bookingDetails };

                if (isSpecialService) {
                    finalBookingDetails.estimatedFare = 0; // Indicates "On Request" for special services
                    // Specific validations for special services
                    if (finalBookingDetails.originatingServiceTitle === 'Hotel Bookings' && (!finalBookingDetails.hotelName || !finalBookingDetails.checkInDate || !finalBookingDetails.checkOutDate)) {
                        alert("Please fill all hotel booking details: Hotel Name, Check-in Date, and Check-out Date."); return;
                    }
                    if (finalBookingDetails.originatingServiceTitle === 'Flight Booking' && (!finalBookingDetails.departureAirport || !finalBookingDetails.arrivalAirport || !finalBookingDetails.departureDate)) {
                        alert("Please fill all flight booking details: Departure & Arrival Airports, and Departure Date."); return;
                    }
                    if (finalBookingDetails.originatingServiceTitle === 'Courier Services' && (!finalBookingDetails.courierPickupAddress || !finalBookingDetails.courierDropoffAddress || !finalBookingDetails.packageDescription)) {
                        alert("Please fill all courier details: Pickup & Delivery Addresses, and Package Description."); return;
                    }
                } else { // Standard ride booking
                    if (!finalBookingDetails.pickup.address || !finalBookingDetails.dropoff.address) {
                        alert("Please enter both pickup and drop-off locations for the ride."); return;
                    }
                    if (finalBookingDetails.distance <= 0 && !(isEstimatingDistance && isOnline)) {
                        alert("Ride distance must be greater than 0. Please wait for AI estimation or enter manually."); return;
                    }
                    // Ensure fare is correctly calculated for rides
                    finalBookingDetails.estimatedFare = calculateFare(finalBookingDetails.rideType, finalBookingDetails.distance);
                }
                
                onConfirmBooking(finalBookingDetails);
            }} 
            variant="primary" 
            size="lg" 
            className="w-full sm:flex-grow"
            disabled={confirmButtonDisabled}
            isLoading={(isEstimatingDistance && isOnline && !isSpecialService)}
            title={confirmButtonTitle}
          >
            {(isEstimatingDistance && isOnline && !isSpecialService) ? 'Estimating...' : (isSpecialService ? 'Submit Request' : 'Confirm & Book Now')}
          </Button>
        </div>
    </div>
  );
};

export default RideBookingScreen;