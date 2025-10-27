
import React from 'react';
import { BookingDetails } from '../../types';
import Input from '../Input';
import { TruckIcon, MapPinIcon, InboxIcon, ScaleIcon, ClockFastForwardIcon } from '../icons/FluentIcons';

interface CourierServiceFormProps {
  details: BookingDetails;
  onChange: (name: keyof BookingDetails | string, value: any) => void;
  isOnline: boolean;
}

const CourierServiceForm: React.FC<CourierServiceFormProps> = ({ details, onChange, isOnline }) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-brand-primary mb-3 border-b pb-2">Courier Service Details</h3>
      <Input
        label="Pickup Address (Package)"
        name="courierPickupAddress"
        placeholder="Enter full address for package pickup"
        value={details.courierPickupAddress || ''}
        onChange={(e) => onChange('courierPickupAddress', e.target.value)}
        icon={<MapPinIcon className="text-green-500" />}
        disabled={!isOnline}
        required
        // Consider using type="textarea" by modifying Input component or using a new Textarea component
        // For now, Input will work, but might be small for addresses.
      />
      <Input
        label="Delivery Address (Package)"
        name="courierDropoffAddress"
        placeholder="Enter full address for package delivery"
        value={details.courierDropoffAddress || ''}
        onChange={(e) => onChange('courierDropoffAddress', e.target.value)}
        icon={<MapPinIcon className="text-red-500" />}
        disabled={!isOnline}
        required
      />
      <Input
        label="Package Description"
        name="packageDescription"
        placeholder="e.g., Documents, Small Box, Electronics"
        value={details.packageDescription || ''}
        onChange={(e) => onChange('packageDescription', e.target.value)}
        icon={<InboxIcon />}
        disabled={!isOnline}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Approx. Weight (kg)"
          name="packageWeightKg"
          type="number"
          min="0.1"
          step="0.1"
          value={details.packageWeightKg?.toString() || '0.5'}
          onChange={(e) => onChange('packageWeightKg', parseFloat(e.target.value) || 0)}
          icon={<ScaleIcon />}
          disabled={!isOnline}
        />
        <div>
            <label htmlFor="deliverySpeed" className="block text-sm font-medium text-gray-700 mb-1">Delivery Speed</label>
            <select
                id="deliverySpeed"
                name="deliverySpeed"
                value={details.deliverySpeed || 'Standard'}
                onChange={(e) => onChange('deliverySpeed', e.target.value)}
                className="form-select block w-full sm:text-sm rounded-lg border-gray-300 focus:ring-brand-primary focus:border-brand-primary py-2 px-3"
                disabled={!isOnline}
            >
                <option>Standard</option>
                <option>Express</option>
                <option>Same-day (if available)</option>
            </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 italic mt-2">
        Courier charges and delivery timelines will be confirmed after request submission based on details provided.
      </p>
    </div>
  );
};

export default CourierServiceForm;
