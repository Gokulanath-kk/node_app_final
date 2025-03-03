import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-red-500 p-6 flex items-center justify-center">
          <AlertTriangle className="text-white w-16 h-16" />
        </div>
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Lock className="w-10 h-10 text-red-500" />
            404 - Unauthorized
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            You do not have permission to access this administrative page.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300 ease-in-out"
            >
              Dashboard
            </button>
          </div>
        </div>
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-500">
          Contact support if you believe this is an error
        </div>
      </div>
    </div>
  );
};

export default NotFound;