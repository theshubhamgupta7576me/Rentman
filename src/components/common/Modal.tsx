import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  buttons?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', buttons }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-4">
        <div
          className="fixed inset-0 transition-all duration-300 ease-out bg-gray-500 bg-opacity-75 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />

        <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-2xl flex flex-col mx-2 sm:mx-0 transition-all duration-300 ease-out animate-in zoom-in-95 slide-in-from-bottom-4`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 pb-20 md:pb-4">
            {children}
          </div>

          {buttons && (
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
              {buttons}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}