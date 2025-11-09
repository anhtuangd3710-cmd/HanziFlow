import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface Props {
  onClose: () => void;
}

const ApiKeyModal: React.FC<Props> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      alert('API Key saved successfully! You can now use AI features.');
      onClose();
    } else {
      alert('Please enter a valid API Key.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in">
        <div className="p-6 border-b flex items-center">
          <KeyIcon className="h-6 w-6 mr-3 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800">Set Your Gemini API Key</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            To use AI-powered features like example sentence generation, you need to provide your own Gemini API key. 
            You can get one from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
              Google AI Studio
            </a>.
          </p>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              Your API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your key here"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your key will be stored securely in your browser's local storage and will not be sent anywhere else.
            </p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Key
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ApiKeyModal;