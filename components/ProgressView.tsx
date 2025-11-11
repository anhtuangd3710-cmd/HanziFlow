import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { VocabSet } from '../types';
import { getSetById } from '../services/api';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import Spinner from './Spinner';

// Helper component for visualizing SRS level
const SrsLevelIndicator: React.FC<{ level: number }> = ({ level }) => {
    const MAX_LEVEL = 8;
    const levelColor = useMemo(() => {
        if (level === 0) return 'bg-gray-300';
        if (level <= 2) return 'bg-yellow-400';
        if (level <= 5) return 'bg-blue-400';
        return 'bg-green-500';
    }, [level]);

    return (
        <div className="flex items-center gap-1" title={`Level ${level}`}>
            {Array.from({ length: MAX_LEVEL }).map((_, index) => (
                <div
                    key={index}
                    className={`h-2 w-4 rounded-sm ${index < level ? levelColor : 'bg-gray-200'}`}
                />
            ))}
        </div>
    );
};

// Helper function to format review dates
const formatReviewDate = (dateString?: string): string => {
    if (!dateString) {
        return 'Not yet reviewed';
    }
    const reviewDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    reviewDate.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'Due for review';
    }
    if (diffDays === 0) {
        return 'Today';
    }
    if (diffDays === 1) {
        return 'Tomorrow';
    }
    if (diffDays <= 7) {
        return `In ${diffDays} days`;
    }
    return reviewDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};


const ProgressView: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const [progressSet, setProgressSet] = useState<VocabSet | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: 'hanzi' | 'srsLevel' | 'nextReviewDate'; direction: 'ascending' | 'descending' }>({ key: 'nextReviewDate', direction: 'ascending' });

  if (!context) return <div>Loading...</div>;
  const { state } = context;

  const setFromContext = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);

  useEffect(() => {
    if (setFromContext) {
      setProgressSet(setFromContext);
      setIsLoading(false);
      return;
    }

    const fetchProgressSet = async () => {
      if (!setId) {
        setProgressSet(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedSet = await getSetById(setId);
        setProgressSet(fetchedSet);
      } catch (error) {
        console.error("Failed to fetch progress set:", error);
        setProgressSet(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProgressSet();
  }, [setId, setFromContext]);


  const sortedItems = useMemo(() => {
    if (!progressSet?.items) return [];

    const sortableItems = [...progressSet.items];
    sortableItems.sort((a, b) => {
        let compareResult = 0;
        switch (sortConfig.key) {
            case 'srsLevel':
                const levelA = a.srsLevel || 0;
                const levelB = b.srsLevel || 0;
                compareResult = levelA - levelB;
                break;
            case 'nextReviewDate':
                // Place items with no review date at the end when sorting ascending
                const dateA = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : Infinity;
                const dateB = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : Infinity;
                compareResult = dateA - dateB;
                break;
            case 'hanzi':
                compareResult = a.hanzi.localeCompare(b.hanzi, 'zh-Hans-CN');
                break;
        }
        return sortConfig.direction === 'ascending' ? compareResult : -compareResult;
    });
    return sortableItems;
  }, [progressSet?.items, sortConfig]);

  const requestSort = (key: 'hanzi' | 'srsLevel' | 'nextReviewDate') => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };
  
  const SortIndicator = ({ direction }: { direction: 'ascending' | 'descending' }) => {
    return <ChevronDownIcon size={16} className={`ml-1 transition-transform text-gray-500 ${direction === 'ascending' ? 'transform rotate-180' : ''}`} />;
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Spinner />
            <p className="ml-4 text-gray-600">Loading progress...</p>
        </div>
    );
  }

  if (!progressSet) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Set not found.</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-500 underline">
          Back to Dashboard
        </button>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{progressSet.title}</h1>
          <p className="text-gray-500">Individual Word Progress</p>
        </div>
        <button onClick={() => navigate('/')} className="py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <button onClick={() => requestSort('hanzi')} className="flex items-center focus:outline-none">
                     Word
                     {sortConfig.key === 'hanzi' && <SortIndicator direction={sortConfig.direction} />}
                   </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <button onClick={() => requestSort('srsLevel')} className="flex items-center focus:outline-none">
                     SRS Level
                     {sortConfig.key === 'srsLevel' && <SortIndicator direction={sortConfig.direction} />}
                   </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <button onClick={() => requestSort('nextReviewDate')} className="flex items-center focus:outline-none">
                     Next Review
                     {sortConfig.key === 'nextReviewDate' && <SortIndicator direction={sortConfig.direction} />}
                   </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.length > 0 ? sortedItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">{item.hanzi}</div>
                    <div className="text-sm text-gray-500">{item.pinyin}</div>
                    <div className="text-sm text-gray-600">{item.meaning}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800 text-lg w-4">{item.srsLevel || 0}</span>
                        <SrsLevelIndicator level={item.srsLevel || 0} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {formatReviewDate(item.nextReviewDate)}
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500">
                        This set has no words yet. Add some to track your progress!
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;