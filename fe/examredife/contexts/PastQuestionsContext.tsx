import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { PastPaper, StudyGuide } from '../types.ts';
import apiService from '../services/apiService.ts';
import { getCache, setCache } from '../services/db.ts';

// Cache keys used in IndexedDB
// Cache keys used in IndexedDB - Bumping version to force fresh fetch after coupling
// Cache keys used in IndexedDB - Bumping version to force fresh fetch after gating/monetization
const CACHE_KEY_PAPERS = 'papers_v14';
const CACHE_KEY_GUIDES = 'guides_v14';

interface PastQuestionsContextType {
    papers: PastPaper[];
    guides: StudyGuide[];
    isLoading: boolean;
    hasFetched: boolean;
    fetchPapers: (subjects?: string[], forceRefresh?: boolean) => Promise<PastPaper[]>;
    fetchFullPaper: (paperId: string) => Promise<PastPaper | null>;
    prefetchPapers: (subjects: string[], year?: number) => Promise<void>;
    fetchGuides: (forceRefresh?: boolean) => Promise<StudyGuide[]>;
}

const PastQuestionsContext = createContext<PastQuestionsContextType | undefined>(undefined);

export const PastQuestionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [papers, setPapers] = useState<PastPaper[]>([]);
    const [guides, setGuides] = useState<StudyGuide[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    // In-memory refs to short-circuit duplicate calls within the same session
    const hasFetchedPapersRef = useRef(false);
    const hasFetchedGuidesRef = useRef(false);
    const papersRef = useRef<PastPaper[]>([]);
    const guidesRef = useRef<StudyGuide[]>([]);

    const fetchPapers = useCallback(async (subjects?: string[], forceRefresh = false) => {
        // Construct a unique cache key if filtered by subjects
        const subjectsKey = subjects && subjects.length > 0 ? `_${subjects.sort().join(',')}` : '';
        const currentCacheKey = `${CACHE_KEY_PAPERS}${subjectsKey}`;

        // 1. In-memory cache hit
        if (!forceRefresh && hasFetchedPapersRef.current && subjectsKey === '') {
            return papersRef.current;
        }

        // 2. IndexedDB cache hit
        if (!forceRefresh) {
            const cached = await getCache<PastPaper[]>(currentCacheKey);
            if (cached && cached.length > 0) {
                console.log(`[Cache] Loaded ${cached.length} papers from IndexedDB (${currentCacheKey})`);
                setPapers(cached);
                if (subjectsKey === '') {
                    papersRef.current = cached;
                    hasFetchedPapersRef.current = true;
                }
                return cached;
            }
        }

        // 3. Network fetch
        setIsLoading(true);
        try {
            let url = '/data/papers';
            if (subjects && subjects.length > 0) {
                url += `?subjects=${subjects.join(',')}`;
            }

            console.log(`[Cache] Fetching papers from network: ${url}`);
            const data = await apiService<PastPaper[]>(url);
            
            setPapers(data);
            if (subjectsKey === '') {
                papersRef.current = data;
                hasFetchedPapersRef.current = true;
            }

            // Persist to IndexedDB
            await setCache(currentCacheKey, data);
            return data;
        } catch (error) {
            console.error("Failed to fetch papers:", error);
            if (subjectsKey === '') hasFetchedPapersRef.current = true;
            return [];
        } finally {
            setIsLoading(false);
            setHasFetched(true);
        }
    }, []);

    // Track ongoing paper requests to prevent duplicate network calls (clashes)
    const activeRequestsRef = useRef<Map<string, Promise<PastPaper | null>>>(new Map());

    const fetchFullPaper = useCallback(async (paperId: string, retries = 2): Promise<PastPaper | null> => {
        const cacheKey = `paper_full_${paperId}`;
        
        // 1. If a request for this paper is already in progress, join it
        if (activeRequestsRef.current.has(paperId)) {
            console.log(`[Cache] Joining ongoing request for paper: ${paperId}`);
            return activeRequestsRef.current.get(paperId)!;
        }

        // 2. Check IndexedDB cache first
        const cached = await getCache<PastPaper>(cacheKey);
        if (cached) {
            console.log(`[Cache] Found full paper ${paperId} in IndexedDB`);
            setPapers(prev => prev.map(p => p.id === paperId && (!p.questions || p.questions.length === 0) ? cached : p));
            return cached;
        }

        // 3. Create a new request promise
        const requestPromise = (async () => {
            try {
                console.log(`[Cache] Fetching full paper ${paperId} from network...`);
                const paper = await apiService<PastPaper>(`/data/papers/${paperId}`);
                
                // Persist to IndexedDB
                await setCache(cacheKey, paper);
                
                setPapers(prev => prev.map(p => p.id === paperId ? paper : p));
                if (papersRef.current.some(p => p.id === paperId)) {
                    papersRef.current = papersRef.current.map(p => p.id === paperId ? paper : p);
                }

                return paper;
            } catch (error) {
                if (retries > 0) {
                    console.warn(`[Retry] Failed to fetch ${paperId}. Retrying in 1s... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Note: Recurse through the wrapper to maintain tracking/deduplication
                    activeRequestsRef.current.delete(paperId);
                    return fetchFullPaper(paperId, retries - 1);
                }
                console.error(`[Retry] Failed to fetch full paper ${paperId} after 3 attempts:`, error);
                return null;
            } finally {
                // Ensure we clean up the tracking map when the request is done
                activeRequestsRef.current.delete(paperId);
            }
        })();

        // Track this promise
        activeRequestsRef.current.set(paperId, requestPromise);
        return requestPromise;
    }, []);

    const prefetchPapers = useCallback(async (subjects: string[], year?: number) => {
        // Filter available metadata to find IDs
        const targets = papersRef.current.filter(p => 
            subjects.includes(p.subject) && (year ? p.year === year : true)
        );

        if (targets.length === 0) return;

        console.log(`[Prefetch] Proactively downloading ${targets.length} papers in background...`);

        // Process with a heavy delay between them so we don't hog the network 
        // while the user is browsing
        for (const target of targets) {
            const cacheKey = `paper_full_${target.id}`;
            const exists = await getCache(cacheKey);
            
            if (!exists) {
                // Wait 2 seconds before each background fetch to stay "polite" to the connection
                await new Promise(res => setTimeout(res, 2000));
                console.log(`[Prefetch] Background loading ${target.subject} ${target.year}`);
                await fetchFullPaper(target.id);
            }
        }
    }, [fetchFullPaper]);

    const fetchGuides = useCallback(async (forceRefresh = false) => {
        // 1. In-memory cache hit
        if (!forceRefresh && hasFetchedGuidesRef.current) {
            return guidesRef.current;
        }

        // 2. IndexedDB cache hit (persists across page reloads, 24h TTL)
        if (!forceRefresh) {
            const cached = await getCache<StudyGuide[]>(CACHE_KEY_GUIDES);
            if (cached && cached.length > 0) {
                console.log(`[Cache] Loaded ${cached.length} guides from IndexedDB`);
                setGuides(cached);
                guidesRef.current = cached;
                hasFetchedGuidesRef.current = true;
                return cached;
            }
        }

        // 3. Network fetch
        setIsLoading(true);
        try {
            console.log('[Cache] Fetching guides from network...');
            const data = await apiService<StudyGuide[]>('/data/guides');
            setGuides(data);
            guidesRef.current = data;
            hasFetchedGuidesRef.current = true;

            // Persist to IndexedDB for future loads
            await setCache(CACHE_KEY_GUIDES, data);
            console.log(`[Cache] Persisted ${data.length} guides to IndexedDB`);

            return data;
        } catch (error) {
            console.error("Failed to fetch guides:", error);
            // Mark as fetched even on error to prevent infinite retry loops
            hasFetchedGuidesRef.current = true;
            return [];
        } finally {
            setIsLoading(false);
            setHasFetched(true);
        }
    }, []);

    return (
        <PastQuestionsContext.Provider value={{ papers, guides, isLoading, hasFetched, fetchPapers, fetchFullPaper, prefetchPapers, fetchGuides }}>
            {children}
        </PastQuestionsContext.Provider>
    );
};

export const usePastQuestions = () => {
    const context = useContext(PastQuestionsContext);
    if (context === undefined) {
        throw new Error('usePastQuestions must be used within a PastQuestionsProvider');
    }
    return context;
};
