// import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
// import { AppContext } from '../context/AppContext';
// import { VocabItem, QuizQuestion, QuizResultType, QuestionType } from '../types';
// import { speakText } from '../services/geminiService';
// import { Volume2Icon } from './icons/Volume2Icon';
// import Spinner from './Spinner';

// interface Props {
//   setId: string;
// }

// const QuizView: React.FC<Props> = ({ setId }) => {
//   const context = useContext(AppContext);

//   if (!context) return <div>Loading...</div>;
//   const { state, setView } = context;

//   const set = useMemo(() => 
//     state.vocabSets.find(s => s._id === setId), 
//     [state.vocabSets, setId]
//   );
  
//   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//   const [pinyinInput, setPinyinInput] = useState('');
//   const [isTransitioning, setIsTransitioning] = useState(false);
  
//   const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
//     return [...array].sort(() => Math.random() - 0.5);
//   }, []);

//   // Generate quiz questions
//   useEffect(() => {
//     if (!set || set.items.length < 4) return;

//     const questionTypes: QuestionType[] = ['meaning', 'hanzi', 'pinyin'];
//     const numQuestions = Math.min(10, set.items.length);
//     const shuffled = shuffleArray(set.items).slice(0, numQuestions);
    
//     const generatedQuestions: QuizQuestion[] = shuffled.map(item => {
//       const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      
//       switch (type) {
//         case 'hanzi': {
//           const otherItems = set.items.filter(i => i.id !== item.id);
//           // Check if we have enough items for wrong options
//           if (otherItems.length < 3) {
//             // Fallback to meaning type if not enough items
//             const wrongOptions = shuffleArray(otherItems).slice(0, Math.min(3, otherItems.length)).map(i => i.meaning);
//             const options = shuffleArray([item.meaning, ...wrongOptions]);
//             return { type: 'meaning', vocabItem: item, options, correctAnswer: item.meaning };
//           }
//           const wrongOptions = shuffleArray(otherItems).slice(0, 3).map(i => i.hanzi);
//           const options = shuffleArray([item.hanzi, ...wrongOptions]);
//           return { type, vocabItem: item, options, correctAnswer: item.hanzi };
//         }
//         case 'pinyin': {
//           return { type, vocabItem: item, options: [], correctAnswer: item.pinyin };
//         }
//         case 'meaning':
//         default: {
//           const otherItems = set.items.filter(i => i.id !== item.id);
//           if (otherItems.length < 3) {
//             const wrongOptions = shuffleArray(otherItems).slice(0, Math.min(3, otherItems.length)).map(i => i.meaning);
//             const options = shuffleArray([item.meaning, ...wrongOptions]);
//             return { type, vocabItem: item, options, correctAnswer: item.meaning };
//           }
//           const wrongOptions = shuffleArray(otherItems).slice(0, 3).map(i => i.meaning);
//           const options = shuffleArray([item.meaning, ...wrongOptions]);
//           return { type, vocabItem: item, options, correctAnswer: item.meaning };
//         }
//       }
//     });
    
//     setQuestions(generatedQuestions);
//     setCurrentQuestionIndex(0);
//     setSelectedAnswer(null);
//     setPinyinInput('');
//   }, [set, shuffleArray]);



//   const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
//     try {
//         const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//         if (!audioContext) return;
//         const oscillator = audioContext.createOscillator();
//         const gainNode = audioContext.createGain();

//         oscillator.connect(gainNode);
//         gainNode.connect(audioContext.destination);

//         oscillator.type = type;
//         oscillator.frequency.value = frequency;
//         gainNode.gain.setValueAtTime(0, audioContext.currentTime);
//         gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Quieter volume

//         oscillator.start(audioContext.currentTime);
//         gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration / 1000);
//         oscillator.stop(audioContext.currentTime + duration / 1000);
//     } catch (e) {
//         console.error("Could not play audio:", e);
//     }
// };
//   const handleSubmitAnswer = useCallback((answer: string) => {
//     if (isTransitioning || !answer) return;
    
//     setIsTransitioning(true);
//     const updatedQuestions = [...questions];
//     updatedQuestions[currentQuestionIndex].userAnswer = answer;
//     setQuestions(updatedQuestions);
//     setSelectedAnswer(answer);
//     const currentQ = questions[currentQuestionIndex];
//      const isCorrect = currentQ.type === 'pinyin'
//         ? answer.toLowerCase() === currentQ.correctAnswer.toLowerCase()
//         : answer === currentQ.correctAnswer;
//      if (isCorrect) {
//         playTone(600, 100, 'triangle');
//         setTimeout(() => playTone(900, 100, 'triangle'), 120);
//     } else {
//         playTone(200, 200, 'sawtooth');
//     }

//     setTimeout(() => {
//       if (currentQuestionIndex < questions.length - 1) {
//         setCurrentQuestionIndex(prev => prev + 1);
//         setSelectedAnswer(null);
//         setPinyinInput('');
//         setIsTransitioning(false);
//       } else {
//         // Calculate final score
//         const score = updatedQuestions.reduce((acc, q) => {
//           if (!q.userAnswer) return acc;
//           const isCorrect = q.type === 'pinyin'
//             ? q.userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
//             : q.userAnswer === q.correctAnswer;
//           return acc + (isCorrect ? 1 : 0);
//         }, 0);

//         const result: QuizResultType = {
//           score,
//           total: updatedQuestions.length,
//           questions: updatedQuestions
//         };
        
//         setView({ view: 'QUIZ_RESULT', setId, result });
//       }
//     }, 1200);
//   }, [isTransitioning, questions, currentQuestionIndex, setView, setId]);

//   const handlePinyinSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const trimmedInput = pinyinInput.trim();
//     if (!trimmedInput || isTransitioning) return;
//     handleSubmitAnswer(trimmedInput);
//   };

//   const handleSpeak = (text: string) => {
//     speakText(text);
//   };

//   // Loading and error states
//   if (!set) return <div>Set not found.</div>;
//   if (set.items.length < 4) {
//     return (
//       <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
//         <h2 className="text-2xl font-bold text-gray-800 mb-4">Cannot Start Quiz</h2>
//         <p className="text-gray-600 mb-4">You need at least 4 words in a set to start a quiz.</p>
//         <button 
//           onClick={() => setView({view: 'DASHBOARD'})} 
//           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           ← Back to Dashboard
//         </button>
//       </div>
//     );
//   }
//   if (questions.length === 0) return <div>Loading quiz...</div>;

//   const currentQuestion = questions[currentQuestionIndex];

//   const renderQuestionPrompt = () => {
//     const { type, vocabItem } = currentQuestion;

//     const speakButton = (
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           handleSpeak(vocabItem.hanzi);
//         }}
//         className="ml-4 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-transform transform hover:scale-110 flex items-center justify-center h-12 w-12"
//         aria-label="Play pronunciation"
//       >
//         <Volume2Icon size={24} />
//       </button>
//     );

//     if (type === 'meaning' || type === 'pinyin') {
//       return (
//         <div className="flex items-center justify-center">
//           <div>
//             <p className="text-6xl font-bold">{vocabItem.hanzi}</p>
//             {type === 'meaning' && (
//               <p className="text-2xl text-gray-500 mt-2">{vocabItem.pinyin}</p>
//             )}
//           </div>
//           {speakButton}
//         </div>
//       );
//     }

//     if (type === 'hanzi') {
//       return <p className="text-4xl font-bold text-center">{vocabItem.meaning}</p>;
//     }

//     return null;
//   };

//   const renderAnswerArea = () => {
//     if (currentQuestion.type === 'pinyin') {
//       const isAnswered = !!selectedAnswer;
//       const isCorrect = isAnswered && 
//         selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
      
//       return (
//         <div>
//           <input 
//             type="text"
//             value={pinyinInput}
//             onChange={e => setPinyinInput(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') {
//                 e.preventDefault();
//                 handlePinyinSubmit(e as any);
//               }
//             }}
//             placeholder="Type the pinyin"
//             disabled={isAnswered}
//             autoFocus
//             className={`w-full p-4 border-2 rounded-lg text-center text-lg transition-all duration-300 ${
//               isAnswered 
//                 ? (isCorrect ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500') 
//                 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
//             }`}
//           />
//           <button 
//             onClick={(e) => handlePinyinSubmit(e as any)}
//             disabled={isAnswered || !pinyinInput.trim()} 
//             className="mt-4 w-full p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//           >
//             Submit
//           </button>
//           {isAnswered && !isCorrect && (
//             <p className="text-center mt-2 text-lg text-green-700 font-semibold">
//               Correct answer: {currentQuestion.correctAnswer}
//             </p>
//           )}
//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {currentQuestion.options.map((option, index) => {
//           const isCorrect = option === currentQuestion.correctAnswer;
//           const isSelected = selectedAnswer === option;
//           let buttonClass = 'p-4 text-left font-semibold rounded-lg border-2 transition-all duration-300';

//           if (isSelected) {
//             buttonClass += isCorrect 
//               ? ' bg-green-200 border-green-500 text-green-800' 
//               : ' bg-red-200 border-red-500 text-red-800';
//           } else if (selectedAnswer) {
//             buttonClass += isCorrect 
//               ? ' bg-green-200 border-green-500 text-green-800' 
//               : ' bg-white border-gray-300 text-gray-400';
//           } else {
//             buttonClass += ' bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 cursor-pointer';
//           }

//           return (
//             <button
//               key={index}
//               onClick={() => handleSubmitAnswer(option)}
//               disabled={!!selectedAnswer || isTransitioning}
//               className={buttonClass}
//             >
//               {option}
//             </button>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold text-gray-800">{set.title} Quiz</h2>
//         <div className="text-lg font-semibold text-gray-600">
//           {currentQuestionIndex + 1} / {questions.length}
//         </div>
//       </div>
      
//       {/* Progress bar */}
//       <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
//         <div 
//           className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//           style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
//         ></div>
//       </div>

//       <div className="bg-gray-100 p-8 rounded-lg text-center mb-6 min-h-[180px] flex flex-col justify-center">
//         {renderQuestionPrompt()}
//       </div>
      
//       {renderAnswerArea()}

//       <button 
//         onClick={() => setView({view: 'DASHBOARD'})} 
//         className="mt-8 block mx-auto text-gray-600 hover:text-gray-800 font-semibold transition-colors"
//       >
//         ← Quit Quiz
//       </button>
//     </div>
//   );
// };

// export default QuizView;

// FIX: The original file was likely corrupted or incomplete, causing numerous compilation errors. This version restores the component's logic, state management, and render functions.
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { VocabItem, QuizQuestion, QuizResultType, QuestionType } from '../types';
import { speakText } from '../services/geminiService';
import { Volume2Icon } from './icons/Volume2Icon';
import Spinner from './Spinner';

interface Props {
  setId: string;
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


const QuizView: React.FC<Props> = ({ setId }) => {
  const context = useContext(AppContext);

  if (!context) return <div>Loading...</div>;
  const { state, setView, saveQuizResult } = context;

  const set = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [pinyinInput, setPinyinInput] = useState('');
  
  useEffect(() => {
    if (set && set.items.length >= 4) {
      const questionTypes: QuestionType[] = ['meaning', 'hanzi', 'pinyin'];
      const shuffled = shuffleArray(set.items).slice(0, 10); // Max 10 questions
      
      const generatedQuestions: QuizQuestion[] = shuffled.map((item: VocabItem) => {
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        switch (type) {
          case 'hanzi': {
            const otherItems = set.items.filter((i: VocabItem) => i.id !== item.id);
            const wrongOptions = shuffleArray(otherItems).slice(0, 3).map((i: VocabItem) => i.hanzi);
            const options = shuffleArray([item.hanzi, ...wrongOptions]);
            return { type, vocabItem: item, options, correctAnswer: item.hanzi };
          }
          case 'pinyin': {
            return { type, vocabItem: item, options: [], correctAnswer: item.pinyin };
          }
          case 'meaning':
          default: {
            const otherItems = set.items.filter((i: VocabItem) => i.id !== item.id);
            const wrongOptions = shuffleArray(otherItems).slice(0, 3).map((i: VocabItem) => i.meaning);
            const options = shuffleArray([item.meaning, ...wrongOptions]);
            return { type, vocabItem: item, options, correctAnswer: item.meaning };
          }
        }
      });
      setQuestions(generatedQuestions);
    }
  }, [set]);

  const handleSubmitAnswer = (answer: string) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = currentQ.type === 'pinyin'
        ? answer.toLowerCase() === currentQ.correctAnswer.toLowerCase()
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
                ? q.userAnswer.toLowerCase() === q.correctAnswer.toLowerCase()
                : q.userAnswer === q.correctAnswer;
            return acc + (correct ? 1 : 0);
        }, 0);

        const result: QuizResultType = {
            score,
            total: updatedQuestions.length,
            questions: updatedQuestions
        };

        // Save result to backend before showing the result screen
        await saveQuizResult(setId, result);

        setView({ view: 'QUIZ_RESULT', setId, result });
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
  if (set.items.length < 4) return <div>You need at least 4 words in a set to start a quiz.</div>;
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
        const isCorrect = isAnswered && selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <h2 className="text-2xl font-bold text-gray-800">{set.title} Quiz</h2>
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