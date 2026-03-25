import React from 'react';
import { AppScreen } from '@/components/ui';
import { QuestionSearch } from '@/features/search/components/QuestionSearch';

export default function SearchScreen() {
  return (
    <AppScreen>
      <QuestionSearch />
    </AppScreen>
  );
}
