import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    keywords?: string[];
    noindex?: boolean;
}

const useSEO = ({ title, description, canonical, keywords, noindex }: SEOProps) => {
    useEffect(() => {
        // Handle Title
        const baseTitle = 'ExamRedi AI Study Platform';
        const fullTitle = title ? `${title} | ExamRedi` : baseTitle;
        document.title = fullTitle;

        // Handle Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description || 'Master your exams with AI-powered study guides, past questions, and engaging learning tools on ExamRedi.');

        // Handle Keywords
        if (keywords && keywords.length > 0) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', keywords.join(', '));
        }

        // Handle Robots (Noindex)
        let metaRobots = document.querySelector('meta[name="robots"]');
        if (noindex) {
            if (!metaRobots) {
                metaRobots = document.createElement('meta');
                metaRobots.setAttribute('name', 'robots');
                document.head.appendChild(metaRobots);
            }
            metaRobots.setAttribute('content', 'noindex, nofollow');
        } else if (metaRobots) {
            // Remove it if not needed or set to index
            metaRobots.setAttribute('content', 'index, follow');
        }

        // Handle Canonical Link
        const currentPath = window.location.pathname;
        const defaultCanonical = `https://examredi.com${currentPath}`;
        const finalCanonical = canonical || defaultCanonical;

        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', finalCanonical);
    }, [title, description, canonical, keywords, noindex]);
};

export default useSEO;
