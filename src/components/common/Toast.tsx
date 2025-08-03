import React, { useEffect } from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-white',
          iconBg: 'bg-green-500',
          icon: <CheckCircle className="w-5 h-5 text-white" />,
          text: 'text-gray-900'
        };
      case 'info':
        return {
          bg: 'bg-white',
          iconBg: 'bg-blue-500',
          icon: <Info className="w-5 h-5 text-white" />,
          text: 'text-gray-900'
        };
      case 'warning':
        return {
          bg: 'bg-white',
          iconBg: 'bg-yellow-500',
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
          text: 'text-gray-900'
        };
      case 'error':
        return {
          bg: 'bg-white',
          iconBg: 'bg-red-500',
          icon: <AlertCircle className="w-5 h-5 text-white" />,
          text: 'text-gray-900'
        };
      default:
        return {
          bg: 'bg-white',
          iconBg: 'bg-gray-500',
          icon: <Info className="w-5 h-5 text-white" />,
          text: 'text-gray-900'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 md:top-4 md:left-1/2 md:transform md:-translate-x-1/2">
      <div className={`flex items-center p-3 md:p-4 rounded-lg shadow-lg border border-gray-200 ${styles.bg} w-[calc(100vw-2rem)] md:w-auto md:max-w-[600px] mx-4 md:mx-0`}>
        <div className={`flex-shrink-0 mr-3 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${styles.iconBg}`}>
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-reddit-sans-regular ${styles.text} leading-relaxed whitespace-nowrap`}>
            {message}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-3 md:ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 