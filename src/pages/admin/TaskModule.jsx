/**
 * TaskModule — Admin task management with Kanban board + Edit Task support.
 */
import React, { useEffect, useState } from 'react';
import useTaskStore from '../../store/taskStore';
import useInternStore from '../../store/internStore';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Button, Modal, StatusBadge, PriorityBadge } from '../../components/common';
import KanbanBoard from '../../components/charts/KanbanBoard';
import TaskForm from '../../components/TaskForm';
import { formatDate, isOverdue } from '../../utils/dateUtils';

function TaskModule() {
  const { tasks, loadTasks, addTask, deleteTask, updateTask } = useTaskStore();
  const { interns, loadInterns } = useInternStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { showToast } = useToast();

  const [addOpen, setAddOpen]     = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [editTask, setEditTask]   = useState(null);

  useEffect(() => {
    loadTasks();
    loadInterns();
  }, []);

  const activeInterns = interns.filter((i) => i.status === 'Active');

  function handleAddTask(data) {
    addTask({ ...data, createdBy: currentUser?.name ?? 'Admin' })
      .then(() => { showToast('Task assigned successfully.', 'success'); setAddOpen(false); })
      .catch((err) => showToast(err.message || 'Failed to add task.', 'error'));
  }

  async function handleEditTask(data) {
    try {
      await updateTask(editTask.id, { ...editTask, ...data });
      showToast('Task updated successfully.', 'success');
      setEditTask(null);
      setDetailTask(null);
    } catch (err) {
      showToast('Failed to update task: ' + (err.message || 'Unknown error'), 'error');
    }
  }

  function handleDelete(taskId) {
    deleteTask(taskId)
      .then(() => { showToast('Task deleted.', 'success'); setDetailTask(null); })
      .catch((err) => showToast(err.message || 'Failed to delete.', 'error'));
  }

  return (
    <section aria-label="Task Management">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Tasks</h1>
        <Button onClick={() => setAddOpen(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign Task
        </Button>
      </div>

      <KanbanBoard tasks={tasks} interns={interns} onCardClick={setDetailTask} />

      {/* Assign Task Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Assign Task" size="2xl">
        <TaskForm activeInterns={activeInterns} onSubmit={handleAddTask} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Edit Task Modal */}
      {editTask && (
        <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="2xl">
          <TaskForm task={editTask} activeInterns={activeInterns} onSubmit={handleEditTask} onCancel={() => setEditTask(null)} />
        </Modal>
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <Modal isOpen={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details" size="xl">
          <TaskDetail
            task={detailTask}
            interns={interns}
            onDelete={() => handleDelete(detailTask.id)}
            onEdit={() => { setEditTask(detailTask); setDetailTask(null); }}
          />
        </Modal>
      )}
    </section>
  );
}

function TaskDetail({ task, interns, onDelete, onEdit }) {
  const overdue = task.status !== 'Completed' && isOverdue(task.dueDate);
  const assignedInterns = (task.assignedTo ?? [])
    .map((id) => interns.find((i) => i.id === id)?.name)
    .filter(Boolean);
  const loggedHours = (task.workLogs ?? []).reduce((s, l) => s + (l.hours ?? l.hoursWorked ?? 0), 0);

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-textPrimary">{task.title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div><dt className="text-textSecondary text-xs">Category</dt><dd>{task.category || '—'}</dd></div>
        <div>
          <dt className="text-textSecondary text-xs">Due Date</dt>
          <dd className={overdue ? 'text-danger font-semibold' : ''}>
            {formatDate(task.dueDate)}{overdue && ' (Overdue)'}
          </dd>
        </div>
        <div><dt className="text-textSecondary text-xs">Assigned To</dt><dd>{assignedInterns.join(', ') || '—'}</dd></div>
        <div><dt className="text-textSecondary text-xs">Created By</dt><dd>{task.createdBy}</dd></div>
        <div><dt className="text-textSecondary text-xs">Estimated Hours</dt><dd>{task.estimatedHours ?? '—'}</dd></div>
        <div><dt className="text-textSecondary text-xs">Logged Hours</dt><dd>{loggedHours}</dd></div>
      </dl>

      {task.description && (
        <div>
          <p className="text-xs text-textSecondary mb-1">Description</p>
          <p className="text-sm text-textPrimary">{task.description}</p>
        </div>
      )}

      {/* Status History */}
      {(task.statusHistory ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-textPrimary mb-2">Status History</h4>
          <ol className="space-y-1">
            {task.statusHistory.map((entry, i) => (
              <li key={i} className="flex items-center gap-3 text-xs text-textSecondary">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                <StatusBadge status={entry.status} />
                <span>by {entry.changedBy}</span>
                <span>{entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Work Logs */}
      {(task.workLogs ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-textPrimary mb-2">Work Logs</h4>
          <div className="space-y-2">
            {task.workLogs.map((log) => (
              <div key={log.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{log.loggedAt ? new Date(log.loggedAt).toLocaleDateString() : ''}</span>
                  <span className="text-accent font-semibold">{log.hours ?? log.hoursWorked}h</span>
                </div>
                {log.note && <p className="text-textSecondary">{log.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-border flex items-center gap-3">
        <Button variant="secondary" onClick={onEdit} className="text-xs">
          ✏️ Edit Task
        </Button>
        <Button variant="danger" onClick={onDelete} className="text-xs">
          🗑 Delete Task
        </Button>
      </div>
    </div>
  );
}

export default TaskModule;
