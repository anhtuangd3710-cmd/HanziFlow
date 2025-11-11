
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import PublicSetCard from './PublicSetCard';
import Spinner from './Spinner';
import Pagination from './Pagination';

const CommunityView: React.FC = () => {
  const context = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const navigate = useNavigate();

  const fetchSetsCallback = context?.fetchPublicSets;

  useEffect(() => {
    if (fetchSetsCallback) {
        // Reset to page 1 whenever the search term changes
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchSetsCallback(1, debouncedSearchTerm);
        }
    }
  }, [debouncedSearchTerm, fetchSetsCallback]);

  useEffect(() => {
    if (fetchSetsCallback) {
        fetchSetsCallback(currentPage, debouncedSearchTerm);
    }
  }, [currentPage, fetchSetsCallback]);

  if (!context) {
    return <Spinner />;
  }
  const { state } = context;
  const { publicSets, publicSetsPagination, isLoading } = state;
  
  const handlePageChange = (page: number) => {
      setCurrentPage(page);
  };

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

      {isLoading && publicSets.length === 0 ? (
         <div className="flex justify-center items-center h-40">
            <Spinner />
            <p className="ml-4 text-gray-600">Loading community sets...</p>
        </div>
      ) : publicSetsPagination && publicSetsPagination.totalSets > 0 ? (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {publicSets.map(set => (
              <PublicSetCard 
                  key={set._id} 
                  set={set} 
                  onPreview={() => navigate(`/community/set/${set._id}`)}
              />
            ))}
          </div>
          {publicSetsPagination && publicSetsPagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={publicSetsPagination.currentPage}
                totalPages={publicSetsPagination.totalPages}
                onPageChange={handlePageChange}
                isDisabled={isLoading}
              />
            </div>
          )}
        </>
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