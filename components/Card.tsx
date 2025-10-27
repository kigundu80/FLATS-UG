
import React from 'react';

// Extend HTMLAttributes to accept standard DOM element props like onClick, role, aria-live, etc.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions, ...props }) => {
  return (
    // Spread the collected props onto the main div element.
    <div className={`bg-surface shadow-md rounded-xl overflow-hidden ${className}`} {...props}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
