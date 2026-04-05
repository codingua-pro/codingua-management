import { addDocument, getDocuments, updateDocument, deleteDocument, COLLECTIONS } from './firebase.js';
import { toast, openModal, closeModal, setupModals, showTableLoading, showEmptyState,
         formatMoney, formatDate, startClock, setActiveNav, setupSidebar, filterTable, confirmDelete, resetForm, populateSelect } from './utils.js';
import { injectLayout } from './layout.js';

injectLayout('Payments');
setActiveNav();
setupSidebar();
setupModals();
startClock(document.getElementById('clock'));

let payments = [];
let students = [];
let groups = [];
let editingId = null;
let filterStatus = '';

const tbody = document.getElementById('paymentsTbody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

async function loadAll() {
  showTableLoading(tbody, 8);
  try {
    [payments, students, groups] = await Promise.all([
      getDocuments(COLLECTIONS.payments),
      getDocuments(COLLECTIONS.students),
      getDocuments(COLLECTIONS.groups)
    ]);
    populateSelect(document.getElementById('fStudent'), students, 'id', 'name', 'Select student...');
    populateSelect(document.getElementById('fGroup'), groups, 'id', 'name', 'Select group...');
    updateSummary();
    renderPayments(payments);
  } catch (err) {
    toast('Failed to load payments', 'error');
  }
}

function updateSummary() {
  const paid = payments.filter(p => p.status === 'paid');
  const pending = payments.filter(p => p.status === 'pending');
  const totalPaid = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = pending.reduce((s, p) => s + (p.amount || 0), 0);

  document.getElementById('sumPaid').textContent = formatMoney(totalPaid);
  document.getElementById('sumPending').textContent = formatMoney(totalPending);
  document.getElementById('sumCount').textContent = payments.length;
  document.getElementById('sumPendingCount').textContent = pending.length;
}

function renderPayments(list) {
  const filtered = filterStatus ? list.filter(p => p.status === filterStatus) : list;
  if (filtered.length === 0) {
    showEmptyState(tbody, 8, '💳', 'No payment records', 'Add payment records to track revenue');
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const student = students.find(s => s.id === p.studentId);
    const group = groups.find(g => g.id === p.groupId);
    return `
    <tr data-id="${p.id}">
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar avatar-sm">${student?.name?.charAt(0) || '?'}</div>
          <span class="td-primary">${student?.name || p.studentName || '—'}</span>
        </div>
      </td>
      <td>${group ? `<span class="badge badge-blue">${group.name}</span>` : '—'}</td>
      <td class="td-mono" style="color:var(--accent-3);font-weight:600">${formatMoney(p.amount)}</td>
      <td class="td-mono">${p.paymentDate || '—'}</td>
      <td>
        <span class="badge ${p.status === 'paid' ? 'badge-green' : 'badge-amber'}">
          ${p.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
        </span>
      </td>
      <td>${p.method || '—'}</td>
      <td style="color:var(--text-2);font-size:0.82rem">${p.notes || '—'}</td>
      <td>
        <div class="actions-cell">
          ${p.status === 'pending' ? `<button class="action-btn success" onclick="markPaid('${p.id}')" title="Mark as Paid">✓</button>` : ''}
          <button class="action-btn" onclick="editPayment('${p.id}')" title="Edit">✎</button>
          <button class="action-btn danger" onclick="deletePayment('${p.id}','${student?.name || 'payment'}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

statusFilter?.addEventListener('change', (e) => {
  filterStatus = e.target.value;
  renderPayments(payments);
});

document.getElementById('btnAddPayment').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Record Payment';
  resetForm('paymentForm');
  document.getElementById('fStatus').value = 'pending';
  openModal('paymentModal');
});

window.editPayment = (id) => {
  const p = payments.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Payment';
  document.getElementById('fStudent').value = p.studentId || '';
  document.getElementById('fGroup').value = p.groupId || '';
  document.getElementById('fAmount').value = p.amount || '';
  document.getElementById('fPaymentDate').value = p.paymentDate || '';
  document.getElementById('fStatus').value = p.status || 'pending';
  document.getElementById('fMethod').value = p.method || '';
  document.getElementById('fNotes').value = p.notes || '';
  openModal('paymentModal');
};

window.markPaid = async (id) => {
  try {
    await updateDocument(COLLECTIONS.payments, id, { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] });
    toast('Marked as paid! ✓', 'success');
    loadAll();
  } catch (err) {
    toast('Failed to update', 'error');
  }
};

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  const studentId = document.getElementById('fStudent').value;
  const student = students.find(s => s.id === studentId);

  const data = {
    studentId,
    studentName: student?.name || '',
    groupId: document.getElementById('fGroup').value,
    amount: parseFloat(document.getElementById('fAmount').value) || 0,
    paymentDate: document.getElementById('fPaymentDate').value,
    status: document.getElementById('fStatus').value,
    method: document.getElementById('fMethod').value,
    notes: document.getElementById('fNotes').value.trim()
  };

  try {
    if (editingId) {
      await updateDocument(COLLECTIONS.payments, editingId, data);
      toast('Payment updated!', 'success');
    } else {
      await addDocument(COLLECTIONS.payments, data);
      toast('Payment recorded!', 'success');
    }
    closeModal('paymentModal');
    loadAll();
  } catch (err) {
    toast('Failed to save payment', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Save Payment';
  }
});

window.deletePayment = async (id, name) => {
  if (!confirmDelete(name)) return;
  try {
    await deleteDocument(COLLECTIONS.payments, id);
    toast('Payment deleted', 'info');
    loadAll();
  } catch (err) {
    toast('Failed to delete', 'error');
  }
};

searchInput?.addEventListener('input', e => filterTable(Array.from(tbody.querySelectorAll('tr')), e.target.value));

loadAll();
