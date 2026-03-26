
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePwaInstall } from '../contexts/PwaContext.tsx';

const Logo = () => (
    <div className="flex items-center space-x-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
            <rect x="4" y="4" width="12" height="3" rx="1.5" fill="#3B82F6" />
            <rect x="4" y="9" width="18" height="3" rx="1.5" fill="#EF4444" />
            <rect x="4" y="14" width="10" height="3" rx="1.5" fill="#FACC15" />
            <rect x="4" y="19" width="15" height="3" rx="1.5" fill="#22C55E" />
        </svg>
        <span className="font-bold text-xl text-slate-800">ExamRedi</span>
    </div>
);

/** Detect if this visitor has logged in before by checking for a stored refresh token */
const useReturningUser = () => {
    const [isReturning, setIsReturning] = useState(false);
    useEffect(() => {
        try {
            const hasToken = !!localStorage.getItem('refreshToken');
            const hasVisited = !!localStorage.getItem('examredi_visited');
            setIsReturning(hasToken || hasVisited);
            // Mark as visited for future loads
            if (!hasVisited) localStorage.setItem('examredi_visited', '1');
        } catch {
            // localStorage may be blocked in private/incognito — treat as new
        }
    }, []);
    return isReturning;
};

const LandingHeader: React.FC = () => {
    const { canInstall, showInstallBanner } = usePwaInstall();
    const isReturning = useReturningUser();

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Logo />
                <div className="flex items-center gap-3">
                    {canInstall && (
                        <button
                            onClick={showInstallBanner}
                            className="font-semibold text-primary hover:underline"
                        >
                            Install App
                        </button>
                    )}
                    {isReturning ? (
                        <>
                            <Link
                                to="/register"
                                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                New here?
                            </Link>
                            <Link
                                to="/login"
                                className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-accent transition-colors flex items-center gap-1.5"
                            >
                                <span>👋</span> Welcome Back
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link>
                            <Link to="/register" className="bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-accent transition-colors">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-14 h-14 mb-4 rounded-full bg-primary-light text-primary flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
    const isReturning = useReturningUser();

    return (
        <div className="bg-slate-50 min-h-screen">
            <LandingHeader />
            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-32 text-center bg-white">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                            Ace Your Exams with <span className="text-primary">AI-Powered</span> Study Tools
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                            ExamRedi provides everything you need to succeed. From interactive practice sessions and AI tutors to dynamic study guides and educational games.
                        </p>
                        <div className="mt-10">
                            {isReturning ? (
                                <Link to="/login" className="bg-primary text-white font-black py-4 px-10 rounded-2xl text-lg hover:bg-accent transition-all hover:scale-105 inline-block shadow-xl shadow-primary/20">
                                    Continue My Progress
                                </Link>
                            ) : (
                                <Link to="/register" className="bg-primary text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-accent transition-transform hover:scale-105 inline-block">
                                    Start Studying for Free
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Your Ultimate Study Companion</h2>
                            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
                                We've built a comprehensive platform to address all your study needs and help you achieve your best results.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                title="Practice Questions"
                                description="Access a vast library of past questions for UTME and other exams. Practice in a simulated environment and track your progress."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                            />
                            <FeatureCard
                                title="AI Tutor"
                                description="Your personal AI-buddy is available 24/7. Ask questions, get hints, and understand complex topics with ease."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                            <FeatureCard
                                title="AI Study Guides"
                                description="Generate custom study guides on any subject or topic instantly. Your learning, personalized and efficient."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            />
                            <FeatureCard
                                title="Performance Analysis"
                                description="Detailed insights into your strengths and weaknesses. See exactly where you need to improve to hit your target score."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            />
                            <FeatureCard
                                title="Educational Games"
                                description="Master difficult concepts through interactive gameplay. Subject Sprint and Memory Match make learning addictive."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                            <FeatureCard
                                title="Career Guidance"
                                description="Not sure what to study or where? Use our AI research tools to find the perfect course and university in Nigeria."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 bg-slate-100/50">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-16">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="relative">
                                <div className="w-16 h-16 bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl shadow-primary/30 relative z-10">1</div>
                                <div className="absolute top-8 left-1/2 w-full h-1 bg-primary/10 -z-0 hidden md:block"></div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Register</h3>
                                <p className="text-slate-600">Create your free account and set your targets.</p>
                            </div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl shadow-primary/30 relative z-10">2</div>
                                <div className="absolute top-8 left-1/2 w-full h-1 bg-primary/10 -z-0 hidden md:block"></div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Practice</h3>
                                <p className="text-slate-600">Take exams, play games, and ask our AI buddy.</p>
                            </div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl shadow-primary/30 relative z-10">3</div>
                                <div className="absolute top-8 left-1/2 w-full h-1 bg-primary/10 -z-0 hidden md:block"></div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Get Insights</h3>
                                <p className="text-slate-600">See your weak spots and track your estimated score.</p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-primary text-white text-2xl font-bold flex items-center justify-center rounded-2xl mx-auto mb-6 shadow-xl shadow-primary/30 relative z-10">4</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Succeed</h3>
                                <p className="text-slate-600">Walk into your exam with total confidence and win!</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pro Benefits Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mt-32 -mr-32"></div>
                            <h2 className="text-3xl md:text-5xl font-black mb-8 relative z-10 tracking-tight">Level Up with <span className="text-primary">ExamRedi Pro</span></h2>
                            <p className="text-slate-300 text-lg mb-10 relative z-10">Unlock the full power of AI-powered learning and leave nothing to chance.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-12 relative z-10">
                                <div className="flex items-center gap-3">
                                    <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-semibold">Unlimited AI Tutor Messages</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-semibold">Full Past Question Access (1978-2025)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-semibold">Generate Unlimited Study Guides</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span className="font-semibold">Global Leaderboard Access</span>
                                </div>
                            </div>

                            {isReturning ? (
                                <Link to="/login" className="bg-primary text-white font-black py-4 px-12 rounded-2xl text-xl hover:bg-accent transition-all hover:scale-105 inline-block shadow-xl shadow-primary/20 relative z-10">
                                    Resume Pro Learning
                                </Link>
                            ) : (
                                <Link to="/register" className="bg-primary text-white font-black py-4 px-12 rounded-2xl text-xl hover:bg-accent transition-all hover:scale-105 inline-block shadow-xl shadow-primary/20 relative z-10">
                                    Upgrade My Learning
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t py-8">
                    <div className="container mx-auto px-4 text-center text-slate-500">
                        <p>&copy; {new Date().getFullYear()} ExamRedi. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;
