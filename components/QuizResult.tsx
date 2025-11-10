
import React from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { QuizResultType, QuestionType } from '../types';

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
  if (!input) return '';
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

interface LocationState {
    quizResult: QuizResultType;
    quizType: 'standard' | 'review';
    questionTypes?: QuestionType[];
}

const QuizResult: React.FC = () => {
    const { setId } = useParams<{ setId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // If location.state is missing (e.g., user refreshed the page), redirect to dashboard.
    if (!location.state) {
        return <Navigate to="/" replace />;
    }
    const { quizResult, quizType, questionTypes } = location.state as LocationState;


  const { score, total, questions } = quizResult;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  let feedbackMessage = "Great job!";
  if (percentage < 50) {
    feedbackMessage = "Keep practicing!";
  } else if (percentage < 80) {
    feedbackMessage = "You're getting there!";
  }

  const handleRetryQuiz = () => {
    navigate(`/set/${setId}/quiz`, { state: { quizType, questionTypes }, replace: true });
  };

  const handleDashboard = () => {
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800">Quiz Complete!</h2>
      <div className="my-8 text-center">
        <p className="text-xl text-gray-600">Your Score</p>
        <p className="text-6xl font-bold text-blue-600 my-2">{score} / {total}</p>
        <p className="text-2xl font-semibold text-gray-700">{percentage}% - {feedbackMessage}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-2">Review Your Answers:</h3>
        {questions.map((q, index) => {
          const isCorrect = q.type === 'pinyin'
            ? convertNumberedPinyin(q.userAnswer || '').toLowerCase() === q.correctAnswer.toLowerCase()
            : q.userAnswer === q.correctAnswer;

          const questionPrompt = () => {
              switch(q.type) {
                  case 'pinyin':
                  case 'meaning':
                      return `${q.vocabItem.hanzi} (${q.vocabItem.pinyin})`;
                  case 'hanzi':
                      return q.vocabItem.meaning;
              }
          }
            
          return (
            <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="font-bold text-lg">
                {questionPrompt()}
              </p>
              <p className={`mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                Your answer: <span className="font-semibold">{q.userAnswer || 'No answer'}</span>
                {!isCorrect && (
                  <span className="ml-2 text-gray-700">(Correct: <span className="font-semibold">{q.correctAnswer}</span>)</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button onClick={handleRetryQuiz} className="py-2 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">
          Retry Quiz
        </button>
        <button onClick={handleDashboard} className="py-2 px-6 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResult;