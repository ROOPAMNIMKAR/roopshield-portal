/**
 * InternHRNotices — Intern view of HR notices posted by admin.
 */
import React, { useEffect, useMemo } from 'react';
import useHRStore from '../../store/hrStore';
import useAuthStore from '../../store/authStore';

const CAT_COLORS = {
  General: 'bg-gray-100 text-gray-700',
  'Policy Update': 'bg-blue-100 text-blue-700',
  Event: 'bg-purple-100 text-purple-700',
  Holiday: 'bg-green-100 text-green-700',
  Reminder: 'bg-amber-100 text-amber-700',
  Urgent: 'bg-red-100 text-red-700',
};

function InternHRNotices() {
  const { notices, loadAll } = useHRStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => { loadAll(); }, []);

  const dept = currentUser?.department ?? '';
  const visible = useMemo(
    () => notices
      .filter((n) => n.visibleTo === 'All' || n.visibleTo === dept)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notices, dept]
  );

  return (
    <section aria-label="HR Notices">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">HR Notices</h1>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-3" aria-hidden="true">📢</span>
          <p className="text-textSecondary text-sm">No HR notices at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((n) => (
            <article key={n.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-textPrimary">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CAT_COLORS[n.category] ?? 'bg-gray-100 text-gray-700'}`}>
                  {n.category}
                </span>
              </div>
              <p className="text-sm text-textPrimary mb-2">{n.body}</p>
              <p className="text-xs text-textSecondary">
                Posted by {n.createdBy} · {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default InternHRNotices;
