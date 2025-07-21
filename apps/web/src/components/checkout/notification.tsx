import { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export const Notification = ({ message, type, isVisible, onClose }: NotificationProps) => {
  useEffect(() => {
    if (isVisible) {
      // Success messages stay longer (6 seconds), error messages shorter (4 seconds)
      const duration = type === 'success' ? 6000 : 4000;
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, type]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className={`${
        type === 'success' 
          ? 'bg-success-50 border-success shadow-lg shadow-success-200' 
          : 'bg-danger-50 border-danger shadow-lg shadow-danger-200'
      } border-2`}>
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {type === 'success' && (
                <div className="text-success-600 text-xl">✓</div>
              )}
              {type === 'error' && (
                <div className="text-danger-600 text-xl">⚠</div>
              )}
              <p className={`text-sm font-medium ${type === 'success' ? 'text-success-700' : 'text-danger-700'}`}>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`ml-4 text-lg font-bold ${
                type === 'success' 
                  ? 'text-success-500 hover:text-success-700' 
                  : 'text-danger-500 hover:text-danger-700'
              }`}
            >
              ×
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showSuccess = (message: string) => {
    setNotification({
      message,
      type: 'success',
      isVisible: true,
    });
  };

  const showError = (message: string) => {
    setNotification({
      message,
      type: 'error',
      isVisible: true,
    });
  };

  const hide = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return {
    notification,
    showSuccess,
    showError,
    hideNotification: hide,
  };
};
