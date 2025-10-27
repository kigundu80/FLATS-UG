
import React from 'react';
import { DriverProfile, DriverAvailabilityStatus, DriverScreenView, IncomingRideRequest } from '../../driver_types'; 
import AvailabilityToggle from './AvailabilityToggle';
import { DRIVER_APP_NAME } from '../../driver_constants';

// Placeholder Icons
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="map w-5 h-5" {...props}><path fillRule="evenodd" d="M12 1.586l-4 4v10.828l4-4V1.586zM8.5 0A1.5 1.5 0 007 1.5v12.328a1.5 1.5 0 002.379 1.342L15.5 10.59V1.5A1.5 1.5 0 0014 .086L8.5 0z" clipRule="evenodd" /></svg>;
const DollarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="currency-dollar w-5 h-5" {...props}><path d="M8.433 7.418c.158-.103.358-.166.581-.166s.423.063.581.166L10 8.254l.419-.836c.158-.103.358-.166.581-.166.223 0 .423.063.581.166L12 8.254l.419-.836c.158-.103.358-.166.581-.166.223 0 .423.063.581.166L14 8.254l.419-.836c.158-.103.358-.166.581-.166.223 0 .423.063.581.166L16 8.254l.293-.586a.5.5 0 01.914.409l-2.5 5a.5.5 0 01-.914-.409l.707-1.414-1.293.646a.5.5 0 01-.581 0l-1.293-.647-1.293.647a.5.5 0 01-.581 0L8 11.254l-.293.586a.5.5 0 01-.914-.409l2.5-5a.5.5 0 01.914.409L9.293 7.67l1.293-.647a.5.5 0 01.581 0L12 7.67l.293-.586zM7 10a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1z" /></svg>;
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="menu-alt2 w-6 h-6" {...props}><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;


interface DriverDashboardProps {
  driverProfile: DriverProfile | null;
  onToggleAvailability: (newStatus: DriverAvailabilityStatus) => void;
  onNavigate: (screen: DriverScreenView) => void;
  currentRideRequest: IncomingRideRequest | null; // For displaying notification
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driverProfile, onToggleAvailability, onNavigate, currentRideRequest }) => {
  if (!driverProfile) {
    return (
      <div className="p-4 text-center text-red-500">
        Driver profile not loaded. Please login.
      </div>
    );
  }

  const { fullName, availability, profileImageUrl } = driverProfile;

  let statusMessage = "You are Offline";
  let statusColorClass = "bg-status-offline text-white";
  if (availability === DriverAvailabilityStatus.Online) {
    statusMessage = "Online - Awaiting Ride Requests";
    statusColorClass = "bg-status-online text-driver-primary";
  } else if (availability === DriverAvailabilityStatus.OnTrip) {
    statusMessage = "On Trip - Driving to Destination";
    statusColorClass = "bg-blue-500 text-white";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-driver-primary text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {profileImageUrl && <img src={profileImageUrl} alt={fullName} className="w-10 h-10 rounded-full mr-3 border-2 border-driver-accent"/>}
            <div>
                <h1 className="text-xl font-bold">{DRIVER_APP_NAME}</h1>
                <p className="text-xs text-gray-300">Welcome, {fullName.split(' ')[0]}</p>
            </div>
          </div>
          <AvailabilityToggle 
            currentStatus={availability} 
            onToggle={onToggleAvailability} 
          />
        </div>
      </header>

      {/* Status Bar */}
      <div className={`p-3 text-center text-sm font-medium ${statusColorClass} shadow`}>
        {statusMessage}
      </div>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-4 space-y-6">
        {/* Incoming Ride Request Notification on Dashboard */}
        {currentRideRequest && availability === DriverAvailabilityStatus.Online && (
          <div 
            className="bg-yellow-400 border-l-4 border-yellow-600 text-yellow-900 p-4 rounded-md shadow-lg mb-6 cursor-pointer hover:bg-yellow-300 transition-colors"
            role="alert"
            onClick={() => onNavigate(DriverScreenView.RideRequest)} // Navigate to the request screen
            aria-live="polite"
          >
            <div className="flex items-center">
              <BellIcon className="w-8 h-8 mr-3 animate-bounce" />
              <div>
                <h3 className="font-bold text-lg">NEW RIDE REQUEST!</h3>
                <p className="text-sm">Tap here to view details and respond.</p>
              </div>
            </div>
          </div>
        )}

        {/* Map View Placeholder */}
        <section aria-labelledby="map-view-heading">
          <h2 id="map-view-heading" className="sr-only">Map View</h2>
          <div className="bg-gray-300 h-64 rounded-lg flex items-center justify-center text-gray-500 shadow">
            <MapIcon className="w-16 h-16 text-gray-400" />
            <span className="ml-2">Live Map (Placeholder)</span>
          </div>
           {availability === DriverAvailabilityStatus.Online && !currentRideRequest && (
            <p className="text-center text-sm text-gray-600 mt-2">Searching for nearby ride requests...</p>
          )}
        </section>

        {/* Quick Stats Placeholder */}
        <section aria-labelledby="quick-stats-heading" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 id="quick-stats-heading" className="sr-only">Quick Statistics</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-driver-primary mb-2 flex items-center">
                <DollarIcon className="text-driver-secondary mr-2"/> Today's Earnings
            </h3>
            <p className="text-3xl font-bold text-driver-primary">UGX 0</p>
            <p className="text-sm text-gray-500">0 trips completed</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-driver-primary mb-2">Next Payout</h3>
            <p className="text-2xl font-bold text-driver-primary">UGX 0</p>
            <p className="text-sm text-gray-500">Scheduled for [Date]</p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-gray-200 p-2 fixed bottom-0 left-0 right-0 shadow-top z-40">
        <nav className="container mx-auto flex justify-around items-center">
          <button 
            onClick={() => onNavigate(DriverScreenView.Dashboard)} 
            className={`flex flex-col items-center p-2 rounded-md transition-colors ${availability === DriverAvailabilityStatus.Online && currentRideRequest ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'} ${ (window.location.hash || DriverScreenView.Dashboard) === DriverScreenView.Dashboard && !(availability === DriverAvailabilityStatus.Online && currentRideRequest) ? 'text-driver-theme-primary' : 'text-gray-600'}`}
            disabled={availability === DriverAvailabilityStatus.Online && !!currentRideRequest}
            aria-current={(window.location.hash || DriverScreenView.Dashboard) === DriverScreenView.Dashboard ? "page" : undefined}
          >
            <MapIcon className="w-6 h-6"/>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => onNavigate(DriverScreenView.Earnings)} 
            className={`flex flex-col items-center p-2 rounded-md transition-colors ${availability === DriverAvailabilityStatus.Online && currentRideRequest ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-driver-theme-primary hover:bg-gray-100'}`}
            disabled={availability === DriverAvailabilityStatus.Online && !!currentRideRequest}
          >
            <DollarIcon className="w-6 h-6"/>
            <span className="text-xs mt-1">Earnings</span>
          </button>
           <button 
            onClick={() => onNavigate(DriverScreenView.Profile)} 
            className={`flex flex-col items-center p-2 rounded-md transition-colors ${availability === DriverAvailabilityStatus.Online && currentRideRequest ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-driver-theme-primary hover:bg-gray-100'}`}
            disabled={availability === DriverAvailabilityStatus.Online && !!currentRideRequest}
           >
            <MenuIcon className="w-6 h-6"/>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </nav>
      </footer>
       <div className="h-16"></div> {/* Spacer for fixed bottom nav */}
    </div>
  );
};

export default DriverDashboard;
