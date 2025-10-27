import React from 'react';
import Card from '../Card';
import Button from '../Button';
import { WalletIcon, CheckCircleIcon, TicketIcon, ArrowLeftIcon } from '../icons/FluentIcons';

interface EarningsScreenProps {
  onBack: () => void;
}

// Mock data for recent trips
const mockTrips = [
  { id: 'trip1', from: 'Acacia Mall', to: 'Entebbe Airport', fare: 50000, time: '2:45 PM' },
  { id: 'trip2', from: 'Kampala Serena Hotel', to: 'Kololo Airstrip', fare: 25000, time: '1:10 PM' },
  { id: 'trip3', from: 'Makerere University', to: 'Oasis Mall', fare: 18500, time: '11:30 AM' },
  { id: 'trip4', from: 'Bugolobi', to: 'Muyenga', fare: 16500, time: '10:15 AM' },
  { id: 'trip5', from: 'Kamwokya', to: 'Nakasero Market', fare: 15000, time: '9:00 AM' },
];

const EarningsScreen: React.FC<EarningsScreenProps> = ({ onBack }) => {
  const todayEarnings = mockTrips.reduce((acc, trip) => acc + trip.fare, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Earnings</h1>
        <Button onClick={onBack} variant="ghost" size="sm" leftIcon={<ArrowLeftIcon />}>
            Dashboard
        </Button>
      </div>

      <Card title="Today's Summary">
        <div className="text-center">
            <p className="text-sm text-text-secondary">TODAY'S EARNINGS</p>
            <p className="text-5xl font-bold text-driver-primary my-2">UGX {todayEarnings.toLocaleString()}</p>
            <div className="flex justify-center items-center space-x-4 text-text-secondary mt-3">
                <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span>{mockTrips.length} Trips Completed</span>
                </div>
            </div>
        </div>
      </Card>
      
      <Card title="Payouts">
        <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div>
                <p className="text-sm font-semibold text-text-secondary">UPCOMING PAYOUT</p>
                <p className="text-2xl font-bold text-text-primary">UGX 875,500</p>
                <p className="text-xs text-text-secondary">Scheduled for July 15, 2024</p>
            </div>
            <WalletIcon className="w-12 h-12 text-driver-primary opacity-50"/>
        </div>
        <div className="mt-4">
            <Button variant="ghost" className="w-full">View Payout History</Button>
        </div>
      </Card>
      
      <Card title="Today's Trips">
        {mockTrips.length > 0 ? (
          <ul className="space-y-3">
            {mockTrips.map((trip) => (
              <li key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                    <TicketIcon className="w-6 h-6 text-driver-primary mr-3 shrink-0"/>
                    <div>
                        <p className="font-semibold text-text-primary text-sm">{trip.from} to {trip.to}</p>
                        <p className="text-xs text-text-secondary">{trip.time}</p>
                    </div>
                </div>
                <p className="font-bold text-sm text-green-600">UGX {trip.fare.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary text-center py-4">No trips completed today.</p>
        )}
      </Card>

      {/* Spacer for bottom nav */}
      <div className="h-16"></div> 
    </div>
  );
};

export default EarningsScreen;