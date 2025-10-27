import React, { useState, useEffect } from 'react';
import { DriverProfile } from '../../types';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, CarIcon, TicketIcon, CheckCircleIcon, ClockIcon, InformationCircleIcon, ArrowUpTrayIcon, StarIcon } from '../icons/FluentIcons';

interface DriverProfileScreenProps {
  driverProfile: DriverProfile;
  onSave: (updatedProfile: DriverProfile) => void;
  onBack: () => void; // To navigate back to dashboard
}

const DriverProfileScreen: React.FC<DriverProfileScreenProps> = ({ driverProfile, onSave, onBack }) => {
  const [profileData, setProfileData] = useState<DriverProfile>(driverProfile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setProfileData(driverProfile);
  }, [driverProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(profileData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setProfileData(driverProfile);
    setIsEditing(false);
  }

  const getStatusIcon = (status: 'Verified' | 'Pending' | 'Rejected') => {
    switch (status) {
      case 'Verified':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'Rejected':
        return <InformationCircleIcon className="w-5 h-5 text-danger" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card title="Your Profile">
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
            <img 
                src={profileData.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName)}&background=2563EB&color=fff`} 
                alt={profileData.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-driver-primary"
            />
            <div>
                <h2 className="text-2xl font-bold text-text-primary">{profileData.fullName}</h2>
                <p className="text-text-secondary">{profileData.driverId}</p>
                <div className="flex items-center text-sm text-yellow-500 font-semibold mt-1">
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-400" /> {profileData.rating.toFixed(1)}
                </div>
            </div>
            </div>
             {!isEditing && (
                <Button variant="ghost" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
        </div>
      </Card>

      <Card title="Personal Information">
        <div className="space-y-4">
            <Input label="Full Name" name="fullName" value={profileData.fullName} onChange={handleChange} disabled={!isEditing} icon={<UserCircleIcon />} />
            <Input label="Email Address" name="email" type="email" value={profileData.email} onChange={handleChange} disabled={!isEditing} icon={<EnvelopeIcon />} />
            <Input label="Phone Number" name="phone" type="tel" value={profileData.phone} onChange={handleChange} disabled={!isEditing} icon={<PhoneIcon />} />
        </div>
      </Card>
      
      <Card title="Vehicle Details">
        <div className="space-y-4">
            <Input label="Vehicle Model" name="vehicleModel" value={profileData.vehicleModel} onChange={handleChange} disabled={!isEditing} icon={<CarIcon />} />
            <Input label="License Plate" name="licensePlate" value={profileData.licensePlate} onChange={handleChange} disabled={!isEditing} icon={<TicketIcon />} />
        </div>
      </Card>

      <Card title="Documents">
        <div className="space-y-3">
            {profileData.documents && profileData.documents.length > 0 ? (
                profileData.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            {getStatusIcon(doc.status)}
                            <span className="ml-3 font-medium text-text-primary">{doc.name}</span>
                        </div>
                        <span className={`text-sm font-semibold ${doc.status === 'Verified' ? 'text-green-600' : (doc.status === 'Pending' ? 'text-yellow-600' : 'text-danger')}`}>{doc.status}</span>
                    </div>
                ))
            ) : (
                <p className="text-text-secondary text-sm">No documents uploaded yet.</p>
            )}
        </div>
        <div className="mt-4 pt-4 border-t">
            <Button variant="secondary" size="sm" className="w-full" leftIcon={<ArrowUpTrayIcon />} disabled={!isEditing}>
                Upload New Document
            </Button>
             {isEditing && <p className="text-xs text-text-secondary text-center mt-2">Document upload will be enabled once you save other changes.</p>}
        </div>
      </Card>

      {isEditing && (
        <div className="sticky bottom-20 sm:bottom-4 z-10 flex gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <Button variant="ghost" onClick={handleCancel} className="w-full">Cancel</Button>
            <Button variant="primary" onClick={handleSave} className="w-full">Save Changes</Button>
        </div>
      )}

      {/* Spacer for bottom nav */}
       <div className="h-16"></div> 
    </div>
  );
};

export default DriverProfileScreen;
