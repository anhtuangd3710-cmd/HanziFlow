// FIX: The original file was likely corrupted or incomplete, causing numerous compilation errors. This version restores the component's logic, state management, and render functions.
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { VocabItem, QuizQuestion, QuizResultType, QuestionType } from '../types';
import { speakText } from '../services/geminiService';
import { Volume2Icon } from './icons/Volume2Icon';
import Spinner from './Spinner';

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
  
  // Split by spaces first, then process each part
  const parts = lowerInput.split(/\s+/);
  
  const processedParts = parts.map(part => {
    // Match all syllables with tone numbers in the part (e.g., "ni3hao3ma" -> ["ni3", "hao3", "ma"])
    const syllablePattern = /([a-züv]+[1-5]?)/g;
    const syllables = part.match(syllablePattern) || [part];
    
    return syllables.map(syllable => {
      const match = syllable.match(/^([a-züv]+)([1-5])$/);
      if (!match) return syllable;
      
      const [, letters, tone] = match;
      
      // Find which vowel gets the tone mark (priority: a, o, e, iu, then other vowels)
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

interface Props {
  setId: string;
  quizType: 'standard' | 'review';
  questionTypes?: QuestionType[];
}

// FIX: shuffleArray moved out of component and defined as a standard generic function
// to avoid ambiguity with JSX syntax (<T>) that caused parsing errors.
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quieter volume

        oscillator.start(audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration / 1000);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.error("Could not play audio:", e);
    }
};


const QuizView: React.FC<Props> = ({ setId, quizType, questionTypes }) => {
  const context = useContext(AppContext);

  if (!context) return <div>Loading...</div>;
  const { state, setView, saveQuizResult } = context;

  const set = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [pinyinInput, setPinyinInput] = useState('');
  
  useEffect(() => {
    if (set) {
      let itemsForQuiz = set.items;
      if (quizType === 'review') {
        itemsForQuiz = set.items.filter(item => item.needsReview);
      }
      
      const minWordsNeeded = set.difficulty === 'Hard' ? 5 : (set.difficulty === 'Easy' ? 3 : 4);
      if (itemsForQuiz.length < minWordsNeeded) {
        setQuestions([]); 
        return;
      }

      const shuffled = shuffleArray(itemsForQuiz).slice(0, 10); // Max 10 questions
      
      const generatedQuestions: QuizQuestion[] = shuffled.map((item: VocabItem) => {
        let questionTypePool: QuestionType[];
        let numOptions: number;

        switch (set.difficulty) {
            case 'Easy':
                questionTypePool = ['meaning', 'hanzi'];
                numOptions = 3;
                break;
            case 'Hard':
                // Prioritize pinyin questions by adding more instances to the pool
                questionTypePool = ['pinyin', 'pinyin', 'hanzi', 'meaning'];
                numOptions = 5;
                break;
            case 'Medium':
            default:
                questionTypePool = ['meaning', 'hanzi', 'pinyin'];
                numOptions = 4;
                break;
        }

        // Allow user to override with specific question types from the dropdown
        let finalQuestionTypePool = questionTypes && questionTypes.length > 0
            ? questionTypePool.filter(qt => questionTypes.includes(qt))
            : questionTypePool;

        // If the user's filter results in an empty pool, fall back to the difficulty-based pool
        if (finalQuestionTypePool.length === 0) {
            finalQuestionTypePool = questionTypePool;
        }
        
        const type = finalQuestionTypePool[Math.floor(Math.random() * finalQuestionTypePool.length)];
        const numWrongOptions = numOptions - 1;
        
        switch (type) {
          case 'hanzi': {
            const otherItems = itemsForQuiz.filter((i: VocabItem) => i.id !== item.id);
            const wrongOptions = shuffleArray(otherItems).slice(0, numWrongOptions).map((i: VocabItem) => i.hanzi);
            const options = shuffleArray([item.hanzi, ...wrongOptions]);
            return { type, vocabItem: item, options, correctAnswer: item.hanzi };
          }
          case 'pinyin': {
            return { type, vocabItem: item, options: [], correctAnswer: item.pinyin };
          }
          case 'meaning':
          default: {
            const otherItems = itemsForQuiz.filter((i: VocabItem) => i.id !== item.id);
            const wrongOptions = shuffleArray(otherItems).slice(0, numWrongOptions).map((i: VocabItem) => i.meaning);
            const options = shuffleArray([item.meaning, ...wrongOptions]);
            return { type, vocabItem: item, options, correctAnswer: item.meaning };
          }
        }
      });
      setQuestions(generatedQuestions);
    }
  }, [set, quizType, questionTypes]);

  const handleSubmitAnswer = (answer: string) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = currentQ.type === 'pinyin'
        ? convertNumberedPinyin(answer).toLowerCase() === currentQ.correctAnswer.toLowerCase()
        : answer === currentQ.correctAnswer;
    
    if (isCorrect) {
        playTone(600, 100, 'triangle');
        setTimeout(() => playTone(900, 100, 'triangle'), 120);
    } else {
        playTone(200, 200, 'sawtooth');
    }


    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].userAnswer = answer;
    setQuestions(updatedQuestions);
    setSelectedAnswer(answer);


    setTimeout(async () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setPinyinInput('');
      } else {
        const score = updatedQuestions.reduce((acc, q) => {
            if (!q.userAnswer) return acc;
            const correct = q.type === 'pinyin'
                ? convertNumberedPinyin(q.userAnswer).toLowerCase() === q.correctAnswer.toLowerCase()
                : q.userAnswer === q.correctAnswer;
            return acc + (correct ? 1 : 0);
        }, 0);

        const result: QuizResultType = {
            score,
            total: updatedQuestions.length,
            questions: updatedQuestions
        };

        // Save result to backend for SRS and gamification processing
        await saveQuizResult(setId, result);

        setView({ view: 'QUIZ_RESULT', setId, result, quizType, questionTypes });
      }
    }, 1200);
  };

  const handlePinyinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!pinyinInput.trim()) return;
      handleSubmitAnswer(pinyinInput.trim());
  }

  const handleSpeak = (text: string) => {
    speakText(text);
  };

  if (!set) return <div>Set not found.</div>;
  
  const itemsForQuiz = quizType === 'review' 
    ? set.items.filter(item => item.needsReview) 
    : set.items;

  const minWordsNeeded = set.difficulty === 'Hard' ? 5 : (set.difficulty === 'Easy' ? 3 : 4);
  
  if (itemsForQuiz.length < minWordsNeeded) {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-700">Not Enough Words</h3>
            <p className="text-gray-500 mt-2">
                A quiz with '{set.difficulty}' difficulty needs at least {minWordsNeeded} words.
                {quizType === 'review' 
                    ? ` You currently have ${itemsForQuiz.length} word${itemsForQuiz.length === 1 ? '' : 's'} marked for review.`
                    : ` This set only has ${itemsForQuiz.length} word${itemsForQuiz.length === 1 ? '' : 's'}.`
                }
            </p>
            <button onClick={() => setView({view: 'DASHBOARD'})} className="mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Back to Dashboard
            </button>
        </div>
    );
  }
  
  if (questions.length === 0) return <div><Spinner /> Loading quiz...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  const renderQuestionPrompt = () => {
    const { type, vocabItem } = currentQuestion;

    const speakButton = (
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleSpeak(vocabItem.hanzi);
            }}
            className="ml-4 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-transform transform hover:scale-110 flex items-center justify-center h-12 w-12"
            aria-label="Play pronunciation"
        >
            <Volume2Icon size={24} />
        </button>
    );

    // For questions showing Hanzi, include the speaker button.
    if (type === 'meaning' || type === 'pinyin') {
        return (
            <div className="flex items-center justify-center">
                <div>
                    <p className="text-6xl font-bold">{vocabItem.hanzi}</p>
                    {type === 'meaning' && (
                        <p className="text-2xl text-gray-500 mt-2">{vocabItem.pinyin}</p>
                    )}
                </div>
                {speakButton}
            </div>
        );
    }

    // For 'hanzi' question type, just show the meaning.
    if (type === 'hanzi') {
        return <p className="text-4xl font-bold text-center">{vocabItem.meaning}</p>;
    }

    return null; // Should not happen
  };

  const renderAnswerArea = () => {
    if (currentQuestion.type === 'pinyin') {
        const isAnswered = !!selectedAnswer;
        const isCorrect = isAnswered && convertNumberedPinyin(selectedAnswer).toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        return (
            <form onSubmit={handlePinyinSubmit}>
                <input 
                    type="text"
                    value={pinyinInput}
                    onChange={e => setPinyinInput(e.target.value)}
                    placeholder="Type the pinyin"
                    disabled={isAnswered}
                    className={`w-full p-4 border-2 rounded-lg text-center text-lg transition-all duration-300 ${isAnswered ? (isCorrect ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500') : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                />
                 <button type="submit" disabled={isAnswered || !pinyinInput.trim()} className="mt-4 w-full p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400">
                    Submit
                </button>
                {isAnswered && !isCorrect && (
                    <p className="text-center mt-2 text-lg text-green-700 font-semibold">Correct answer: {currentQuestion.correctAnswer}</p>
                )}
            </form>
        )
    }

    const gridCols = currentQuestion.options.length > 4 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

    return (
        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
            {currentQuestion.options.map((option, index) => {
                const isCorrect = option === currentQuestion.correctAnswer;
                const isSelected = selectedAnswer === option;
                let buttonClass = 'p-4 text-left font-semibold rounded-lg border-2 transition-all duration-300';

                if (isSelected) {
                    buttonClass += isCorrect ? ' bg-green-200 border-green-500 text-green-800' : ' bg-red-200 border-red-500 text-red-800';
                } else if (selectedAnswer) {
                     buttonClass += isCorrect ? ' bg-green-200 border-green-500 text-green-800' : ' bg-white border-gray-300';
                } else {
                    buttonClass += ' bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400';
                }

                return (
                    <button
                        key={index}
                        onClick={() => handleSubmitAnswer(option)}
                        disabled={!!selectedAnswer}
                        className={buttonClass}
                    >
                        {option}
                    </button>
                )
            })}
        </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{set.title} {quizType === 'review' ? 'Review' : ''} Quiz</h2>
            <div className="text-lg font-semibold text-gray-600">
                
                {currentQuestionIndex + 1} / {questions.length}
            </div>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg text-center mb-6 min-h-[180px] flex flex-col justify-center">
            {renderQuestionPrompt()}
        </div>
        
        {renderAnswerArea()}

         <button onClick={() => setView({view: 'DASHBOARD'})} className="mt-8 block mx-auto text-gray-600 hover:text-gray-800 font-semibold">
           ← Quit Quiz
       </button>
    </div>
  );
};

export default QuizView;