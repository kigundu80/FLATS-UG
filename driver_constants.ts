
import { DriverProfile, DriverAvailabilityStatus } from './driver_types';

export const DRIVER_APP_NAME = "FLATS UG Driver";

export const MOCK_DRIVER_PROFILE: DriverProfile = {
  id: 'driver001',
  fullName: 'David K.',
  email: 'driver@flatsug.com',
  phone: '+256 700 111222',
  vehicleModel: 'Toyota Fielder',
  licensePlate: 'UXX 555Y',
  profileImageUrl: 'https://picsum.photos/seed/driverDavid/100/100',
  rating: 4.9,
  availability: DriverAvailabilityStatus.Offline,
};

export const LOCAL_STORAGE_DRIVER_KEY = 'flatsUgDriverProfile';
// This key MUST match LOCAL_STORAGE_NEW_RIDE_REQUEST_KEY in the User App's constants.ts
export const USER_APP_NEW_RIDE_REQUEST_KEY = 'flatsUgNewRideRequest'; 
