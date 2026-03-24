import express from 'express';
import Paper from '../models/Paper.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://examredi.com';

        // Fetch subjects and their associated types to ONLY include valid combinations
        const subjectData = await Paper.aggregate([
            { $group: { _id: "$subject", types: { $addToSet: "$type" } } }
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static high-priority pages (Excluding Utility pages like /login /register)
        const staticPages = [
            { path: '', priority: '1.0', freq: 'daily' },
            { path: '/practice', priority: '0.9', freq: 'daily' },
            { path: '/study-guides', priority: '0.8', freq: 'daily' },
            { path: '/question-search', priority: '0.8', freq: 'daily' },
            { path: '/literature', priority: '0.7', freq: 'weekly' },
            { path: '/dictionary', priority: '0.7', freq: 'weekly' },
            { path: '/career-institutions', priority: '0.7', freq: 'weekly' }
        ];

        staticPages.forEach(p => {
            xml += `
  <url>
    <loc>${baseUrl}${p.path}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
        });

        // Dynamic Subject Past Questions Landing Pages
        subjectData.forEach(item => {
            const subject = item._id;
            const slug = encodeURIComponent(subject.toLowerCase().replace(/\s+/g, '-'));

            // Base Subject Page
            xml += `
  <url>
    <loc>${baseUrl}/past-questions/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

            // Only include type variants that ACTUALLY exist for this subject
            item.types.forEach(type => {
                const typeSlug = encodeURIComponent(type.toLowerCase());
                xml += `
  <url>
    <loc>${baseUrl}/past-questions/${slug}?examType=${typeSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
        });

        xml += '\n</urlset>';
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('[Sitemap Error]:', error);
        res.status(500).end();
    }
});

// @desc    robots.txt
// @route   GET /robots.txt
router.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /reset-password/

Sitemap: https://examredi.com/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

export default router;
