import { addDocument, getDocuments, updateDocument, deleteDocument, COLLECTIONS } from './firebase.js';
import { toast, openModal, closeModal, setupModals, showTableLoading, showEmptyState,
         formatDate, startClock, setActiveNav, setupSidebar, filterTable, confirmDelete, resetForm, initials } from './utils.js';
import { injectLayout } from './layout.js';

injectLayout('Students');
setActiveNav();
setupSidebar();
setupModals();
startClock(document.getElementById('clock'));

let students = [];
let editingId = null;

const tbody = document.getElementById('studentsTbody');
const searchInput = document.getElementById('searchInput');

async function loadStudents() {
  showTableLoading(tbody, 7);
  try {
    students = await getDocuments(COLLECTIONS.students);
    renderStudents(students);
  } catch (err) {
    toast('Failed to load students', 'error');
  }
}

function renderStudents(list) {
  if (list.length === 0) {
    showEmptyState(tbody, 7, '👥', 'No students enrolled', 'Add your first student to begin');
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr data-id="${s.id}">
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="avatar">${initials(s.name)}</div>
          <div>
            <div class="td-primary">${s.name}</div>
            <div style="font-size:0.75rem;color:var(--text-2);font-family:var(--font-mono)">#${s.id.slice(0,8)}</div>
          </div>
        </div>
      </td>
      <td class="td-mono">${s.phone || '—'}</td>
      <td class="td-mono">${s.email || '—'}</td>
      <td class="td-mono">${s.parentPhone || '—'}</td>
      <td>${s.age || '—'}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.notes || '—'}</td>
      <td>
        <div class="actions-cell">
          <button class="action-btn" onclick="editStudent('${s.id}')" title="Edit">✎</button>
          <button class="action-btn danger" onclick="deleteStudent('${s.id}','${s.name}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

document.getElementById('btnAddStudent').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add New Student';
  resetForm('studentForm');
  openModal('studentModal');
});

window.editStudent = async (id) => {
  const s = students.find(x => x.id === id);
  if (!s) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Student';
  document.getElementById('fName').value = s.name || '';
  document.getElementById('fPhone').value = s.phone || '';
  document.getElementById('fEmail').value = s.email || '';
  document.getElementById('fParentPhone').value = s.parentPhone || '';
  document.getElementById('fAge').value = s.age || '';
  document.getElementById('fNotes').value = s.notes || '';
  openModal('studentModal');
};

document.getElementById('studentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  const data = {
    name: document.getElementById('fName').value.trim(),
    phone: document.getElementById('fPhone').value.trim(),
    email: document.getElementById('fEmail').value.trim(),
    parentPhone: document.getElementById('fParentPhone').value.trim(),
    age: document.getElementById('fAge').value.trim(),
    notes: document.getElementById('fNotes').value.trim()
  };

  try {
    if (editingId) {
      await updateDocument(COLLECTIONS.students, editingId, data);
      toast('Student updated!', 'success');
    } else {
      await addDocument(COLLECTIONS.students, data);
      toast('Student added!', 'success');
    }
    closeModal('studentModal');
    loadStudents();
  } catch (err) {
    toast('Failed to save student', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Save Student';
  }
});

window.deleteStudent = async (id, name) => {
  if (!confirmDelete(name)) return;
  try {
    await deleteDocument(COLLECTIONS.students, id);
    toast('Student removed', 'info');
    loadStudents();
  } catch (err) {
    toast('Failed to delete', 'error');
  }
};

searchInput?.addEventListener('input', e => filterTable(Array.from(tbody.querySelectorAll('tr')), e.target.value));

loadStudents();
