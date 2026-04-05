import { addDocument, getDocuments, updateDocument, deleteDocument, COLLECTIONS } from '../firebase.js';
import { toast, openModal, closeModal, setupModals, showTableLoading, showEmptyState,
         formatDate, startClock, setActiveNav, setupSidebar, filterTable, confirmDelete, resetForm, populateSelect } from './utils.js';
import { injectLayout } from './layout.js';

injectLayout('Sessions');
setActiveNav();
setupSidebar();
setupModals();
startClock(document.getElementById('clock'));

let sessions = [];
let groups = [];
let editingId = null;
let filterGroupId = '';

const tbody = document.getElementById('sessionsTbody');
const searchInput = document.getElementById('searchInput');
const groupFilter = document.getElementById('groupFilter');

async function loadAll() {
  showTableLoading(tbody, 7);
  try {
    [sessions, groups] = await Promise.all([
      getDocuments(COLLECTIONS.sessions),
      getDocuments(COLLECTIONS.groups)
    ]);
    populateSelect(document.getElementById('fGroup'), groups, 'id', 'name', 'Select group...');

    // Group filter
    groupFilter.innerHTML = '<option value="">All Groups</option>';
    groups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id; opt.textContent = g.name;
      groupFilter.appendChild(opt);
    });

    renderSessions(sessions);
  } catch (err) {
    toast('Failed to load sessions', 'error');
  }
}

function renderSessions(list) {
  const filtered = filterGroupId ? list.filter(s => s.groupId === filterGroupId) : list;

  if (filtered.length === 0) {
    showEmptyState(tbody, 7, '📅', 'No sessions found', 'Add sessions to track your classes');
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const group = groups.find(g => g.id === s.groupId);
    return `
    <tr data-id="${s.id}">
      <td class="td-primary">${s.topic || 'Untitled'}</td>
      <td>${group ? `<span class="badge badge-blue">${group.name}</span>` : '—'}</td>
      <td class="td-mono">${s.sessionDate || '—'}</td>
      <td class="td-mono">${s.sessionTime || '—'}</td>
      <td><span class="badge ${s.status === 'completed' ? 'badge-green' : s.status === 'cancelled' ? 'badge-red' : 'badge-amber'}">${s.status || 'scheduled'}</span></td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-2)">${s.notes || '—'}</td>
      <td>
        <div class="actions-cell">
          <button class="action-btn" onclick="editSession('${s.id}')" title="Edit">✎</button>
          <button class="action-btn danger" onclick="deleteSession('${s.id}','${s.topic}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

groupFilter?.addEventListener('change', (e) => {
  filterGroupId = e.target.value;
  renderSessions(sessions);
});

document.getElementById('btnAddSession').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add New Session';
  resetForm('sessionForm');
  openModal('sessionModal');
});

window.editSession = (id) => {
  const s = sessions.find(x => x.id === id);
  if (!s) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Session';
  document.getElementById('fTopic').value = s.topic || '';
  document.getElementById('fGroup').value = s.groupId || '';
  document.getElementById('fSessionDate').value = s.sessionDate || '';
  document.getElementById('fSessionTime').value = s.sessionTime || '';
  document.getElementById('fStatus').value = s.status || 'scheduled';
  document.getElementById('fNotes').value = s.notes || '';
  openModal('sessionModal');
};

document.getElementById('sessionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  const data = {
    topic: document.getElementById('fTopic').value.trim(),
    groupId: document.getElementById('fGroup').value,
    sessionDate: document.getElementById('fSessionDate').value,
    sessionTime: document.getElementById('fSessionTime').value,
    status: document.getElementById('fStatus').value,
    notes: document.getElementById('fNotes').value.trim()
  };

  try {
    if (editingId) {
      await updateDocument(COLLECTIONS.sessions, editingId, data);
      toast('Session updated!', 'success');
    } else {
      await addDocument(COLLECTIONS.sessions, data);
      toast('Session added!', 'success');
    }
    closeModal('sessionModal');
    loadAll();
  } catch (err) {
    toast('Failed to save session', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Save Session';
  }
});

window.deleteSession = async (id, topic) => {
  if (!confirmDelete(topic)) return;
  try {
    await deleteDocument(COLLECTIONS.sessions, id);
    toast('Session deleted', 'info');
    loadAll();
  } catch (err) {
    toast('Failed to delete', 'error');
  }
};

searchInput?.addEventListener('input', e => filterTable(Array.from(tbody.querySelectorAll('tr')), e.target.value));

loadAll();
