
import React from 'react'; // Added explicit React import

export enum DriverScreenView {
  Dashboard = 'DASHBOARD',
  RideRequest = 'RIDEREQUEST', // New screen for incoming requests
  ActiveRide = 'ACTIVERIDE',
  Earnings = 'EARNINGS',
  Profile = 'PROFILE',
  Login = 'LOGIN',
}

export enum DriverAvailabilityStatus {
  Online = 'Online',
  Offline = 'Offline',
  OnTrip = 'OnTrip',
}

export interface DriverProfile {
  id: string;
  fullName: string;
  email: string; // For login
  phone: string;
  vehicleModel: string;
  licensePlate: string;
  profileImageUrl?: string;
  rating: number;
  availability: DriverAvailabilityStatus;
}

// Represents the data structure coming from the User App via localStorage
export interface SimplifiedRideRequest {
  id: string; // Unique ID for the request from user app
  passengerName: string;
  passengerContact?: string;
  pickupLocation: { address: string; lat?: number; lng?: number };
  dropoffLocation: { address: string; lat?: number; lng?: number };
  rideType: string; // Should match RideType enum from User app (e.g., 'Standard', 'VIP')
  estimatedFare: number;
  distance: number;
  passengers: number;
  passengerRating?: number; // Optional
  estimatedArrivalTime: string; // User's perspective ETA (e.g., "15 mins")
}

// This is what the Driver App's IncomingRideRequestScreen will use.
// It can be directly mapped from SimplifiedRideRequest or augmented.
export interface IncomingRideRequest extends SimplifiedRideRequest {
  // We can add driver-specific fields here if needed,
  // e.g., estimatedDistanceToPickup, but for now, it's the same.
  // The 'id' from SimplifiedRideRequest will serve as the unique ride ID.
}


export interface ActiveRideDetails {
  requestId: string;
  passengerName: string;
  pickupLocation: { address: string; lat?: number; lng?: number };
  dropoffLocation: { address: string; lat?: number; lng?: number };
  navigationUrl?: string; // To Google Maps/Waze etc.
}

// Minimal type for SVG icons for now
export interface SVGIconProps extends React.SVGProps<SVGSVGElement> {}