/**
 * ProgressModule — Admin work process & progress page.
 *
 * Features:
 * - Three overview stat cards
 * - Per-intern progress table with Score
 * - ContributionGraph (12-week heatmap)
 * - "Rate Intern" button → StarRating + feedback form
 * - Past ratings accordion grouped by week
 *
 * Requirements: 10.1–10.6
 */
import React, { useEffect, useState, useMemo } from 'react';
import useTaskStore from '../../store/taskStore';
import useInternStore from '../../store/internStore';
import useRatingStore from '../../store/ratingStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, StarRating } from '../../components/common';
import ContributionGraph from '../../components/charts/ContributionGraph';
import { isOverdue, toISOWeek } from '../../utils/dateUtils';

function ProgressModule() {
  const { tasks, loadTasks } = useTaskStore();
  const { interns, loadInterns } = useInternStore();
  const { ratings, loadRatings, saveRating, getRatingsForIntern } = useRatingStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [rateIntern, setRateIntern] = useState(null);
  const [ratingVal, setRatingVal] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingErr, setRatingErr] = useState('');
  const [expandedIntern, setExpandedIntern] = useState(null);

  useEffect(() => {
    loadTasks();
    loadInterns();
    loadRatings();
  }, []);

  /* ── Overview stats ── */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedOnTime = tasks.filter(
    (t) => t.status === 'Completed' && t.dueDate && !isOverdue(t.dueDate)
  ).length;
  const onTimeRate = completedTasks > 0 ? Math.round((completedOnTime / completedTasks) * 100) : 0;

  const avgDuration =
    totalTasks > 0
      ? Math.round(tasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0) / totalTasks)
      : 0;

  /* ── Per-intern rows ── */
  const internRows = useMemo(() =>
    interns.map((intern) => {
      const own = tasks.filter((t) => t.assignedTo?.includes(intern.id));
      const completed = own.filter((t) => t.status === 'Completed').length;
      const inProgress = own.filter((t) => t.status === 'In Progress').length;
      const overdue = own.filter(
        (t) => t.status !== 'Completed' && isOverdue(t.dueDate)
      ).length;
      const score = own.length > 0 ? Math.round((completed / own.length) * 100) : 0;
      return { intern, total: own.length, completed, inProgress, overdue, score };
    }),
    [interns, tasks]
  );

  /* ── Activity data for ContributionGraph ── */
  const activityData = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      (t.workLogs ?? []).forEach((log) => {
        if (log.date) map[log.date] = (map[log.date] ?? 0) + 1;
      });
    });
    return map;
  }, [tasks]);

  /* ── Rating submit ── */
  function handleRateSubmit(e) {
    e.preventDefault();
    if (!ratingVal) { setRatingErr('Please select a star rating.'); return; }
    const week = toISOWeek(new Date());
    saveRating({
      internId: rateIntern.id,
      rating: ratingVal,
      feedback,
      week,
      createdBy: currentUser?.name ?? 'Admin',
    });
    showToast(`Rating saved for ${rateIntern.name}.`, 'success');
    setRateIntern(null);
    setRatingVal(0);
    setFeedback('');
    setRatingErr('');
  }

  return (
    <section aria-label="Work Process & Progress">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Work Process</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Overall Completion Rate" value={`${overallCompletion}%`} color="text-accent" />
        <StatCard label="On-Time Delivery Rate" value={`${onTimeRate}%`} color="text-green-600" />
        <StatCard label="Avg Task Duration" value={`${avgDuration}h`} color="text-amber-600" />
      </div>

      {/* Per-intern table */}
      <div className="bg-white rounded-xl border border-border overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Intern', 'Assigned', 'Completed', 'In Progress', 'Overdue', 'Score', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-textSecondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {internRows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-textSecondary">No data.</td></tr>
            ) : (
              internRows.map(({ intern, total, completed, inProgress, overdue, score }) => (
                <React.Fragment key={intern.id}>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-textPrimary">{intern.name}</td>
                    <td className="px-4 py-3">{total}</td>
                    <td className="px-4 py-3 text-green-700">{completed}</td>
                    <td className="px-4 py-3 text-blue-700">{inProgress}</td>
                    <td className="px-4 py-3 text-danger">{overdue}</td>
                    <td className="px-4 py-3 font-semibold">{score}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="text-xs px-2 py-1"
                          onClick={() => { setRateIntern(intern); setRatingVal(0); setFeedback(''); setRatingErr(''); }}
                        >
                          Rate
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs px-2 py-1"
                          onClick={() => setExpandedIntern(expandedIntern === intern.id ? null : intern.id)}
                          aria-expanded={expandedIntern === intern.id}
                        >
                          {expandedIntern === intern.id ? 'Hide' : 'Ratings'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedIntern === intern.id && (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 bg-gray-50">
                        <RatingsAccordion ratings={getRatingsForIntern(intern.id)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contribution graph */}
      <div className="bg-white rounded-xl border border-border p-5 mb-8">
        <h2 className="text-base font-semibold text-textPrimary mb-4">Weekly Activity (12 weeks)</h2>
        <ContributionGraph activityData={activityData} />
      </div>

      {/* Rate Intern Modal */}
      <Modal isOpen={!!rateIntern} onClose={() => setRateIntern(null)} title={`Rate ${rateIntern?.name ?? ''}`} size="md">
        <form onSubmit={handleRateSubmit}>
          <div className="mb-4">
            <p className="text-sm text-textSecondary mb-2">Star Rating <span className="text-danger">*</span></p>
            <StarRating value={ratingVal} onChange={setRatingVal} size="lg" label="Performance rating" />
            {ratingErr && <p className="text-xs text-danger mt-1">{ratingErr}</p>}
          </div>
          <div className="mb-5">
            <label htmlFor="pm-feedback" className="block text-sm text-textSecondary mb-1">Feedback</label>
            <textarea
              id="pm-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Write feedback…"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setRateIntern(null)}>Cancel</Button>
            <Button type="submit">Save Rating</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-xs text-textSecondary mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function RatingsAccordion({ ratings }) {
  if (!ratings.length) return <p className="text-xs text-textSecondary">No ratings yet.</p>;
  const sorted = [...ratings].sort((a, b) => b.week?.localeCompare(a.week ?? '') ?? 0);
  return (
    <div className="space-y-2">
      {sorted.map((r) => (
        <div key={r.id} className="bg-white rounded-lg border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-textSecondary">{r.week}</span>
            <StarRating value={r.rating} readOnly size="sm" />
          </div>
          {r.feedback && <p className="text-xs text-textPrimary">{r.feedback}</p>}
          <p className="text-xs text-textSecondary mt-1">by {r.createdBy}</p>
        </div>
      ))}
    </div>
  );
}

export default ProgressModule;
