import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { progressService } from '../services/progressService';
import { courseService } from '../services/courseService';

export default function CourseProgressSummaryPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const res = await courseService.getAll({ per_page: 100 });
        setCourses(res.data.data);
      } catch {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const loadSummary = async () => {
      setLoadingSummary(true);
      setError('');
      try {
        const res = await progressService.getCourseProgressSummary(selectedCourse);
        setSummary(res.data);
      } catch {
        setError('Failed to load course summary.');
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [selectedCourse]);

  return (
    <AppShell title="Course Progress Summary" eyebrow="Learning Progress Monitoring">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">-- Choose a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.slug}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {loadingSummary && (
          <div className="text-center text-sm text-slate-500">Loading summary...</div>
        )}

        {summary && (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{summary.summary.total_students}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Active</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{summary.summary.active_students}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{summary.summary.completed_students}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Avg Progress</p>
                <p className="mt-2 text-2xl font-bold text-teal-600">{summary.summary.average_progress}%</p>
              </div>
            </section>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">Lesson Completion ({summary.summary.total_lessons} lessons)</h3>
              </div>

              {summary.lessons.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No lessons found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Order</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Lesson</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Duration</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Completed</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Completion Rate</th>
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
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
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
              )}
            </div>

            <div>
              <Link
                to={`/courses/${summary.course.slug}/progress`}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                View detailed course progress &rarr;
              </Link>
            </div>
          </>
        )}

        {!loading && !loadingSummary && !summary && selectedCourse === '' && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">Select a course to view its progress summary.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
