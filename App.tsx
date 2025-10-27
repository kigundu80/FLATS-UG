import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
    AppMode, UserScreenView, DriverScreenView, 
    BookingDetails, RideType, User, ServiceItem,
    DriverProfile, DriverAvailabilityStatus, IncomingRideRequest,
    ServiceTypeEnum, ApiAuthResponse,
    ApiServiceBookingRequestData, ApiServiceBookingResponse,
    BackendRide, Driver, ActiveRideDetails
} from './types';
import HomeScreen from './components/HomeScreen';
import RideBookingScreen from './components/RideBookingScreen';
import ServicesScreen from './components/ServicesScreen';
import TrackingScreen from './components/TrackingScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import LoginSelectionScreen from './components/LoginSelectionScreen'; 
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Footer from './components/Footer';
import Button from './components/Button'; 

import DriverDashboard from './components/driver_ui/DriverDashboard';
import IncomingRideRequestScreenComponent from './components/driver_ui/IncomingRideRequestScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import TermsAndConditionsScreen from './components/TermsAndConditionsScreen';
import AiChatScreen from './components/AiChatScreen';
import DriverProfileScreen from './components/driver_ui/DriverProfileScreen';
import DriverBottomNavbar from './components/driver_ui/DriverBottomNavbar';
import ActiveRideScreen from './components/driver_ui/ActiveRideScreen';
import EarningsScreen from './components/driver_ui/EarningsScreen';


import { 
    RIDE_OPTIONS, AVAILABLE_SERVICES, 
    LOCAL_STORAGE_LOGGED_IN_USER_KEY, LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY,
    API_BASE_URL,
    LOCAL_STORAGE_USER_TOKEN_KEY, LOCAL_STORAGE_DRIVER_TOKEN_KEY
} from './constants';
import { calculateFare } from './services/fareService';
import { InformationCircleIcon } from './components/icons/FluentIcons';

// Helper to map BackendRide to BookingDetails
const mapBackendRideToBookingDetails = (ride: BackendRide, currentUserForBooking?: User | null): BookingDetails => {
  const driverDetails: Driver | null = ride.driverId && ride.driverName ? {
    name: ride.driverName,
    rating: ride.driverRating || 0,
    vehicleModel: ride.driverVehicle || 'N/A',
    licensePlate: ride.driverLicensePlate || 'N/A',
    imageUrl: ride.driverImageUrl || `https://picsum.photos/seed/${ride.driverId}/100/100`,
    phone: ride.driverPhone || 'N/A',
  } : null;

  return {
    id: ride.id,
    pickup: { address: ride.pickupAddress, lat: ride.pickupLat || undefined, lng: ride.pickupLng || undefined },
    dropoff: { address: ride.dropoffAddress, lat: ride.dropoffLat || undefined, lng: ride.dropoffLng || undefined },
    rideType: ride.rideType,
    distance: ride.distance,
    estimatedFare: ride.estimatedFare,
    estimatedArrivalTime: 'N/A', // This is mostly a frontend concept; backend doesn't store user's ETA expectation like "15 mins"
    driver: driverDetails,
    passengers: ride.passengers,
    clientFullName: currentUserForBooking?.fullName || ride.passengerName || 'N/A',
    clientEmail: currentUserForBooking?.email || 'N/A', // Assuming email isn't directly on ride from backend unless joined
    clientContact: currentUserForBooking?.contact || ride.passengerContact || 'N/A',
    originatingServiceTitle: ride.originatingServiceTitle || undefined,
    serviceTypeForApi: ServiceTypeEnum.RIDE,
    status: ride.status,
  };
};


const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.AuthSelection);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserToken, setCurrentUserToken] = useState<string | null>(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState<boolean>(false);
  const [currentUserScreen, setCurrentUserScreen] = useState<UserScreenView>(UserScreenView.Home);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  const [currentDriver, setCurrentDriver] = useState<DriverProfile | null>(null);
  const [currentDriverToken, setCurrentDriverToken] = useState<string | null>(null);
  const [isAuthenticatedDriver, setIsAuthenticatedDriver] = useState<boolean>(false);
  const [currentDriverScreen, setCurrentDriverScreen] = useState<DriverScreenView>(DriverScreenView.Dashboard);
  const [incomingRideRequestForDriver, setIncomingRideRequestForDriver] = useState<IncomingRideRequest | null>(null);
  const [activeRideDetails, setActiveRideDetails] = useState<ActiveRideDetails | null>(null);
  const [driverRideRequestTimeout, setDriverRideRequestTimeout] = useState<number | null>(null);
  const driverPollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigateToUserScreen = useCallback((screen: UserScreenView) => {
    // This function can now navigate to any UserScreenView
    setCurrentUserScreen(screen);
  }, []);

  const fetchAndSetActiveRideDetails = async (rideId: string, token: string) => {
     try {
        const response = await fetch(`${API_BASE_URL}/rides/${rideId}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const rideData: BackendRide = await response.json();
            const rideDetails: ActiveRideDetails = {
                id: rideData.id,
                userId: rideData.userId,
                pickupAddress: rideData.pickupAddress,
                dropoffAddress: rideData.dropoffAddress,
                rideType: rideData.rideType,
                estimatedFare: rideData.estimatedFare,
                distance: rideData.distance,
                passengers: rideData.passengers,
                status: rideData.status,
                pickupLat: rideData.pickupLat || undefined,
                pickupLng: rideData.pickupLng || undefined,
                dropoffLat: rideData.dropoffLat || undefined,
                dropoffLng: rideData.dropoffLng || undefined,
                originatingServiceTitle: rideData.originatingServiceTitle || undefined,
                requestedAt: rideData.requestedAt,
                passengerName: rideData.passengerName || 'N/A',
                passengerContact: rideData.passengerContact,
                passengerRating: rideData.passengerRating,
            };
            setActiveRideDetails(rideDetails);
            // Optionally navigate to active ride screen if not already on a specific screen
            if (currentDriverScreen !== DriverScreenView.RideRequest) {
                 setCurrentDriverScreen(DriverScreenView.ActiveRide);
            }
        } else {
            console.error(`Failed to fetch details for active ride ${rideId}.`);
            // Clear the bad activeRideId from profile state
            setCurrentDriver(prev => prev ? ({ ...prev, activeRideId: null }) : null);
        }
    } catch (error) {
        console.error("Error fetching active ride details:", error);
    }
  };


  const fetchAndSetCurrentDriverProfile = async (token: string, initialProfileFromStorage?: DriverProfile) => {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const profileData: DriverProfile & { driverSystemId?: string, availabilityStatus?: DriverAvailabilityStatus } = await response.json();
            // Map backend fields to frontend DriverProfile
            const fetchedDriverProfile: DriverProfile = {
                id: profileData.id,
                driverId: profileData.driverSystemId || profileData.driverId, // Prefer driverSystemId if present
                fullName: profileData.fullName,
                email: profileData.email,
                phone: profileData.phone,
                vehicleModel: profileData.vehicleModel,
                licensePlate: profileData.licensePlate,
                profileImageUrl: profileData.profileImageUrl,
                rating: profileData.rating,
                availability: profileData.availabilityStatus || profileData.availability, // Prefer availabilityStatus
                token: token,
                activeRideId: initialProfileFromStorage?.activeRideId || currentDriver?.activeRideId || null,
                documents: [
                    { id: 'doc1', name: 'Driving Permit', status: 'Verified', submittedAt: '2023-10-15' },
                    { id: 'doc2', name: 'Vehicle Registration', status: 'Pending', submittedAt: '2024-05-20' }
                ]
            };
            setCurrentDriver(fetchedDriverProfile);
            localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY, JSON.stringify(fetchedDriverProfile));
            
            if (fetchedDriverProfile.activeRideId) {
                await fetchAndSetActiveRideDetails(fetchedDriverProfile.activeRideId, token);
            }

            return fetchedDriverProfile;
        } else {
            console.error("Failed to fetch driver profile, logging out driver.");
            handleDriverLogout();
        }
    } catch (error) {
        console.error("Error fetching driver profile:", error);
        handleDriverLogout();
    }
    return null;
  };
  
  const fetchAndSetCurrentUserRide = useCallback(async (token: string, userForBooking: User | null) => {
    if (!isOnline) return;
    try {
        const response = await fetch(`${API_BASE_URL}/rides/user/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const ride: BackendRide | null = await response.json();
            if (ride) {
                const currentBookingDetails = mapBackendRideToBookingDetails(ride, userForBooking);
                setBookingDetails(currentBookingDetails);
                 // Navigate based on status
                if ([ 'ACCEPTED', 'DRIVER_EN_ROUTE', 'ONGOING'].includes(ride.status)) {
                   if (currentBookingDetails.driver) navigateToUserScreen(UserScreenView.Tracking);
                   else navigateToUserScreen(UserScreenView.Confirmation); // Driver details might be missing from this specific response
                } else if (['PENDING_ASSIGNMENT', 'AWAITING_DRIVER_ACCEPTANCE'].includes(ride.status)) {
                    navigateToUserScreen(UserScreenView.Confirmation);
                } else {
                     // For completed/cancelled, clear booking details or handle as needed
                     // setBookingDetails(null); 
                }
            } else {
                setBookingDetails(null); // No active ride
            }
        } else {
            console.error("Failed to fetch current user ride:", response.statusText);
            setBookingDetails(null);
        }
    } catch (error) {
        console.error("Error fetching current user ride:", error);
        setBookingDetails(null);
    }
  }, [isOnline, navigateToUserScreen]);


  useEffect(() => {
    const storedUserStr = localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_USER_KEY);
    const storedUserToken = localStorage.getItem(LOCAL_STORAGE_USER_TOKEN_KEY);

    const storedDriverStr = localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY);
    const storedDriverToken = localStorage.getItem(LOCAL_STORAGE_DRIVER_TOKEN_KEY);

    if (storedUserStr && storedUserToken) {
      try {
        const user: User = JSON.parse(storedUserStr);
        setCurrentUser(user);
        setCurrentUserToken(storedUserToken);
        setIsAuthenticatedUser(true);
        setAppMode(AppMode.User);
        if (currentUserScreen === UserScreenView.Login || currentUserScreen === UserScreenView.Signup) {
            setCurrentUserScreen(UserScreenView.Home);
        }
        fetchAndSetCurrentUserRide(storedUserToken, user);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        handleUserLogout(); // Clear inconsistent state
      }
    } else if (storedDriverStr && storedDriverToken) {
      try {
        const driver: DriverProfile = JSON.parse(storedDriverStr);
        // We will fetch full profile from backend to ensure data consistency
        fetchAndSetCurrentDriverProfile(storedDriverToken, driver).then(fetchedProfile => {
            if (fetchedProfile) {
                setCurrentDriver(prev => ({...prev, ...fetchedProfile, activeRideId: driver.activeRideId})); // Ensure activeRideId is preserved from LS if set
                setCurrentDriverToken(storedDriverToken);
                setIsAuthenticatedDriver(true);
                setAppMode(AppMode.Driver);
                if (!fetchedProfile.activeRideId) {
                    setCurrentDriverScreen(DriverScreenView.Dashboard); 
                } // fetchAndSetActiveRideDetails will handle navigation if ride is active
            } else {
                handleDriverLogout(); // If fetch fails
            }
        });
      } catch (error) {
        console.error("Error parsing stored driver data:", error);
        handleDriverLogout(); // Clear inconsistent state
      }
    } else {
      setAppMode(AppMode.AuthSelection);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const handleUserSignup = async (fullName: string, email: string, contact: string, passwordInput: string): Promise<string | void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password: passwordInput, contactPhone: contact }),
      });
      const data: ApiAuthResponse = await response.json();
      if (!response.ok) {
        return data.message || `Signup failed with status: ${response.status}`;
      }
      alert(data.message || "Signup successful! Please login."); 
      return; 
    } catch (error) {
      console.error('Signup API error:', error);
      return 'An error occurred during signup. Please try again.';
    }
  };

  const handleUserLogin = async (email: string, passwordInput: string): Promise<string | void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordInput }),
      });
      const data: ApiAuthResponse = await response.json();

      if (!response.ok || !data.token || !data.user) {
        return data.message || `Login failed with status: ${response.status}`;
      }
      
      const loggedInUser: User = { 
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        contact: data.user.contact || '', 
      };

      setCurrentUser(loggedInUser);
      setCurrentUserToken(data.token);
      setIsAuthenticatedUser(true);
      localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_USER_KEY, JSON.stringify(loggedInUser));
      localStorage.setItem(LOCAL_STORAGE_USER_TOKEN_KEY, data.token);
      setAppMode(AppMode.User);
      setCurrentUserScreen(UserScreenView.Home);
      await fetchAndSetCurrentUserRide(data.token, loggedInUser);
      return; 
    } catch (error) {
      console.error('Login API error:', error);
      return 'An error occurred during login. Please try again.';
    }
  };
  
  const handleUserSignupSuccessNavigation = useCallback(() => {
    setAppMode(AppMode.AuthSelection); 
  }, []);
  
  const handleUserLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentUserToken(null);
    setIsAuthenticatedUser(false);
    localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_TOKEN_KEY);
    setBookingDetails(null);
    setAppMode(AppMode.AuthSelection);
    setCurrentUserScreen(UserScreenView.Login); // Or Home, but AuthSelection implies Login
  }, []);

  const handleBookingRequest = useCallback((pickupAddress: string, dropoffAddress: string, rideType: RideType, distance: number) => {
    if (!isAuthenticatedUser || !currentUser) {
        setAppMode(AppMode.AuthSelection);
        alert("Please login or sign up to make a booking.");
        return;
    }
    const fare = distance > 0 ? calculateFare(rideType, distance) : 0;
    const newBooking: BookingDetails = {
      // id will be set by backend
      pickup: { address: pickupAddress },
      dropoff: { address: dropoffAddress },
      rideType: rideType,
      distance: distance,
      estimatedFare: fare,
      estimatedArrivalTime: 'Estimating...', // Placeholder, will be updated post-confirmation
      driver: null, // Driver assigned by backend
      passengers: 1, // Default, can be updated in RideBookingScreen
      clientFullName: currentUser.fullName,
      clientEmail: currentUser.email,
      clientContact: currentUser.contact,
      serviceTypeForApi: ServiceTypeEnum.RIDE,
    };
    setBookingDetails(newBooking);
    navigateToUserScreen(UserScreenView.Booking);
  }, [currentUser, isAuthenticatedUser, navigateToUserScreen]);

  const handleServiceBookingRequest = useCallback((service: ServiceItem) => {
    if (!isAuthenticatedUser || !currentUser) {
      setAppMode(AppMode.AuthSelection);
      alert("Please login or sign up to book a service.");
      return;
    }
    const newBooking: BookingDetails = {
      pickup: { address: '' }, 
      dropoff: { address: '' }, 
      rideType: RideType.Standard, 
      distance: 0, 
      estimatedFare: 0, 
      estimatedArrivalTime: 'N/A', 
      passengers: 1, 
      clientFullName: currentUser.fullName, 
      clientEmail: currentUser.email, 
      clientContact: currentUser.contact,
      originatingServiceTitle: service.title,
      serviceTypeForApi: service.serviceTypeEnum || ServiceTypeEnum.OTHER,
    };
    setBookingDetails(newBooking);
    navigateToUserScreen(UserScreenView.Booking);
  }, [currentUser, isAuthenticatedUser, navigateToUserScreen]);

  const confirmUserBooking = useCallback(async (updatedBookingDetails: BookingDetails) => {
    if (!isOnline) {
      alert("You are currently offline. Please check your internet connection.");
      return;
    }
    if (!isAuthenticatedUser || !currentUser || !currentUserToken) {
        setAppMode(AppMode.AuthSelection);
        return;
    }
    
    setBookingDetails(updatedBookingDetails); // Update with final details from form

    const serviceType = updatedBookingDetails.serviceTypeForApi;

    if (serviceType === ServiceTypeEnum.RIDE) {
      // API call for RIDE
      try {
        const ridePayload = {
          pickupAddress: updatedBookingDetails.pickup.address,
          dropoffAddress: updatedBookingDetails.dropoff.address,
          // Add lat/lng if available from BookingDetails
          pickupLat: updatedBookingDetails.pickup.lat,
          pickupLng: updatedBookingDetails.pickup.lng,
          dropoffLat: updatedBookingDetails.dropoff.lat,
          dropoffLng: updatedBookingDetails.dropoff.lng,
          rideType: updatedBookingDetails.rideType,
          estimatedFare: updatedBookingDetails.estimatedFare,
          distance: updatedBookingDetails.distance,
          passengers: updatedBookingDetails.passengers,
          originatingServiceTitle: updatedBookingDetails.originatingServiceTitle,
        };
        const response = await fetch(`${API_BASE_URL}/rides/request`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUserToken}`
          },
          body: JSON.stringify(ridePayload),
        });
        const data: BackendRide = await response.json(); // Expecting the created ride object
        if (!response.ok) {
          alert(`Ride request failed: ${(data as any).message || response.statusText}`);
          return;
        }
        console.log("Ride request successful via API:", data);
        const confirmedBooking = mapBackendRideToBookingDetails(data, currentUser);
        // Update bookingDetails with backend response (includes ID and status)
        setBookingDetails(confirmedBooking); 
        navigateToUserScreen(UserScreenView.Confirmation);
      } catch (error) {
        console.error("Ride request API error:", error);
        alert("An error occurred while submitting your ride request. Please try again.");
      }
    } else if (serviceType === ServiceTypeEnum.HOTEL || serviceType === ServiceTypeEnum.FLIGHT || serviceType === ServiceTypeEnum.COURIER) {
      const apiPayload: ApiServiceBookingRequestData = {
        userId: currentUser.id,
        serviceType: serviceType,
        clientFullName: updatedBookingDetails.clientFullName,
        clientEmail: updatedBookingDetails.clientEmail,
        clientContact: updatedBookingDetails.clientContact,
        originatingServiceTitle: updatedBookingDetails.originatingServiceTitle,
        hotelName: updatedBookingDetails.hotelName,
        checkInDate: updatedBookingDetails.checkInDate,
        checkOutDate: updatedBookingDetails.checkOutDate,
        roomType: updatedBookingDetails.roomType,
        numberOfGuestsHotel: updatedBookingDetails.numberOfGuestsHotel,
        departureAirport: updatedBookingDetails.departureAirport,
        arrivalAirport: updatedBookingDetails.arrivalAirport,
        departureDate: updatedBookingDetails.departureDate,
        returnDate: updatedBookingDetails.returnDate,
        flightClass: updatedBookingDetails.flightClass,
        numberOfPassengersFlight: updatedBookingDetails.numberOfPassengersFlight,
        courierPickupAddress: updatedBookingDetails.courierPickupAddress,
        courierDropoffAddress: updatedBookingDetails.courierDropoffAddress,
        packageDescription: updatedBookingDetails.packageDescription,
        packageWeightKg: updatedBookingDetails.packageWeightKg,
        deliverySpeed: updatedBookingDetails.deliverySpeed,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/service-bookings`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUserToken}`
          },
          body: JSON.stringify(apiPayload),
        });
        const data: ApiServiceBookingResponse = await response.json();
        if (!response.ok) {
          alert(`Service booking failed: ${data.message || response.statusText}`);
          return;
        }
        console.log("Service booking successful via API:", data.booking);
        // For non-ride services, the existing confirmation flow is okay.
        // Update bookingDetails if necessary, though it's less critical than for rides.
        setBookingDetails(prev => ({...prev, id: data.booking?.id, status: data.booking?.status}));
        navigateToUserScreen(UserScreenView.Confirmation);
      } catch (error) {
        console.error("Service booking API error:", error);
        alert("An error occurred while submitting your service request. Please try again.");
      }
    } else { 
      console.warn("Unhandled service type for confirmation:", serviceType);
      alert("This service type cannot be booked at the moment.");
    }
  }, [navigateToUserScreen, isAuthenticatedUser, currentUser, currentUserToken, isOnline]);

  const isUserBookingActive = (currentUserScreen === UserScreenView.Tracking || currentUserScreen === UserScreenView.Confirmation) && isAuthenticatedUser && !!bookingDetails?.id;

  const handleDriverLogin = async (driverIdentifier: string, passwordInput: string): Promise<string | void> => {
     try {
      const response = await fetch(`${API_BASE_URL}/auth/driver/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driverIdentifier, password: passwordInput }),
      });
      const data: ApiAuthResponse = await response.json();

      if (!response.ok || !data.token || !data.driver) {
        return data.message || `Driver login failed: ${response.status}`;
      }
      
      const loggedInDriver: DriverProfile = {
        id: data.driver.id, 
        driverId: data.driver.driverId, 
        fullName: data.driver.fullName,
        email: data.driver.email,
        phone: data.driver.phone, 
        vehicleModel: data.driver.vehicleModel, 
        licensePlate: data.driver.licensePlate, 
        profileImageUrl: data.driver.profileImageUrl,
        rating: data.driver.rating, 
        availability: data.driver.availabilityStatus,
        activeRideId: null, // Initialize activeRideId
        documents: [ // Add mock documents as backend doesn't support them yet
            { id: 'doc1', name: 'Driving Permit', status: 'Verified', submittedAt: '2023-10-15' },
            { id: 'doc2', name: 'Vehicle Registration', status: 'Pending', submittedAt: '2024-05-20' }
        ]
      };

      setCurrentDriver(loggedInDriver);
      setCurrentDriverToken(data.token);
      setIsAuthenticatedDriver(true);
      localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY, JSON.stringify(loggedInDriver));
      localStorage.setItem(LOCAL_STORAGE_DRIVER_TOKEN_KEY, data.token);
      setAppMode(AppMode.Driver);
      setCurrentDriverScreen(DriverScreenView.Dashboard);
      return; 
    } catch (error) {
      console.error('Driver Login API error:', error);
      return 'An error occurred during driver login. Please try again.';
    }
  };

  const handleDriverLogout = useCallback(() => {
    if (driverPollingIntervalRef.current) {
        clearInterval(driverPollingIntervalRef.current);
        driverPollingIntervalRef.current = null;
    }
    setCurrentDriver(null);
    setCurrentDriverToken(null);
    setIsAuthenticatedDriver(false);
    localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DRIVER_TOKEN_KEY);
    setActiveRideDetails(null);
    setAppMode(AppMode.AuthSelection);
    setCurrentDriverScreen(DriverScreenView.Dashboard); // Reset screen
  }, []);
  
  const handleToggleDriverAvailability = useCallback(async (newStatus: DriverAvailabilityStatus) => {
    if (!currentDriver || !currentDriverToken || !isOnline) {
      alert(isOnline ? "Driver profile not available." : "You are offline. Cannot change status.");
      return;
    }
    if (newStatus === DriverAvailabilityStatus.Offline && 
        (currentDriver.availability === DriverAvailabilityStatus.OnTrip || incomingRideRequestForDriver)) {
      alert("Cannot go offline while on a trip or with an active ride request.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/drivers/me/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentDriverToken}`
        },
        body: JSON.stringify({ availability: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Failed to update availability: ${data.message || response.statusText}`);
        return;
      }
      setCurrentDriver(prevProfile => {
        if (!prevProfile) return null;
        const updatedProfile = { ...prevProfile, availability: data.availabilityStatus };
        localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY, JSON.stringify(updatedProfile));
        return updatedProfile;
      });

    } catch (error) {
      console.error("Error updating availability on backend:", error);
      alert("An error occurred while updating your availability.");
    }
  }, [currentDriver, currentDriverToken, incomingRideRequestForDriver, isOnline]);

  const navigateToDriverScreen = useCallback((screen: DriverScreenView) => {
    if (appMode !== AppMode.Driver) {
        setAppMode(AppMode.AuthSelection);
        return;
    }
    if (incomingRideRequestForDriver && screen !== DriverScreenView.RideRequest) {
      alert("Please respond to the current ride request first.");
      return;
    }
    if (activeRideDetails && screen === DriverScreenView.Dashboard) {
      setCurrentDriverScreen(DriverScreenView.ActiveRide);
      return;
    }
    setCurrentDriverScreen(screen);
  }, [appMode, incomingRideRequestForDriver, activeRideDetails]);
  
  const handleUpdateDriverProfile = useCallback((updatedProfile: DriverProfile) => {
        setCurrentDriver(updatedProfile);
        localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY, JSON.stringify(updatedProfile));
        alert("Profile updated successfully! (This is a simulation)");
        navigateToDriverScreen(DriverScreenView.Dashboard);
    }, [navigateToDriverScreen]);

  const clearDriverRideRequest = () => {
    setIncomingRideRequestForDriver(null);
    if (driverRideRequestTimeout) {
      clearTimeout(driverRideRequestTimeout);
      setDriverRideRequestTimeout(null);
    }
  };

  const updateActiveRideStatus = (rideData: BackendRide) => {
    setActiveRideDetails(prev => {
        if (!prev) return null; // Should not happen if this function is called
        // Create a new object with all fields from rideData mapped to ActiveRideDetails
        const newDetails: ActiveRideDetails = {
            id: rideData.id,
            userId: rideData.userId,
            pickupAddress: rideData.pickupAddress,
            dropoffAddress: rideData.dropoffAddress,
            rideType: rideData.rideType,
            estimatedFare: rideData.estimatedFare,
            distance: rideData.distance,
            passengers: rideData.passengers,
            status: rideData.status,
            pickupLat: rideData.pickupLat || undefined,
            pickupLng: rideData.pickupLng || undefined,
            dropoffLat: rideData.dropoffLat || undefined,
            dropoffLng: rideData.dropoffLng || undefined,
            originatingServiceTitle: rideData.originatingServiceTitle || undefined,
            requestedAt: rideData.requestedAt,
            passengerName: rideData.passengerName || 'N/A',
            passengerContact: rideData.passengerContact,
            passengerRating: rideData.passengerRating,
        };
        return newDetails;
    });
  };

  const handleAcceptDriverRide = async (requestId: string) => {
    if (!currentDriver || !currentDriverToken || !isOnline || !incomingRideRequestForDriver) {
        alert(isOnline ? "Cannot accept ride: Not authenticated or request is gone." : "You are offline.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/rides/${requestId}/accept`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentDriverToken}` }
        });
        const data = await response.json();
        if (!response.ok) {
            alert(`Failed to accept ride: ${data.message || response.statusText}`);
            if (response.status === 403 || response.status === 404) clearDriverRideRequest();
            return;
        }
        console.log(`Driver: Accepted ride ${requestId} via API.`);

        const acceptedRideDetails: ActiveRideDetails = { ...incomingRideRequestForDriver, status: 'ACCEPTED' };
        setActiveRideDetails(acceptedRideDetails);

        const updatedProfile = {...currentDriver, availability: DriverAvailabilityStatus.OnTrip, activeRideId: requestId};
        setCurrentDriver(updatedProfile);
        localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY, JSON.stringify(updatedProfile));

        clearDriverRideRequest();
        setCurrentDriverScreen(DriverScreenView.ActiveRide); 

    } catch (error) {
        console.error("Error accepting ride:", error);
        alert("An error occurred while accepting the ride.");
    }
  };

  const handleRejectDriverRide = async (requestId: string, autoRejected = false) => {
     if (!currentDriver || !currentDriverToken || !isOnline && !autoRejected) { 
        alert(isOnline ? "Cannot reject ride: Not authenticated." : "You are offline.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/rides/${requestId}/reject`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentDriverToken}` }
        });
        const data = await response.json(); 
        if (!response.ok && response.status !== 404 && response.status !== 403) { 
            alert(`Failed to reject ride: ${data.message || response.statusText}`);
            return;
        }
        console.log(`Driver: Rejected ride ${requestId} via API. AutoRejected: ${autoRejected}`);
        clearDriverRideRequest();
        setCurrentDriverScreen(DriverScreenView.Dashboard);
        if(!autoRejected) alert("Ride Rejected.");
    } catch (error) {
        console.error("Error rejecting ride:", error);
        alert("An error occurred while rejecting the ride.");
    }
  };
  
   const handleArriveAtPickup = async () => {
    if (!activeRideDetails || !currentDriverToken || !isOnline) return;
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${activeRideDetails.id}/arrive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentDriverToken}` }
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Failed to mark arrival: ${data.message || response.statusText}`);
        return;
      }
      updateActiveRideStatus(data.ride);
    } catch (error) {
      console.error("Error marking arrival:", error);
      alert("An error occurred while marking arrival.");
    }
  };

  const handleStartRide = async () => {
    if (!activeRideDetails || !currentDriverToken || !isOnline) return;
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${activeRideDetails.id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentDriverToken}` }
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Failed to start ride: ${data.message || response.statusText}`);
        return;
      }
      updateActiveRideStatus(data.ride);
    } catch (error) {
      console.error("Error starting ride:", error);
      alert("An error occurred while starting the ride.");
    }
  };
  
  const handleCompleteDriverRide = async () => {
    if (!currentDriver || !currentDriverToken || !currentDriver.activeRideId || !isOnline) {
        alert(isOnline ? "No active ride to complete or not authenticated." : "You are offline.");
        return;
    }
    const rideIdToComplete = currentDriver.activeRideId;
    try {
        const response = await fetch(`${API_BASE_URL}/rides/${rideIdToComplete}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentDriverToken}` }
        });
        const data = await response.json();
        if (!response.ok) {
            alert(`Failed to complete ride: ${data.message || response.statusText}`);
            return;
        }
        console.log(`Driver: Completed ride ${rideIdToComplete} via API.`);
        setActiveRideDetails(null); 
        const updatedProfile = {...currentDriver, availability: DriverAvailabilityStatus.Online, activeRideId: null};
        setCurrentDriver(updatedProfile);
        localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY, JSON.stringify(updatedProfile));
        alert("Ride Completed! You are now Online.");
        navigateToDriverScreen(DriverScreenView.Dashboard);
    } catch (error) {
        console.error("Error completing ride:", error);
        alert("An error occurred while completing the ride.");
    }
  };


  // Driver: Polling for new rides
  useEffect(() => {
    if (appMode === AppMode.Driver && currentDriver?.availability === DriverAvailabilityStatus.Online && !incomingRideRequestForDriver && currentDriverToken && isOnline) {
      if (driverPollingIntervalRef.current) clearInterval(driverPollingIntervalRef.current); 
      
      const poll = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/rides/driver/new`, {
            headers: { 'Authorization': `Bearer ${currentDriverToken}` }
          });
          if (!response.ok) { 
            console.error("Polling error:", response.status, response.statusText);
            if (response.status === 401 || response.status === 403) {
                handleDriverLogout(); 
            }
            return;
          }
          const rideData: IncomingRideRequest | null = await response.json(); 
          
          if (rideData && !incomingRideRequestForDriver) { 
            console.log("Driver App: Polled new ride request from backend", rideData);
            setIncomingRideRequestForDriver(rideData);
            navigateToDriverScreen(DriverScreenView.RideRequest); 

            if (driverRideRequestTimeout) clearTimeout(driverRideRequestTimeout);
            const timeoutId = setTimeout(() => handleRejectDriverRide(rideData.id, true), 30000);
            setDriverRideRequestTimeout(timeoutId);
          }
        } catch (error) {
          console.error("Driver App: Error polling for ride requests", error);
        }
      };
      
      poll(); 
      driverPollingIntervalRef.current = setInterval(poll, 7000) as unknown as number; 

    } else {
      if (driverPollingIntervalRef.current) {
        clearInterval(driverPollingIntervalRef.current);
        driverPollingIntervalRef.current = null;
      }
    }
    return () => {
      if (driverPollingIntervalRef.current) {
        clearInterval(driverPollingIntervalRef.current);
        driverPollingIntervalRef.current = null;
      }
      if(driverRideRequestTimeout) clearTimeout(driverRideRequestTimeout);
    };
  }, [appMode, currentDriver?.availability, incomingRideRequestForDriver, currentDriverToken, navigateToDriverScreen, isOnline, handleDriverLogout]);


  const handleBackToMain = useCallback(() => {
    if (isAuthenticatedUser) {
        setCurrentUserScreen(UserScreenView.Home);
    } else {
        setAppMode(AppMode.AuthSelection);
        setCurrentUserScreen(UserScreenView.Login); 
    }
  }, [isAuthenticatedUser]);


  const renderContent = () => {
    if (currentUserScreen === UserScreenView.PrivacyPolicy) {
      return <PrivacyPolicyScreen onBack={handleBackToMain} />;
    }
    if (currentUserScreen === UserScreenView.TermsAndConditions) {
      return <TermsAndConditionsScreen onBack={handleBackToMain} />;
    }
    
    switch (appMode) {
      case AppMode.AuthSelection:
        return <LoginSelectionScreen 
                    onUserLogin={handleUserLogin} 
                    onUserSignup={handleUserSignup}
                    onDriverLogin={handleDriverLogin} 
                    onUserSignupSuccessNav={handleUserSignupSuccessNavigation}
                />;
      
      case AppMode.User:
        if (!isAuthenticatedUser || !currentUser) { 
            setAppMode(AppMode.AuthSelection); return null;
        }
        switch (currentUserScreen) {
          case UserScreenView.Home:
            return <HomeScreen onBookNow={handleBookingRequest} onShowServices={() => navigateToUserScreen(UserScreenView.Services)} isOnline={isOnline} />;
          case UserScreenView.Services:
            return <ServicesScreen onBookService={handleServiceBookingRequest} isOnline={isOnline} />;
          case UserScreenView.Booking:
            if (!bookingDetails) { navigateToUserScreen(UserScreenView.Home); return null; }
            return <RideBookingScreen initialBookingDetails={bookingDetails} onConfirmBooking={confirmUserBooking} onBack={() => navigateToUserScreen(UserScreenView.Home)} currentUser={currentUser} isOnline={isOnline} />;
          case UserScreenView.Tracking:
            if (!bookingDetails || !bookingDetails.id) { navigateToUserScreen(UserScreenView.Home); return null; }
            return <TrackingScreen bookingDetails={bookingDetails} />;
          case UserScreenView.Confirmation:
            if (!bookingDetails || !bookingDetails.id) { navigateToUserScreen(UserScreenView.Home); return null; }
            return <ConfirmationScreen bookingDetails={bookingDetails} onTrackRide={() => navigateToUserScreen(UserScreenView.Tracking)} onGoHome={() => navigateToUserScreen(UserScreenView.Home)} />;
          case UserScreenView.AiChat:
            return <AiChatScreen />;
          default:
            navigateToUserScreen(UserScreenView.Home);
            return null;
        }

      case AppMode.Driver:
        if (!isAuthenticatedDriver || !currentDriver) { 
            setAppMode(AppMode.AuthSelection); return null;
        }

        const renderDriverContent = () => {
          if (currentDriverScreen === DriverScreenView.RideRequest && incomingRideRequestForDriver) {
              return <IncomingRideRequestScreenComponent 
                          request={incomingRideRequestForDriver}
                          onAccept={handleAcceptDriverRide}
                          onReject={handleRejectDriverRide}
                      />;
          }
          
          switch(currentDriverScreen) {
              case DriverScreenView.ActiveRide:
                  if (!activeRideDetails) {
                      navigateToDriverScreen(DriverScreenView.Dashboard);
                      return null;
                  }
                  return <ActiveRideScreen 
                            activeRide={activeRideDetails}
                            onArrive={handleArriveAtPickup}
                            onStart={handleStartRide}
                            onCompleteRide={handleCompleteDriverRide}
                          />;
              case DriverScreenView.Profile:
                  return <DriverProfileScreen 
                              driverProfile={currentDriver}
                              onSave={handleUpdateDriverProfile}
                              onBack={() => navigateToDriverScreen(DriverScreenView.Dashboard)}
                          />;
              case DriverScreenView.Earnings:
                  return <EarningsScreen 
                              onBack={() => navigateToDriverScreen(DriverScreenView.Dashboard)} 
                          />;
              case DriverScreenView.Dashboard:
              default:
                  return <DriverDashboard 
                              driverProfile={currentDriver} 
                              onToggleAvailability={handleToggleDriverAvailability}
                              onNavigate={navigateToDriverScreen}
                              currentRideRequest={incomingRideRequestForDriver}
                          />;
          }
        };

        return (
          <>
            {renderDriverContent()}
            {(!incomingRideRequestForDriver || currentDriverScreen !== DriverScreenView.RideRequest) && (
              <DriverBottomNavbar 
                  onNavigate={navigateToDriverScreen}
                  currentScreen={currentDriverScreen}
                  isRequestActive={!!incomingRideRequestForDriver}
                  activeRideId={currentDriver.activeRideId}
              />
            )}
          </>
        );

      default:
        setAppMode(AppMode.AuthSelection); 
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-text-primary">
      {!isOnline && (
        <div className="bg-danger text-white text-center p-2 fixed top-0 left-0 right-0 z-[1000]" role="alert">
          <InformationCircleIcon className="w-5 h-5 inline mr-2" />
          You are currently offline. Some features may be unavailable.
        </div>
      )}
      
      {appMode === AppMode.User && isAuthenticatedUser && (
        <Navbar onNavigate={navigateToUserScreen} currentScreen={currentUserScreen} isAuthenticated={isAuthenticatedUser} onLogout={handleUserLogout} />
      )}
      {appMode === AppMode.Driver && isAuthenticatedDriver && currentDriver && (!incomingRideRequestForDriver) && (
         <header className={`bg-driver-primary text-white p-4 shadow-md sticky top-0 z-50 ${!isOnline ? 'pt-10' : ''}`}> 
            <div className="container mx-auto max-w-4xl flex justify-between items-center">
                <span className="font-bold text-xl sm:text-2xl">{`${currentDriver.fullName.split(' ')[0]}'s Portal`}</span>
                <Button onClick={handleDriverLogout} variant="ghost" size="sm" className="text-white hover:bg-driver-primary-dark">Logout</Button>
            </div>
         </header>
      )}

      <main className={`flex-grow w-full ${appMode === AppMode.AuthSelection ? '' : 'container mx-auto max-w-4xl px-4 py-6'} ${appMode === AppMode.User || appMode === AppMode.Driver ? 'pb-24' : ''} ${!isOnline ? 'pt-10' : ''}`}>
        <div className="animate-fadeIn">
         {renderContent()}
        </div>
      </main>
      
      {appMode === AppMode.User && isAuthenticatedUser && (
        <BottomNavbar onNavigate={navigateToUserScreen} currentScreen={currentUserScreen} isBookingActive={isUserBookingActive} />
      )}
      
      {appMode === AppMode.AuthSelection && <Footer onNavigate={navigateToUserScreen} />} 
    </div>
  );
};

export default App;