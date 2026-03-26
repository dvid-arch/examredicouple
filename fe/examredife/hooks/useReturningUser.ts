import { useState, useEffect } from 'react';

/**
 * Module-level cache to ensure all instances of the hook get 
 * the same value within the same page load/session.
 */
let sessionReturningStatus: boolean | null = null;

/**
 * Hook to detect if a visitor has been to the site before or is logged in.
 * It uses localStorage to persist the "visited" state.
 */
export const useReturningUser = () => {
    // Initialize with cached value if available
    const [isReturning, setIsReturning] = useState<boolean>(
        sessionReturningStatus !== null ? sessionReturningStatus : false
    );

    useEffect(() => {
        // If already determined for this session, don't re-calculate or mark again
        if (sessionReturningStatus !== null) {
            if (isReturning !== sessionReturningStatus) {
                setIsReturning(sessionReturningStatus);
            }
            return;
        }

        try {
            const hasToken = !!localStorage.getItem('refreshToken');
            const hasVisited = !!localStorage.getItem('examredi_visited');
            
            const status = hasToken || hasVisited;
            
            // Cache the status for all other hook instances in this session
            sessionReturningStatus = status;
            setIsReturning(status);

            // Mark as visited for FUTURE sessions
            // If they are NEW, we mark them now, but the current session status 
            // remains 'false' for all components thanks to the cache.
            if (!hasVisited) {
                localStorage.setItem('examredi_visited', '1');
            }
        } catch (e) {
            // localStorage may be blocked in private/incognito — treat as new
            console.warn("localStorage access blocked", e);
            sessionReturningStatus = false;
            setIsReturning(false);
        }
    }, [isReturning]);

    return isReturning;
};
