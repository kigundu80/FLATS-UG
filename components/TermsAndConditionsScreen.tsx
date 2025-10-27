

import React from 'react';
import Card from './Card';
import Button from './Button';
import { ArrowLeftIcon } from './icons/FluentIcons';

interface TermsAndConditionsScreenProps {
  onBack: () => void;
}

const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card title="Terms and Conditions">
        <div className="prose prose-sm sm:prose-base max-w-none text-text-secondary space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <p>
            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the FLATS UG mobile application (the "Service") operated by FLATS UG ("us", "we", or "our").
          </p>

          <p>
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>

          <h2 className="text-text-primary font-semibold">1. Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-text-primary font-semibold">2. Service Provision</h2>
          <p>
            FLATS UG provides a platform to connect users seeking transportation or other services with independent third-party providers (Drivers). You acknowledge that FLATS UG does not provide transportation services or function as a transportation carrier and that all such transportation services are provided by independent third-party contractors who are not employed by FLATS UG.
          </p>

          <h2 className="text-text-primary font-semibold">3. User Conduct</h2>
          <p>
            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You are responsible for all your activity in connection with the Service.
          </p>

          <h2 className="text-text-primary font-semibold">4. Payments and Charges</h2>
          <p>
            You understand that use of the Services may result in charges to you for the services or goods you receive from a Third-Party Provider ("Charges"). FLATS UG will facilitate your payment of the applicable Charges on behalf of the Third-Party Provider as such Third-Party Provider's limited payment collection agent. Payment of the Charges in such manner shall be considered the same as payment made directly by you to the Third-Party Provider.
          </p>
          
          <h2 className="text-text-primary font-semibold">5. Limitation Of Liability</h2>
          <p>
            In no event shall FLATS UG, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2 className="text-text-primary font-semibold">6. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Uganda, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-text-primary font-semibold">7. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
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

export default TermsAndConditionsScreen;