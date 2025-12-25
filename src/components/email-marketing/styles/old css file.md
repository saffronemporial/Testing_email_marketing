/* =========================================================
   SAFFRON EMPORIAL – EMAIL MARKETING DESIGN SYSTEM
   Enterprise Gold • Glass • Finance Dashboard Grade
   ========================================================= */

/* ---------------- ROOT THEME ---------------- */
:root {
  --gold-primary: #d4af37;
  --gold-secondary: #b8962e;
  --gold-glow: rgba(212, 175, 55, 0.35);

  --bg-dark: #0b0f1a;
  --bg-panel: rgba(255, 255, 255, 0.08);
  --bg-panel-strong: rgba(255, 255, 255, 0.12);

  --border-soft: rgba(255, 255, 255, 0.15);
  --text-primary: #ffffff;
  --text-muted: #9ca3af;

  --radius-lg: 18px;
  --radius-md: 14px;
  --radius-sm: 10px;

  --blur-strong: blur(16px);
  --blur-soft: blur(10px);

  --transition-fast: 0.2s ease;
  --transition-medium: 0.35s ease;
}

/* ---------------- GLOBAL RESET (MODULE ONLY) ---------------- */
.email-marketing-root {
  width: 100% !important;
  height: 100% !important;
  background: radial-gradient(
      circle at top right,
      rgba(212, 175, 55, 0.08),
      transparent 45%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(212, 175, 55, 0.05),
      transparent 50%
    ),
    var(--bg-dark);
  color: var(--text-primary) !important;
  overflow: hidden !important;
}

/* ---------------- LAYOUT ---------------- */
.email-layout {
  display: flex !important;
  height: 100% !important;
  width: 100% !important;
}

/* ---------------- SIDEBAR ---------------- */
.email-sidebar {
  width: 260px !important;
  min-width: 260px !important;
  background: linear-gradient(
    180deg,
    rgba(20, 25, 45, 0.85),
    rgba(10, 12, 25, 0.9)
  ) !important;
  backdrop-filter: var(--blur-strong);
  border-right: 1px solid var(--border-soft);
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
}

.email-sidebar-title { 
  font-size: 20px !important;
  font-weight: 600 !important;
  color: var(--gold-primary) !important;
  letter-spacing: 0.6px !important;
}

.email-sidebar-sub {
  font-size: 11px !important;
  color: var(--text-muted) !important;
  margin-top: 2px !important;
}

/* Sidebar Nav */
.email-nav {
  margin-top: 28px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
}

.email-nav a {
  padding: 10px 14px !important;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition-medium);
  display: flex;
  align-items: center;
  gap: 10px;
}

.email-nav a:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.email-nav a.active {
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.18),
    rgba(212, 175, 55, 0.05)
  ) !important;
  color: var(--gold-primary) !important;
  box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.35) !important;
}

/* Back button */
.email-back-btn {
  margin-top: auto !important;
  padding: 12px !important;
  border-radius: var(--radius-md) !important;
  background: linear-gradient(
    90deg,
    var(--gold-primary),
    var(--gold-secondary)
  ) !important;
  color: #000 !important;
  font-weight: 600 !important;
  text-align: center !important;
  cursor: pointer !important;
  transition: var(--transition-medium) !important;
}

.email-back-btn:hover {
  box-shadow: 0 0 25px var(--gold-glow);
  transform: translateY(-1px);
}

/* ---------------- MAIN CONTENT ---------------- */
.email-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---------------- HEADER ---------------- */
.email-header {
  height: 64px;
  min-height: 64px;
  background: rgba(10, 12, 25, 0.75);
  backdrop-filter: var(--blur-soft);
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.email-header-stats {
  display: flex;
  gap: 16px;
}

.email-stat-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  min-width: 120px;
}

.email-stat-card label {
  font-size: 11px;
  color: var(--text-muted);
}

.email-stat-card span {
  font-size: 18px;
  font-weight: 600;
  color: var(--gold-primary);
}

/* ---------------- PAGE CONTENT ---------------- */
.email-content {
  flex: 1;
  overflow-y: auto;
  padding: 26px;
}

/* ---------------- GLASS CARDS ---------------- */
.email-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--blur-soft);
  padding: 22px;
  transition: var(--transition-medium);
}

.email-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45),
    0 0 30px rgba(212, 175, 55, 0.18);
}

/* ---------------- BUTTONS ---------------- */
.email-btn-primary {
  background: linear-gradient(
    90deg,
    var(--gold-primary),
    var(--gold-secondary)
  );
  color: #000;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: var(--transition-medium);
}

.email-btn-primary:hover {
  box-shadow: 0 0 25px var(--gold-glow);
  transform: translateY(-1px);
}

.email-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-soft);
  color: #fff;
  padding: 10px 16px;
  border-radius: var(--radius-md);
}

/* ---------------- TABLE ---------------- */
.email-table {
  width: 100%;
  border-collapse: collapse;
}

.email-table th {
  text-align: left;
  font-size: 12px;
  color: var(--text-muted);
  padding-bottom: 10px;
}

.email-table td {
  padding: 12px 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ---------------- STATUS BADGES ---------------- */
.email-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.email-badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.email-badge-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.email-badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* ---------------- RESPONSIVE ---------------- */
@media (max-width: 1024px) {
  .email-sidebar {
    width: 220px;
    min-width: 220px;
  }
}

@media (max-width: 768px) {
  .email-layout {
    flex-direction: column;
  }

  .email-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }

  .email-nav {
    flex-direction: row;
    gap: 10px;
  }

  .email-header {
    padding: 0 14px;
  }

  .email-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .email-stat-card {
    min-width: auto;
    padding: 6px 10px;
  }

  .email-card {
    padding: 16px;
  }

  .email-btn-primary {
    width: 100%;
  }
}
