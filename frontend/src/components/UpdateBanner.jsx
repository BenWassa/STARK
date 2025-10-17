import React from 'react';
import { Download, X } from 'lucide-react';

const UpdateBanner = ({ onUpdate, onDismiss }) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 shadow-lg border-b border-green-400">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Download className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">
              New version available!
            </p>
            <p className="text-xs opacity-90">
              Click update to get the latest features and improvements.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onUpdate}
            className="bg-white text-green-600 px-4 py-1.5 rounded-md font-medium text-sm hover:bg-green-50 transition-colors duration-200 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Update</span>
          </button>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors duration-200"
            aria-label="Dismiss update notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBanner;