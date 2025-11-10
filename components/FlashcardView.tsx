
import React, { useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { VocabItem } from '../types';
import { speakText } from '../services/geminiService';
import { Volume2Icon } from './icons/Volume2Icon';
import { StarIcon } from './icons/StarIcon';
import { ShuffleIcon } from './icons/ShuffleIcon';

const FlashcardView: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) return <div>Loading...</div>;
  const { state, toggleNeedsReview } = context;

  const set = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<VocabItem[]>([]);

  React.useEffect(() => {
    if (set && shuffledItems.length === 0) { // Only shuffle once at the beginning
      setShuffledItems([...set.items].sort(() => Math.random() - 0.5));
    } else if (set) {
      // If the set items have changed (e.g., from a review toggle), update the item in our shuffled list
      // without changing the order, preserving the study flow.
      setShuffledItems(currentShuffled => {
        return currentShuffled.map(shuffledItem => {
          const updatedItem = set.items.find(item => item.id === shuffledItem.id);
          return updatedItem || shuffledItem;
        });
      });
    }
  }, [set]);

  const goNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledItems.length);
    }, 150); // wait for flip animation
  };
  
  const handleShuffle = () => {
    if (set) {
        setIsFlipped(false);
        // Timeout allows the card to flip back before the content changes
        setTimeout(() => {
            setShuffledItems([...set.items].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
        }, 150);
    }
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Prevent card from flipping when clicking the button
    speakText(text);
  };

  const handleToggleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentItem && setId) {
      toggleNeedsReview(setId, currentItem.id);
    }
  };

  const currentItem = shuffledItems[currentIndex];

  if (!set) return <div>Set not found. <button onClick={() => navigate('/')}>Go back.</button></div>;
  if (shuffledItems.length === 0) return <div>This set has no words. <button onClick={() => navigate('/')} className="text-blue-500 underline">Go back.</button></div>;
  

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-baseline mb-4">
        <h2 className="text-2xl font-bold text-gray-700">{set.title}</h2>
        <p className="text-lg text-gray-500">Card {currentIndex + 1} of {shuffledItems.length}</p>
      </div>
      
      <div className="w-full h-80 perspective-1000">
        <div 
          className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-xl flex flex-col items-center justify-center p-6 cursor-pointer">
            <button
                onClick={(e) => handleSpeak(e, currentItem.hanzi)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Play pronunciation"
            >
                <Volume2Icon size={28} />
            </button>
            <p className="text-6xl font-semibold">{currentItem.hanzi}</p>
            <p className="text-2xl text-gray-500 mt-4">{currentItem.pinyin}</p>
          </div>
          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden bg-blue-500 text-white rounded-lg shadow-xl flex flex-col items-center justify-center p-6 cursor-pointer rotate-y-180">
            <button
                onClick={handleToggleReview}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${currentItem?.needsReview ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/70 hover:text-white'}`}
                aria-label="Mark for review"
                title={currentItem?.needsReview ? "Unmark from review" : "Mark for review"}
            >
                <StarIcon size={28} filled={!!currentItem?.needsReview} />
            </button>
            <div className="text-center">
                <p className="text-4xl font-bold">{currentItem.meaning}</p>
                {currentItem.exampleSentence && (
                    <p className="text-lg mt-4 opacity-90 italic whitespace-pre-wrap">{currentItem.exampleSentence}</p>
                )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex w-full justify-center gap-4">
        <button onClick={handleShuffle} className="w-48 flex items-center justify-center py-3 px-6 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition-colors">
            <ShuffleIcon size={20} className="mr-2" />
            Shuffle
        </button>
        <button onClick={goNext} className="w-48 py-3 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Next Card
        </button>
      </div>

       <button onClick={() => navigate('/')} className="mt-8 text-gray-600 hover:text-gray-800 font-semibold">
           ← Back to Dashboard
       </button>
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>
    </div>
  );
};

export default FlashcardView;