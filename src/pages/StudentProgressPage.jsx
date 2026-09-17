import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { progressService } from '../services/progressService';
import api from '../services/api';

export default function StudentProgressPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users', { params: { role: 'student', per_page: 100 } });
        setStudents(res.data.data);
      } catch {
        setError('Failed to load students.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleStudentSelect = async (studentId) => {
    if (!studentId) {
      setSelectedStudent(null);
      setProgress(null);
      return;
    }

    setSelectedStudent(studentId);
    setLoadingProgress(true);
    setError('');
    try {
      const res = await progressService.getStudentProgress(studentId);
      setProgress(res.data);
    } catch {
      setError('Failed to load student progress.');
    } finally {
      setLoadingProgress(false);
    }
  };

  return (
    <AppShell title="Student Progress" eyebrow="Learning Progress Monitoring">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">Select Student</label>
          <select
            value={selectedStudent || ''}
            onChange={(e) => handleStudentSelect(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">-- Choose a student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>

        {loadingProgress && (
          <div className="text-center text-sm text-slate-500">Loading progress...</div>
        )}

        {progress && (
          <>
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
                    <div key={item.enrollment_id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
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
                          <span className="text-xs text-slate-400">
                            {item.completed_lessons}/{item.total_lessons} lessons
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-600">{item.progress}%</p>
                        </div>
                        <Link
                          to={`/enrollments/${item.enrollment_id}`}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!loading && !loadingProgress && !progress && selectedStudent === null && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">Select a student to view their progress.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
