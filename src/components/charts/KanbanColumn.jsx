/**
 * KanbanColumn — single column in the Kanban board.
 *
 * Props:
 *   title: string
 *   tasks: Task[]
 *   interns: User[]
 *   onCardClick: (task) => void
 *
 * Requirements: 8.1, 8.5, 8.7, 8.8
 */
import React from 'react';
import { PriorityBadge, Avatar } from '../common';
import { isOverdue, formatDate } from '../../utils/dateUtils';

const COLUMN_COLORS = {
  'To Do':        'border-gray-300 bg-gray-50',
  'In Progress':  'border-blue-300 bg-blue-50',
  'Under Review': 'border-amber-300 bg-amber-50',
  'Completed':    'border-green-300 bg-green-50',
};

const HEADER_COLORS = {
  'To Do':        'bg-gray-200 text-gray-700',
  'In Progress':  'bg-blue-200 text-blue-800',
  'Under Review': 'bg-amber-200 text-amber-800',
  'Completed':    'bg-green-200 text-green-800',
};

function KanbanColumn({ title, tasks = [], interns = [], onCardClick }) {
  const colClass = COLUMN_COLORS[title] ?? 'border-gray-300 bg-gray-50';
  const headerClass = HEADER_COLORS[title] ?? 'bg-gray-200 text-gray-700';

  return (
    <section
      className={`flex flex-col rounded-xl border-2 ${colClass} min-w-[220px] flex-1`}
      aria-label={`${title} column`}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${headerClass}`}>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">
          {tasks.length}
        </span>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-2 p-2 overflow-y-auto flex-1">
        {tasks.length === 0 && (
          <p className="text-xs text-textSecondary text-center py-4">No tasks</p>
        )}
        {tasks.map((task) => {
          const overdue = task.status !== 'Completed' && isOverdue(task.dueDate);
          const loggedHours = (task.workLogs ?? []).reduce((s, l) => s + (l.hoursWorked ?? 0), 0);
          const estimated = task.estimatedHours ?? 0;
          const progress = estimated > 0 ? Math.min(100, Math.round((loggedHours / estimated) * 100)) : 0;

          const assignedInterns = (task.assignedTo ?? [])
            .map((id) => interns.find((i) => i.id === id))
            .filter(Boolean);

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onCardClick?.(task)}
              className="w-full text-left bg-white rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {/* Title + priority */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-textPrimary leading-snug line-clamp-2">
                  {task.title}
                </p>
                <PriorityBadge priority={task.priority} />
              </div>

              {/* Category */}
              {task.category && (
                <p className="text-xs text-textSecondary mb-1">{task.category}</p>
              )}

              {/* Due date */}
              <p className={`text-xs mb-2 ${overdue ? 'text-danger font-semibold' : 'text-textSecondary'}`}>
                Due: {formatDate(task.dueDate)}
                {overdue && ' (Overdue)'}
              </p>

              {/* Progress bar */}
              {estimated > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-textSecondary mb-0.5">
                    <span>{loggedHours}h logged</span>
                    <span>{estimated}h est.</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Assigned interns */}
              {assignedInterns.length > 0 && (
                <div className="flex -space-x-1">
                  {assignedInterns.slice(0, 3).map((intern) => (
                    <Avatar key={intern.id} name={intern.name} photoUrl={intern.photoUrl} size="xs" />
                  ))}
                  {assignedInterns.length > 3 && (
                    <span className="h-6 w-6 rounded-full bg-gray-200 text-xs flex items-center justify-center text-textSecondary font-medium">
                      +{assignedInterns.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default KanbanColumn;
