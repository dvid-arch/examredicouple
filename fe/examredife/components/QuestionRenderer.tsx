import React from 'react';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import { PastQuestion } from '../types.ts';
import SpeechButton from './SpeechButton.tsx';

interface QuestionRendererProps {
  question: PastQuestion;
  questionContent?: string;
  className?: string;
  imageClassName?: string;
  forceLightMode?: boolean;
  renderOptions?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  isReviewMode?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  questionContent,
  className = '',
  imageClassName = '',
  forceLightMode = false,
  renderOptions = true,
  correctAnswer,
  userAnswer,
  isReviewMode
}) => {
  const content = questionContent || question?.question || '';

  // Prepare text for reading: Question + Options
  const getSpeechText = () => {
    let text = content;
    if (renderOptions && question.options) {
      text += '. Options are: ';
      text += Object.entries(question.options)
        .map(([key, opt]) => `${key}: ${opt.text}`)
        .join('. ');
    }
    return text;
  };
  const hasPlaceholder = content.includes('[IMAGE]');
  const hasDiagram = !!question.questionDiagram;

  // Final Correct Answer: use prop if provided, else use question.answer
  const finalCorrectAnswer = correctAnswer || question.answer;

  const renderContent = () => {
    if (hasDiagram && hasPlaceholder) {
      const parts = content.split('[IMAGE]');
      return (
        <>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <MarkdownRenderer content={part} forceLightMode={forceLightMode} />
              {index < parts.length - 1 && (
                <div className="my-4 flex justify-center">
                  <img src={question.questionDiagram} alt="Question diagram" className={`max-w-full h-auto rounded-lg border bg-white shadow-sm dark:border-slate-600 ${imageClassName}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </>
      );
    }
    return content ? (
      <MarkdownRenderer content={content} forceLightMode={forceLightMode} />
    ) : (
      <p className="text-slate-400 italic">Question text not available.</p>
    );
  };

  return (
    <div className={className}>
      <div className="mb-2">
        <SpeechButton text={getSpeechText()} size="sm" variant="ghost" showText={false} className="bg-slate-50 dark:bg-slate-800/50" />
      </div>

      {renderContent()}

      {hasDiagram && !hasPlaceholder && (
        <div className="my-4 flex justify-center">
          <img src={question.questionDiagram} alt="Question diagram" className={`max-w-full h-auto rounded-lg border bg-white shadow-sm dark:border-slate-600 ${imageClassName}`} />
        </div>
      )}

      {/* Render Options if available and requested */}
      {renderOptions && question.options && Object.keys(question.options).length > 0 && (
        <div className="mt-3 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {Object.entries(question.options).map(([key, option]) => {
            const isCorrect = key === finalCorrectAnswer;
            const isUserSelection = key === userAnswer;

            let containerClass = forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
            let badgeClass = forceLightMode ? 'bg-slate-200 text-slate-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
            let textClass = forceLightMode ? 'text-slate-700' : 'text-slate-700 dark:text-slate-300';

            if (isReviewMode) {
              if (isCorrect) {
                containerClass = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-1 ring-green-100 dark:ring-green-900/30';
                badgeClass = 'bg-green-500 text-white shadow-sm';
                textClass = 'text-green-800 dark:text-green-200 font-bold';
              } else if (isUserSelection) {
                containerClass = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30';
                badgeClass = 'bg-red-500 text-white shadow-sm';
                textClass = 'text-red-800 dark:text-red-200 font-bold';
              }
            } else if (isCorrect) {
              // Standard behavior (likely for study mode or single-question preview)
              containerClass = 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-1 ring-green-100 dark:ring-green-900/30';
              badgeClass = 'bg-green-500 text-white';
              textClass = 'text-green-800 dark:text-green-200 font-medium';
            }

            return (
              <div key={key} className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl border transition-all ${containerClass}`}>
                <span className={`flex-shrink-0 w-5 h-5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold ${badgeClass}`}>
                  {key}
                </span>
                <div className={`text-[13px] sm:text-base leading-relaxed ${textClass}`}>
                  <MarkdownRenderer content={option.text} forceLightMode={forceLightMode} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanation section for Review Mode */}
      {isReviewMode && question.explanation && (
        <div className="mt-8 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">💡</div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-xs">Explanation</h4>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
            <MarkdownRenderer content={question.explanation} forceLightMode={forceLightMode} />
          </div>
        </div>
      )}
    </div>
  );
};


export default QuestionRenderer;
