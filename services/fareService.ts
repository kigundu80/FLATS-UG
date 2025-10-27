
import { RideType, RideOption } from '../types';
import { RIDE_OPTIONS, FARE_CONFIG } from '../constants';

export const calculateFare = (rideType: RideType, distanceKm: number): number => {
  const selectedOption: RideOption | undefined = RIDE_OPTIONS.find(opt => opt.id === rideType);

  if (!selectedOption) {
    throw new Error("Invalid ride type selected.");
  }

  let totalFare = selectedOption.baseFare;

  if (distanceKm > FARE_CONFIG.baseDistanceKm) {
    const extraDistance = distanceKm - FARE_CONFIG.baseDistanceKm;
    totalFare += extraDistance * FARE_CONFIG.extraChargePerKm;
  }

  return Math.round(totalFare); // Round to nearest UGX
};
