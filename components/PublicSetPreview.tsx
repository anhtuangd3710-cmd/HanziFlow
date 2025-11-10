
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getPublicSetDetails } from '../services/api';
import { VocabSet } from '../types';
import Spinner from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';

const PublicSetPreview: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [set, setSet] = useState<VocabSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSet = async () => {
      if (!setId) return;
      setIsLoading(true);
      try {
        const fetchedSet = await getPublicSetDetails(setId);
        setSet(fetchedSet);
      } catch (err) {
        setError('Could not load the set. It may have been removed or made private.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSet();
  }, [setId]);

  if (!context) return null;
  const { state, cloneSet } = context;

  const isAlreadyCloned = state.user?.clonedSets?.includes(setId || '');
  const isOwnSet = state.vocabSets.some(s => s._id === setId);

  const handleClone = async () => {
    if (isAlreadyCloned || isOwnSet || !setId) return;
    const cloned = await cloneSet(setId);
    if (cloned) {
      navigate('/');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
        <p className="ml-4 text-gray-600">Loading set details...</p>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
        <h3 className="text-xl font-semibold text-red-600">Error</h3>
        <p className="text-gray-600 mt-2">{error || "The set could not be found."}</p>
        <button onClick={() => navigate('/community')} className="mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Community
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{set.title}</h1>
                <p className="text-gray-500 mt-1">by {set.creatorName}</p>
            </div>
            <button
                onClick={handleClone}
                disabled={isAlreadyCloned || isOwnSet || state.isLoading}
                className="flex items-center py-2 px-5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
            >
                {state.isLoading && <Spinner />}
                <DownloadIcon size={20} className="mr-2"/>
                {isAlreadyCloned ? 'Added to Your Sets' : (isOwnSet ? 'This is Your Set' : 'Add to My Sets')}
            </button>
        </div>
        <p className="mt-4 text-gray-700">{set.description}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Words in this Set ({set.items.length})</h2>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {set.items.map((item, index) => (
                <div key={item.id || index} className="p-4 border bg-gray-50 rounded-md grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1">
                    <div className="font-semibold text-lg">{item.hanzi}</div>
                    <div className="text-gray-600">{item.pinyin}</div>
                    <div className="text-gray-800">{item.meaning}</div>
                </div>
            ))}
        </div>
      </div>
       <button onClick={() => navigate('/community')} className="mt-8 block mx-auto text-gray-600 hover:text-gray-800 font-semibold">
           ← Back to Community
       </button>
    </div>
  );
};

export default PublicSetPreview;