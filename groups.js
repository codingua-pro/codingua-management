import { addDocument, getDocuments, updateDocument, deleteDocument, getStudentsByGroup, COLLECTIONS } from './firebase.js';
import { toast, openModal, closeModal, setupModals, showTableLoading, showEmptyState,
         formatDate, startClock, setActiveNav, setupSidebar, filterTable, confirmDelete, resetForm, populateSelect } from './utils.js';
import { injectLayout } from './layout.js';

injectLayout('Groups');
setActiveNav();
setupSidebar();
setupModals();
startClock(document.getElementById('clock'));

let groups = [];
let courses = [];
let students = [];
let editingId = null;

const tbody = document.getElementById('groupsTbody');
const searchInput = document.getElementById('searchInput');

async function loadAll() {
  showTableLoading(tbody, 7);
  try {
    [groups, courses, students] = await Promise.all([
      getDocuments(COLLECTIONS.groups),
      getDocuments(COLLECTIONS.courses),
      getDocuments(COLLECTIONS.students)
    ]);
    populateSelect(document.getElementById('fCourse'), courses, 'id', 'name', 'Select course...');
    renderGroups(groups);
  } catch (err) {
    toast('Failed to load data', 'error');
  }
}

function renderGroups(list) {
  if (list.length === 0) {
    showEmptyState(tbody, 7, '🗂️', 'No groups created', 'Create a group and assign a course');
    return;
  }
  tbody.innerHTML = list.map(g => {
    const course = courses.find(c => c.id === g.courseId);
    return `
    <tr data-id="${g.id}">
      <td class="td-primary">${g.name}</td>
      <td>${course ? `<span class="badge badge-blue">${course.name}</span>` : '—'}</td>
      <td class="td-mono">${g.startDate || '—'}</td>
      <td style="color:var(--accent)">${g.days || '—'}</td>
      <td class="td-mono">${g.time || '—'}</td>
      <td><span class="badge badge-purple" id="count-${g.id}">...</span></td>
      <td>
        <div class="actions-cell">
          <button class="action-btn success" onclick="viewStudents('${g.id}','${g.name}')" title="Students">👥</button>
          <button class="action-btn" onclick="editGroup('${g.id}')" title="Edit">✎</button>
          <button class="action-btn danger" onclick="deleteGroup('${g.id}','${g.name}')" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Load student counts async
  list.forEach(async g => {
    const s = await getStudentsByGroup(g.id);
    const el = document.getElementById(`count-${g.id}`);
    if (el) el.textContent = `${s.length} students`;
  });
}

document.getElementById('btnAddGroup').addEventListener('click', () => {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Create New Group';
  resetForm('groupForm');
  openModal('groupModal');
});

window.editGroup = (id) => {
  const g = groups.find(x => x.id === id);
  if (!g) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Group';
  document.getElementById('fName').value = g.name || '';
  document.getElementById('fCourse').value = g.courseId || '';
  document.getElementById('fStartDate').value = g.startDate || '';
  document.getElementById('fDays').value = g.days || '';
  document.getElementById('fTime').value = g.time || '';
  document.getElementById('fMaxStudents').value = g.maxStudents || '';
  openModal('groupModal');
};

document.getElementById('groupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  const data = {
    name: document.getElementById('fName').value.trim(),
    courseId: document.getElementById('fCourse').value,
    startDate: document.getElementById('fStartDate').value,
    days: document.getElementById('fDays').value.trim(),
    time: document.getElementById('fTime').value.trim(),
    maxStudents: parseInt(document.getElementById('fMaxStudents').value) || 0
  };

  try {
    if (editingId) {
      await updateDocument(COLLECTIONS.groups, editingId, data);
      toast('Group updated!', 'success');
    } else {
      await addDocument(COLLECTIONS.groups, data);
      toast('Group created!', 'success');
    }
    closeModal('groupModal');
    loadAll();
  } catch (err) {
    toast('Failed to save group', 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Save Group';
  }
});

window.deleteGroup = async (id, name) => {
  if (!confirmDelete(name)) return;
  try {
    await deleteDocument(COLLECTIONS.groups, id);
    toast('Group deleted', 'info');
    loadAll();
  } catch (err) {
    toast('Failed to delete', 'error');
  }
};

// VIEW / MANAGE STUDENTS IN GROUP
let currentGroupId = null;

window.viewStudents = async (groupId, groupName) => {
  currentGroupId = groupId;
  document.getElementById('studentsGroupName').textContent = groupName;

  // Populate add-student dropdown with students NOT yet in group
  const enrolled = await getStudentsByGroup(groupId);
  const enrolledIds = enrolled.map(s => s.id);
  const available = students.filter(s => !enrolledIds.includes(s.id));
  populateSelect(document.getElementById('fAddStudent'), available, 'id', 'name', 'Select student to add...');

  renderGroupStudentList(enrolled);
  openModal('groupStudentsModal');
};

function renderGroupStudentList(list) {
  const ul = document.getElementById('groupStudentList');
  if (list.length === 0) {
    ul.innerHTML = '<div class="empty-state" style="padding:30px"><div class="empty-icon">👤</div><div class="empty-title">No students in this group</div></div>';
    return;
  }
  ul.innerHTML = list.map(s => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="avatar avatar-sm">${s.name?.charAt(0) || '?'}</div>
        <div>
          <div style="font-size:0.88rem;font-weight:600;color:var(--text-0)">${s.name}</div>
          <div style="font-size:0.75rem;color:var(--text-2)">${s.phone || '—'}</div>
        </div>
      </div>
      <button class="action-btn danger" onclick="removeFromGroup('${s.id}','${currentGroupId}')" title="Remove">✕</button>
    </div>`).join('');
}

document.getElementById('btnAddToGroup').addEventListener('click', async () => {
  const studentId = document.getElementById('fAddStudent').value;
  if (!studentId) { toast('Please select a student', 'warning'); return; }
  try {
    await addDocument(COLLECTIONS.studentGroups, { studentId, groupId: currentGroupId });
    toast('Student added to group!', 'success');
    const enrolled = await getStudentsByGroup(currentGroupId);
    const enrolledIds = enrolled.map(s => s.id);
    const available = students.filter(s => !enrolledIds.includes(s.id));
    populateSelect(document.getElementById('fAddStudent'), available, 'id', 'name', 'Select student to add...');
    renderGroupStudentList(enrolled);
  } catch (err) {
    toast('Failed to add student', 'error');
  }
});

window.removeFromGroup = async (studentId, groupId) => {
  try {
    // Find and delete the studentGroup link
    const links = await getDocuments(COLLECTIONS.studentGroups);
    const link = links.find(l => l.studentId === studentId && l.groupId === groupId);
    if (link) await deleteDocument(COLLECTIONS.studentGroups, link.id);
    toast('Student removed from group', 'info');
    const enrolled = await getStudentsByGroup(groupId);
    renderGroupStudentList(enrolled);
  } catch (err) {
    toast('Failed to remove', 'error');
  }
};

searchInput?.addEventListener('input', e => filterTable(Array.from(tbody.querySelectorAll('tr')), e.target.value));

loadAll();
