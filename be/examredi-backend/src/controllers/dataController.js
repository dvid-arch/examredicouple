import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Paper from '../models/Paper.js';
import Leaderboard from '../models/Leaderboard.js';
import User from '../models/User.js';
import Performance from '../models/Performance.js';
import Guide from '../models/Guide.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'db');
const topicsFilePath = path.join(dbPath, 'topics.json');
const leaderboardFilePath = path.join(dbPath, 'leaderboard.json');
const performanceFilePath = path.join(dbPath, 'performance.json');
const literatureFilePath = path.join(dbPath, 'literature.json');


const SUBJECT_MAPPING = {
    // Accounts
    'Accounting': 'Accounting',
    'Financial Accounting': 'Accounting',
    'accounts-principles-of-accounts': 'Accounting',

    // Agric
    'Agriculture': 'Agricultural Science',
    'Agric': 'Agricultural Science',
    'agricultural-science': 'Agricultural Science',

    // English
    'English': 'English Language',
    'Use of English': 'English Language',
    'english-language': 'English Language',

    // Literature
    'Literature': 'Literature in English',
    'Literature-in-English': 'Literature in English',
    'literature-in-english': 'Literature in English',

    // Religion
    'CRS': 'Christian Religious Knowledge (CRK)',
    'Christian Religious Studies': 'Christian Religious Knowledge (CRK)',
    'CRK': 'Christian Religious Knowledge (CRK)',
    'christian-religious-knowledge-crk': 'Christian Religious Knowledge (CRK)',

    'IRS': 'Islamic Religious Knowledge (IRK)',
    'Islamic Religious Studies': 'Islamic Religious Knowledge (IRK)',
    'IRK': 'Islamic Religious Knowledge (IRK)',
    'islamic-religious-knowledge-irk': 'Islamic Religious Knowledge (IRK)',

    // Art
    'Fine Art': 'Fine Arts',
    'Fine Arts': 'Fine Arts',
    'fine-arts': 'Fine Arts',

    // PHE
    'Physical and Health Education (PHE)': 'Physical and Health Education',
    'PHE': 'Physical and Health Education',
    'physical-and-health-education': 'Physical and Health Education',

    // Exact name matches to handle single word frontend slugs specifically
    'mathematics': 'Mathematics',
    'maths': 'Mathematics',
    'biology': 'Biology',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
    'economics': 'Economics',
    'government': 'Government',
    'geography': 'Geography',
    'commerce': 'Commerce',
    'history': 'History',
    'civic-education': 'Civic Education'
};

const readJsonFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return [];
    }
};


const writeJsonFile = async (filePath, data) => {
    await fs.mkdir(dbPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// @desc    Get past papers
// @route   GET /api/data/papers
export const getPapers = async (req, res) => {
    try {
        const { subject, year } = req.query;
        const filter = {};

        if (subject || req.query.subjects) {
            // Support both ?subject=Math and ?subjects=Math,English
            const subjectsToFilter = req.query.subjects 
                ? req.query.subjects.split(',') 
                : [subject];

            const subjectRegexes = subjectsToFilter.map(sub => {
                const targetSubject = SUBJECT_MAPPING[sub] || sub;
                const escapedSubject = sub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const escapedTarget = targetSubject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return [
                    { subject: new RegExp('^' + escapedTarget + '$', 'i') },
                    { subject: new RegExp('^' + escapedSubject + '$', 'i') }
                ];
            }).flat();

            filter.$or = subjectRegexes;
        }

        if (year) {
            filter.year = Number(year);
        }

        const isPro = req.user?.subscription === 'pro' || req.user?.role === 'admin';
        const userLicenseYear = req.user?.licenseYear || new Date().getFullYear(); // Fallback to current year for legacy pro users

        // Apply access restriction
        if (!isPro) {
            // Free users only get 2024 (previously 2000, now switched to 2024 for better coverage)
            if (year && Number(year) !== 2024) {
                return res.status(403).json({
                    message: `Year ${year} is an ExamRedi Pro feature. Upgrade to unlock all years.`,
                    isLocked: true
                });
            }
            filter.year = 2024;
            console.log(`[DataDebug] Restriction applied: Only year 2024 allowed for free user.`);
        } else {
            // Pro/Admin bypass - Enforce Silent year-based lock for Pro (but not Admin)
            if (req.user?.role !== 'admin') {
                // Limit access to current year AND previous years
                // Logic: PaperYear < userLicenseYear (e.g. register in 2026, get up to 2025)
                if (year && Number(year) >= userLicenseYear) {
                    return res.status(403).json({
                        message: "This paper is part of a newer exam year. Please upgrade your license to access newer papers.",
                        isLocked: true
                    });
                }

                // If no year specified, filter papers by the cutoff
                if (!filter.year) {
                    filter.year = { $lt: userLicenseYear };
                }
            }
            console.log(`[DataDebug] Pro Access - LicenseYear Cutoff applied.`);
        }

        console.log(`[DataDebug] Final DB Filter:`, JSON.stringify(filter));

        const includeQuestions = req.query.full === 'true';

        // Query MongoDB - Exclude questions by default to save bandwidth
        let query = Paper.find(filter).lean();
        if (!includeQuestions) {
            query = query.select('-questions');
        }
        let papers = await query.exec();

        // Secondary safety: Strip explanations and further limit for non-pro
        if (!isPro) {
            papers = papers.map(paper => ({
                ...paper,
                isLimited: true,
                questions: (paper.questions || []).map(q => {
                    const { explanation, ...rest } = q;
                    return rest;
                })
            }));

            // Guests (unauthenticated) still get the 10-question teaser even within year 2000
            if (!req.user) {
                papers = papers.map(paper => ({
                    ...paper,
                    questions: paper.questions.slice(0, 10)
                }));
            }
        }

        res.json(papers);
    } catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single paper with questions
// @route   GET /api/data/papers/:id
export const getPaperById = async (req, res) => {
    try {
        const paper = await Paper.findOne({ id: req.params.id }).lean();
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        const isPro = req.user?.subscription === 'pro' || req.user?.role === 'admin';
        
        // Apply same restrictions as getPapers
        if (!isPro) {
            if (paper.year !== 2024) {
                 return res.status(403).json({
                    message: `Year ${paper.year} is an ExamRedi Pro feature.`,
                    isLocked: true
                });
            }
            paper.isLimited = true;
            paper.questions = (paper.questions || []).map(q => {
                const { explanation, ...rest } = q;
                return rest;
            });
            // Guest check is harder here without more session context, 
            // but we assume authenticated if we reached here via standard routes.
        }

        res.json(paper);
    } catch (error) {
        console.error('Error fetching paper by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search past questions by keyword
// @route   GET /api/data/search
export const searchPapers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const filter = {
            $or: [
                { 'questions.question': { $regex: query, $options: 'i' } },
                { 'questions.options.A.text': { $regex: query, $options: 'i' } },
                { 'questions.options.B.text': { $regex: query, $options: 'i' } },
                { 'questions.options.C.text': { $regex: query, $options: 'i' } },
                { 'questions.options.D.text': { $regex: query, $options: 'i' } }
            ]
        };

        const isPro = req.user?.subscription === 'pro' || req.user?.role === 'admin';
        const isAdmin = req.user?.role === 'admin';
        const userLicenseYear = req.user?.licenseYear || new Date().getFullYear();

        if (!isPro) {
            filter.year = 2024;
        } else if (!isAdmin) {
            filter.year = { $lt: userLicenseYear };
        }

        // Database search using regex (case-insensitive)
        const papers = await Paper.find(filter).limit(20).lean();

        const results = [];
        const lowerQuery = query.toLowerCase();

        papers.forEach(paper => {
            paper.questions.forEach(q => {
                const qText = q.question ? String(q.question).toLowerCase() : '';
                // ... search logic ...
                if (
                    qText.includes(lowerQuery) ||
                    (q.options?.A?.text && String(q.options.A.text).toLowerCase().includes(lowerQuery)) ||
                    (q.options?.B?.text && String(q.options.B.text).toLowerCase().includes(lowerQuery)) ||
                    (q.options?.C?.text && String(q.options.C.text).toLowerCase().includes(lowerQuery)) ||
                    (q.options?.D?.text && String(q.options.D.text).toLowerCase().includes(lowerQuery))
                ) {
                    const result = {
                        ...q,
                        subject: paper.subject,
                        year: paper.year,
                        exam: paper.exam
                    };

                    if (!isPro) {
                        delete result.explanation;
                        result.isLocked = paper.year !== 2024;
                    } else if (!isAdmin && paper.year >= userLicenseYear) {
                        delete result.explanation;
                        result.isLocked = true;
                    }

                    results.push(result);
                }
            });
        });

        res.json(results.slice(0, 50));
    } catch (error) {
        console.error('Error searching papers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single question by ID
// @route   GET /api/data/question/:id
export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await Paper.findOne({ 'questions.id': id }).lean();

        if (!paper) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const question = paper.questions.find(q => q.id === id);

        const isPro = req.user?.subscription === 'pro' || req.user?.role === 'admin';
        const isAdmin = req.user?.role === 'admin';
        const userLicenseYear = req.user?.licenseYear || new Date().getFullYear();

        // Add paper metadata for context
        const result = {
            ...question,
            subject: paper.subject,
            year: paper.year,
            exam: paper.exam
        };

        if (!isPro) {
                        delete result.explanation;
                        result.isLocked = paper.year !== 2024;
                    } else if (!isAdmin && paper.year >= userLicenseYear) {
                        delete result.explanation;
                        result.isLocked = true;
                    } else if (req.user?.role !== 'admin' && paper.year >= (req.user?.licenseYear || new Date().getFullYear())) {
            delete result.explanation;
            result.isLocked = true;
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search past questions by topics
// @route   POST /api/data/search-by-topic
export const searchByTopic = async (req, res) => {
    try {
        const { subject, topic, subTopic } = req.body;

        const targetTopic = topic || subTopic;

        if (!targetTopic) {
            return res.status(400).json({ message: 'topic is required' });
        }

        let targetSubject = subject;
        if (subject) {
            const normalizedSubject = subject.toLowerCase().trim();
            // Case-insensitive lookup in SUBJECT_MAPPING
            const matchedKey = Object.keys(SUBJECT_MAPPING).find(k => k.toLowerCase() === normalizedSubject);
            if (matchedKey) {
                targetSubject = SUBJECT_MAPPING[matchedKey];
            } else if (normalizedSubject.includes('-')) {
                // Fallback for slugs lacking explicit mapping (e.g. 'civic-education' -> 'Civic Education')
                targetSubject = normalizedSubject.replace(/-/g, ' ');
            }
        }

        // Find papers that have questions tagged with this topic (case-insensitive)
        const escapedTerm = targetTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexTerm = new RegExp('^' + escapedTerm + '$', 'i');

        const slugifiedTerm = targetTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const escapedSlugTerm = slugifiedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexSlugTerm = new RegExp('^' + escapedSlugTerm + '$', 'i');

        const filter = {
            $or: [
                { 'questions.topics': regexTerm },
                { 'questions.topics': regexSlugTerm }
            ]
        };

        if (targetSubject) {
            const escapedSubject = targetSubject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.subject = new RegExp('^' + escapedSubject + '$', 'i');
        }

        const isPro = req.user?.subscription === 'pro' || req.user?.role === 'admin';
        const isAdmin = req.user?.role === 'admin';
        const userLicenseYear = req.user?.licenseYear || new Date().getFullYear();

        if (!isPro) {
            filter.year = 2024;
        } else if (!isAdmin) {
            filter.year = { $lt: userLicenseYear };
        }

        const papers = await Paper.find(filter).lean();
        const results = [];

        papers.forEach(paper => {
            paper.questions.forEach(q => {
                const questionTopics = (q.topics || []).map(t => t.toLowerCase());

                // If the question has this exact topic or the slug version (case-insensitive), include it
                const isMatch = questionTopics.includes(targetTopic.toLowerCase()) ||
                    questionTopics.includes(slugifiedTerm);

                if (isMatch) {
                    const result = {
                        ...q,
                        subject: paper.subject,
                        year: paper.year,
                        exam: paper.exam
                    };

                    if (!isPro) {
                        delete result.explanation;
                        result.isLocked = paper.year !== 2024;
                    } else if (!isAdmin && paper.year >= userLicenseYear) {
                        delete result.explanation;
                        result.isLocked = true;
                    }

                    results.push(result);
                }
            });
        });

        res.json(results.slice(0, 100));
    } catch (error) {
        console.error('Error matching questions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get study guides
// @route   GET /api/data/guides
export const getGuides = async (req, res) => {
    try {
        const isPro = req.user?.subscription === 'pro' || req.user?.role === 'admin';

        // Use MongoDB directly
        let guides = await Guide.find({}).sort({ subject: 1 }).lean();

        if (!isPro) {
            guides = guides.map(guide => ({
                ...guide,
                isLimited: true,
                topics: (guide.topics || []).map((topic, index) => ({
                    ...topic,
                    isFree: index < 2, // First 2 are free
                    content: index < 2 ? topic.content : undefined // Hide content for locked ones
                }))
            }));
        }

        res.json(guides);
    } catch (error) {
        console.error('Error fetching guides:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get leaderboard
// @route   GET /api/data/leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        // Query users directly to ensure data is fresh and deletions are reflected.
        // We filter for users with names and an estimatedScore (base is 150, but we'll show anything > 0).
        const users = await User.find({ 
            name: { $exists: true, $ne: "" },
            estimatedScore: { $gt: 0 }
        })
        .select('name estimatedScore photoURL subscription')
        .sort({ estimatedScore: -1 })
        .limit(50);

        // Map to the format expected by the frontend (Rankings)
        const leaderboard = users.map(u => ({
            name: u.name,
            estimatedScore: u.estimatedScore || 150,
            photoURL: u.photoURL,
            isVerified: u.subscription === 'pro'
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add score to leaderboard
// @route   POST /api/data/leaderboard
export const addLeaderboardScore = async (req, res) => {
    try {
        const { name, totalQuestions, answers, date, score: clientScore } = req.body;
        let finalScore = clientScore;

        if (answers && typeof answers === 'object') {
            const questionIds = Object.keys(answers);
            // Dynamic query to find papers containing these questions
            const papers = await Paper.find({ 'questions.id': { $in: questionIds } }).lean();
            const allQuestions = papers.flatMap(p => p.questions);

            let verifiedScore = 0;
            questionIds.forEach(qId => {
                const question = allQuestions.find(q => q.id === qId);
                if (question && question.answer === answers[qId]) {
                    verifiedScore++;
                }
            });

            console.log(`Score Verification: Client=${clientScore}, Verified=${verifiedScore}`);
            finalScore = verifiedScore;
        }

        const newScore = new Leaderboard({
            name,
            score: finalScore,
            totalQuestions: totalQuestions || 0,
            date: date || Date.now()
        });

        await newScore.save();

        // Return the refactored leaderboard even on submission for consistency
        const users = await User.find({ 
            name: { $exists: true, $ne: "" },
            estimatedScore: { $gt: 0 }
        })
        .select('name estimatedScore photoURL subscription')
        .sort({ estimatedScore: -1 })
        .limit(50);

        const leaderboard = users.map(u => ({
            name: u.name,
            estimatedScore: u.estimatedScore || 150,
            photoURL: u.photoURL,
            isVerified: u.subscription === 'pro'
        }));

        res.status(201).json(leaderboard);
    } catch (error) {
        console.error('Error adding leaderboard score:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user performance results
// @route   GET /api/data/performance
export const getPerformance = async (req, res) => {
    try {
        const userId = req.user?.id;
        const isPro = req.user?.subscription === 'pro';

        if (!isPro) {
            return res.status(403).json({ message: "Performance tracking is an ExamRedi Pro feature." });
        }

        const userResults = await Performance.find({ userId }).sort({ date: -1 });
        res.json(userResults);
    } catch (error) {
        console.error('Error fetching performance:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a performance result
// @route   POST /api/data/performance
export const addPerformanceResult = async (req, res) => {
    try {
        const userId = req.user?.id;
        const {
            paperId,
            exam,
            subject,
            year,
            score,
            totalQuestions,
            type,
            topicBreakdown,
            incorrectQuestions,
            completedAt
        } = req.body;

        const newResult = new Performance({
            userId,
            subject,
            score,
            totalQuestions,
            type: type || 'practice',
            topicBreakdown,
            incorrectQuestions,
            date: completedAt || Date.now(),
            metadata: {
                paperId,
                exam,
                year
            }
        });

        await newResult.save();
        res.status(201).json(newResult);
    } catch (error) {
        console.error('Error adding performance result:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get literature books
// @route   GET /api/data/literature
export const getLiterature = async (req, res) => {
    const literature = await readJsonFile(literatureFilePath);
    res.json(literature);
};

// @desc    Get JAMB syllabus topics
// @route   GET /api/data/topics
export const getTopics = async (req, res) => {
    try {
        const raw = await readJsonFile(topicsFilePath);
        const asArray = Object.entries(raw).map(([slug, data]) => ({
            slug,
            label: data.label,
            topics: (data.topics || []).map(t => ({
                slug: t.slug,
                label: t.label
            }))
        }));
        res.json(asArray);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Generate a sitemap.xml
// @route   GET /api/data/sitemap.xml
export const getSitemap = async (req, res) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'https://examredi.com';

        // Fetch all papers with their question IDs
        const papers = await Paper.find({}, 'questions.id updatedAt').lean();

        // Static pages
        const staticPages = [
            '',
            '/practice',
            '/study-guides',
            '/leaderboard',
            '/challenge',
            '/literature'
        ];

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        staticPages.forEach(page => {
            sitemap += `  <url>\n    <loc>${frontendUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });

        // Add dynamic question pages
        papers.forEach(paper => {
            (paper.questions || []).forEach(q => {
                sitemap += `  <url>\n    <loc>${frontendUrl}/question/${q.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
            });
        });

        sitemap += '</urlset>';

        res.set('Content-Type', 'text/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
};
