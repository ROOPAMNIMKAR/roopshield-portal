/**
 * AdminDashboard — Admin overview with 6 stat cards including Active Interns + Pending Leave.
 */
import React, { useEffect, useMemo } from 'react';
import useInternStore from '../../store/internStore';
import useAttendanceStore from '../../store/attendanceStore';
import useTaskStore from '../../store/taskStore';
import useHRStore from '../../store/hrStore';
import { StatusBadge } from '../../components/common';

const TASK_STATUSES = ['To Do', 'In Progress', 'Under Review', 'Completed'];
const STATUS_COLORS = {
  'To Do':        'bg-gray-400',
  'In Progress':  'bg-blue-500',
  'Under Review': 'bg-amber-500',
  'Completed':    'bg-green-500',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function AdminDashboard() {
  const { interns, loadInterns } = useInternStore();
  const { records, loadAttendance } = useAttendanceStore();
  const { tasks, loadTasks } = useTaskStore();
  const { leaveRequests, loadAll: loadHR } = useHRStore();

  useEffect(() => {
    loadInterns();
    loadAttendance();
    loadTasks();
    loadHR();
  }, []);

  const todayStr = today();

  const totalInterns    = interns.length;
  const activeInterns   = interns.filter((i) => i.status === 'Active').length;
  const presentToday    = records.filter((r) => r.date === todayStr && r.status === 'Present').length;
  const tasksAssigned   = tasks.length;
  const completedTasks  = tasks.filter((t) => t.status === 'Completed').length;
  const pendingLeave    = leaveRequests.filter((r) => r.status === 'Pending').length;

  const recentAttendance = useMemo(() =>
    [...records].sort((a, b) => new Date(b.markedAt ?? 0) - new Date(a.markedAt ?? 0)).slice(0, 5),
    [records]
  );

  const taskDist = useMemo(() =>
    TASK_STATUSES.map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
    })),
    [tasks]
  );
  const maxCount = Math.max(...taskDist.map((d) => d.count), 1);

  const activityFeed = useMemo(() => {
    const events = [];
    interns.forEach((i) => events.push({ ts: i.createdAt, label: `Intern added: ${i.name}`, actor: 'Admin' }));
    tasks.forEach((t) => events.push({ ts: t.createdAt, label: `Task assigned: ${t.title}`, actor: t.createdBy ?? 'Admin' }));
    records.forEach((r) => events.push({ ts: r.markedAt, label: `Attendance marked for ${r.internName} (${r.date})`, actor: r.markedBy ?? 'Admin' }));
    return events.filter((e) => e.ts).sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 5);
  }, [interns, tasks, records]);

  return (
    <section aria-label="Admin Dashboard">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Dashboard</h1>

      {/* 6 Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Interns"   value={totalInterns}   icon="👥" color="text-accent" />
        <StatCard label="Active Interns"  value={activeInterns}  icon="🟢" color="text-green-600" />
        <StatCard label="Present Today"   value={presentToday}   icon="✅" color="text-green-700" />
        <StatCard label="Tasks Assigned"  value={tasksAssigned}  icon="📋" color="text-amber-600" />
        <StatCard label="Completed Tasks" value={completedTasks} icon="🏆" color="text-purple-600" />
        <StatCard label="Pending Leave"   value={pendingLeave}   icon="🕐" color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Attendance */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-base font-semibold text-textPrimary mb-4">Recent Attendance</h2>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-textSecondary">No attendance records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-textSecondary">Intern</th>
                    <th className="text-left py-2 text-xs font-medium text-textSecondary">Date</th>
                    <th className="text-left py-2 text-xs font-medium text-textSecondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentAttendance.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 font-medium text-textPrimary">{r.internName}</td>
                      <td className="py-2 text-textSecondary">{r.date}</td>
                      <td className="py-2"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Status Chart */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-base font-semibold text-textPrimary mb-4">Task Status</h2>
          <div className="space-y-3">
            {taskDist.map(({ status, count }) => (
              <div key={status}>
                <div className="flex justify-between text-xs text-textSecondary mb-1">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_COLORS[status]}`}
                    style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemax={maxCount}
                    aria-label={`${status}: ${count} tasks`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-textPrimary mb-4">Recent Activity</h2>
        {activityFeed.length === 0 ? (
          <p className="text-sm text-textSecondary">No activity yet.</p>
        ) : (
          <ol className="space-y-3">
            {activityFeed.map((event, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm text-textPrimary">{event.label}</p>
                  <p className="text-xs text-textSecondary">{event.actor} · {new Date(event.ts).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-textSecondary">{label}</p>
        <span className="text-xl" aria-hidden="true">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default AdminDashboard;
