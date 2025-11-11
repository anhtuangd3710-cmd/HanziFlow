
import React, { useState, useContext, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AppContext } from '../context/AppContext';
import { VocabSet, VocabItem, Difficulty } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import Spinner from './Spinner';
import { FileTextIcon } from './icons/FileTextIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface Props {
  set: VocabSet | null;
  onClose: () => void;
}

const toneMap: { [key: string]: { [tone: string]: string } } = {
  'a': { '1': 'ā', '2': 'á', '3': 'ǎ', '4': 'à', '5': 'a' },
  'e': { '1': 'ē', '2': 'é', '3': 'ě', '4': 'è', '5': 'e' },
  'i': { '1': 'ī', '2': 'í', '3': 'ǐ', '4': 'ì', '5': 'i' },
  'o': { '1': 'ō', '2': 'ó', '3': 'ǒ', '4': 'ò', '5': 'o' },
  'u': { '1': 'ū', '2': 'ú', '3': 'ǔ', '4': 'ù', '5': 'u' },
  'ü': { '1': 'ǖ', '2': 'ǘ', '3': 'ǚ', '4': 'ǜ', '5': 'ü' },
  'v': { '1': 'ǖ', '2': 'ǘ', '3': 'ǚ', '4': 'ǜ', '5': 'ü' },
};

// Convert numbered pinyin to toned pinyin
const convertNumberedPinyin = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  const parts = lowerInput.split(/\s+/);
  
  const processedParts = parts.map(part => {
    const syllablePattern = /([a-züv]+[1-5]?)/g;
    const syllables = part.match(syllablePattern) || [part];
    
    return syllables.map(syllable => {
      const match = syllable.match(/^([a-züv]+)([1-5])$/);
      if (!match) return syllable;
      
      const [, letters, tone] = match;
      
      let toneIndex = -1;
      if (letters.includes('a')) toneIndex = letters.indexOf('a');
      else if (letters.includes('o')) toneIndex = letters.indexOf('o');
      else if (letters.includes('e')) toneIndex = letters.indexOf('e');
      else if (letters.includes('iu')) toneIndex = letters.indexOf('u');
      else if (letters.includes('i')) toneIndex = letters.indexOf('i');
      else if (letters.includes('u')) toneIndex = letters.indexOf('u');
      else if (letters.includes('ü')) toneIndex = letters.indexOf('ü');
      else if (letters.includes('v')) toneIndex = letters.indexOf('v');
      
      if (toneIndex === -1) return syllable;
      
      const vowel = letters[toneIndex] === 'v' ? 'v' : letters[toneIndex];
      const tonedVowel = toneMap[vowel]?.[tone] || vowel;
      
      return letters.substring(0, toneIndex) + tonedVowel + letters.substring(toneIndex + 1);
    }).join('');
  });
  
  return processedParts.join(' ');
};

const VocabSetModal: React.FC<Props> = ({ set, onClose }) => {
  const context = useContext(AppContext);
  const [title, setTitle] = useState(set?.title || '');
  const [description, setDescription] = useState(set?.description || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(set?.difficulty || 'Medium');
  const [isPublic, setIsPublic] = useState(set?.isPublic || false);
  const [items, setItems] = useState<VocabItem[]>(set?.items || []);
  const [newItem, setNewItem] = useState({ hanzi: '', pinyin: '', meaning: '', exampleSentence: '' });
  const [generatingIndex, setGeneratingIndex] = useState<number | 'new' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  if (!context) return null;
  const { state, saveSet, generateExample } = context;

  useEffect(() => {
    if (set) {
      setTitle(set.title);
      setDescription(set.description);
      setItems(set.items);
      setDifficulty(set.difficulty);
      setIsPublic(set.isPublic || false);
    } else {
      setTitle('');
      setDescription('');
      setItems([]);
      setDifficulty('Medium');
      setIsPublic(false);
    }
  }, [set]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
        setToastMessage(null);
    }, 3000);
  };

  const handlePinyinBlur = (value: string, updater: (newValue: string) => void) => {
      if (/\d/.test(value)) {
          const converted = convertNumberedPinyin(value);
          updater(converted);
      }
  };

  const handleSaveSet = async () => {
    if (!title) {
        alert("Set title cannot be empty.");
        return;
    }

    const setToSave = {
        title,
        description,
        difficulty,
        isPublic,
        items,
        ...(set && { _id: set._id })
    };
    
    await saveSet(setToSave);
    onClose();
  };

  const handleAddItem = () => {
    if (newItem.hanzi && newItem.pinyin && newItem.meaning) {
        const itemToAdd: VocabItem = { ...newItem, id: `item-${Date.now()}` };
        setItems([...items, itemToAdd]);
        setNewItem({ hanzi: '', pinyin: '', meaning: '', exampleSentence: '' });
    }
  };

  const handleItemChange = (index: number, field: keyof Omit<VocabItem, 'id' | '_id'>, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };
  
  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleGenerateExample = async (index: number | 'new') => {
    const itemSource = index === 'new' ? newItem : items[index];
    if (!itemSource.hanzi || !itemSource.pinyin || !itemSource.meaning) {
        alert("Please fill in Hanzi, Pinyin, and Meaning before generating an example.");
        return;
    }
    
    setGeneratingIndex(index);
    try {
        const sentence = await generateExample(itemSource);
        
        if (sentence) {
            if (index === 'new') {
                setNewItem(prev => ({ ...prev, exampleSentence: sentence }));
            } else {
                handleItemChange(index, 'exampleSentence', sentence);
            }
        }
    } finally {
        setGeneratingIndex(null);
    }
  };


  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) {
                showToast("Error: The file appears to be empty or has no data rows.");
                return;
            }

            const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
            const hanziIndex = headers.indexOf('hanzi');
            const pinyinIndex = headers.indexOf('pinyin');
            const meaningIndex = headers.indexOf('meaning');
            const exampleIndex = headers.indexOf('examplesentence');

            if (hanziIndex === -1 || pinyinIndex === -1 || meaningIndex === -1) {
                throw new Error('Import failed: File must contain "Hanzi", "pinyin", and "meaning" columns.');
            }
            
            const dataRows = jsonData.slice(1);

            const newItems: VocabItem[] = dataRows.map((row, index) => {
                const hanzi = row[hanziIndex];
                const pinyin = row[pinyinIndex];
                const meaning = row[meaningIndex];

                if (!hanzi || !pinyin || !meaning) {
                    console.warn(`Skipping empty or incomplete row ${index + 2}`);
                    return null;
                }

                const vocabItem: VocabItem = {
                    id: `item-import-${Date.now()}-${index}`,
                    hanzi: String(hanzi),
                    pinyin: String(pinyin),
                    meaning: String(meaning),
                };

                if (exampleIndex > -1 && row[exampleIndex]) {
                    vocabItem.exampleSentence = String(row[exampleIndex]);
                }

                return vocabItem;
            }).filter((item): item is VocabItem => item !== null);

            if (newItems.length > 0) {
                setItems(prevItems => [...prevItems, ...newItems]);
                showToast(`Successfully imported ${newItems.length} items.`);
            } else {
                showToast("No valid new items were found in the file.");
            }
        } catch (error: any) {
            console.error("Excel Parsing Error:", error);
            showToast(`${error.message}`);
        }
    };
    reader.onerror = () => {
        showToast("Error: Failed to read the file.");
    };
    reader.readAsArrayBuffer(file);
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleExportExcel = () => {
    if (items.length === 0) {
        showToast("There are no items to export.");
        return;
    }

    const dataToExport = items.map(item => ({
        hanzi: item.hanzi,
        pinyin: item.pinyin,
        meaning: item.meaning,
        exampleSentence: item.exampleSentence || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vocabulary");
    
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(workbook, `${safeTitle || 'vocab_set'}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const header = ["hanzi", "pinyin", "meaning", "exampleSentence"];
    const example1 = ["你好", "ni3 hao3", "hello", "你好，世界！ (nǐ hǎo, shì jiè!) - Hello, world!"];
    const example2 = ["谢谢", "xie4 xie", "thank you", "非常感谢你。 (fēi cháng gǎn xiè nǐ) - Thank you very much."];
    const templateData = [header, example1, example2];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, "hanziflow_template.xlsx");
};


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{set ? 'Edit Set' : 'Create New Set'}</h2>
            {!set?.originalSetId && (
                <div className="flex items-center">
                    <span className="mr-3 text-sm font-medium text-gray-700">Make Publicly Available</span>
                    <label htmlFor="isPublicToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="isPublicToggle" className="sr-only peer" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            )}
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                       <div className="mt-2 flex space-x-4">
                          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                              <label key={level} className="flex items-center">
                                  <input 
                                      type="radio" 
                                      name="difficulty" 
                                      value={level} 
                                      checked={difficulty === level} 
                                      onChange={() => setDifficulty(level)}
                                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{level}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" rows={2}/>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-800">Vocabulary Items ({items.length})</h3>
                <div className="flex gap-2 flex-wrap">
                   <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileImport}
                      className="hidden"
                      accept=".xlsx, .xls"
                  />
                  <button onClick={handleDownloadTemplate} className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-md">
                      <FileTextIcon size={16} className="mr-1.5" /> Template
                  </button>
                  <button onClick={handleTriggerImport} className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md">
                      <UploadIcon size={16} className="mr-1.5" /> Import
                  </button>
                   <button onClick={handleExportExcel} className="flex items-center text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md">
                      <DownloadIcon size={16} className="mr-1.5" /> Export
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                  {items.map((item, index) => (
                      <div key={item.id} className="p-3 border bg-gray-50 rounded-md">
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                              <input type="text" value={item.hanzi} placeholder="Hanzi" onChange={e => handleItemChange(index, 'hanzi', e.target.value)} className="border p-2 rounded-md md:col-span-2"/>
                              <input 
                                  type="text" 
                                  value={item.pinyin} 
                                  placeholder="nǐ hǎo (or ni3 hao3)" 
                                  onChange={e => handleItemChange(index, 'pinyin', e.target.value)}
                                  onBlur={e => handlePinyinBlur(e.target.value, (newValue) => handleItemChange(index, 'pinyin', newValue))}
                                  className="border p-2 rounded-md md:col-span-2"
                              />
                              <input type="text" value={item.meaning} placeholder="Meaning" onChange={e => handleItemChange(index, 'meaning', e.target.value)} className="border p-2 rounded-md md:col-span-2"/>
                              <button onClick={() => handleDeleteItem(item.id)} aria-label={`Delete word ${item.hanzi}`} title="Delete word" className="text-red-500 hover:text-red-700 p-2 justify-self-center"><TrashIcon size={20}/></button>
                          </div>
                          <div className="flex items-center mt-2">
                               <textarea value={item.exampleSentence || ''} placeholder="Example sentence" onChange={e => handleItemChange(index, 'exampleSentence', e.target.value)} className="w-full border p-2 rounded-md" rows={3}/>
                               <button 
                                  onClick={() => handleGenerateExample(index)} 
                                  aria-label={`Generate example for ${item.hanzi}`}
                                  className="ml-2 p-2 h-10 w-10 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                  disabled={generatingIndex !== null || !item.hanzi || !item.pinyin || !item.meaning}
                                  title="Generate Example with AI"
                              >
                                  {generatingIndex === index ? <Spinner/> : <SparkleIcon size={20}/>}
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <input type="text" value={newItem.hanzi} onChange={e => setNewItem(prev => ({...prev, hanzi: e.target.value}))} placeholder="新 (xīn)" className="border p-2 rounded-md"/>
                      <input 
                          type="text" 
                          value={newItem.pinyin} 
                          onChange={e => setNewItem(prev => ({...prev, pinyin: e.target.value}))} 
                          onBlur={e => handlePinyinBlur(e.target.value, (newValue) => setNewItem(prev => ({...prev, pinyin: newValue})))}
                          placeholder="nǐ hǎo (or ni3 hao3)" 
                          className="border p-2 rounded-md"
                      />
                      <input type="text" value={newItem.meaning} onChange={e => setNewItem(prev => ({...prev, meaning: e.target.value}))} placeholder="new" className="border p-2 rounded-md"/>
                  </div>
                   <div className="flex items-center mt-2">
                      <textarea value={newItem.exampleSentence || ''} onChange={e => setNewItem(prev => ({...prev, exampleSentence: e.target.value}))} placeholder="Example: 这是我的新书 (zhè shì wǒ de xīn shū)" className="w-full border p-2 rounded-md" rows={3}/>
                      <button 
                          onClick={() => handleGenerateExample('new')} 
                          aria-label="Generate example for new word"
                          className="ml-2 p-2 h-10 w-10 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                          disabled={generatingIndex !== null || !newItem.hanzi || !newItem.pinyin || !newItem.meaning}
                          title="Generate Example with AI"
                      >
                          {generatingIndex === 'new' ? <Spinner/> : <SparkleIcon size={20}/>}
                      </button>
                  </div>
              </div>
               <button onClick={handleAddItem} className="mt-2 flex items-center text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md">
                  <PlusIcon size={16} className="mr-2"/> Add Word
              </button>
          </div>
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSaveSet} disabled={state.isLoading} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 w-32 text-center">
              {state.isLoading ? <Spinner/> : (set ? 'Save Changes' : 'Create Set')}
            </button>
          </div>
          {toastMessage && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white py-2 px-5 rounded-lg shadow-lg animate-fade-in-out">
                  {toastMessage}
              </div>
          )}
        </div>
      </div>
      <style>{`
          @keyframes fade-in-out {
              0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
              10% { opacity: 1; transform: translateY(0) translateX(-50%); }
              90% { opacity: 1; transform: translateY(0) translateX(-50%); }
              100% { opacity: 0; transform: translateY(10px) translateX(-50%); }
          }
          .animate-fade-in-out {
              animation: fade-in-out 3s ease-in-out forwards;
          }
      `}</style>
    </>
  );
};

export default VocabSetModal;
