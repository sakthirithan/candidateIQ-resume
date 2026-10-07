/**
 * CandidateIQ Job Attention & Requisition Health Service
 * Centralized utility for evaluating attention rules, health status, and metrics.
 */

const STALE_DAYS_THRESHOLD = 30;
const NO_APP_DAYS_THRESHOLD = 7;
const CLOSING_SOON_DAYS = 7;

/**
 * Checks if a single job requisition needs attention.
 * @param {Object} job - Mongoose Job document or plain JS object
 * @param {number} appCount - Real application count for this job
 * @param {Date} [now=new Date()] - Reference date
 * @returns {Object} { needsAttention: boolean, reasons: string[], isStale: boolean, isNoApp: boolean, isClosingSoon: boolean, isOverdue: boolean }
 */
function evaluateJobAttention(job, appCount = 0, now = new Date()) {
  const reasons = [];
  if (!job || job.status !== 'published') {
    return { needsAttention: false, reasons, isStale: false, isNoApp: false, isClosingSoon: false, isOverdue: false };
  }

  const createdAt = new Date(job.createdAt || Date.now());
  const nowMs = now.getTime();
  const createdMs = createdAt.getTime();
  const ageDays = (nowMs - createdMs) / (1000 * 60 * 60 * 24);

  // Rule 1: Stale Requisition (published > 30 days)
  const isStale = ageDays > STALE_DAYS_THRESHOLD;
  if (isStale) {
    reasons.push(`Published for over ${STALE_DAYS_THRESHOLD} days (${Math.floor(ageDays)} days open)`);
  }

  // Rule 2: No Applications (published > 7 days with 0 applications)
  const isNoApp = ageDays >= NO_APP_DAYS_THRESHOLD && appCount === 0;
  if (isNoApp) {
    reasons.push(`No applications received after ${Math.floor(ageDays)} days published`);
  }

  let isClosingSoon = false;
  let isOverdue = false;

  if (job.closingDate) {
    const closingMs = new Date(job.closingDate).getTime();
    const daysUntilClosing = (closingMs - nowMs) / (1000 * 60 * 60 * 24);

    if (daysUntilClosing < 0) {
      isOverdue = true;
      reasons.push(`Closing date has passed (${Math.abs(Math.floor(daysUntilClosing))} days ago)`);
    } else if (daysUntilClosing <= CLOSING_SOON_DAYS) {
      isClosingSoon = true;
      reasons.push(`Closing soon in ${Math.ceil(daysUntilClosing)} day(s)`);
    }
  }

  const needsAttention = isStale || isNoApp || isClosingSoon || isOverdue;

  return {
    needsAttention,
    reasons,
    isStale,
    isNoApp,
    isClosingSoon,
    isOverdue,
    ageDays: Math.floor(ageDays)
  };
}

/**
 * Calculates aggregated summary metrics for a list of jobs and application count map.
 */
function calculateJobMetrics(jobs = [], appCountMap = {}, now = new Date()) {
  let activeRequisitions = 0;
  let needsAttentionCount = 0;
  let closingSoonCount = 0;

  jobs.forEach(job => {
    if (job.status === 'published') {
      activeRequisitions++;

      const count = appCountMap[job._id.toString()] || 0;
      const evalResult = evaluateJobAttention(job, count, now);

      if (evalResult.needsAttention) {
        needsAttentionCount++;
      }

      if (evalResult.isClosingSoon) {
        closingSoonCount++;
      }
    }
  });

  return {
    activeRequisitions,
    needsAttentionCount,
    closingSoonCount
  };
}

module.exports = {
  evaluateJobAttention,
  calculateJobMetrics,
  STALE_DAYS_THRESHOLD,
  NO_APP_DAYS_THRESHOLD,
  CLOSING_SOON_DAYS
};
