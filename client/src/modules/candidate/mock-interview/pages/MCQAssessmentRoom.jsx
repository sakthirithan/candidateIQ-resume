import React from 'react';
import Frame8AssessmentContainer from '../components/Frame8AssessmentContainer';

export default function MCQAssessmentRoom({
  assessmentTitle = 'CandidateIQ Technical Assessment',
  questions = [],
  initialAnswers = {},
  durationMinutes = 45,
  onSaveAnswer,
  onCompleteAssessment,
  onCloseAssessment,
  loading = false,
  submitting = false
}) {
  return (
    <Frame8AssessmentContainer
      assessmentTitle={assessmentTitle}
      questions={questions}
      initialAnswers={initialAnswers}
      durationMinutes={durationMinutes}
      onSaveAnswer={onSaveAnswer}
      onComplete={(answers) => {
        if (onCompleteAssessment) onCompleteAssessment(answers);
      }}
      onBackToDashboard={onCloseAssessment}
    />
  );
}
