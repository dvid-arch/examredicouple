import { useState, useEffect } from 'react';

/**
 * Hook to detect if a visitor has been to the site before or is logged in.
 * It uses localStorage to persist the "visited" state.
 */
export const useReturningUser = () => {
    const [isReturning, setIsReturning] = useState(false);

    useEffect(() => {
        try {
            const hasToken = !!localStorage.getItem('refreshToken');
            const hasVisited = !!localStorage.getItem('examredi_visited');
            
            setIsReturning(hasToken || hasVisited);

            // Mark as visited for future loads if not already marked
            if (!hasVisited) {
                // Use a small timeout to ensure we don't flip the state 
                // within the same session's first render if possible, 
                // though usually we want it marked for the NEXT session.
                localStorage.setItem('examredi_visited', '1');
            }
        } catch (e) {
            // localStorage may be blocked in private/incognito — treat as new
            console.warn("localStorage access blocked", e);
        }
    }, []);

    return isReturning;
};
