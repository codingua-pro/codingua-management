import { getDashboardStats, getDocuments, COLLECTIONS } from '../firebase.js';
import { formatMoney, formatDate, startClock, setActiveNav, setupSidebar, toast } from './utils.js';
import { injectLayout } from './layout.js';

injectLayout('Dashboard');
setActiveNav();
setupSidebar();
startClock(document.getElementById('clock'));

async function loadDashboard() {
  try {
    const stats = await getDashboardStats();

    document.getElementById('statCourses').textContent = stats.courses;
    document.getElementById('statStudents').textContent = stats.students;
    document.getElementById('statGroups').textContent = stats.groups;
    document.getElementById('statSessions').textContent = stats.sessions;
    document.getElementById('statRevenue').textContent = formatMoney(stats.totalRevenue);
    document.getElementById('statPending').textContent = stats.pendingPayments;

    // Load recent students
    const students = await getDocuments(COLLECTIONS.students);
    const recentStudents = students.slice(-5).reverse();
    const recentList = document.getElementById('recentStudents');
    recentList.innerHTML = recentStudents.length === 0
      ? '<p style="color:var(--text-2);font-size:0.85rem;padding:16px 0">No students yet.</p>'
      : recentStudents.map(s => `
        <div class="activity-item">
          <div class="avatar avatar-sm">${s.name?.charAt(0) || '?'}</div>
          <div>
            <div class="activity-text"><strong>${s.name}</strong></div>
            <div class="activity-time">${s.phone || '—'} · Added ${formatDate(s.createdAt)}</div>
          </div>
        </div>`).join('');

    // Load recent payments
    const payments = await getDocuments(COLLECTIONS.payments);
    const recentPayments = payments.slice(-5).reverse();
    const payList = document.getElementById('recentPayments');
    payList.innerHTML = recentPayments.length === 0
      ? '<p style="color:var(--text-2);font-size:0.85rem;padding:16px 0">No payments yet.</p>'
      : recentPayments.map(p => `
        <div class="activity-item">
          <div class="activity-dot" style="background:${p.status === 'paid' ? 'var(--accent-3)' : 'var(--accent-warn)'}"></div>
          <div style="flex:1">
            <div class="activity-text"><strong>${p.studentName || 'Student'}</strong> — ${formatMoney(p.amount)}</div>
            <div class="activity-time">${formatDate(p.paymentDate)} · <span class="badge ${p.status === 'paid' ? 'badge-green' : 'badge-amber'}">${p.status}</span></div>
          </div>
        </div>`).join('');

  } catch (err) {
    console.error(err);
    toast('Failed to load dashboard data', 'error');
  }
}

loadDashboard();
