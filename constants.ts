import React from 'react';
import { RideType, RideOption, ServiceItem, DriverProfile, DriverAvailabilityStatus, ServiceTypeEnum } from './types';
import { BriefcaseIcon, MapIcon, GlobeAltIcon, UserGroupIcon, HomeIcon, AcademicCapIcon, UsersIcon, PaperAirplaneIcon, TruckIcon, KeyIcon, ArrowTrendingUpIcon } from './components/icons/FluentIcons';

export const APP_NAME = "FLATS UG"; 

// --- API Configuration ---
// The API base URL is now pointing to the local backend server to fix fetch errors.
export const API_BASE_URL = 'http://localhost:5001/api';

// --- User App Constants ---
export const FARE_CONFIG = {
  baseDistanceKm: 4.5,
  extraChargePerKm: 3500, // UGX
};

export const RIDE_OPTIONS: RideOption[] = [
  { id: RideType.Standard, name: 'Standard', baseFare: 30000, icon: React.createElement(UsersIcon) },
  { id: RideType.Premium, name: 'Premium', baseFare: 40000, icon: React.createElement(BriefcaseIcon) },
  { id: RideType.VIP, name: 'VIP', baseFare: 70000, icon: React.createElement(ArrowTrendingUpIcon) },
];

export const MOCK_USER_VIEW_DRIVER: import('./types').Driver = {
  name: 'John Doe',
  rating: 4.8,
  vehicleModel: 'Toyota Premio',
  licensePlate: 'UBD 123X',
  imageUrl: 'https://picsum.photos/seed/driver/100/100',
  phone: '+256 777 123456',
};

export const AVAILABLE_SERVICES: ServiceItem[] = [
  { id: 'courier', title: 'Courier Services', description: 'Fast and reliable package delivery.', icon: React.createElement(TruckIcon), serviceTypeEnum: ServiceTypeEnum.COURIER },
  { id: 'vip', title: 'VIP/Corporate Rides', description: 'Premium transport for business needs.', icon: React.createElement(BriefcaseIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'airport', title: 'Airport Transfers', description: 'Seamless airport pickups and drop-offs.', icon: React.createElement(PaperAirplaneIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'city_tours', title: 'City Tours/Town Runnings', description: 'Explore the city with our guided tours.', icon: React.createElement(MapIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'hotel_bookings', title: 'Hotel Bookings', description: 'Assistance with hotel reservations.', icon: React.createElement(HomeIcon), serviceTypeEnum: ServiceTypeEnum.HOTEL },
  { id: 'private_driver', title: 'Private Driver Hiring', description: 'Hire a personal driver for your needs.', icon: React.createElement(KeyIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'family_tours', title: 'Family Tours', description: 'Comfortable rides for family outings.', icon: React.createElement(UserGroupIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'group_tours', title: 'Individual/Group Tours', description: 'Customized tours for individuals and groups.', icon: React.createElement(UsersIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'flight_booking', title: 'Flight Booking', description: 'Assistance with booking flights.', icon: React.createElement(GlobeAltIcon), serviceTypeEnum: ServiceTypeEnum.FLIGHT },
  { id: 'school_trip', title: 'School Trip/Picnics', description: 'Safe transport for school events.', icon: React.createElement(AcademicCapIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
  { id: 'car_hiring', title: 'Car Hiring', description: 'Rent a car for your personal use.', icon: React.createElement(KeyIcon, { className: 'transform rotate-90' }), serviceTypeEnum: ServiceTypeEnum.OTHER }, // Or RIDE if it's chauffeured
  { id: 'shuttle_services', title: 'Individual Shuttle Services', description: 'Convenient shuttle rides.', icon: React.createElement(UsersIcon), serviceTypeEnum: ServiceTypeEnum.RIDE },
];

export const LOCAL_STORAGE_LOGGED_IN_USER_KEY = 'flatsUgLoggedInUser'; // Stores {user_details, token}
export const LOCAL_STORAGE_USERS_DB_KEY = 'flatsUgUsersDB_temp_signup_simulation'; // Kept for any old signup logic, but backend is primary
export const LOCAL_STORAGE_NEW_RIDE_REQUEST_KEY = 'flatsUgNewRideRequest'; // For simulating ride request to Driver


// --- Driver App Constants (merged) ---
export const DRIVER_APP_NAME_LABEL = "FLATS UG Driver Portal"; 

export const DEFAULT_DRIVER_PROFILE: DriverProfile = {
  id: 'DRV000', 
  password: 'password', 
  fullName: 'Default Driver',
  email: 'default.driver@flatsug.com',
  phone: '+256 000 000000',
  vehicleModel: 'Default Vehicle',
  licensePlate: 'UXX 000X',
  profileImageUrl: 'https://picsum.photos/seed/defaultdriver/100/100',
  rating: 4.5,
  availability: DriverAvailabilityStatus.Offline,
  driverId: 'DRV000',
  documents: [
    { id: 'doc1', name: 'Driving Permit', status: 'Verified', submittedAt: '2023-10-15' },
    { id: 'doc2', name: 'Vehicle Registration', status: 'Pending', submittedAt: '2024-05-20' }
  ]
};

// Simulated Database of Registered Drivers (Admin would manage this - for frontend simulation if needed)
// Backend database is the source of truth for login.
export const MOCK_DRIVERS_DB_FOR_FRONTEND_FALLBACK: DriverProfile[] = [
  {
    id: 'DRV001_uuid_placeholder', // This should be a UUID if from DB
    driverId: 'DRV001', 
    password: 'password123', 
    fullName: 'David K.',
    email: 'driver.david@flatsug.com',
    phone: '+256 700 111222',
    vehicleModel: 'Toyota Fielder',
    licensePlate: 'UXX 555Y',
    profileImageUrl: 'https://picsum.photos/seed/driverDavid/100/100',
    rating: 4.9,
    availability: DriverAvailabilityStatus.Offline,
    documents: [
      { id: 'doc3', name: 'Driving Permit', status: 'Verified', submittedAt: '2023-09-01' },
      { id: 'doc4', name: 'National ID', status: 'Verified', submittedAt: '2023-09-01' },
    ]
  },
  // ... more mock drivers
];

export const LOCAL_STORAGE_LOGGED_IN_DRIVER_KEY = 'flatsUgLoggedInDriver'; // Stores {driver_profile, token}
export const LOCAL_STORAGE_DRIVERS_DB_KEY_TEMP_LOGIN_SIM = 'flatsUgDriversDB_temp_login_simulation'; // Kept for any old login logic, backend is primary

// JWT Token Keys in LocalStorage (Optional, could also store within the user/driver profile object)
export const LOCAL_STORAGE_USER_TOKEN_KEY = 'flatsUgUserToken';
export const LOCAL_STORAGE_DRIVER_TOKEN_KEY = 'flatsUgDriverToken';
