import React from 'react';
import { getCurrentUser, isAuthenticated } from '@/utils/auth';

function ProtectedRoute({ allowedRoles, currentTab, children, onRedirect, onRequirePayment }) {
  const user = getCurrentUser();

  if (!isAuthenticated() || !user) {
    if (onRedirect) onRedirect('landing');
    return null;
  }

  // Check HR payment status requirement
  if (['hr', 'recruiter'].includes(user.role) && user.paymentStatus === 'pending') {
    if (onRequirePayment) onRequirePayment(user);
  }

  // Role check
  if (allowedRoles) {
    const expandedAllowed = allowedRoles.flatMap(r => (r === 'hr' || r === 'recruiter') ? ['hr', 'recruiter'] : [r]);
    if (!expandedAllowed.includes(user.role)) {
      // Redirect to legitimate workspace based on role
      if (user.role === 'candidate') {
        if (onRedirect) onRedirect('dashboard');
      } else if (['hr', 'recruiter'].includes(user.role)) {
        if (onRedirect) onRedirect('recruiter-dashboard');
      } else if (user.role === 'admin') {
        if (onRedirect) onRedirect('admin-dashboard');
      }
      return null;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
