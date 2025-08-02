import React from 'react';
import SpotifyButton from './spotify/SpotifyButton';
import { FaExclamationTriangle, FaRedo, FaInfoCircle } from 'react-icons/fa';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  variant = 'error',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          icon: FaExclamationTriangle,
          iconColor: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30'
        };
      case 'warning':
        return {
          icon: FaExclamationTriangle,
          iconColor: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30'
        };
      case 'info':
        return {
          icon: FaInfoCircle,
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30'
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`bg-spotify-medium-gray rounded-lg p-4 border ${styles.borderColor} ${className}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`text-lg mt-0.5 ${styles.iconColor}`} />
        <div className="flex-1">
          <h3 className="spotify-text-body-medium text-white mb-1">
            {title}
          </h3>
          <p className="spotify-text-body-small spotify-text-gray mb-3">
            {message}
          </p>
          {onRetry && (
            <SpotifyButton variant="small" onClick={onRetry}>
              <FaRedo className="mr-1" />
              Retry
            </SpotifyButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 