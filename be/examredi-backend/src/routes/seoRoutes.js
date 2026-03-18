import express from 'express';
import Paper from '../models/Paper.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = 'https://examredi.com';
        
        // Fetch unique subjects and exam types for dynamic paths
        const [subjects, types] = await Promise.all([
            Paper.distinct('subject'),
            Paper.distinct('type')
        ]);
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        
        // Static high-priority pages
        const staticPages = [
            { path: '', priority: '1.0', freq: 'daily' },
            { path: '/practice', priority: '0.9', freq: 'daily' },
            { path: '/guides', priority: '0.8', freq: 'weekly' },
            { path: '/login', priority: '0.5', freq: 'monthly' },
            { path: '/register', priority: '0.5', freq: 'monthly' }
        ];

        staticPages.forEach(p => {
            xml += `
  <url>
    <loc>${baseUrl}${p.path}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
        });

        // Dynamic Subject Practice Pages
        subjects.forEach(subject => {
            const slug = encodeURIComponent(subject.toLowerCase().replace(/\s+/g, '-'));
            xml += `
  <url>
    <loc>${baseUrl}/practice/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        // Add sitemap for each subject per exam type
        types.forEach(type => {
            subjects.forEach(subject => {
                const subjectSlug = encodeURIComponent(subject.toLowerCase().replace(/\s+/g, '-'));
                const typeSlug = encodeURIComponent(type.toLowerCase());
                xml += `
  <url>
    <loc>${baseUrl}/practice/${subjectSlug}?examType=${typeSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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

export default router;
