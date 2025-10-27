
import React, { useState, useCallback } from 'react';
import { AVAILABLE_SERVICES } from '../constants';
import { ServiceItem } from '../types';
import Card from './Card';
import { getServiceDescription } from '../services/geminiService';
import Button from './Button';
import { InformationCircleIcon, ChevronRightIcon } from './icons/FluentIcons';

interface ServiceCardProps {
  service: ServiceItem;
  onBookService: (service: ServiceItem) => void;
  isOnline: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBookService, isOnline }) => {
  const [dynamicDescription, setDynamicDescription] = useState<string | null>(null);
  const [isLoadingDesc, setIsLoadingDesc] = useState(false);
  const [geminiDescFetched, setGeminiDescFetched] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const fetchGeminiDescription = useCallback(async () => {
    if (!isOnline) {
      setDynamicDescription("AI details unavailable while offline.");
      setGeminiError("Offline");
      setGeminiDescFetched(true); // Mark as "fetched" to avoid re-attempt until online
      return;
    }
    if (geminiDescFetched && dynamicDescription && !geminiError) return; 

    setIsLoadingDesc(true);
    setGeminiError(null);
    try {
      const geminiResult = await getServiceDescription(service.title);
      if (geminiResult.error) {
        setDynamicDescription(geminiResult.description); // Show error message from service
        setGeminiError(geminiResult.error);
      } else {
        setDynamicDescription(geminiResult.description);
      }
      setGeminiDescFetched(true);
    } catch (error) {
      setDynamicDescription("Could not load enhanced description at this time.");
      setGeminiError("Fetch error");
      setGeminiDescFetched(false); 
    } finally {
      setIsLoadingDesc(false);
    }
  }, [service.title, geminiDescFetched, dynamicDescription, isOnline, geminiError]);

  const displayDescription = dynamicDescription || service.description;
  const aiDetailsButtonDisabled = isLoadingDesc || (geminiDescFetched && !!dynamicDescription && !geminiError) || !isOnline;
  let aiDetailsButtonText = "Get AI Details";
  if (isLoadingDesc && isOnline) aiDetailsButtonText = "Loading Details...";
  else if (!isOnline) aiDetailsButtonText = "AI Details (Offline)";
  else if (geminiDescFetched && dynamicDescription && !geminiError) aiDetailsButtonText = "Details by Gemini";
  else if (geminiError) aiDetailsButtonText = "AI Details (Error)";


  return (
    <Card className="flex flex-col h-full bg-white hover:shadow-xl transition-shadow duration-200">
      <div className="p-6 flex-grow">
        <div className="flex items-center text-brand-primary mb-3">
          {React.cloneElement(service.icon, { className: "w-8 h-8 mr-3" })}
          <h3 className="text-xl font-semibold">{service.title}</h3>
        </div>
        <p className={`text-gray-600 text-sm mb-4 min-h-[60px] ${geminiDescFetched && !geminiError ? 'italic text-purple-700' : (geminiError ? 'italic text-red-600' : '')}`}>
          {displayDescription}
        </p>
      </div>
      <div className="p-4 bg-brand-bg-alt border-t border-gray-200 space-y-2">
        <Button 
          onClick={fetchGeminiDescription} 
          variant="ghost" 
          size="sm" 
          className="w-full text-brand-primary"
          isLoading={isLoadingDesc && isOnline}
          disabled={aiDetailsButtonDisabled}
          leftIcon={<InformationCircleIcon className="w-4 h-4"/>}
          title={!isOnline ? "AI Details unavailable while offline" : (geminiDescFetched && !geminiError ? "Details already fetched via AI" : "Get AI-powered details")}
        >
          {aiDetailsButtonText}
        </Button>
        <Button
            onClick={() => onBookService(service)}
            variant="secondary"
            size="sm"
            className="w-full"
            rightIcon={<ChevronRightIcon className="w-4 h-4"/>}
        >
            Book This Service
        </Button>
      </div>
    </Card>
  );
};

interface ServicesScreenProps {
    onBookService: (service: ServiceItem) => void;
    isOnline: boolean;
}

const ServicesScreenComponent: React.FC<ServicesScreenProps> = ({ onBookService, isOnline }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary">Our Services</h1>
        <p className="text-md sm:text-lg text-gray-700 mt-2">
          Comprehensive transportation solutions tailored for you. Click "Get AI Details" for more information powered by Gemini, or "Book This Service" to proceed.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} onBookService={onBookService} isOnline={isOnline} />
        ))}
      </div>
    </div>
  );
};

export default ServicesScreenComponent;
