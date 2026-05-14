/* ============================================================
   STUDENT REVIEWER EXCHANGE PLATFORM — script.js
   Core logic: data init, auth, CRUD, utilities
   ============================================================ */

'use strict';

/* ─── Storage Keys ──────────────────────────────────────────── */
const KEYS = {
  INITIALIZED:   'srep_initialized',
  USERS:         'srep_users',
  CURRENT_USER:  'srep_current_user',
  REVIEWERS:     'srep_reviewers',
  EVENTS:        'srep_events',
  NOTIFICATIONS: 'srep_notifications',
  RATINGS:       'srep_ratings',
};

/* ─── Storage Helpers ───────────────────────────────────────── */
function getLS(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}
function setLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

/* ─── Unique ID Generator ───────────────────────────────────── */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ─── Date Helpers ──────────────────────────────────────────── */
function fmtDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}
function fmtDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return fmtDate(isoStr);
}
function todayISO() { return new Date().toISOString().split('T')[0]; }

/* ─── Default / Sample Data ─────────────────────────────────── */
const DEFAULT_DATA = {
  users: [
    {
      id: 'user_admin',
      username: 'admin',
      password: '1234',
      name: 'Alex Admin',
      email: 'admin@srep.edu',
      subject: 'General',
      bio: 'Platform administrator and academic coordinator.',
      joinDate: '2024-01-15T08:00:00.000Z',
      role: 'admin',
    },
    {
      id: 'user_001',
      username: 'jdoe',
      password: 'pass123',
      name: 'Jane Doe',
      email: 'jane@srep.edu',
      subject: 'Mathematics',
      bio: 'Math enthusiast and tutor for calculus and statistics.',
      joinDate: '2024-02-10T09:30:00.000Z',
      role: 'student',
    },
    {
      id: 'user_002',
      username: 'msmith',
      password: 'pass456',
      name: 'Mark Smith',
      email: 'mark@srep.edu',
      subject: 'Science',
      bio: 'Chemistry and Biology reviewer with 3 years of experience.',
      joinDate: '2024-03-05T10:00:00.000Z',
      role: 'student',
    },
  ],

  reviewers: [
    {
      id: 'rev_001',
      name: 'Maria Santos',
      subject: 'Mathematics',
      contact: 'maria.santos@edu.ph',
      description: 'Experienced math reviewer specializing in Calculus, Algebra, and Statistics. Available weekdays 2–6 PM.',
      ratingTotal: 23,
      ratingCount: 5,
      submittedBy: 'user_001',
      submittedDate: '2024-03-01T07:00:00.000Z',
      tags: ['Calculus', 'Algebra', 'Statistics'],
    },
    {
      id: 'rev_002',
      name: 'Carlos Reyes',
      subject: 'Science',
      contact: 'carlos.reyes@edu.ph',
      description: 'Physics and Chemistry tutor. Board passer with 5 years of reviewing experience. Online and face-to-face sessions available.',
      ratingTotal: 18,
      ratingCount: 4,
      submittedBy: 'user_002',
      submittedDate: '2024-03-05T08:30:00.000Z',
      tags: ['Physics', 'Chemistry', 'Biology'],
    },
    {
      id: 'rev_003',
      name: 'Luz Fernandez',
      subject: 'English',
      contact: 'luz.fernandez@edu.ph',
      description: 'English literature and communication arts reviewer. Former professor offering comprehensive English proficiency reviews.',
      ratingTotal: 20,
      ratingCount: 4,
      submittedBy: 'user_admin',
      submittedDate: '2024-03-10T09:00:00.000Z',
      tags: ['Grammar', 'Literature', 'Writing'],
    },
    {
      id: 'rev_004',
      name: 'Ramon Torres',
      subject: 'History',
      contact: 'ramon.torres@edu.ph',
      description: 'Philippine and World History reviewer. Deep knowledge of social studies and civics. Weekend sessions available.',
      ratingTotal: 14,
      ratingCount: 3,
      submittedBy: 'user_001',
      submittedDate: '2024-03-15T10:00:00.000Z',
      tags: ['Philippine History', 'World History', 'Civics'],
    },
    {
      id: 'rev_005',
      name: 'Ana Villanueva',
      subject: 'Technology',
      contact: 'ana.villanueva@edu.ph',
      description: 'Computer Science and IT reviewer. Covers programming fundamentals, data structures, networking, and software engineering.',
      ratingTotal: 24,
      ratingCount: 5,
      submittedBy: 'user_002',
      submittedDate: '2024-03-20T11:00:00.000Z',
      tags: ['Programming', 'Networking', 'Software Eng.'],
    },
  ],

  ratings: [
    { id: 'rat_001', reviewerId: 'rev_001', userId: 'user_002', rating: 5, comment: 'Excellent reviewer! Very thorough and patient.', date: '2024-04-01T10:00:00.000Z' },
    { id: 'rat_002', reviewerId: 'rev_001', userId: 'user_admin', rating: 4, comment: 'Great explanations for complex topics.', date: '2024-04-03T11:00:00.000Z' },
    { id: 'rat_003', reviewerId: 'rev_002', userId: 'user_001', rating: 5, comment: 'Best physics reviewer I have encountered!', date: '2024-04-05T09:00:00.000Z' },
    { id: 'rat_004', reviewerId: 'rev_003', userId: 'user_001', rating: 5, comment: 'Helped me improve my writing significantly.', date: '2024-04-07T14:00:00.000Z' },
    { id: 'rat_005', reviewerId: 'rev_005', userId: 'user_001', rating: 5, comment: 'Very knowledgeable in programming concepts!', date: '2024-04-09T16:00:00.000Z' },
  ],

  events: [
    {
      id: 'evt_001',
      title: 'Math Finals Review',
      date: getNextDate(3),
      time: '14:00',
      type: 'review',
      description: 'Group review session for upcoming calculus finals.',
      userId: 'user_admin',
    },
    {
      id: 'evt_002',
      title: 'Physics Midterm Exam',
      date: getNextDate(7),
      time: '09:00',
      type: 'exam',
      description: 'Coverage: Chapters 1–5 (Mechanics and Thermodynamics).',
      userId: 'user_admin',
    },
    {
      id: 'evt_003',
      title: 'English Essay Submission',
      date: getNextDate(5),
      time: '23:59',
      type: 'assignment',
      description: 'Literary analysis essay on Jose Rizal\'s works. Min 1500 words.',
      userId: 'user_admin',
    },
    {
      id: 'evt_004',
      title: 'History Group Study',
      date: getNextDate(1),
      time: '16:00',
      type: 'review',
      description: 'Collaborative study session on Philippine history topics.',
      userId: 'user_admin',
    },
    {
      id: 'evt_005',
      title: 'IT Project Deadline',
      date: getNextDate(10),
      time: '17:00',
      type: 'assignment',
      description: 'Final submission of the web development capstone project.',
      userId: 'user_admin',
    },
  ],

  notifications: [
    {
      id: 'ntf_001',
      userId: 'user_admin',
      message: 'Welcome to SREP! Browse available reviewers to get started.',
      type: 'info',
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: 'ntf_002',
      userId: 'user_admin',
      message: 'A new reviewer "Ana Villanueva" has been added for Technology.',
      type: 'success',
      date: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'ntf_003',
      userId: 'user_admin',
      message: 'Reminder: Math Finals Review is scheduled for tomorrow at 2:00 PM.',
      type: 'warning',
      date: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
    {
      id: 'ntf_004',
      userId: 'user_admin',
      message: 'Your reviewer submission was successfully saved.',
      type: 'success',
      date: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ],
};

/** Returns an ISO date string N days from today */
function getNextDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/* ─── First-Run Initialization ──────────────────────────────── */
function initializeData() {
  if (getLS(KEYS.INITIALIZED)) return; // Already initialized

  setLS(KEYS.USERS,         DEFAULT_DATA.users);
  setLS(KEYS.REVIEWERS,     DEFAULT_DATA.reviewers);
  setLS(KEYS.RATINGS,       DEFAULT_DATA.ratings);
  setLS(KEYS.EVENTS,        DEFAULT_DATA.events);
  setLS(KEYS.NOTIFICATIONS, DEFAULT_DATA.notifications);
  setLS(KEYS.INITIALIZED,   true);

  console.log('[SREP] Default data initialized.');
}

/* ─── Auth Functions ────────────────────────────────────────── */
function getCurrentUser() {
  return getLS(KEYS.CURRENT_USER);
}

function setCurrentUser(user) {
  setLS(KEYS.CURRENT_USER, user);
}

function logout() {
  localStorage.removeItem(KEYS.CURRENT_USER);
  window.location.href = 'login.html';
}

/** Redirects to login if not authenticated */
function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/** Redirects to dashboard if already authenticated */
function redirectIfAuthed() {
  if (getCurrentUser()) {
    window.location.href = 'dashboard.html';
  }
}

function login(username, password) {
  const users = getLS(KEYS.USERS) || [];
  const user = users.find(
    u => u.username === username.trim() && u.password === password
  );
  if (!user) return { ok: false, error: 'Invalid username or password.' };
  setCurrentUser(user);
  return { ok: true, user };
}

function register(data) {
  const users = getLS(KEYS.USERS) || [];
  if (users.find(u => u.username === data.username.trim())) {
    return { ok: false, error: 'Username already exists. Choose another.' };
  }
  const newUser = {
    id:       'user_' + genId(),
    username: data.username.trim(),
    password: data.password,
    name:     data.name.trim(),
    email:    data.email.trim(),
    subject:  data.subject || 'General',
    bio:      '',
    joinDate: new Date().toISOString(),
    role:     'student',
  };
  users.push(newUser);
  setLS(KEYS.USERS, users);
  // Welcome notification
  addNotification(newUser.id, `Welcome to SREP, ${newUser.name}! Start by browsing reviewers.`, 'info');
  return { ok: true, user: newUser };
}

/* ─── User CRUD ─────────────────────────────────────────────── */
function getUsers()          { return getLS(KEYS.USERS) || []; }
function getUserById(id)     { return getUsers().find(u => u.id === id) || null; }

function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...updates };
  setLS(KEYS.USERS, users);
  // Refresh session if editing self
  const cu = getCurrentUser();
  if (cu && cu.id === id) setCurrentUser(users[idx]);
  return true;
}

/* ─── Reviewer CRUD ─────────────────────────────────────────── */
function getReviewers()      { return getLS(KEYS.REVIEWERS) || []; }
function getReviewerById(id) { return getReviewers().find(r => r.id === id) || null; }

function addReviewer(data) {
  const list = getReviewers();
  const reviewer = {
    id:            'rev_' + genId(),
    name:          data.name.trim(),
    subject:       data.subject,
    contact:       data.contact.trim(),
    description:   data.description.trim(),
    ratingTotal:   0,
    ratingCount:   0,
    submittedBy:   data.submittedBy,
    submittedDate: new Date().toISOString(),
    tags:          data.tags || [],
  };
  list.push(reviewer);
  setLS(KEYS.REVIEWERS, list);
  addNotification(data.submittedBy, `Your reviewer "${reviewer.name}" was successfully submitted!`, 'success');
  return reviewer;
}

function updateReviewer(id, updates) {
  const list = getReviewers();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...updates };
  setLS(KEYS.REVIEWERS, list);
  return true;
}

function deleteReviewer(id) {
  const list = getReviewers().filter(r => r.id !== id);
  setLS(KEYS.REVIEWERS, list);
  // Also remove associated ratings
  const ratings = getRatings().filter(r => r.reviewerId !== id);
  setLS(KEYS.RATINGS, ratings);
}

function getReviewersByUser(userId) {
  return getReviewers().filter(r => r.submittedBy === userId);
}

function getAverageRating(reviewer) {
  if (!reviewer.ratingCount) return 0;
  return reviewer.ratingTotal / reviewer.ratingCount;
}

/* ─── Rating Functions ──────────────────────────────────────── */
function getRatings()        { return getLS(KEYS.RATINGS) || []; }

function rateReviewer(reviewerId, userId, rating, comment) {
  const ratings = getRatings();
  // One rating per user per reviewer
  const existing = ratings.findIndex(r => r.reviewerId === reviewerId && r.userId === userId);
  const entry = { id: 'rat_' + genId(), reviewerId, userId, rating, comment, date: new Date().toISOString() };
  if (existing >= 0) {
    ratings[existing] = entry; // Update existing rating
  } else {
    ratings.push(entry);
  }
  setLS(KEYS.RATINGS, ratings);
  // Recalculate reviewer aggregate
  const reviewerRatings = ratings.filter(r => r.reviewerId === reviewerId);
  const total = reviewerRatings.reduce((s, r) => s + r.rating, 0);
  updateReviewer(reviewerId, { ratingTotal: total, ratingCount: reviewerRatings.length });
}

function getUserRatingForReviewer(reviewerId, userId) {
  return getRatings().find(r => r.reviewerId === reviewerId && r.userId === userId) || null;
}

function getReviewerRatings(reviewerId) {
  return getRatings().filter(r => r.reviewerId === reviewerId);
}

/* ─── Calendar / Events CRUD ────────────────────────────────── */
function getEvents()         { return getLS(KEYS.EVENTS) || []; }
function getEventById(id)    { return getEvents().find(e => e.id === id) || null; }

function getUserEvents(userId) {
  return getEvents().filter(e => e.userId === userId);
}

function getEventsForDate(date, userId) {
  return getEvents().filter(e => e.date === date && e.userId === userId);
}

function addEvent(data, userId) {
  const list = getEvents();
  const event = {
    id:          'evt_' + genId(),
    title:       data.title.trim(),
    date:        data.date,
    time:        data.time || '',
    type:        data.type || 'other',
    description: (data.description || '').trim(),
    userId,
  };
  list.push(event);
  setLS(KEYS.EVENTS, list);
  addNotification(userId, `Event "${event.title}" added on ${fmtDate(event.date)}.`, 'info');
  return event;
}

function updateEvent(id, updates) {
  const list = getEvents();
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...updates };
  setLS(KEYS.EVENTS, list);
  return true;
}

function deleteEvent(id) {
  setLS(KEYS.EVENTS, getEvents().filter(e => e.id !== id));
}

/* ─── Notification Functions ────────────────────────────────── */
function getNotifications(userId) {
  return (getLS(KEYS.NOTIFICATIONS) || []).filter(n => n.userId === userId);
}

function addNotification(userId, message, type = 'info') {
  const all = getLS(KEYS.NOTIFICATIONS) || [];
  all.unshift({
    id:      'ntf_' + genId(),
    userId,
    message,
    type,
    date:    new Date().toISOString(),
    read:    false,
  });
  setLS(KEYS.NOTIFICATIONS, all);
}

function markNotificationRead(id) {
  const all = getLS(KEYS.NOTIFICATIONS) || [];
  const idx = all.findIndex(n => n.id === id);
  if (idx >= 0) { all[idx].read = true; setLS(KEYS.NOTIFICATIONS, all); }
}

function markAllRead(userId) {
  const all = (getLS(KEYS.NOTIFICATIONS) || []).map(n =>
    n.userId === userId ? { ...n, read: true } : n
  );
  setLS(KEYS.NOTIFICATIONS, all);
}

function getUnreadCount(userId) {
  return getNotifications(userId).filter(n => !n.read).length;
}

/* ─── Subject Catalog ───────────────────────────────────────── */
const SUBJECTS = [
  { name: 'Mathematics',  icon: '📐', color: '#6366f1' },
  { name: 'Science',      icon: '🔬', color: '#10b981' },
  { name: 'English',      icon: '📖', color: '#3b82f6' },
  { name: 'History',      icon: '🏛️',  color: '#f59e0b' },
  { name: 'Technology',   icon: '💻', color: '#8b5cf6' },
  { name: 'Arts',         icon: '🎨', color: '#ec4899' },
  { name: 'Filipino',     icon: '🇵🇭', color: '#ef4444' },
  { name: 'Social Studies',icon: '🌍', color: '#14b8a6' },
  { name: 'Economics',    icon: '📊', color: '#f97316' },
  { name: 'General',      icon: '📚', color: '#64748b' },
];

/* ─── Toast Notification UI ─────────────────────────────────── */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 320);
  }, 3500);
}

/* ─── Modal Utilities ───────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => {
    m.classList.remove('open');
  });
  document.body.style.overflow = '';
}

/* ─── Stars Renderer ────────────────────────────────────────── */
function renderStars(avg, interactive = false, reviewerId = '') {
  const rounded = Math.round(avg);
  let html = '<span class="stars-display">';
  for (let i = 1; i <= 5; i++) {
    const cls = interactive
      ? `star interactive ${i <= rounded ? 'filled' : ''}`
      : `star ${i <= rounded ? 'filled' : ''}`;
    const attr = interactive ? `data-val="${i}" data-rid="${reviewerId}"` : '';
    html += `<span class="${cls}" ${attr}>★</span>`;
  }
  html += '</span>';
  return html;
}

/* ─── Avatar Initials ───────────────────────────────────────── */
function getInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/* ─── Confirm Dialog ────────────────────────────────────────── */
// Named showConfirm (NOT "confirm") to avoid shadowing window.confirm
function showConfirm(message, onConfirm) {
  const overlay = document.getElementById('confirm-modal');
  if (!overlay) { if (window.confirm(message)) onConfirm(); return; }
  document.getElementById('confirm-message').textContent = message;
  openModal('confirm-modal');
  const btn = document.getElementById('confirm-ok');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => {
    closeModal('confirm-modal');
    onConfirm();
  });
}

/* ─── Auto-init on every page ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initializeData();  // First-run check

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // Mobile sidebar toggle
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay && sidebarOverlay.classList.toggle('open');
    });
    sidebarOverlay && sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    });
  }
});
