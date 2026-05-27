/**
 * ReportModule — Admin reports page with Excel download.
 */
import React, { useEffect, useMemo } from 'react';
import useAttendanceStore from '../../store/attendanceStore';
import useTaskStore from '../../store/taskStore';
import useInternStore from '../../store/internStore';
import useRatingStore from '../../store/ratingStore';
import { CSVDownloadButton } from '../../components/common';
import { isOverdue } from '../../utils/dateUtils';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function BarCell({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-textSecondary w-8 text-right">{value}</span>
      </div>
    </td>
  );
}

function SectionHeader({ title }) {
  return <h2 className="text-lg font-semibold text-textPrimary mb-3">{title}</h2>;
}

function ReportModule() {
  const { records, loadAttendance, getReportSummary } = useAttendanceStore();
  const { tasks, loadTasks } = useTaskStore();
  const { interns, loadInterns } = useInternStore();
  const { ratings, loadRatings } = useRatingStore();

  useEffect(() => {
    loadAttendance();
    loadTasks();
    loadInterns();
    loadRatings();
  }, []);

  const attendanceSummary = useMemo(() => getReportSummary(), [records]);

  const taskCompletion = useMemo(() => {
    const statuses = ['To Do', 'In Progress', 'Under Review', 'Completed'];
    return statuses.map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
    }));
  }, [tasks]);

  const internPerformance = useMemo(() =>
    interns.map((intern) => {
      const own = tasks.filter((t) => t.assignedTo?.includes(intern.id));
      const completed = own.filter((t) => t.status === 'Completed').length;
      const overdue = own.filter((t) => t.status !== 'Completed' && isOverdue(t.dueDate)).length;
      const score = own.length > 0 ? Math.round((completed / own.length) * 100) : 0;
      const attRec = records.filter((r) => r.internId === intern.id);
      const attPct = attRec.length > 0
        ? Math.round((attRec.filter((r) => r.status === 'Present').length / attRec.length) * 100)
        : 0;
      const latestRating = ratings
        .filter((r) => r.internId === intern.id)
        .sort((a, b) => (b.ratedAt || '').localeCompare(a.ratedAt || ''))[0];
      return {
        name: intern.name,
        department: intern.department,
        college: intern.college || '',
        status: intern.status,
        tasksAssigned: own.length,
        completed,
        overdue,
        score,
        attendance: attPct,
        rating: latestRating?.rating ?? '—',
      };
    }),
    [interns, tasks, records, ratings]
  );

  const deptSummary = useMemo(() => {
    const map = {};
    interns.forEach((intern) => {
      const dept = intern.department || 'Unknown';
      if (!map[dept]) map[dept] = { dept, total: 0, active: 0, tasks: 0, completed: 0 };
      map[dept].total += 1;
      if (intern.status === 'Active') map[dept].active += 1;
      const own = tasks.filter((t) => t.assignedTo?.includes(intern.id));
      map[dept].tasks += own.length;
      map[dept].completed += own.filter((t) => t.status === 'Completed').length;
    });
    return Object.values(map);
  }, [interns, tasks]);

  const maxAttTotal = Math.max(...attendanceSummary.map((r) => r.total), 1);
  const maxTaskCount = Math.max(...taskCompletion.map((r) => r.count), 1);

  // ── Full Excel export (SpreadsheetML) ────────────────────────────────────────
  function exportFullReportExcel() {
    function esc(val) {
      return String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function headerRow(cols) {
      return '<Row>' + cols.map((c) => `<Cell ss:StyleID="h"><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('') + '</Row>';
    }
    function titleRow(title) {
      return `<Row><Cell ss:StyleID="t"><Data ss:Type="String">${esc(title)}</Data></Cell></Row>`;
    }
    function dataRow(cols, row) {
      return '<Row>' + cols.map((c) => `<Cell><Data ss:Type="String">${esc(row[c])}</Data></Cell>`).join('') + '</Row>';
    }
    const gap = '<Row><Cell><Data ss:Type="String"></Data></Cell></Row>';

    // Section 1: Intern Performance
    const s1cols = ['Name', 'Department', 'College', 'Status', 'Tasks', 'Completed', 'Overdue', 'Score %', 'Attendance %', 'Rating'];
    const s1rows = internPerformance.map((r) => ({
      'Name': r.name, 'Department': r.department, 'College': r.college,
      'Status': r.status, 'Tasks': r.tasksAssigned, 'Completed': r.completed,
      'Overdue': r.overdue, 'Score %': r.score, 'Attendance %': r.attendance + '%',
      'Rating': r.rating,
    }));

    // Section 2: Attendance Summary
    const s2cols = ['Intern', 'Total', 'Present', 'Absent', 'Late', 'Half-Day', 'Leave', 'Attendance %'];
    const s2rows = attendanceSummary.map((r) => ({
      'Intern': r.internName, 'Total': r.total, 'Present': r.present,
      'Absent': r.absent, 'Late': r.late, 'Half-Day': r.halfDay,
      'Leave': r.leave, 'Attendance %': r.percentage + '%',
    }));

    // Section 3: Task Status
    const s3cols = ['Status', 'Count'];
    const s3rows = taskCompletion.map((r) => ({ 'Status': r.status, 'Count': r.count }));

    // Section 4: Department Summary
    const s4cols = ['Department', 'Total Interns', 'Active', 'Tasks Assigned', 'Completed'];
    const s4rows = deptSummary.map((r) => ({
      'Department': r.dept, 'Total Interns': r.total, 'Active': r.active,
      'Tasks Assigned': r.tasks, 'Completed': r.completed,
    }));

    let xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="t"><Font ss:Bold="1" ss:Size="12" ss:Color="#FFFFFF"/><Interior ss:Color="#1e3a8a" ss:Pattern="Solid"/></Style>
  <Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#dbeafe" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Full Report"><Table>`;

    xml += titleRow(`RoopShield Internship Portal — Full Report (${today()})`);
    xml += gap;

    xml += titleRow('SECTION 1: Intern Performance');
    xml += headerRow(s1cols);
    s1rows.forEach((r) => { xml += dataRow(s1cols, r); });
    xml += gap;

    xml += titleRow('SECTION 2: Attendance Summary');
    xml += headerRow(s2cols);
    s2rows.forEach((r) => { xml += dataRow(s2cols, r); });
    xml += gap;

    xml += titleRow('SECTION 3: Task Status Distribution');
    xml += headerRow(s3cols);
    s3rows.forEach((r) => { xml += dataRow(s3cols, r); });
    xml += gap;

    xml += titleRow('SECTION 4: Department-wise Summary');
    xml += headerRow(s4cols);
    s4rows.forEach((r) => { xml += dataRow(s4cols, r); });

    xml += '</Table></Worksheet></Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roopshield-full-report-${today()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-label="Reports" className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-textPrimary">Reports</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportFullReportExcel}
            className="inline-flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            📊 Download Full Report (Excel)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm border border-border rounded-lg px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* 1. Attendance Summary */}
      <div className="bg-white rounded-xl border border-border p-5 print-section">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Attendance Summary" />
          <CSVDownloadButton data={attendanceSummary} filename={`attendance_summary_${today()}.csv`} label="CSV" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Intern', 'Total', 'Present', 'Absent', 'Late', 'Half-Day', 'Leave', 'Attendance %'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendanceSummary.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-textSecondary">No data.</td></tr>
              ) : (
                attendanceSummary.map((row) => (
                  <tr key={row.internId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.internName}</td>
                    <BarCell value={row.total} max={maxAttTotal} />
                    <td className="px-4 py-3">{row.present}</td>
                    <td className="px-4 py-3">{row.absent}</td>
                    <td className="px-4 py-3">{row.late}</td>
                    <td className="px-4 py-3">{row.halfDay}</td>
                    <td className="px-4 py-3">{row.leave}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.percentage >= 80 ? 'bg-green-100 text-green-700' :
                        row.percentage >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{row.percentage}%</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Task Completion */}
      <div className="bg-white rounded-xl border border-border p-5 print-section">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Task Completion" />
          <CSVDownloadButton data={taskCompletion} filename={`task_completion_${today()}.csv`} label="CSV" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Count</th>
                <th className="text-left px-4 py-3 font-medium text-textSecondary">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {taskCompletion.map((row) => (
                <tr key={row.status} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.status}</td>
                  <td className="px-4 py-3">{row.count}</td>
                  <BarCell value={row.count} max={maxTaskCount} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Intern Performance */}
      <div className="bg-white rounded-xl border border-border p-5 print-section">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Intern Performance" />
          <CSVDownloadButton data={internPerformance} filename={`intern_performance_${today()}.csv`} label="CSV" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Dept', 'Tasks', 'Completed', 'Overdue', 'Score', 'Attendance', 'Rating'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {internPerformance.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-textSecondary">No data.</td></tr>
              ) : (
                internPerformance.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-textSecondary">{row.department}</td>
                    <td className="px-4 py-3">{row.tasksAssigned}</td>
                    <td className="px-4 py-3 text-green-700">{row.completed}</td>
                    <td className="px-4 py-3 text-danger">{row.overdue}</td>
                    <td className="px-4 py-3 font-semibold">{row.score}%</td>
                    <td className="px-4 py-3">{row.attendance}%</td>
                    <td className="px-4 py-3">{row.rating}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Department Summary */}
      <div className="bg-white rounded-xl border border-border p-5 print-section">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Department-wise Summary" />
          <CSVDownloadButton data={deptSummary} filename={`department_summary_${today()}.csv`} label="CSV" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Department', 'Total Interns', 'Active', 'Tasks Assigned', 'Completed'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-textSecondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deptSummary.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-textSecondary">No data.</td></tr>
              ) : (
                deptSummary.map((row) => (
                  <tr key={row.dept} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.dept}</td>
                    <td className="px-4 py-3">{row.total}</td>
                    <td className="px-4 py-3 text-green-700">{row.active}</td>
                    <td className="px-4 py-3">{row.tasks}</td>
                    <td className="px-4 py-3">{row.completed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          nav, header, button, .no-print { display: none !important; }
          .print-section { break-inside: avoid; margin-bottom: 2rem; }
          body { background: white; }
        }
      `}</style>
    </section>
  );
}

export default ReportModule;
