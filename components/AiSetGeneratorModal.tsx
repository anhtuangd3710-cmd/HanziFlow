'use client';

import React, { useState, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { VocabSet, VocabItem } from '@/lib/types';
import Spinner from './Spinner';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { HelpCircleIcon } from './icons/HelpCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface Props {
  onClose: () => void;
  onSetCreated: (newSet: VocabSet) => void;
}

const AiSetGeneratorModal: React.FC<Props> = ({ onClose, onSetCreated }) => {
  const context = useContext(AppContext);
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(10);
  const [isLoading, setIsLoading] =useState(false);
  const [generatedItems, setGeneratedItems] = useState<VocabItem[] | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  if (!context) return null;
  const { saveSet, generateSetWithAI } = context;

  const handleGenerate = async () => {
    if (!topic.trim()) {
        alert('Please enter a topic.');
        return;
    }
    setIsLoading(true);
    setGeneratedItems(null);
    try {
        const items = await generateSetWithAI(topic, wordCount);
        if (items) {
            setGeneratedItems(items);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveSet = async () => {
    if (!generatedItems || generatedItems.length === 0) {
        alert("No items to save.");
        return;
    }
    const newSetData = {
        title: `AI: ${topic}`,
        description: `An AI-generated set about ${topic} with ${generatedItems.length} words.`,
        difficulty: 'Medium' as const,
        items: generatedItems,
    };

    // The context's saveSet function is designed to work with the full AppContext loading state.
    // So we don't need to manage a separate loading state here.
    await saveSet(newSetData);
    onClose(); // Close this modal, dashboard will show the new set.
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center">
          <BrainCircuitIcon className="h-6 w-6 mr-3 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Generate Set with AI</h2>
        </div>
        
        {!generatedItems ? (
            <div className="p-6 space-y-4">
                <p className="text-gray-600">Enter a topic and let AI create a vocabulary set for you. Great for exploring new subjects!</p>
                
                {/* Help Section */}
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => setIsHelpOpen(!isHelpOpen)} className="w-full flex justify-between items-center p-3 text-left">
                        <div className="flex items-center">
                            <HelpCircleIcon className="h-5 w-5 mr-2 text-gray-500"/>
                            <span className="font-semibold text-gray-700">Pro Tips for Better Results</span>
                        </div>
                        <ChevronDownIcon size={20} className={`transition-transform text-gray-500 ${isHelpOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isHelpOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-4 border-t text-sm text-gray-600 space-y-3">
                            <p>The AI is great at generating lists for specific themes. Be as descriptive as you like!</p>
                            <p><strong className="font-semibold text-gray-800">Important:</strong> Always review the generated words. The AI can sometimes make mistakes with pinyin or provide less common translations.</p>
                            <p className="font-semibold text-gray-800">Example Prompts:</p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                <li>Common fruits in China</li>
                                <li>HSK 3 verbs</li>
                                <li>Adjectives for describing personality</li>
                                <li>Words related to business meetings</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
                    <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Chinese Food, Traveling, HSK 2 Verbs"
                    />
                </div>
                 <div>
                    <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700">Number of Words (5-20)</label>
                    <input
                    id="wordCount"
                    type="number"
                    value={wordCount}
                    min="5"
                    max="20"
                    onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
            </div>
        ) : (
             <div className="p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">Generated Words for "{topic}"</h3>
                <div className="space-y-3">
                    {generatedItems.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded-md border">
                            <div className="grid grid-cols-3 gap-4">
                                <span className="font-semibold">{item.hanzi}</span>
                                <span className="text-gray-600">{item.pinyin}</span>
                                <span className="text-gray-800">{item.meaning}</span>
                            </div>
                            {item.exampleSentence && (
                                <p className="text-sm text-gray-500 mt-2 italic whitespace-pre-wrap">"{item.exampleSentence}"</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Cancel
            </button>
            {!generatedItems ? (
                <button onClick={handleGenerate} disabled={isLoading} className="py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-36 text-center disabled:bg-purple-300">
                    {isLoading ? <Spinner /> : 'Generate'}
                </button>
            ) : (
                <button onClick={handleSaveSet} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save this Set
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AiSetGeneratorModal;