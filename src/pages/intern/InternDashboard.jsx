/**
 * InternDashboard — with Days Remaining stat card.
 */
import React, { useEffect, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useAttendanceStore from '../../store/attendanceStore';
import useTaskStore from '../../store/taskStore';
import useAnnouncementStore from '../../store/announcementStore';
import useRatingStore from '../../store/ratingStore';
import useInternStore from '../../store/internStore';
import { useToast } from '../../hooks/useToast';
import { StatusBadge, StarRating } from '../../components/common';
import { formatDate } from '../../utils/dateUtils';

const TASK_STATUSES = ['To Do', 'In Progress', 'Under Review', 'Completed'];

const IMPORTANCE_STYLES = {
  Info:      'border-l-blue-500 bg-blue-50',
  Warning:   'border-l-amber-500 bg-amber-50',
  Important: 'border-l-red-500 bg-red-50',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function InternDashboard() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { records, loadAttendance } = useAttendanceStore();
  const { tasks, loadTasks, updateTaskStatus } = useTaskStore();
  const { announcements, loadAnnouncements, getVisibleAnnouncements } = useAnnouncementStore();
  const { ratings, loadRatings } = useRatingStore();
  const { interns, loadInterns } = useInternStore();
  const { showToast } = useToast();

  useEffect(() => {
    loadAttendance();
    loadTasks();
    loadAnnouncements();
    loadRatings();
    loadInterns();
  }, []);

  const internId   = currentUser?.id;
  const internName = currentUser?.name ?? 'Intern';
  const department = currentUser?.department ?? '';

  // Get full intern record for endDate
  const internRecord = useMemo(
    () => interns.find((i) => i.id === internId) ?? currentUser,
    [interns, internId, currentUser]
  );

  // Days remaining in internship
  const daysRemaining = useMemo(() => {
    const endDate = internRecord?.endDate;
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }, [internRecord]);

  const myRecords = useMemo(() => records.filter((r) => r.internId === internId), [records, internId]);
  const attPct = myRecords.length > 0
    ? Math.round((myRecords.filter((r) => r.status === 'Present').length / myRecords.length) * 100)
    : 0;
  const todayAtt = myRecords.find((r) => r.date === today());

  const myTasks = useMemo(() => tasks.filter((t) => t.assignedTo?.includes(internId)), [tasks, internId]);
  const completedCount = myTasks.filter((t) => t.status === 'Completed').length;
  const pendingCount   = myTasks.filter((t) => t.status !== 'Completed').length;
  const recentTasks    = useMemo(
    () => [...myTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [myTasks]
  );

  const visibleAnnouncements = useMemo(
    () => getVisibleAnnouncements(department).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [announcements, department]
  );

  const latestRating = useMemo(
    () => ratings.filter((r) => r.internId === internId).sort((a, b) => (b.ratedAt || '').localeCompare(a.ratedAt || ''))[0],
    [ratings, internId]
  );

  function handleStatusChange(taskId, newStatus) {
    updateTaskStatus(taskId, newStatus, internName);
    showToast('Task status updated.', 'success');
  }

  function daysColor(d) {
    if (d === null) return 'text-gray-500';
    if (d > 14) return 'text-blue-600';
    if (d > 0)  return 'text-amber-600';
    return 'text-danger';
  }

  function daysLabel(d) {
    if (d === null) return '—';
    if (d > 0) return d;
    if (d === 0) return 'Last Day!';
    return 'Ended';
  }

  return (
    <section aria-label="Intern Dashboard">
      {/* Welcome banner */}
      <div className="bg-primary rounded-xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {internName}!</h1>
        <p className="text-white/70 text-sm">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Attendance"     value={`${attPct}%`}          color="text-green-600" />
        <StatCard label="Tasks Assigned" value={myTasks.length}         color="text-accent" />
        <StatCard label="Completed"      value={completedCount}         color="text-purple-600" />
        <StatCard label="Pending"        value={pendingCount}           color="text-amber-600" />
        <StatCard label="Days Remaining" value={daysLabel(daysRemaining)} color={daysColor(daysRemaining)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's attendance */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-3">Today's Attendance</h2>
            {todayAtt ? (
              <div className="flex items-center gap-3">
                <StatusBadge status={todayAtt.status} />
                <span className="text-sm text-textSecondary">Marked by {todayAtt.markedBy}</span>
              </div>
            ) : (
              <p className="text-sm text-textSecondary">Not marked yet for today.</p>
            )}
          </div>

          {/* Recent tasks */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-4">Recent Tasks</h2>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-textSecondary">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-textPrimary truncate">{task.title}</p>
                      <p className="text-xs text-textSecondary">Due: {formatDate(task.dueDate)}</p>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent shrink-0"
                      aria-label={`Update status for ${task.title}`}
                    >
                      {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-3">Announcements</h2>
            {visibleAnnouncements.length === 0 ? (
              <p className="text-sm text-textSecondary">No announcements.</p>
            ) : (
              <div className="space-y-3">
                {visibleAnnouncements.map((ann) => (
                  <div key={ann.id} className={`border-l-4 rounded-r-lg p-3 ${IMPORTANCE_STYLES[ann.importance] ?? 'border-l-gray-400 bg-gray-50'}`}>
                    <p className="text-sm font-medium text-textPrimary">{ann.title}</p>
                    <p className="text-xs text-textSecondary mt-0.5 line-clamp-2">{ann.body}</p>
                    <p className="text-xs text-textSecondary mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest rating */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-3">Latest Rating</h2>
            {latestRating ? (
              <div>
                <StarRating value={latestRating.rating} readOnly size="md" />
                <p className="text-sm text-textPrimary mt-2">{latestRating.comment || 'No feedback.'}</p>
                <p className="text-xs text-textSecondary mt-1">by {latestRating.ratedBy}</p>
              </div>
            ) : (
              <p className="text-sm text-textSecondary">No ratings yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="text-xs text-textSecondary mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default InternDashboard;
