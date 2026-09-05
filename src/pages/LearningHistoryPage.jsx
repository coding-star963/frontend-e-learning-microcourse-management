import { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import Alert from '../components/Alert';
import { progressService } from '../services/progressService';
import api from '../services/api';

export default function LearningHistoryPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await api.get('/users', { params: { role: 'student', per_page: 100 } });
        setStudents(res.data.data);
      } catch {
        setError('Failed to load students.');
      }
    };

    loadStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setError('');
      try {
        const res = await progressService.getLearningHistory(selectedStudent, { per_page: 15 });
        setHistory(res.data.data);
        setPagination(res.data.meta);
      } catch {
        setError('Failed to load learning history.');
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [selectedStudent]);

  const handlePageChange = (page) => {
    if (!selectedStudent) return;
    setLoadingHistory(true);
    progressService.getLearningHistory(selectedStudent, { page, per_page: 15 })
      .then((res) => {
        setHistory(res.data.data);
        setPagination(res.data.meta);
      })
      .catch(() => setError('Failed to load learning history.'))
      .finally(() => setLoadingHistory(false));
  };

  return (
    <AppShell title="Learning History" eyebrow="Learning Progress Monitoring">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">Select Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
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

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {loadingHistory ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {selectedStudent ? 'No learning history found.' : 'Select a student to view their learning history.'}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-slate-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <span className="text-sm">&#10003;</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950">{item.lesson.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {item.lesson.course.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          Lesson {item.lesson.order}
                        </span>
                        {item.lesson.duration_formatted && (
                          <span className="text-xs text-slate-400">
                            {item.lesson.duration_formatted}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString()
                          : '-'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleTimeString()
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                  <p className="text-sm text-slate-500">
                    Showing {pagination.from} to {pagination.to} of {pagination.total}
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          page === pagination.current_page
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
