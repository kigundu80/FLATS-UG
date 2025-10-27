
import React from 'react';
import { BookingDetails } from '../../types';
import Input from '../Input';
import { BuildingOfficeIcon, CalendarDaysIcon, UsersIcon } from '../icons/FluentIcons';

interface HotelBookingFormProps {
  details: BookingDetails;
  onChange: (name: keyof BookingDetails | string, value: any) => void;
  isOnline: boolean;
}

const HotelBookingForm: React.FC<HotelBookingFormProps> = ({ details, onChange, isOnline }) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-brand-primary mb-3 border-b pb-2">Hotel Booking Details</h3>
      <Input
        label="Hotel Name / Preference"
        name="hotelName"
        placeholder="e.g., Serena Hotel Kampala, or Any 5-star near City Center"
        value={details.hotelName || ''}
        onChange={(e) => onChange('hotelName', e.target.value)}
        icon={<BuildingOfficeIcon />}
        disabled={!isOnline}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Check-in Date"
          name="checkInDate"
          type="date"
          value={details.checkInDate || ''}
          onChange={(e) => onChange('checkInDate', e.target.value)}
          icon={<CalendarDaysIcon />}
          disabled={!isOnline}
          required
        />
        <Input
          label="Check-out Date"
          name="checkOutDate"
          type="date"
          value={details.checkOutDate || ''}
          onChange={(e) => onChange('checkOutDate', e.target.value)}
          icon={<CalendarDaysIcon />}
          disabled={!isOnline}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select
                id="roomType"
                name="roomType"
                value={details.roomType || 'Single'}
                onChange={(e) => onChange('roomType', e.target.value)}
                className="form-select block w-full sm:text-sm rounded-lg border-gray-300 focus:ring-brand-primary focus:border-brand-primary py-2 px-3"
                disabled={!isOnline}
            >
                <option>Single</option>
                <option>Double</option>
                <option>Twin</option>
                <option>Suite</option>
                <option>Family Room</option>
                <option>Any Available</option>
            </select>
        </div>
        <Input
          label="Number of Guests"
          name="numberOfGuestsHotel"
          type="number"
          min="1"
          value={details.numberOfGuestsHotel?.toString() || '1'}
          onChange={(e) => onChange('numberOfGuestsHotel', parseInt(e.target.value, 10) || 1)}
          icon={<UsersIcon />}
          disabled={!isOnline}
          required
        />
      </div>
       <p className="text-xs text-gray-500 italic mt-2">
        For hotel bookings, specific room availability and pricing will be confirmed after request submission.
      </p>
    </div>
  );
};

export default HotelBookingForm;
