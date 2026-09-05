import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { progressService } from '../services/progressService';
import { courseService } from '../services/courseService';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-600',
  suspended: 'bg-amber-50 text-amber-700',
};

export default function CourseProgressPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('students');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [courseRes, progressRes] = await Promise.all([
          courseService.getById(slug),
          progressService.getCourseProgress(slug),
        ]);
        setCourse(courseRes.data.data);
        setProgressData(progressRes.data);
      } catch {
        setError('Failed to load course progress.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  useEffect(() => {
    if (tab !== 'lessons') return;

    const loadSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await progressService.getCourseProgressSummary(slug);
        setSummary(res.data);
      } catch {
        setError('Failed to load lesson summary.');
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [slug, tab]);

  if (loading) {
    return (
      <AppShell title="Course Progress" eyebrow="Learning Progress Monitoring">
        <div className="text-center text-sm text-slate-500">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={course ? `Progress - ${course.title}` : 'Course Progress'} eyebrow="Learning Progress Monitoring">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <Link to={`/courses/${slug}`} className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to course
          </Link>
        </div>

        {progressData && (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{progressData.summary.total_students}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Active</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{progressData.summary.active_students}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{progressData.summary.completed_students}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg Progress</p>
                <p className="mt-2 text-2xl font-bold text-teal-600">{progressData.summary.average_progress}%</p>
              </div>
            </section>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setTab('students')}
                  className={`px-4 py-3 text-sm font-medium ${
                    tab === 'students'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setTab('lessons')}
                  className={`px-4 py-3 text-sm font-medium ${
                    tab === 'lessons'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Lesson Completion
                </button>
              </div>

              {tab === 'students' && (
                <>
                  {progressData.students.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No students enrolled.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">Student</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Progress</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Completed</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Last Accessed</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {progressData.students.map((item) => (
                            <tr key={item.enrollment_id} className="hover:bg-slate-50">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-950">{item.student.name}</p>
                                <p className="text-xs text-slate-500">{item.student.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColors[item.status]}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${item.progress}%` }} />
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">{item.progress}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {item.completed_lessons}/{item.total_lessons}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {item.last_accessed_at
                                  ? new Date(item.last_accessed_at).toLocaleDateString()
                                  : 'Never'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    to={`/students/${item.student.id}/progress`}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                  >
                                    Progress
                                  </Link>
                                  <Link
                                    to={`/enrollments/${item.enrollment_id}`}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                  >
                                    Enrollment
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {tab === 'lessons' && (
                <>
                  {loadingSummary ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
                  ) : summary && summary.lessons.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">Order</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Lesson</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Duration</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Completed</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {summary.lessons.map((lesson) => (
                            <tr key={lesson.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm text-slate-600">{lesson.order}</td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-950">{lesson.title}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {lesson.duration_formatted || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {lesson.completed_students}/{lesson.total_students}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-teal-600"
                                      style={{ width: `${lesson.completion_rate}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-slate-600">{lesson.completion_rate}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-500">No lessons found.</div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
