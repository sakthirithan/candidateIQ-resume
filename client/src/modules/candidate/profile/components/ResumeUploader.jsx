import React from 'react';
import ResumeIntelligence from './ResumeIntelligence';

function ResumeUploader({ onProfileUpdated, onNavigateToProfile }) {
  return <ResumeIntelligence onProfileUpdated={onProfileUpdated} onNavigateToProfile={onNavigateToProfile} />;
}

export default ResumeUploader;
