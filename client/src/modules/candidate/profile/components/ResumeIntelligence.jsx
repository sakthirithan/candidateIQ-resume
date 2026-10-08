import React from 'react';
import { ResumeHistory } from './ResumeHistory';

export function ResumeIntelligence({ onProfileUpdated, onNavigateToProfile }) {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <ResumeHistory
        onUpdateCandidateProfile={(newProfile) => {
          if (onProfileUpdated) onProfileUpdated(newProfile);
          if (onNavigateToProfile) onNavigateToProfile();
        }}
      />
    </div>
  );
}

export default ResumeIntelligence;
