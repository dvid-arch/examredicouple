import React from 'react';
import { practiceService } from '@/services/practice-service';
import { performanceService } from '@/services/performance-service';
import { 
  PracticeSessionCompletion, 
  PracticeSetupDraft, 
  PreparedPracticeSession 
} from '@/types/practice';

export type PracticeState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; session: PreparedPracticeSession }
  | { kind: 'empty'; message: string }
  | { kind: 'error'; message: string };

export function usePracticeSession() {
  const [state, setState] = React.useState<PracticeState>({ kind: 'idle' });

  const startSession = React.useCallback(async (draft: PracticeSetupDraft) => {
    setState({ kind: 'loading' });

    try {
      const papers = await practiceService.fetchPapers();
      const session = practiceService.buildSession(draft, papers);

      if (session.questions.length === 0) {
        setState({
          kind: 'empty',
          message: 'No questions matched this setup. Try expanding your year range.',
        });
        return;
      }

      setState({ kind: 'ready', session });
    } catch (error) {
      setState({
        kind: 'error',
        message: (error as Error).message || 'Unable to prepare your session right now.',
      });
    }
  }, []);

  const completeSession = React.useCallback(async (payload: PracticeSessionCompletion) => {
    await performanceService.savePracticeResult(payload);
  }, []);

  const reset = React.useCallback(() => setState({ kind: 'idle' }), []);

  return { state, startSession, completeSession, reset };
}
