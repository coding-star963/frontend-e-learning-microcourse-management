import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { progressService } from '../services/progressService';

export default function StudentProgressDetailPage() {
  const { id } = useParams();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await progressService.getStudentProgress(id);
        setProgress(res.data);
      } catch {
        setError('Failed to load student progress.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Student Progress" eyebrow="Learning Progress Monitoring">
        <div className="text-center text-sm text-slate-500">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={progress ? `Progress - ${progress.student.name}` : 'Student Progress'} eyebrow="Learning Progress Monitoring">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <Link to="/progress/students" className="text-sm text-slate-600 hover:text-teal-600">
            &larr; Back to students
          </Link>
        </div>

        {progress && (
          <>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                  {progress.student.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{progress.student.name}</h2>
                  <p className="text-sm text-slate-500">{progress.student.email}</p>
                </div>
              </div>
            </div>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Enrolled Courses</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{progress.summary.total_courses}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{progress.summary.completed_courses}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg Progress</p>
                <p className="mt-2 text-2xl font-bold text-teal-600">{progress.summary.average_progress}%</p>
              </div>
            </section>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">Course Progress</h3>
              </div>

              {progress.courses.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No active enrollments.</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {progress.courses.map((item) => (
                    <div key={item.enrollment_id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/courses/${item.course.slug}`}
                            className="font-semibold text-slate-950 hover:text-teal-600"
                          >
                            {item.course.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">{item.course.category}</span>
                            <span className="text-xs text-slate-400">by {item.course.teacher}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              {item.completed_lessons}/{item.total_lessons} lessons
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-teal-600"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600">{item.progress}%</span>
                            </div>
                          </div>
                          <Link
                            to={`/enrollments/${item.enrollment_id}`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
