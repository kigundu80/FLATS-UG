import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>; // More specific type for SVG icons
}

const Input: React.FC<InputProps> = ({ label, name, error, icon, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon, { className: "h-5 w-5 text-gray-400"})}
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`
            form-input block w-full sm:text-sm rounded-lg bg-gray-50 border-gray-300
            focus:ring-primary focus:border-primary focus:bg-white
            transition-colors duration-150
            ${icon ? 'pl-10' : 'px-4'} py-3
            ${error ? 'border-danger text-danger placeholder-red-300 focus:ring-danger focus:border-danger' : ''}
            ${props.disabled ? 'bg-gray-200 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;