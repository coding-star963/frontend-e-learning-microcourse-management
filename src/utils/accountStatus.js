// Account status from the API: active, suspended or deactivated.
export const accountStatusLabels = {
  active: 'Active',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
};

export const accountStatusBadge = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  suspended: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  deactivated: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export const accountStatusDot = {
  active: 'bg-emerald-500',
  suspended: 'bg-amber-500',
  deactivated: 'bg-rose-500',
};

export function accountStatusOf(user) {
  if (user?.account_status) return user.account_status;
  return user?.is_active === false ? 'deactivated' : 'active';
}

// Confirmation text for account actions (suspend, reactivate, deactivate, activate).
export function accountActionConfirm(action, user) {
  const name = user?.name || 'this user';
  const isStudent = user?.role === 'student';
  switch (action) {
    case 'suspend':
      return {
        title: `Suspend ${name}'s account?`,
        description: 'The account is kept but cannot be used until it is reactivated.',
        consequences: [
          isStudent
            ? 'They are signed out of the mobile app right away and see a suspension notice.'
            : 'They are signed out of the web portal right away and see a suspension notice.',
          'Sign-in attempts are refused until the account is reactivated.',
          'Enrollments, progress and other records are kept unchanged.',
        ],
        confirmLabel: 'Suspend account',
        tone: 'warning',
      };
    case 'unsuspend':
      return {
        title: `Reactivate ${name}'s account?`,
        description: 'The suspension is lifted and they can sign in again.',
        consequences: isStudent
          ? ['They can sign in to the mobile app again.', 'They receive an "Account reactivated" notification.']
          : ['They can sign in to the web portal again.'],
        confirmLabel: 'Reactivate account',
        tone: 'primary',
      };
    case 'deactivate':
      return {
        title: `Deactivate ${name}'s account?`,
        description: 'Deactivation closes the account until an administrator activates it again.',
        consequences: [
          'They are signed out on every device immediately.',
          'Sign-in attempts are refused.',
          'Their records are kept.',
        ],
        confirmLabel: 'Deactivate',
        tone: 'danger',
      };
    default:
      return {
        title: `Activate ${name}'s account?`,
        description: 'The account becomes active and can sign in again.',
        consequences: ['Any suspension on the account is also lifted.'],
        confirmLabel: 'Activate',
        tone: 'primary',
      };
  }
}
