import { addDocument, getDocuments, updateDocument, deleteDocument, COLLECTIONS } from './firebase.js';
import { toast, openModal, closeModal, setupModals, showTableLoading, showEmptyState,
         formatMoney, formatDate, startClock, setActiveNav, setupSidebar, filterTable, confirmDelete, resetForm } from './js/utils.js';
import { injectLayout } from './js/layout.js';

injectLayout('Courses');
setActiveNav();
setupSidebar();
setupModals();
startClock(document.getElementById('clock'));

let courses = [];
let editingId = null;

const tbody = document.getElementById('coursesTbody');
const searchInput = document.getElementById('searchInput');

async function loadCourses() {
  showTableLoading(tbody, 6);
  try {
    courses = await getDocuments(COLLECTIONS.courses);
    renderCourses(courses);
  } catch (err) {
    toast('Failed to load courses', 'error');
  }
}

function renderCourses(list) {
  if (list.length === 0) {
    showEmptyState(tbody, 6, '📚', 'No courses yet', 'Add your first course to get started');
    return;
  }
  tbody.innerHTML = list.map(c => `
    <tr data-id="${c.id}">
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <div class="avatar" style="background:linear-gradient(135deg,var(--accent-2),var(--accent))">${c.name?.charAt(0) || '?'}</div>
          <div>
            <div class="td-primary">${c.name}</div>
            <div style="font-size:0.75rem;color:var(--text-2);font-family:var(--font-mono)">${c.code || ''}</div>
          </div>
        </div>
      </td>
      <td>${c.description || '—'}</td>
      <td class="td-mono">${formatMoney(c.price)}</td>
      <td>${c.duration || '—'}</td>
      <td><span class="badge ${c.status === 'active' ? 'badge-green' : 'badge-amber'}">${c.status || 'active'}</span></td>
      <td>
        <div class="actions-cell">
          <button class="action-btn" onclick="editCourse('${c.id}')" title="Edit">✎</button>
          <button class="action-btn danger" onclick="deleteCourse('${c.id}','${c.name}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

// ADD / EDIT
document.getElementById('btnAddCourse').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add New Course';
  resetForm('courseForm');
  openModal('courseModal');
});

window.editCourse = async (id) => {
  const course = courses.find(c => c.id === id);
  if (!course) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Course';
  document.getElementById('fName').value = course.name || '';
  document.getElementById('fCode').value = course.code || '';
  document.getElementById('fDescription').value = course.description || '';
  document.getElementById('fPrice').value = course.price || '';
  document.getElementById('fDuration').value = course.duration || '';
  document.getElementById('fStatus').value = course.status || 'active';
  openModal('courseModal');
};

document.getElementById('courseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const data = {
    name: document.getElementById('fName').value.trim(),
    code: document.getElementById('fCode').value.trim(),
    description: document.getElementById('fDescription').value.trim(),
    price: parseFloat(document.getElementById('fPrice').value) || 0,
    duration: document.getElementById('fDuration').value.trim(),
    status: document.getElementById('fStatus').value
  };

  try {
    if (editingId) {
      await updateDocument(COLLECTIONS.courses, editingId, data);
      toast('Course updated!', 'success');
    } else {
      await addDocument(COLLECTIONS.courses, data);
      toast('Course added!', 'success');
    }
    closeModal('courseModal');
    loadCourses();
  } catch (err) {
    toast('Failed to save course', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Course';
  }
});

window.deleteCourse = async (id, name) => {
  if (!confirmDelete(name)) return;
  try {
    await deleteDocument(COLLECTIONS.courses, id);
    toast('Course deleted', 'info');
    loadCourses();
  } catch (err) {
    toast('Failed to delete', 'error');
  }
};

searchInput?.addEventListener('input', (e) => {
  const rows = tbody.querySelectorAll('tr');
  filterTable(Array.from(rows), e.target.value);
});

loadCourses();
