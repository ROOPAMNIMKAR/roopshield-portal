/**
 * KanbanBoard — four-column Kanban board with filter bar.
 *
 * Props:
 *   tasks: Task[]
 *   interns: User[]
 *   onCardClick: (task) => void
 *
 * Requirements: 8.1, 8.5, 8.7, 8.8
 */
import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { useDebounce } from '../../hooks/useDebounce';

const STATUSES = ['To Do', 'In Progress', 'Under Review', 'Completed'];
const PRIORITIES = ['', 'Low', 'Medium', 'High', 'Critical'];

function KanbanBoard({ tasks = [], interns = [], onCardClick }) {
  const [filterIntern, setFilterIntern] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDueStart, setFilterDueStart] = useState('');
  const [filterDueEnd, setFilterDueEnd] = useState('');

  const debouncedCategory = useDebounce(filterCategory, 300);

  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))];

  const filtered = tasks.filter((t) => {
    if (filterIntern && !t.assignedTo?.includes(filterIntern)) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (debouncedCategory && !t.category?.toLowerCase().includes(debouncedCategory.toLowerCase())) return false;
    if (filterDueStart && t.dueDate < filterDueStart) return false;
    if (filterDueEnd && t.dueDate > filterDueEnd) return false;
    return true;
  });

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-border">
        <select
          value={filterIntern}
          onChange={(e) => setFilterIntern(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by intern"
        >
          <option value="">All Interns</option>
          {interns.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          type="text"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          placeholder="Filter by category…"
          className="text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Filter by category"
        />

        <input
          type="date"
          value={filterDueStart}
          onChange={(e) => setFilterDueStart(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Due date from"
        />
        <input
          type="date"
          value={filterDueEnd}
          onChange={(e) => setFilterDueEnd(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Due date to"
        />

        {(filterIntern || filterPriority || filterCategory || filterDueStart || filterDueEnd) && (
          <button
            type="button"
            onClick={() => { setFilterIntern(''); setFilterPriority(''); setFilterCategory(''); setFilterDueStart(''); setFilterDueEnd(''); }}
            className="text-sm text-danger hover:underline focus:outline-none"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Columns */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            title={status}
            tasks={filtered.filter((t) => t.status === status)}
            interns={interns}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;
