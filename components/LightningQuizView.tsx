'use client';


import React, { useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation'; import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { VocabItem, QuizQuestion, QuizResultType, QuestionType, VocabSet } from '@/lib/types';
import { speakText } from '@/lib/geminiService';
import { getSetById } from '@/lib/api';
import Spinner from './Spinner';

const TOTAL_TIME = 90; // 90 seconds for the lightning round

const convertNumberedPinyin = (input: string): string => {
  // Pinyin conversion logic remains the same...
  const toneMap: { [key: string]: { [tone: string]: string } } = {
    'a': { '1': 'ā', '2': 'á', '3': 'ǎ', '4': 'à', '5': 'a' }, 'e': { '1': 'ē', '2': 'é', '3': 'ě', '4': 'è', '5': 'e' }, 'i': { '1': 'ī', '2': 'í', '3': 'ǐ', '4': 'ì', '5': 'i' }, 'o': { '1': 'ō', '2': 'ó', '3': 'ǒ', '4': 'ò', '5': 'o' }, 'u': { '1': 'ū', '2': 'ú', '3': 'ǔ', '4': 'ù', '5': 'u' }, 'ü': { '1': 'ǖ', '2': 'ǘ', '3': 'ǚ', '4': 'ǜ', '5': 'ü' }, 'v': { '1': 'ǖ', '2': 'ǘ', '3': 'ǚ', '4': 'ǜ', '5': 'ü' },
  };
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

interface LocationState {
    questionTypes?: QuestionType[];
    questionCount?: number;
}

function shuffleArray<T>(array: T[]): T[] { return [...array].sort(() => Math.random() - 0.5); }
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => { /* ... */ };



type LightningQuizViewProps = {
  onComplete?: () => void;
};

const LightningQuizView: React.FC<LightningQuizViewProps> = ({ onComplete }) => {
  const { setId } = useParams<{ setId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionTypes = useMemo(() => searchParams.get('types')?.split(',') as QuestionType[] || [], [searchParams]);
  const questionCount = useMemo(() => parseInt(searchParams.get('questionCount') || '10'), [searchParams]);
  
  const context = useContext(AppContext);
  const [quizSet, setQuizSet] = useState<VocabSet | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [pinyinInput, setPinyinInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef<number | undefined>(undefined);

  // Ref to hold the latest answered questions to avoid stale closures in setTimeout
  const answeredQuestionsRef = useRef(answeredQuestions);
  useEffect(() => {
    answeredQuestionsRef.current = answeredQuestions;
  }, [answeredQuestions]);

  if (!context) return <div>Loading...</div>;
  const { state, saveQuizResult } = context;
  const setFromContext = useMemo(() => state.vocabSets.find(s => s._id === setId), [state.vocabSets, setId]);

  useEffect(() => {
    if (setFromContext) {
        setQuizSet(setFromContext);
        setIsLoading(false);
        return;
    }
    const fetchQuizSet = async () => {
      if (!setId) { setQuizSet(null); setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const fetchedSet = await getSetById(setId);
            setQuizSet(fetchedSet);
        } catch (error) {
            console.error("Failed to fetch quiz set:", error);
            setQuizSet(null);
        } finally {
            setIsLoading(false);
        }
    };
    fetchQuizSet();
  }, [setId, setFromContext]);
  
  // Question Generation
  useEffect(() => {
    if (quizSet) {
      // Generate a large pool of questions to draw from
      const itemsForQuiz = [...quizSet.items, ...quizSet.items, ...quizSet.items]; // repeat to get more questions
      const shuffledItems = shuffleArray(itemsForQuiz);

      const generatedQuestions: QuizQuestion[] = shuffledItems.map((item: VocabItem, index: number) => {
        let questionTypePool: QuestionType[] = ['meaning', 'hanzi', 'pinyin'];
        if (questionTypes && questionTypes.length > 0) {
            questionTypePool = questionTypePool.filter(qt => questionTypes.includes(qt));
        }
        if (questionTypePool.length === 0) questionTypePool = ['meaning', 'hanzi', 'pinyin'];
        
        const type = questionTypePool[index % questionTypePool.length];
        // ... question generation logic ...
        switch (type) {
            case 'hanzi': {
              const otherItems = quizSet.items.filter((i: VocabItem) => i.id !== item.id);
              const wrongOptions = shuffleArray(otherItems).slice(0, 3).map((i: VocabItem) => i.hanzi);
              const options = shuffleArray([item.hanzi, ...wrongOptions]);
              return { type, vocabItem: item, options, correctAnswer: item.hanzi };
            }
            case 'pinyin': {
              return { type, vocabItem: item, options: [], correctAnswer: item.pinyin };
            }
            default: {
              const otherItems = quizSet.items.filter((i: VocabItem) => i.id !== item.id);
              const wrongOptions = shuffleArray(otherItems).slice(0, 3).map((i: VocabItem) => i.meaning);
              const options = shuffleArray([item.meaning, ...wrongOptions]);
              return { type, vocabItem: item, options, correctAnswer: item.meaning };
            }
          }
      });
      setQuestions(generatedQuestions);
    }
  }, [quizSet, questionTypes]);


  const finishQuiz = useCallback(async () => {
    if (isFinished) return; // Prevent running multiple times
    setIsFinished(true);
    if(timerRef.current) clearInterval(timerRef.current);

    const finalAnsweredQuestions = answeredQuestionsRef.current;
    
    const score = finalAnsweredQuestions.reduce((acc, q) => {
        if (!q.userAnswer) return acc;
        const isCorrect = q.type === 'pinyin'
            ? convertNumberedPinyin(q.userAnswer).toLowerCase() === q.correctAnswer.toLowerCase()
            : q.userAnswer === q.correctAnswer;
        return acc + (isCorrect ? 1 : 0);
    }, 0);

    const result: QuizResultType = {
        score,
        total: finalAnsweredQuestions.length,
        questions: finalAnsweredQuestions
    };
    
    if (setId) {
        await saveQuizResult(setId, result);
    }
    
    if (onComplete) {
        // MixedStudyMode - call callback after delay
        setTimeout(() => onComplete(), 1000);
    } else {
        // Standalone - go back to set page
        router.push(`/set/${setId}`);
    }
  }, [isFinished, saveQuizResult, router, setId, onComplete]);


  // Timer logic
  useEffect(() => {
    if (questions.length > 0 && !isFinished) {
        timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    finishQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, isFinished, finishQuiz]);

  const handleSubmitAnswer = (answer: string) => {
    if (isFinished) return;
    const currentQ = questions[currentQuestionIndex];
    const updatedQuestion = { ...currentQ, userAnswer: answer };
    
    setAnsweredQuestions(prev => [...prev, updatedQuestion]);
    
    setCurrentQuestionIndex(prev => prev + 1);
    setPinyinInput('');
  };
  
  if (isLoading || questions.length === 0) return <div className="flex justify-center mt-8"><Spinner /></div>;
  if (!quizSet) return <div>Set not found.</div>;
  
  if (isFinished) {
    return <div className="text-center p-8">Calculating results...</div>
  }
  
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return <div className="text-center p-8">No more questions! Calculating results...</div>
  }

  const currentQuestion = questions[currentQuestionIndex];
  const score = answeredQuestions.filter(q => {
    const isCorrect = q.type === 'pinyin' ? convertNumberedPinyin(q.userAnswer!).toLowerCase() === q.correctAnswer.toLowerCase() : q.userAnswer === q.correctAnswer;
    return isCorrect;
  }).length;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-600">Lightning Round!</h2>
            <div className="flex gap-4 items-center">
                <div className="text-lg font-semibold">Score: <span className="text-green-600">{score}</span></div>
                <div className="text-lg font-semibold">Time: <span className={timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}>{timeLeft}</span>s</div>
            </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{width: `${(timeLeft / TOTAL_TIME) * 100}%`}}></div>
        </div>

        <div className="bg-gray-100 p-8 rounded-lg text-center mb-6 min-h-[180px] flex flex-col justify-center">
            {/* Question Prompt Logic Here */}
            {(currentQuestion.type === 'meaning' || currentQuestion.type === 'pinyin') && <p className="text-6xl font-bold">{currentQuestion.vocabItem.hanzi}</p>}
            {currentQuestion.type === 'hanzi' && <p className="text-4xl font-bold text-center">{currentQuestion.vocabItem.meaning}</p>}
        </div>
        
        {/* Answer Area Logic Here */}
        {currentQuestion.type !== 'pinyin' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(currentQuestion.options || []).map((option, index) => (
                    <button key={index} onClick={() => handleSubmitAnswer(option)} className="p-4 text-left font-semibold rounded-lg border-2 bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400">
                        {option}
                    </button>
                ))}
            </div>
        ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(pinyinInput); }}>
                <input 
                    type="text" value={pinyinInput} onChange={e => setPinyinInput(e.target.value)}
                    placeholder="Type the pinyin and press Enter" autoFocus
                    className="w-full p-4 border-2 rounded-lg text-center text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
            </form>
        )}
    </div>
  );
};

export default LightningQuizView;
