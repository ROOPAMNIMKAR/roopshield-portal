/**
 * DoubtsModule — Admin view of intern doubts with reply functionality.
 */
import React, { useEffect, useState, useMemo } from 'react';
import useDoubtStore from '../../store/doubtStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal } from '../../components/common';

const STATUS_STYLES = {
  Open:     'bg-amber-100 text-amber-700',
  Replied:  'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
};

function DoubtsModule() {
  const { doubts, loadDoubts, replyDoubt, resolveDoubt } = useDoubtStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [filterStatus, setFilterStatus] = useState('');
  const [replyTarget, setReplyTarget]   = useState(null);
  const [replyText, setReplyText]       = useState('');
  const [replyErr, setReplyErr]         = useState('');

  useEffect(() => { loadDoubts(); }, []);

  const filtered = useMemo(() => {
    const sorted = [...doubts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!filterStatus) return sorted;
    return sorted.filter((d) => d.status === filterStatus);
  }, [doubts, filterStatus]);

  const openCount    = doubts.filter((d) => d.status === 'Open').length;
  const repliedCount = doubts.filter((d) => d.status === 'Replied').length;

  function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) { setReplyErr('Reply cannot be empty.'); return; }
    replyDoubt(replyTarget.id, { reply: replyText.trim(), repliedBy: currentUser?.name ?? 'Admin' });
    showToast('Reply sent.', 'success');
    setReplyTarget(null);
    setReplyText('');
    setReplyErr('');
  }

  function handleResolve(id) {
    resolveDoubt(id);
    showToast('Marked as resolved.', 'success');
  }

  return (
    <section aria-label="Intern Doubts & Questions">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Doubts & Questions</h1>
        <div className="flex gap-3 text-sm">
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">{openCount} Open</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">{repliedCount} Replied</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-5">
        {['', 'Open', 'Replied', 'Resolved'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              filterStatus === s
                ? 'bg-accent text-white'
                : 'bg-white border border-border text-textSecondary hover:text-textPrimary'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <svg className="h-14 w-14 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-textSecondary text-sm">No doubts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-textPrimary">{d.subject}</h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    From <span className="font-medium">{d.internName}</span> · {new Date(d.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[d.status]}`}>
                  {d.status}
                </span>
              </div>

              <p className="text-sm text-textPrimary mb-3">{d.message}</p>

              {d.reply && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Your reply · {new Date(d.repliedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-textPrimary">{d.reply}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  className="text-xs px-3 py-1.5"
                  onClick={() => { setReplyTarget(d); setReplyText(d.reply ?? ''); setReplyErr(''); }}
                >
                  {d.reply ? 'Edit Reply' : 'Reply'}
                </Button>
                {d.status !== 'Resolved' && (
                  <Button
                    variant="ghost"
                    className="text-xs px-3 py-1.5 text-green-700 hover:bg-green-50"
                    onClick={() => handleResolve(d.id)}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <Modal
        isOpen={!!replyTarget}
        onClose={() => setReplyTarget(null)}
        title={`Reply to: ${replyTarget?.subject ?? ''}`}
        size="md"
      >
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-textSecondary mb-1">Question from {replyTarget?.internName}</p>
          <p className="text-sm text-textPrimary">{replyTarget?.message}</p>
        </div>
        <form onSubmit={handleReply} noValidate>
          <label htmlFor="dm-reply" className="block text-xs font-medium text-textSecondary mb-1">
            Your Reply <span className="text-danger">*</span>
          </label>
          <textarea
            id="dm-reply"
            value={replyText}
            onChange={(e) => { setReplyText(e.target.value); setReplyErr(''); }}
            rows={5}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${replyErr ? 'border-danger' : 'border-border'}`}
            placeholder="Type your reply…"
          />
          {replyErr && <p className="text-xs text-danger mt-1">{replyErr}</p>}
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => setReplyTarget(null)}>Cancel</Button>
            <Button type="submit">Send Reply</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default DoubtsModule;
