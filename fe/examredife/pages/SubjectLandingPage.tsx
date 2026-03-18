import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config.ts';

interface SubjectData {
    subject: string;
    slug: string;
    paperCount: number;
    questionCount: number;
    years: number[];
    types: string[];
    previewQuestions: {
        id: string;
        questionNumber: number;
        questionPreview: string;
        year: number;
        type: string;
    }[];
}

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

const SubjectLandingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const examType = searchParams.get('examType') || '';

    const [data, setData] = useState<SubjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = `${API_BASE_URL}/public/subjects/${slug}${examType ? `?examType=${examType}` : ''}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Not found');
                const json = await res.json();
                setData(json);
            } catch {
                setError('Subject not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug, examType]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
                <p className="text-xl font-semibold mb-4">Subject not found</p>
                <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
            </div>
        );
    }

    const minYear = Math.min(...data.years);
    const maxYear = Math.max(...data.years);
    const examTypeLabel = data.types.join(' / ');
    const pageTitle = `${data.subject} Past Questions (${minYear}–${maxYear}) | ${examTypeLabel} | ExamRedi`;

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Update document title for SEO */}
            {typeof document !== 'undefined' && (document.title = pageTitle)}

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/"><Logo /></Link>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600">Login</Link>
                        <Link to="/register" className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Start Free
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-16 px-4">
                    <div className="container mx-auto text-center">
                        <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">{examTypeLabel} Past Questions</p>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                            {data.subject} Past Questions
                        </h1>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                            Practice with <strong>{data.questionCount.toLocaleString()} real exam questions</strong> from {data.paperCount} past papers
                            spanning <strong>{minYear} to {maxYear}</strong>. Join thousands of students who scored higher with ExamRedi.
                        </p>
                        <Link
                            to="/register"
                            className="bg-white text-blue-700 font-extrabold py-4 px-10 rounded-xl text-lg hover:bg-blue-50 transition-all hover:scale-105 inline-block shadow-lg"
                        >
                            🚀 Start Practising Free
                        </Link>
                        <p className="text-blue-200 text-xs mt-3">No credit card required. Free to get started.</p>
                    </div>
                </section>

                {/* Stats Bar */}
                <section className="bg-white border-b py-6 px-4">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-extrabold text-blue-600">{data.questionCount.toLocaleString()}</p>
                                <p className="text-sm text-slate-500 mt-1">Past Questions</p>
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-blue-600">{data.paperCount}</p>
                                <p className="text-sm text-slate-500 mt-1">Past Papers</p>
                            </div>
                            <div>
                                <p className="text-3xl font-extrabold text-blue-600">{data.years.length}</p>
                                <p className="text-sm text-slate-500 mt-1">Years Covered</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preview Questions */}
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                            Sample Questions from {data.subject} Past Papers
                        </h2>
                        <p className="text-slate-500 text-center mb-8">
                            Here's a preview. Sign up to access all {data.questionCount.toLocaleString()} questions with answers and explanations.
                        </p>

                        <div className="space-y-4">
                            {data.previewQuestions.map((q) => (
                                <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {q.type} {q.year}
                                        </span>
                                        <span className="text-xs text-slate-400">Question {q.questionNumber}</span>
                                    </div>
                                    <p className="text-slate-700 font-medium">{q.questionPreview}</p>

                                    {/* Blurred answer options teaser */}
                                    <div className="mt-4 space-y-2 select-none">
                                        {['A', 'B', 'C', 'D'].map((opt) => (
                                            <div key={opt} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">{opt}</span>
                                                <div className="h-3 bg-slate-100 rounded flex-1 blur-[2px]"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Lock overlay CTA */}
                                    <div className="mt-4 text-center">
                                        <Link
                                            to="/register"
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                                        >
                                            🔓 Sign up to see full question + answer + AI explanation
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Big CTA */}
                        <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-center text-white shadow-xl">
                            <h3 className="text-2xl font-extrabold mb-2">Ready to Ace {data.subject}?</h3>
                            <p className="text-blue-100 mb-6">
                                Get unlimited access to all {data.questionCount.toLocaleString()} past questions,
                                AI explanations, performance tracking, and more.
                            </p>
                            <Link
                                to="/register"
                                className="bg-white text-blue-700 font-extrabold py-3 px-10 rounded-xl text-lg hover:bg-blue-50 transition-all hover:scale-105 inline-block"
                            >
                                Create Free Account →
                            </Link>
                            <p className="text-blue-200 text-xs mt-3">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
                        </div>

                        {/* Years grid */}
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Available {data.subject} Past Papers</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.years.map(year => (
                                    <Link
                                        key={year}
                                        to="/register"
                                        className="bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-700 transition-all"
                                    >
                                        {data.subject} {year}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t py-8 mt-12">
                    <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                        <Logo />
                        <p className="mt-3">© {new Date().getFullYear()} ExamRedi. Your #1 exam preparation platform in Nigeria.</p>
                        <div className="flex justify-center gap-6 mt-3">
                            <Link to="/" className="hover:text-blue-600">Home</Link>
                            <Link to="/register" className="hover:text-blue-600">Register</Link>
                            <Link to="/login" className="hover:text-blue-600">Login</Link>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default SubjectLandingPage;
