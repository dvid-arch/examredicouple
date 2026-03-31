import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card.tsx';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';

interface QuizResultsProps {
    finalScore: number;
    totalQuestions: number;
    topicBreakdown: Record<string, { correct: number, total: number }>;
    isAuthenticated: boolean;
    requestLogin: () => void;
    onReview: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
    finalScore,
    totalQuestions,
    topicBreakdown,
    isAuthenticated,
    requestLogin,
    onReview
}) => {
    const { user } = useAuth();
    const isPro = user?.subscription === 'pro' || user?.role === 'admin';
    const percentage = Math.round((finalScore / totalQuestions) * 100);

    const feedback = useMemo(() => {
        if (percentage === 100) return { title: 'Mastery Achieved! 🏆', sub: "Perfect score! You've completely mastered this set.", color: 'text-green-500', bg: 'bg-green-50' };
        if (percentage >= 80) return { title: 'Outstanding! 🌟', sub: "Excellent work! Your performance is top-tier.", color: 'text-blue-500', bg: 'bg-blue-50' };
        if (percentage >= 50) return { title: 'Great Effort! 👍', sub: "You're getting there! Keep practicing to bridge those gaps.", color: 'text-primary', bg: 'bg-indigo-50' };
        return { title: 'Keep Pushing! 💪', sub: "Every expert was once a beginner. review the failed topics and try again.", color: 'text-orange-500', bg: 'bg-orange-50' };
    }, [percentage]);

    const strokeDashoffset = 100 - percentage;

    return (
        <div className="min-h-[100dvh] overflow-y-auto w-full bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-6 sm:space-y-10 pb-12">
                
                {/* Hero Section: Score Ring */}
                <div className={`p-8 sm:p-12 rounded-3xl text-center relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm sm:shadow-md`}>
                    <div className="relative z-10 flex flex-col items-center">
                        <h1 className={`text-2xl sm:text-3xl font-black mb-2 ${feedback.color}`}>{feedback.title}</h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 font-bold text-sm sm:text-base leading-relaxed">{feedback.sub}</p>

                        <div className="relative w-48 h-48 sm:w-60 sm:h-60 mb-8 mt-2 flex items-center justify-center">
                            <svg viewBox="0 0 44 44" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                <motion.circle 
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="transparent" 
                                    className={`${feedback.color.replace('text', 'stroke')}`}
                                    strokeDasharray="113.1" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-6xl sm:text-8xl font-black tracking-tighter ${feedback.color}`}>
                                    {percentage}<span className="text-2xl sm:text-3xl">%</span>
                                </span>
                                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-[-5px]">Your Score</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
                            <Link to="/practice" replace className="bg-slate-800 dark:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 text-center">
                                New Practice
                            </Link>
                            <button
                                onClick={onReview}
                                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-3 px-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Review Questions</span>
                                <span className="text-lg">📖</span>
                            </button>
                            <Link to="/performance" replace className="bg-primary text-white font-bold py-3 px-10 rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 active:scale-95 text-center">
                                Detailed Analysis
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                    {/* Topic Breakdown */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Topic Breakdown</h3>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Performance</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3 relative">
                            {Object.entries(topicBreakdown).sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total)).map(([topic, stats], index) => {
                                const acc = Math.round((stats.correct / stats.total) * 100);
                                const isBestTopic = index === 0;
                                const isBlurred = !isPro && !isBestTopic && Object.keys(topicBreakdown).length > 1;
                                const badge = acc >= 90 ? { text: 'MASTERED 🏆', color: 'bg-yellow-400' } : acc >= 50 ? { text: 'GOOD 👍', color: 'bg-green-100 text-green-700' } : { text: 'RETRY 📖', color: 'bg-orange-100 text-orange-700' };

                                return (
                                    <div
                                        key={topic}
                                        className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col gap-3 group relative ${isBlurred ? 'opacity-40 blur-[2px] pointer-events-none' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-700 dark:text-slate-200 capitalize truncate group-hover:text-primary transition-colors">{topic}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stats.correct} / {stats.total} Correct</p>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full ${badge.color}`}>
                                                {badge.text}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${acc}%` }}
                                                transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                                                className={`h-full ${acc >= 90 ? 'bg-yellow-400' : acc >= 50 ? 'bg-primary' : 'bg-orange-500'}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {!isPro && Object.keys(topicBreakdown).length > 1 && (
                                <div className="absolute inset-0 top-[140px] bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent flex items-center justify-center p-8 z-20">
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-primary/20 text-center max-w-xs transform translate-y-12">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-2">Deep Performance Insights</h4>
                                        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">Upgrade to Pro to track your performance on all topics and identify exactly where to improve.</p>
                                        <Link to="/settings" className="block w-full bg-primary text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                                            Unlock Pro
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side: Insights */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-xl">💡</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Smart Tip</h3>
                        </div>

                        {percentage < 100 ? (
                            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform">
                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM11 7h2v6h-2V7zm0 8h2v2h-2v-2z" /></svg>
                                </div>
                                <h4 className="font-bold mb-2 text-lg">Next Step</h4>
                                <p className="text-blue-50 text-xs sm:text-sm mb-6 font-medium leading-relaxed">
                                    Your scores show a few areas that need focus. Reviewing the study guides for your weakest topics will help you improve your score in the next session.
                                </p>
                                <Link to="/study-guides" className="block w-full bg-white text-indigo-700 font-black py-3 rounded-xl text-xs uppercase text-center hover:bg-blue-50 transition-colors shadow-sm">
                                    Open Study Guides
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-yellow-400 rounded-2xl p-6 text-yellow-950 shadow-lg shadow-yellow-400/20">
                                <h4 className="font-black mb-2 text-lg uppercase tracking-tight">Master Level reached!</h4>
                                <p className="text-yellow-900 text-xs sm:text-sm mb-6 font-bold leading-relaxed">
                                    You've completely aced this set. You're showing consistent mastery. Why not try a full mock exam to test your stamina?
                                </p>
                                <Link to="/practice" className="block w-full bg-yellow-950 text-white font-black py-3 rounded-xl text-xs uppercase text-center shadow-md">
                                    Try Mock Exam
                                </Link>
                            </div>
                        )}

                        {!isAuthenticated && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Save your progress</h4>
                                <p className="text-slate-500 text-xs mb-6 font-medium leading-relaxed">Login to track your scores, earn trophies, and see your rank on the national leaderboard.</p>
                                <button onClick={requestLogin} className="w-full bg-primary/10 text-primary font-bold py-3 rounded-xl text-sm border border-primary/10 hover:bg-primary hover:text-white transition-all">
                                    Login to Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResults;
