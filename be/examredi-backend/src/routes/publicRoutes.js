import express from 'express';
import Paper from '../models/Paper.js';

const router = express.Router();

// @desc    Get a list of all subjects with paper counts (public, no auth)
// @route   GET /api/public/subjects
router.get('/subjects', async (req, res) => {
    try {
        const subjects = await Paper.aggregate([
            {
                $group: {
                    _id: '$subject',
                    paperCount: { $sum: 1 },
                    years: { $addToSet: '$year' },
                    types: { $addToSet: '$type' },
                    questionCount: { $sum: { $size: '$questions' } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const result = subjects.map(s => ({
            subject: s._id,
            slug: s._id.toLowerCase().replace(/\s+/g, '-'),
            paperCount: s.paperCount,
            questionCount: s.questionCount,
            years: s.years.sort((a, b) => b - a),
            types: s.types
        }));

        res.json(result);
    } catch (error) {
        console.error('[Public] Error fetching subjects:', error);
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});

// @desc    Get public metadata + preview questions for a subject (no auth)
// @route   GET /api/public/subjects/:slug
router.get('/subjects/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { examType } = req.query;

        // Convert slug back to subject name match
        const subjectFilter = {
            subject: { $regex: new RegExp('^' + slug.replace(/-/g, '[\\s-]') + '$', 'i') }
        };
        if (examType) subjectFilter.type = { $regex: new RegExp('^' + examType + '$', 'i') };

        // Get aggregate stats
        const stats = await Paper.aggregate([
            { $match: subjectFilter },
            {
                $group: {
                    _id: '$subject',
                    paperCount: { $sum: 1 },
                    questionCount: { $sum: { $size: '$questions' } },
                    years: { $addToSet: '$year' },
                    types: { $addToSet: '$type' }
                }
            }
        ]);

        if (!stats.length) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const info = stats[0];

        // Get 3 teaser questions from the most recent paper (not the full questions)
        const recentPaper = await Paper.findOne(subjectFilter)
            .sort({ year: -1 })
            .select('subject year type questions')
            .lean();

        const previewQuestions = recentPaper
            ? recentPaper.questions.slice(0, 3).map((q, i) => ({
                  id: q.id,
                  questionNumber: i + 1,
                  // Show partial question text (first 80 chars) as teaser
                  questionPreview: q.question.substring(0, 80) + (q.question.length > 80 ? '...' : ''),
                  hasOptions: true,
                  year: recentPaper.year,
                  type: recentPaper.type
              }))
            : [];

        res.json({
            subject: info._id,
            slug,
            paperCount: info.paperCount,
            questionCount: info.questionCount,
            years: info.years.sort((a, b) => b - a),
            types: info.types,
            previewQuestions
        });
    } catch (error) {
        console.error('[Public] Error fetching subject details:', error);
        res.status(500).json({ message: 'Error fetching subject details' });
    }
});

export default router;
