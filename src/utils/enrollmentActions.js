// Enrollment actions on the web portal and the status each one sets.
export const enrollmentActionStatus = {
  complete: 'completed',
  cancel: 'cancelled',
  suspend: 'suspended',
  activate: 'active',
};

/**
 * Confirmation text for an enrollment action: what it does and what follows.
 * Every action notifies the student in the mobile app.
 */
export function enrollmentActionConfirm(action, enrollment, extra = {}) {
  const student = enrollment?.user?.name || 'the student';
  const course = enrollment?.course?.title || 'this course';
  const notify = `${student} is notified in the mobile app right away.`;

  switch (action) {
    case 'complete':
      return {
        title: 'Mark enrollment as completed?',
        description: `${student}'s enrollment in "${course}" will be marked as completed.`,
        consequences: [
          'Status changes to Completed and progress is set to 100%.',
          'The student keeps access to the course and its lessons.',
          notify,
        ],
        confirmLabel: 'Mark completed',
        tone: 'primary',
      };
    case 'suspend':
      return {
        title: 'Suspend this enrollment?',
        description: `${student}'s access to "${course}" will be paused.`,
        consequences: [
          'The student can no longer open the course lessons, videos or files.',
          'New lesson progress is not recorded; existing progress is kept.',
          'The student cannot re-enroll themself until you reactivate it.',
          notify,
        ],
        confirmLabel: 'Suspend enrollment',
        tone: 'warning',
      };
    case 'cancel':
      return {
        title: 'Cancel this enrollment?',
        description: `${student}'s enrollment in "${course}" will be cancelled.`,
        consequences: [
          'The student loses access to the course lessons, videos and files.',
          'Progress already made is kept on the record but no longer updated.',
          'Cancelled enrollments are left out of progress summaries and the student dashboard.',
          'The student cannot re-enroll themself; you can reactivate the enrollment later.',
          notify,
        ],
        confirmLabel: 'Cancel enrollment',
        tone: 'warning',
      };
    case 'activate':
      return {
        title: 'Reactivate this enrollment?',
        description: `${student}'s enrollment in "${course}" becomes active again.`,
        consequences: [
          'The student regains access to the course lessons and can record progress.',
          notify,
        ],
        confirmLabel: 'Reactivate',
        tone: 'primary',
      };
    case 'delete':
      return {
        title: 'Delete this enrollment record?',
        description: `The record of ${student} in "${course}" will be permanently deleted. This cannot be undone.`,
        consequences: [
          'All lesson progress for this enrollment is deleted with it.',
          'The course disappears from the student\'s "My Courses" in the mobile app.',
          'The student may enroll in the course again from the catalog and start over.',
          notify,
        ],
        confirmLabel: 'Delete permanently',
        tone: 'danger',
      };
    case 'progress':
      return {
        title: 'Update progress manually?',
        description: `${student}'s progress in "${course}" will be set to ${extra.progress}%.`,
        consequences: [
          'This overrides the percentage calculated from completed lessons.',
          'It is recalculated the next time the student completes a lesson or the course lessons change.',
        ],
        confirmLabel: 'Update progress',
        tone: 'primary',
      };
    default:
      return { title: 'Confirm action?', confirmLabel: 'Confirm' };
  }
}
