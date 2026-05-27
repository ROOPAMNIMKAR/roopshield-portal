/**
 * InternDoubts — Intern can submit doubts/questions to admin and see replies.
 */
import React, { useEffect, useState, useMemo } from 'react';
import useDoubtStore from '../../store/doubtStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common';

const STATUS_STYLES = {
  Open:     'bg-amber-100 text-amber-700',
  Replied:  'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
};

function InternDoubts() {
  const { doubts, loadDoubts, submitDoubt } = useDoubtStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors]   = useState({});

  useEffect(() => { loadDoubts(); }, []);

  const myDoubts = useMemo(
    () => doubts.filter((d) => d.internId === currentUser?.id)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [doubts, currentUser]
  );

  function validate() {
    const errs = {};
    if (!subject.trim()) errs.subject = 'Subject is required.';
    if (!message.trim()) errs.message = 'Message is required.';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    submitDoubt({
      internId:   currentUser.id,
      internName: currentUser.name,
      subject:    subject.trim(),
      message:    message.trim(),
    });
    showToast('Your doubt has been sent to the admin.', 'success');
    setSubject('');
    setMessage('');
    setErrors({});
  }

  const inputClass = (f) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${errors[f] ? 'border-danger' : 'border-border'}`;

  return (
    <section aria-label="My Doubts & Questions">
      <h1 className="text-2xl font-bold text-textPrimary mb-6">Doubts & Questions</h1>

      {/* Submit form */}
      <div className="bg-white rounded-xl border border-border p-5 mb-8">
        <h2 className="text-base font-semibold text-textPrimary mb-4">Ask a Question</h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="doubt-subject" className="block text-xs font-medium text-textSecondary mb-1">
              Subject <span className="text-danger">*</span>
            </label>
            <input
              id="doubt-subject"
              type="text"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors((p) => ({ ...p, subject: '' })); }}
              className={inputClass('subject')}
              placeholder="Brief subject of your question"
            />
            {errors.subject && <p className="text-xs text-danger mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label htmlFor="doubt-message" className="block text-xs font-medium text-textSecondary mb-1">
              Message <span className="text-danger">*</span>
            </label>
            <textarea
              id="doubt-message"
              value={message}
              onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((p) => ({ ...p, message: '' })); }}
              rows={4}
              className={inputClass('message')}
              placeholder="Describe your doubt or question in detail…"
            />
            {errors.message && <p className="text-xs text-danger mt-1">{errors.message}</p>}
          </div>
          <Button type="submit">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send to Admin
          </Button>
        </form>
      </div>

      {/* My doubts list */}
      <h2 className="text-base font-semibold text-textPrimary mb-4">My Questions ({myDoubts.length})</h2>
      {myDoubts.length === 0 ? (
        <p className="text-textSecondary text-sm">You haven't submitted any questions yet.</p>
      ) : (
        <div className="space-y-4">
          {myDoubts.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-textPrimary">{d.subject}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[d.status]}`}>
                  {d.status}
                </span>
              </div>
              <p className="text-sm text-textSecondary mb-2">{d.message}</p>
              <p className="text-xs text-textSecondary">{new Date(d.createdAt).toLocaleString()}</p>

              {d.reply && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Reply from {d.repliedBy} · {new Date(d.repliedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-textPrimary">{d.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default InternDoubts;
