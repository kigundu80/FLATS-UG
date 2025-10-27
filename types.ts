import React from 'react'; 

// General Application Mode
export enum AppMode {
  AuthSelection = 'AUTH_SELECTION',
  User = 'USER',
  Driver = 'DRIVER',
}

// User-specific screen views
export enum UserScreenView {
  Home = 'HOME',
  Booking = 'BOOKING',
  Services = 'SERVICES',
  Tracking = 'TRACKING',
  Confirmation = 'CONFIRMATION',
  Login = 'LOGIN', 
  Signup = 'SIGNUP',
  PrivacyPolicy = 'PRIVACY_POLICY',
  TermsAndConditions = 'TERMS_AND_CONDITIONS',
  AiChat = 'AI_CHAT',
}

// Driver-specific screen views
export enum DriverScreenView {
  Dashboard = 'DASHBOARD',
  RideRequest = 'RIDEREQUEST',
  ActiveRide = 'ACTIVERIDE', 
  Earnings = 'EARNINGS',     
  Profile = 'PROFILE',       
}

export interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export enum RideType {
  Standard = 'Standard',
  Premium = 'Premium',
  VIP = 'VIP',
}

export interface RideOption {
  id: RideType;
  name:string;
  baseFare: number;
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

export interface Driver {
  name: string; 
  rating: number;
  vehicleModel: string;
  licensePlate: string;
  imageUrl: string;
  phone: string; 
}

export interface User {
  id: string; 
  fullName: string;
  email: string;
  contact: string; 
  password?: string; 
  rating?: number; 
  token?: string; 
}

// Enum for backend service types
export enum ServiceTypeEnum {
  HOTEL = 'HOTEL',
  FLIGHT = 'FLIGHT',
  COURIER = 'COURIER',
  RIDE = 'RIDE', 
  OTHER = 'OTHER',
}

export interface BookingDetails {
  id?: string; // Backend Ride ID, optional before creation
  pickup: Location; 
  dropoff: Location; 
  rideType: RideType; 
  distance: number;  
  estimatedFare: number;
  estimatedArrivalTime: string; 
  driver?: Driver | null; // Made optional and can be null
  passengers: number; 
  clientFullName: string; 
  clientEmail: string;    
  clientContact: string;  
  originatingServiceTitle?: string; 
  serviceTypeForApi?: ServiceTypeEnum; 

  // Hotel Booking Specific Fields
  hotelName?: string;
  checkInDate?: string; 
  checkOutDate?: string;
  roomType?: string; 
  numberOfGuestsHotel?: number;

  // Flight Booking Specific Fields
  departureAirport?: string;
  arrivalAirport?: string;
  departureDate?: string;
  returnDate?: string; 
  flightClass?: string; 
  numberOfPassengersFlight?: number;

  // Courier Service Specific Fields
  courierPickupAddress?: string;
  courierDropoffAddress?: string;
  packageDescription?: string;
  packageWeightKg?: number;
  deliverySpeed?: string; 

  // Backend ride status
  status?: string; 
}

export interface ServiceItem {
  id: string; 
  title: string;
  description: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; 
  onBookService?: (service: ServiceItem) => void; 
  serviceTypeEnum?: ServiceTypeEnum; 
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

export enum DriverAvailabilityStatus {
  Online = 'Online',
  Offline = 'Offline',
  OnTrip = 'OnTrip',
}

export interface DriverDocument {
  id: string;
  name: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  url?: string;
  submittedAt: string;
}

export interface DriverProfile { 
  id: string; 
  driverId?: string; 
  password?: string; 
  fullName: string;
  email: string; 
  phone: string; 
  vehicleModel: string;
  licensePlate: string;
  profileImageUrl?: string;
  rating: number; 
  availability: DriverAvailabilityStatus;
  token?: string; 
  activeRideId?: string | null; // To store the ID of the ride driver accepted
  documents?: DriverDocument[];
}

// SimplifiedRideRequest remains for potential other uses, but backend structure for driver/new is key
export interface SimplifiedRideRequest {
  id: string; 
  passengerName: string;
  passengerContact?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  rideType: RideType; 
  estimatedFare: number;
  distance: number;
  passengers: number;
  passengerRating?: number;
  estimatedArrivalTime: string; 
  originatingServiceTitle?: string; 
}

// Represents the data structure returned by /api/rides/driver/new
// and used for the IncomingRideRequestScreenComponent.
export interface IncomingRideRequest {
  // Fields from the backend 'Rides' table
  id: string; // Ride UUID
  userId: string;
  pickupAddress: string;
  dropoffAddress: string;
  rideType: RideType; // Ensure this matches enum
  estimatedFare: number;
  distance: number;
  passengers: number;
  status: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  originatingServiceTitle?: string;
  requestedAt: string; 
  // Joined fields from 'Users' table
  passengerName: string;
  passengerContact?: string;
  passengerRating?: number;
  // This is no longer extended from SimplifiedRideRequest to match backend more closely.
  // estimatedArrivalTime is from User App's perspective and not directly sent to driver this way by backend.
}


export interface ActiveRideDetails extends IncomingRideRequest { 
  navigationUrl?: string; 
}

export interface SVGIconProps extends React.SVGProps<SVGSVGElement> {}

// This type was SimplifiedRideRequestForDriver, it's largely superseded by IncomingRideRequest
// but kept if any part of the old localstorage logic might be temporarily active.
export interface SimplifiedRideRequestForDriver extends SimplifiedRideRequest {
}


// API Response Types
export interface ApiAuthResponse {
  message: string;
  user?: { id: string; fullName: string; email: string; contact?: string }; 
  driver?: { 
    id: string; 
    driverId: string; 
    fullName: string; 
    email: string; 
    availabilityStatus: DriverAvailabilityStatus;
    phone: string;
    vehicleModel: string;
    licensePlate: string;
    profileImageUrl?: string;
    rating: number;
  };
  token?: string;
  error?: string; 
}

export interface ApiServiceBookingRequestData extends Omit<BookingDetails, 'driver' | 'estimatedFare' | 'estimatedArrivalTime' | 'rideType' | 'distance' | 'pickup' | 'dropoff' | 'passengers' | 'id' | 'status' > {
  userId: string;
  serviceType: ServiceTypeEnum; 
  clientFullName: string;
  clientEmail: string;
  clientContact: string;
  originatingServiceTitle?: string;
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  roomType?: string;
  numberOfGuestsHotel?: number;
  departureAirport?: string;
  arrivalAirport?: string;
  departureDate?: string;
  returnDate?: string;
  flightClass?: string;
  numberOfPassengersFlight?: number;
  courierPickupAddress?: string;
  courierDropoffAddress?: string;
  packageDescription?: string;
  packageWeightKg?: number;
  deliverySpeed?: string;
}

export interface ApiServiceBookingResponse {
  message: string;
  booking?: ApiServiceBookingRequestData & { id: string; status: string; createdAt: string; updatedAt: string }; 
  error?: string;
}

// Type for backend Ride object (as returned by API)
export interface BackendRide {
  id: string;
  userId: string;
  driverId?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  rideType: RideType;
  status: string;
  estimatedFare: number;
  distance: number;
  passengers: number;
  originatingServiceTitle?: string | null;
  requestedAt: string;
  updatedAt: string;
  // Optional joined fields that might come with it
  passengerName?: string;
  passengerContact?: string;
  passengerRating?: number;
  driverName?: string;
  driverVehicle?: string;
  driverLicensePlate?: string;
  driverImageUrl?: string;
  driverPhone?: string;
  driverRating?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}