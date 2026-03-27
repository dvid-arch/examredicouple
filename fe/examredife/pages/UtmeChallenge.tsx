import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card.tsx';
import { LeaderboardScore } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePastQuestions } from '../contexts/PastQuestionsContext.tsx';
import useSEO from '../hooks/useSEO.ts';
import apiService from '../services/apiService.ts';

// --- ICONS ---
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>;
const RefreshIcon = (props: React.ComponentProps<"svg">) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

// --- MAIN COMPONENT ---
const UtmeChallenge: React.FC = () => {
    const { isAuthenticated, user, requestLogin } = useAuth();
    const navigate = useNavigate();
    const { fetchPapers } = usePastQuestions();
    
    useSEO({
        title: "National Leaderboard",
        description: "See where you stand among students nationwide based on your estimated UTME score."
    });

    const [leaderboard, setLeaderboard] = useState<LeaderboardScore[]>([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
    const [showRules, setShowRules] = useState(() => {
        return localStorage.getItem('hideUtmeChallengeRules') !== 'true';
    });
    const [showHowItWorks, setShowHowItWorks] = useState(false);

    const handleDismissRules = () => {
        localStorage.setItem('hideUtmeChallengeRules', 'true');
        setShowRules(false);
    };

    const fetchLeaderboard = useCallback(async () => {
        setIsLoadingLeaderboard(true);
        try {
            const leaderboardData = await apiService<LeaderboardScore[]>('/data/leaderboard');
            // Sort by estimated score descending
            const sorted = [...leaderboardData].sort((a, b) => (b.estimatedScore || 0) - (a.estimatedScore || 0));
            setLeaderboard(sorted);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setIsLoadingLeaderboard(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
        fetchPapers();
    }, [fetchLeaderboard, fetchPapers]);

    // --- GATING LOGIC ---
    if (isLoadingLeaderboard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <RefreshIcon className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading National Rankings...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Card className="text-center p-8 flex flex-col items-center justify-center h-full max-w-md mx-auto my-12">
                <div className="mb-6">
                    <TrophyIcon />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">National Leaderboard</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                        Join the elite competition! Sign in to see where you stand among students across the country and track your progress toward your target score.
                    </p>
                </div>
                <button
                    onClick={requestLogin}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 w-full"
                >
                    Sign In to View Rankings
                </button>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-1 sm:px-4 py-4 space-y-6">
            {/* Header / Intro */}
            <div className="text-center space-y-2 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Leaderboard</h1>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Ranked by Estimated UTME Score</p>
            </div>

            {/* Prize Banner - Optimized for Mobile */}
            {showRules && (
                <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-4 sm:p-6 shadow-xl relative animate-fade-in border border-white/10 overflow-hidden">
                    {/* Background Decorative Element */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
                    
                    <button 
                        onClick={handleDismissRules}
                        className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors p-1.5"
                        aria-label="Dismiss rules"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">
                        <div className="bg-white/10 p-2.5 sm:p-3 rounded-2xl flex-shrink-0 backdrop-blur-sm border border-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-9 sm:h-9 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-2">
                                🏆 Win Amazing Prizes!
                                <span className="bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Top 3 Only</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-blue-50/90 leading-snug">
                                Rank globally based on your estimated UTME performance. Stay consistent in your practice to climb the leaderboard and win rewards!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* How It Works Action / Toggle */}
            <div className="flex justify-center -mt-2">
                <button 
                    onClick={() => setShowHowItWorks(!showHowItWorks)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${showHowItWorks ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showHowItWorks ? "Hide Guide" : "How to increase my Estimated Score?"}
                </button>
            </div>

            {/* How It Works Content */}
            {showHowItWorks && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-lg border border-primary/10 animate-fade-in space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        🚀 How to Climb the Leaderboard
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <p className="font-bold text-blue-700 dark:text-blue-400 text-sm mb-1 uppercase tracking-tight">1. Consistent Practice</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">The AI tracks your daily engagement. Students who practice every day see a natural boost in their performance trends.</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                            <p className="font-bold text-green-700 dark:text-green-400 text-sm mb-1 uppercase tracking-tight">2. Mastery Over Speed</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Accuracy is everything. It's better to get 10 questions 100% correct than 50 questions with 50% accuracy.</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                            <p className="font-bold text-purple-700 dark:text-purple-400 text-sm mb-1 uppercase tracking-tight">3. Finish Study Guides</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Completing topics in your Classroom proves your theoretical depth and significantly lifts your Estimated Score.</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                            <p className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-1 uppercase tracking-tight">4. Pro Verification</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Pro users get their scores verified and appear on the official prize-eligible national ranking.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Card */}
            <Card className="p-0 overflow-hidden shadow-2xl border-none bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center p-5 sm:p-6 border-b dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">National Ranking</h2>
                    </div>
                    <button
                        onClick={fetchLeaderboard}
                        disabled={isLoadingLeaderboard}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
                        title="Refresh Ranking"
                    >
                        <RefreshIcon className={`w-5 h-5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="p-2 sm:p-4">
                    {leaderboard.length > 0 ? (
                        <div className="space-y-2">
                            {leaderboard.map((entry, index) => {
                                const isTop3 = index < 3;
                                const isCurrentUser = entry.name === user?.name;
                                const rankColor = index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-100 dark:bg-slate-800';
                                const rankTextColor = isTop3 ? 'text-white' : 'text-slate-500 dark:text-slate-400';

                                return (
                                    <div 
                                        key={index} 
                                        className={`group relative p-3 sm:p-4 rounded-2xl flex items-center justify-between transition-all duration-300 ${
                                            isCurrentUser ? 'bg-primary/5 border-2 border-primary/20 scale-[1.01]' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            {/* Rank Badge */}
                                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-sm sm:text-lg shadow-sm flex-shrink-0 ${rankColor} ${rankTextColor}`}>
                                                {index + 1}
                                            </div>
                                            
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className={`font-bold text-sm sm:text-base truncate ${isCurrentUser ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {entry.name}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">You</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-medium">
                                                    <span className="uppercase tracking-wider">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                                    <span className="truncate">Updated recently</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 ml-2">
                                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                {Math.round(entry.estimatedScore || entry.score * (400 / entry.totalQuestions))}
                                            </div>
                                            <div className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 opacity-60">
                                                EST. SCORE
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 font-medium">
                            No rankings yet. Keep practicing to appear here!
                        </div>
                    )}
                </div>

                {/* Footer Incentive */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        Your ranking is updated automatically as you complete practices and study guides.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default UtmeChallenge;