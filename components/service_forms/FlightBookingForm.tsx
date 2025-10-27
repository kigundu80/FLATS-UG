
import React from 'react';
import { BookingDetails } from '../../types';
import Input from '../Input';
import { GlobeAltIcon, CalendarDaysIcon, UsersIcon, TagIcon } from '../icons/FluentIcons'; // Assuming TagIcon for class

interface FlightBookingFormProps {
  details: BookingDetails;
  onChange: (name: keyof BookingDetails | string, value: any) => void;
  isOnline: boolean;
}

const FlightBookingForm: React.FC<FlightBookingFormProps> = ({ details, onChange, isOnline }) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-brand-primary mb-3 border-b pb-2">Flight Booking Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Departure Airport/City"
          name="departureAirport"
          placeholder="e.g., Entebbe (EBB) or Kampala"
          value={details.departureAirport || ''}
          onChange={(e) => onChange('departureAirport', e.target.value)}
          icon={<GlobeAltIcon className="transform -scale-x-100"/>}
          disabled={!isOnline}
          required
        />
        <Input
          label="Arrival Airport/City"
          name="arrivalAirport"
          placeholder="e.g., Nairobi (NBO) or London"
          value={details.arrivalAirport || ''}
          onChange={(e) => onChange('arrivalAirport', e.target.value)}
          icon={<GlobeAltIcon />}
          disabled={!isOnline}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Departure Date"
          name="departureDate"
          type="date"
          value={details.departureDate || ''}
          onChange={(e) => onChange('departureDate', e.target.value)}
          icon={<CalendarDaysIcon />}
          disabled={!isOnline}
          required
        />
        <Input
          label="Return Date (Optional)"
          name="returnDate"
          type="date"
          value={details.returnDate || ''}
          onChange={(e) => onChange('returnDate', e.target.value)}
          icon={<CalendarDaysIcon />}
          disabled={!isOnline}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="flightClass" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
                id="flightClass"
                name="flightClass"
                value={details.flightClass || 'Economy'}
                onChange={(e) => onChange('flightClass', e.target.value)}
                className="form-select block w-full sm:text-sm rounded-lg border-gray-300 focus:ring-brand-primary focus:border-brand-primary py-2 px-3"
                disabled={!isOnline}
            >
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business</option>
                <option>First Class</option>
            </select>
        </div>
        <Input
          label="Number of Passengers"
          name="numberOfPassengersFlight"
          type="number"
          min="1"
          value={details.numberOfPassengersFlight?.toString() || '1'}
          onChange={(e) => onChange('numberOfPassengersFlight', parseInt(e.target.value, 10) || 1)}
          icon={<UsersIcon />}
          disabled={!isOnline}
          required
        />
      </div>
      <p className="text-xs text-gray-500 italic mt-2">
        Flight availability and exact pricing will be confirmed after request submission.
      </p>
    </div>
  );
};

export default FlightBookingForm;
