// =============================================
// SHARED UI UTILITIES
// =============================================

// Toast notifications
let toastContainer = null;

export function toast(message, type = 'info', duration = 3500) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  toastContainer.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(100%)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// Modal helpers
export function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('active');
}

export function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('active');
}

// Set up all modal close buttons
export function setupModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('active');
    });
  });
}

// Loading state for table
export function showTableLoading(tbody, cols) {
  tbody.innerHTML = `
    <tr class="loading-row">
      <td colspan="${cols}">
        <div class="spinner"></div>
        <div style="color:var(--text-2);font-size:0.82rem;font-family:var(--font-mono)">Loading data...</div>
      </td>
    </tr>`;
}

// Empty state
export function showEmptyState(tbody, cols, icon, title, desc) {
  tbody.innerHTML = `
    <tr>
      <td colspan="${cols}">
        <div class="empty-state">
          <div class="empty-icon">${icon}</div>
          <div class="empty-title">${title}</div>
          <div class="empty-desc">${desc}</div>
        </div>
      </td>
    </tr>`;
}

// Format date
export function formatDate(val) {
  if (!val) return '—';
  let d;
  if (val?.toDate) d = val.toDate();
  else if (val?.seconds) d = new Date(val.seconds * 1000);
  else d = new Date(val);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Format currency
export function formatMoney(amount) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(amount || 0);
}

// Initials from name
export function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Update clock
export function startClock(el) {
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

// Set active nav link
export function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Mobile sidebar toggle
export function setupSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
}

// Filter table rows by search
export function filterTable(rows, query) {
  query = query.toLowerCase();
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

// Confirm delete dialog
export function confirmDelete(name) {
  return confirm(`Delete "${name}"?\n\nThis action cannot be undone.`);
}

// Reset a form
export function resetForm(formId) {
  const form = document.getElementById(formId);
  if (form) form.reset();
}

// Populate a select with options
export function populateSelect(selectEl, items, valueKey, labelKey, placeholder = 'Select...') {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[labelKey];
    selectEl.appendChild(opt);
  });
}
