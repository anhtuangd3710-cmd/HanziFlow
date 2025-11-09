
import React, { useContext } from 'react';
import { QuizResultType } from '../types';
import { AppContext } from '../context/AppContext';

interface Props {
  quizResult: QuizResultType;
  setId: string;
}

const QuizResult: React.FC<Props> = ({ quizResult, setId }) => {
  const { dispatch } = useContext(AppContext);
  const { score, total, questions } = quizResult;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  let feedbackMessage = "Great job!";
  if (percentage < 50) {
    feedbackMessage = "Keep practicing!";
  } else if (percentage < 80) {
    feedbackMessage = "You're getting there!";
  }

  const handleTryAgain = () => {
    dispatch({ type: 'SET_VIEW', payload: { view: 'QUIZ', setId } });
  };

  const handleDashboard = () => {
    dispatch({ type: 'SET_VIEW', payload: { view: 'DASHBOARD' } });
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
            ? q.userAnswer?.toLowerCase() === q.correctAnswer.toLowerCase()
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
        <button onClick={handleTryAgain} className="py-2 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700">
          Try Again
        </button>
        <button onClick={handleDashboard} className="py-2 px-6 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResult;