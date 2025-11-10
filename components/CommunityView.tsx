import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import PublicSetCard from './PublicSetCard';
import Spinner from './Spinner';

const CommunityView: React.FC = () => {
  const context = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (context) {
      context.fetchPublicSets();
    }
  }, []); // Note: context is not in dependency array to avoid re-fetches

  if (!context) {
    return <Spinner />;
  }
  const { state, setView } = context;

  const filteredSets = state.publicSets.filter(set => 
    set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (set.creatorName && set.creatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    set.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Community Sets</h1>
        <p className="mt-2 text-lg text-gray-600">Discover and learn from sets created by other users.</p>
      </div>

      <div className="mb-6 max-w-lg mx-auto">
        <input 
            type="text"
            placeholder="Search sets by title, creator, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state.isLoading && state.publicSets.length === 0 ? (
         <div className="flex justify-center items-center h-40">
            <Spinner />
            <p className="ml-4 text-gray-600">Loading community sets...</p>
        </div>
      ) : filteredSets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map(set => (
            <PublicSetCard 
                key={set._id} 
                set={set} 
                onPreview={() => setView({ view: 'PUBLIC_SET_PREVIEW', setId: set._id })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">No Sets Found</h3>
            <p className="mt-2 text-gray-500">{searchTerm ? "Try adjusting your search term." : "There are no public sets available right now. Be the first to share one!"}</p>
        </div>
      )}
    </div>
  );
};

export default CommunityView;