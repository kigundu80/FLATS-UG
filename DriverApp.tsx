
import React, { useState, useEffect, useCallback } from 'react';
import { DriverProfile, DriverAvailabilityStatus, DriverScreenView, SimplifiedRideRequest, IncomingRideRequest } from './driver_types';
import DriverDashboard from './components/driver/DriverDashboard';
import IncomingRideRequestScreen from './components/driver/IncomingRideRequestScreen';
import { MOCK_DRIVER_PROFILE, LOCAL_STORAGE_DRIVER_KEY, USER_APP_NEW_RIDE_REQUEST_KEY } from './driver_constants';

// Placeholder for Login Screen if we add auth later
// import DriverLoginScreen from './components/driver/DriverLoginScreen';

const DriverApp: React.FC = () => {
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // For future auth
  const [currentScreen, setCurrentScreen] = useState<DriverScreenView>(DriverScreenView.Dashboard);
  const [currentRideRequest, setCurrentRideRequest] = useState<IncomingRideRequest | null>(null);
  const [rideRequestTimeout, setRideRequestTimeout] = useState<number | null>(null);

  // Simulate loading driver profile / authentication
  useEffect(() => {
    const storedDriverProfile = localStorage.getItem(LOCAL_STORAGE_DRIVER_KEY);
    if (storedDriverProfile) {
      try {
        const profile: DriverProfile = JSON.parse(storedDriverProfile);
        setDriverProfile(profile);
        setIsAuthenticated(true); 
        setCurrentScreen(DriverScreenView.Dashboard);
      } catch (error) {
        console.error("Error parsing stored driver profile:", error);
        setDriverProfile(MOCK_DRIVER_PROFILE); 
        localStorage.setItem(LOCAL_STORAGE_DRIVER_KEY, JSON.stringify(MOCK_DRIVER_PROFILE));
        setIsAuthenticated(true); 
      }
    } else {
      setDriverProfile(MOCK_DRIVER_PROFILE);
      localStorage.setItem(LOCAL_STORAGE_DRIVER_KEY, JSON.stringify(MOCK_DRIVER_PROFILE));
      setIsAuthenticated(true); 
      setCurrentScreen(DriverScreenView.Dashboard);
    }
  }, []);

  // Listen for new ride requests from localStorage (simulation of backend push)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === USER_APP_NEW_RIDE_REQUEST_KEY && event.newValue) {
        if (driverProfile?.availability !== DriverAvailabilityStatus.Online) {
            console.log("Driver is not Online. Ignoring new ride request from localStorage.");
            // Optionally, clear it so it doesn't linger if a driver goes online later
            // localStorage.removeItem(USER_APP_NEW_RIDE_REQUEST_KEY); 
            return;
        }
        try {
          const requestData: SimplifiedRideRequest = JSON.parse(event.newValue);
          console.log("Driver App: Detected new ride request from localStorage", requestData);
          
          // Map to IncomingRideRequest if necessary (currently they are similar)
          const newRideRequest: IncomingRideRequest = { ...requestData };
          
          setCurrentRideRequest(newRideRequest);
          setCurrentScreen(DriverScreenView.RideRequest);

          // Auto-reject after a timeout (e.g., 30 seconds)
          if (rideRequestTimeout) clearTimeout(rideRequestTimeout);
          const timeoutId = setTimeout(() => {
            handleRejectRide(newRideRequest.id, true); // true for auto-reject
          }, 30000); // 30 seconds
          setRideRequestTimeout(timeoutId);

        } catch (error) {
          console.error("Driver App: Error parsing ride request from localStorage", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (rideRequestTimeout) clearTimeout(rideRequestTimeout);
    };
  }, [driverProfile?.availability, rideRequestTimeout]); // Re-subscribe if availability changes

  const handleToggleAvailability = useCallback((newStatus: DriverAvailabilityStatus) => {
    setDriverProfile(prevProfile => {
      if (!prevProfile) return null;
      // Cannot go offline if on trip or there's an active ride request
      if (newStatus === DriverAvailabilityStatus.Offline && 
          (prevProfile.availability === DriverAvailabilityStatus.OnTrip || currentRideRequest)) {
        alert("Cannot go offline while on a trip or with an active ride request.");
        return prevProfile;
      }
      const updatedProfile = { ...prevProfile, availability: newStatus };
      localStorage.setItem(LOCAL_STORAGE_DRIVER_KEY, JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  }, [currentRideRequest]);

  const handleNavigation = (screen: DriverScreenView) => {
    if (currentRideRequest && screen !== DriverScreenView.RideRequest) {
      alert("Please respond to the current ride request first.");
      return;
    }
    console.log("Navigate to (driver app):", screen);
    setCurrentScreen(screen);
  };
  
  const clearRideRequest = () => {
    setCurrentRideRequest(null);
    localStorage.removeItem(USER_APP_NEW_RIDE_REQUEST_KEY); // Clean up the simulation flag
    if (rideRequestTimeout) {
      clearTimeout(rideRequestTimeout);
      setRideRequestTimeout(null);
    }
  };

  const handleAcceptRide = (requestId: string) => {
    console.log(`Driver: Accepted ride ${requestId}`);
    if (driverProfile) {
      handleToggleAvailability(DriverAvailabilityStatus.OnTrip); // Set driver to 'OnTrip'
    }
    clearRideRequest();
    // In a real app, navigate to an ActiveRide screen with details
    setCurrentScreen(DriverScreenView.Dashboard); // For now, back to dashboard
    alert("Ride Accepted! You are now 'On Trip'. (Simulated)");
  };

  const handleRejectRide = (requestId: string, autoRejected = false) => {
    console.log(`Driver: Rejected ride ${requestId}`);
    clearRideRequest();
    setCurrentScreen(DriverScreenView.Dashboard);
    if (autoRejected) {
        alert("Ride request timed out and was automatically rejected. (Simulated)");
    } else {
        alert("Ride Rejected. (Simulated)");
    }
  };


  // Render logic
  if (!driverProfile) {
    // This case should ideally be DriverLoginScreen if not authenticated
    return <div className="p-4 text-center">Loading driver profile...</div>;
  }

  // If there's an active ride request, show that screen exclusively
  if (currentScreen === DriverScreenView.RideRequest && currentRideRequest) {
    return (
      <IncomingRideRequestScreen 
        request={currentRideRequest}
        onAccept={handleAcceptRide}
        onReject={handleRejectRide}
      />
    );
  }

  switch (currentScreen) {
    case DriverScreenView.Dashboard:
      return (
        <DriverDashboard 
          driverProfile={driverProfile} 
          onToggleAvailability={handleToggleAvailability}
          onNavigate={handleNavigation}
          currentRideRequest={currentRideRequest} // Pass for potential dashboard notification
        />
      );
    // Add cases for other screens like ActiveRide, Earnings, Profile later
    default: // Fallback to Dashboard
      return (
        <DriverDashboard 
          driverProfile={driverProfile} 
          onToggleAvailability={handleToggleAvailability}
          onNavigate={handleNavigation}
          currentRideRequest={currentRideRequest}
        />
      );
  }
};

export default DriverApp;
