

import React from 'react';
import Card from './Card';
import Button from './Button';
import { ArrowLeftIcon } from './icons/FluentIcons';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card title="Privacy Policy">
        <div className="prose prose-sm sm:prose-base max-w-none text-text-secondary space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            Welcome to FLATS UG. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
          </p>

          <h2 className="text-text-primary font-semibold">1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the Application.
            </li>
            <li>
              <strong>Geolocation Information:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using the Application, to provide location-based services.
            </li>
            <li>
              <strong>Device Information:</strong> Information about your mobile device, including your mobile device ID, model, and manufacturer.
            </li>
             <li>
              <strong>Usage Data:</strong> Information on how you use the Application, such as ride history, service bookings, and interaction with features.
            </li>
          </ul>

          <h2 className="text-text-primary font-semibold">2. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Facilitate ride-hailing and service bookings.</li>
            <li>Process payments and refunds.</li>
            <li>Communicate with you about your account or services.</li>
            <li>Improve our Application and services.</li>
            <li>Ensure the safety and security of our users.</li>
          </ul>

          <h2 className="text-text-primary font-semibold">3. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul>
            <li>
              <strong>To other Users/Drivers:</strong> To facilitate a ride, we will share your name and pickup/dropoff locations with the assigned driver. A driver's name, vehicle information, and location will be shared with the user.
            </li>
            <li>
              <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
            </li>
          </ul>
            
          <h2 className="text-text-primary font-semibold">4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>

          <h2 className="text-text-primary font-semibold">5. Your Rights</h2>
          <p>
            You have the right to review or change the information in your account or terminate your account at any time. You can typically do this from your account settings page or by contacting us.
          </p>

           <h2 className="text-text-primary font-semibold">6. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: privacy@flatsug.com
          </p>
        </div>
        <div className="mt-8 pt-6 border-t">
          <Button onClick={onBack} variant="ghost" leftIcon={<ArrowLeftIcon className="w-5 h-5" />}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicyScreen;