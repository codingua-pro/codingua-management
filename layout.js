// =============================================
// SHARED LAYOUT COMPONENT
// Injects sidebar + topbar into each page
// =============================================

export function injectLayout(pageTitle) {
  const sidebarHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar">
      <div class="sidebar-logo">
        <a href="index.html" class="logo-mark">
          <div class="logo-icon">🎓</div>
          <div class="logo-text">
            Codingua
            <span>Academy Manager</span>
          </div>
        </a>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Overview</div>
        <a href="index.html" class="nav-link">
          <span class="icon">⬛</span> Dashboard
        </a>
        <div class="nav-section-label">Academy</div>
        <a href="courses.html" class="nav-link">
          <span class="icon">📚</span> Courses
        </a>
        <a href="students.html" class="nav-link">
          <span class="icon">👥</span> Students
        </a>
        <a href="groups.html" class="nav-link">
          <span class="icon">🗂️</span> Groups
        </a>
        <div class="nav-section-label">Operations</div>
        <a href="sessions.html" class="nav-link">
          <span class="icon">📅</span> Sessions
        </a>
        <a href="payments.html" class="nav-link">
          <span class="icon">💳</span> Payments
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">AD</div>
          <div class="user-info">
            <div class="user-name">Admin</div>
            <div class="user-role">admin@codingua.io</div>
          </div>
        </div>
      </div>
    </aside>
  `;

  const topbarHTML = `
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-toggle" id="menuToggle">☰</button>
        <span class="page-title">${pageTitle}</span>
      </div>
      <div class="topbar-right">
        <span class="topbar-time" id="clock"></span>
      </div>
    </header>
  `;

  // Insert before #app or body's first child
  const app = document.getElementById('app');
  if (app) {
    app.insertAdjacentHTML('beforebegin', sidebarHTML);
    app.insertAdjacentHTML('afterbegin', topbarHTML);
  }
}
