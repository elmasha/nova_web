<template>
  <div class="admin-dashboard">
    <!-- TOP BAR -->
    <header class="topbar" :class="{ scrolled: scrolled }">
      <nuxt-link to="/" class="brand">
        <span class="brand-mark">
          <v-icon small color="white">mdi-bridge</v-icon>
        </span>
        <span class="brand-name">No<span class="brand-dot">va</span></span>
      </nuxt-link>

      <div class="topbar-actions">
        <button class="icon-btn" @click="loadAll" :disabled="loading" aria-label="Refresh">
          <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
        </button>

        <div class="user-menu-wrap">
          <button class="user-avatar" @click.stop="menuOpen = !menuOpen">
            {{ initials }}
          </button>

          <transition name="menu">
            <div v-if="menuOpen" class="user-menu" @click.stop>
              <div class="user-menu-head">
                <div class="user-menu-name">{{ displayName }}</div>
                <div class="user-menu-email">{{ email }}</div>
                <span class="role-badge">Admin</span>
              </div>
              <button class="user-menu-item danger" @click="signOut">
                <v-icon small>mdi-logout</v-icon>
                Sign out
              </button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <!-- TABS -->
    <nav class="tabs">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon x-small :color="activeTab === t.value ? 'white' : '#7f8c8d'" class="mr-1">
          {{ t.icon }}
        </v-icon>
        <span>{{ t.label }}</span>
        <span v-if="t.value === 'verifications' && stats.pending_verifications" class="tab-badge">
          {{ stats.pending_verifications }}
        </span>
        <span v-else-if="t.value === 'assessments' && stats.pending_assessments" class="tab-badge">
          {{ stats.pending_assessments }}
        </span>
      </button>
    </nav>

    <main class="main">
      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-wrap">
        <div class="sk-greeting">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-sub"></div>
        </div>
        <div class="stats-grid">
          <div v-for="n in 6" :key="n" class="sk-stat">
            <div class="sk-circle"></div>
            <div class="sk-stat-body">
              <div class="sk-line sk-label"></div>
              <div class="sk-line sk-value"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Something went wrong</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="loadAll">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
      </section>

      <transition v-else name="fade-slide" mode="out-in">
        <template>
          <!-- HOME -->
          <section v-if="activeTab === 'home'" key="home">
            <div class="greeting">
              <h1>Admin</h1>
              <p>Platform at a glance.</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card gradient-purple" @click="setTab('verifications')">
                <div class="stat-icon">
                  <v-icon small color="white">mdi-account-check-outline</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-label">Pending verifications</div>
                  <div class="stat-value">{{ stats.pending_verifications }}</div>
                </div>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>

              <div class="stat-card gradient-pink" @click="setTab('assessments')">
                <div class="stat-icon">
                  <v-icon small color="white">mdi-file-document-outline</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-label">Pending assessments</div>
                  <div class="stat-value">{{ stats.pending_assessments }}</div>
                </div>
                <v-icon small color="#f5b7c8">mdi-chevron-right</v-icon>
              </div>

              <div class="stat-card gradient-green">
                <div class="stat-icon">
                  <v-icon small color="white">mdi-shield-check</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-label">Verified professionals</div>
                  <div class="stat-value">{{ stats.verified_professionals }}</div>
                </div>
              </div>

              <div class="stat-card gradient-teal">
                <div class="stat-icon">
                  <v-icon small color="white">mdi-account-group-outline</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-label">Active parents</div>
                  <div class="stat-value">{{ stats.active_parents }}</div>
                </div>
              </div>

              <div class="stat-card gradient-indigo">
                <div class="stat-icon">
                  <v-icon small color="white">mdi-calendar-check-outline</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-label">Total bookings</div>
                  <div class="stat-value">{{ stats.total_bookings }}</div>
                </div>
              </div>

              <div class="stat-card gradient-amber">
                <div class="stat-icon">
                  <v-icon small color="white">mdi-alert-outline</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-label">Open complaints</div>
                  <div class="stat-value">{{ stats.open_complaints }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- VERIFICATIONS -->
          <section v-else-if="activeTab === 'verifications'" key="verifications">
            <div class="greeting">
              <h1>Verifications</h1>
              <p>Review professional credentials.</p>
            </div>

            <div class="list-toolbar">
              <div class="sub-tabs">
                <button
                  v-for="f in verificationFilters"
                  :key="f.value"
                  class="sub-tab"
                  :class="{ active: verificationFilter === f.value }"
                  @click="verificationFilter = f.value; loadVerifications()"
                >
                  {{ f.label }}
                </button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="verificationSearch" placeholder="Search name, county…" />
              </div>
            </div>

            <div v-if="!filteredVerifications.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-check-circle-outline</v-icon>
              <div>
                <div class="empty-title">
                  {{ verificationSearch ? 'No matches' : `No ${verificationFilter} verifications` }}
                </div>
                <div class="empty-sub">
                  {{ verificationSearch ? 'Try a different search term.' : 'You are all caught up.' }}
                </div>
              </div>
            </div>

            <div v-else class="list">
              <div
                v-for="v in filteredVerifications"
                :key="v.id"
                class="list-row"
                @click="openVerification(v)"
              >
                <div class="row-avatar" :style="{ background: avatarBg(v.professional_id) }">
                  {{ initialsOf(v.display_name) }}
                </div>
                <div class="row-body">
                  <div class="row-title">{{ v.display_name || 'Professional' }}</div>
                  <div class="row-sub">{{ typeLabel(v.type) }} · {{ v.county || '—' }}</div>
                  <div class="row-meta">
                    <span>{{ v.years_experience || 0 }} yrs</span>
                    <span v-if="v.email"> · {{ v.email }}</span>
                  </div>
                </div>
                <span class="status-pill" :class="statusClass(v.status)">{{ v.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- ASSESSMENTS -->
          <section v-else-if="activeTab === 'assessments'" key="assessments">
            <div class="greeting">
              <h1>Assessment requests</h1>
              <p>Route requests to verified professionals.</p>
            </div>

            <div class="list-toolbar">
              <div class="sub-tabs">
                <button
                  v-for="f in assessmentFilters"
                  :key="f.value"
                  class="sub-tab"
                  :class="{ active: assessmentFilter === f.value }"
                  @click="assessmentFilter = f.value; loadAssessments()"
                >
                  {{ f.label }}
                </button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="assessmentSearch" placeholder="Search child, county…" />
              </div>
            </div>

            <div v-if="!filteredAssessments.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-file-document-outline</v-icon>
              <div>
                <div class="empty-title">
                  {{ assessmentSearch ? 'No matches' : `No ${assessmentFilter} requests` }}
                </div>
                <div class="empty-sub">
                  {{ assessmentSearch ? 'Try a different search term.' : 'New requests will appear here.' }}
                </div>
              </div>
            </div>

            <div v-else class="list">
              <div
                v-for="a in filteredAssessments"
                :key="a.id"
                class="list-row"
                @click="openAssessment(a)"
              >
                <div class="row-avatar row-avatar-purple">
                  <v-icon small color="white">mdi-file-document-outline</v-icon>
                </div>
                <div class="row-body">
                  <div class="row-title">{{ a.child_name }}</div>
                  <div class="row-sub">
                    {{ a.preferred_county || a.child_county || '—' }} · {{ relativeTime(a.created_at) }}
                  </div>
                  <div v-if="a.assigned_professional_name" class="row-meta">
                    Assigned to {{ a.assigned_professional_name }}
                  </div>
                </div>
                <span class="status-pill" :class="statusClass(a.status)">{{ a.status }}</span>
                <v-icon small color="#c8c0e0">mdi-chevron-right</v-icon>
              </div>
            </div>
          </section>

          <!-- USERS -->
          <section v-else-if="activeTab === 'users'" key="users">
            <div class="greeting">
              <h1>Users</h1>
              <p>All registered accounts.</p>
            </div>

            <div class="list-toolbar">
              <div class="sub-tabs">
                <button
                  v-for="f in userFilters"
                  :key="f.value"
                  class="sub-tab"
                  :class="{ active: userFilter === f.value }"
                  @click="userFilter = f.value; loadUsers()"
                >
                  {{ f.label }}
                </button>
              </div>
              <div class="search">
                <v-icon small color="#95a5a6" class="search-icon">mdi-magnify</v-icon>
                <input v-model.trim="userSearch" placeholder="Search name, email…" />
              </div>
            </div>

            <div v-if="!filteredUsers.length" class="mini-empty">
              <v-icon size="28" color="#c8c0e0" class="mr-3">mdi-account-group-outline</v-icon>
              <div>
                <div class="empty-title">{{ userSearch ? 'No matches' : 'No users' }}</div>
                <div class="empty-sub">
                  {{ userSearch ? 'Try a different search term.' : 'Registered users will appear here.' }}
                </div>
              </div>
            </div>

            <div v-else class="list">
              <div v-for="u in filteredUsers" :key="u.id" class="list-row">
                <div class="row-avatar" :style="{ background: avatarBg(u.id) }">
                  {{ initialsOf(u.display_name || u.email) }}
                </div>
                <div class="row-body">
                  <div class="row-title">{{ u.display_name || 'No name' }}</div>
                  <div class="row-sub">{{ u.email || u.phone || '—' }}</div>
                  <div class="row-meta">
                    <span class="role-chip">{{ u.role }}</span>
                    · joined {{ relativeTime(u.created_at) }}
                  </div>
                </div>
                <button
                  v-if="u.role !== 'admin'"
                  class="row-action"
                  :class="u.status === 'active' ? 'danger' : 'success'"
                  :disabled="userActing === u.id"
                  @click.stop="confirmToggleUser(u)"
                >
                  {{ userActing === u.id ? '…' : u.status === 'active' ? 'Suspend' : 'Reactivate' }}
                </button>
                <span v-else class="status-pill status-grey">{{ u.status }}</span>
              </div>
            </div>
          </section>
        </template>
      </transition>
    </main>

    <!-- VERIFICATION DETAIL MODAL -->
    <transition name="modal">
      <div v-if="selectedVerification" class="modal-backdrop" @click.self="closeVerification">
        <div class="modal modal-lg">
          <div class="modal-head">
            <div class="modal-title">Verification · {{ selectedVerification.display_name }}</div>
            <button class="modal-close" @click="closeVerification">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-row">
              <div class="modal-label">Type</div>
              <div class="modal-value">{{ typeLabel(selectedVerification.type) }}</div>
            </div>
            <div class="modal-row">
              <div class="modal-label">Experience</div>
              <div class="modal-value">{{ selectedVerification.years_experience || 0 }} years</div>
            </div>
            <div class="modal-row">
              <div class="modal-label">County</div>
              <div class="modal-value">
                {{ selectedVerification.county || '—' }}
                <span v-if="selectedVerification.area">, {{ selectedVerification.area }}</span>
              </div>
            </div>
            <div class="modal-row" v-if="selectedVerification.price_min || selectedVerification.price_max">
              <div class="modal-label">Price range</div>
              <div class="modal-value">
                KSh {{ formatPrice(selectedVerification.price_min) }} – {{ formatPrice(selectedVerification.price_max) }}
              </div>
            </div>
            <div class="modal-row">
              <div class="modal-label">Online</div>
              <div class="modal-value">{{ selectedVerification.online ? 'Yes' : 'No' }}</div>
            </div>
            <div v-if="selectedVerification.bio" class="modal-row">
              <div class="modal-label">Bio</div>
              <div class="modal-value">{{ selectedVerification.bio }}</div>
            </div>

            <div class="section-title-sm mt-4">Documents</div>

            <div v-if="selectedVerification.id_doc_url" class="doc-row">
              <v-icon small color="#4a3b8c" class="mr-2">mdi-card-account-details-outline</v-icon>
              <div class="doc-body">
                <div class="doc-label">National ID / Passport</div>
                <a :href="selectedVerification.id_doc_url" target="_blank" rel="noopener" class="doc-link">
                  Open document
                </a>
              </div>
            </div>
            <div v-if="selectedVerification.qualification_doc_url" class="doc-row">
              <v-icon small color="#4a3b8c" class="mr-2">mdi-school-outline</v-icon>
              <div class="doc-body">
                <div class="doc-label">Qualification</div>
                <a :href="selectedVerification.qualification_doc_url" target="_blank" rel="noopener" class="doc-link">
                  Open document
                </a>
              </div>
            </div>
            <div v-if="selectedVerification.licence_doc_url" class="doc-row">
              <v-icon small color="#4a3b8c" class="mr-2">mdi-certificate-outline</v-icon>
              <div class="doc-body">
                <div class="doc-label">Practising licence</div>
                <a :href="selectedVerification.licence_doc_url" target="_blank" rel="noopener" class="doc-link">
                  Open document
                </a>
              </div>
            </div>

            <div v-if="verificationError" class="error-box mt-4">{{ verificationError }}</div>

            <div v-if="rejectMode" class="reject-box mt-4">
              <label class="field-label">Reason for rejection</label>
              <textarea
                v-model.trim="rejectNotes"
                rows="3"
                class="text-input textarea"
                placeholder="Explain what needs fixing so the professional can resubmit."
                :disabled="acting"
              ></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <template v-if="selectedVerification.status === 'pending'">
              <template v-if="!rejectMode">
                <button class="btn-danger" :disabled="acting" @click="rejectMode = true">Reject</button>
                <button class="btn-primary" :disabled="acting" @click="approveVerification">
                  {{ acting ? 'Approving…' : 'Approve' }}
                </button>
              </template>
              <template v-else>
                <button class="btn-secondary" :disabled="acting" @click="rejectMode = false">Back</button>
                <button
                  class="btn-danger"
                  :disabled="acting || rejectNotes.length < 5"
                  @click="submitReject"
                >
                  {{ acting ? 'Rejecting…' : 'Confirm rejection' }}
                </button>
              </template>
            </template>
            <template v-else>
              <button class="btn-secondary" @click="closeVerification">Close</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- ASSESSMENT ASSIGN MODAL -->
    <transition name="modal">
      <div v-if="selectedAssessment" class="modal-backdrop" @click.self="closeAssessment">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">Assign assessment</div>
            <button class="modal-close" @click="closeAssessment">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="modal-row">
              <div class="modal-label">Child</div>
              <div class="modal-value">{{ selectedAssessment.child_name }}</div>
            </div>
            <div class="modal-row">
              <div class="modal-label">Parent</div>
              <div class="modal-value">
                {{ selectedAssessment.parent_name }}
                <span v-if="selectedAssessment.parent_phone"> · {{ selectedAssessment.parent_phone }}</span>
              </div>
            </div>
            <div v-if="selectedAssessment.preferred_county" class="modal-row">
              <div class="modal-label">Preferred county</div>
              <div class="modal-value">{{ selectedAssessment.preferred_county }}</div>
            </div>
            <div v-if="selectedAssessment.preferred_language" class="modal-row">
              <div class="modal-label">Language</div>
              <div class="modal-value">{{ selectedAssessment.preferred_language }}</div>
            </div>
            <div v-if="selectedAssessment.concerns" class="modal-row">
              <div class="modal-label">Concerns</div>
              <div class="modal-value">{{ selectedAssessment.concerns }}</div>
            </div>

            <label class="field-label mt-4">Assign to professional</label>
            <select v-model.number="assignProfessionalId" class="text-input" :disabled="acting">
              <option :value="null" disabled>Select a verified professional</option>
              <option v-for="p in verifiedProfessionals" :key="p.id" :value="p.id">
                {{ p.display_name }} — {{ typeLabel(p.type) }} · {{ p.county || '—' }}
              </option>
            </select>
            <p class="hint">Only verified professionals appear here.</p>

            <div v-if="assignError" class="error-box mt-4">{{ assignError }}</div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" :disabled="acting" @click="closeAssessment">Cancel</button>
            <button
              class="btn-primary"
              :disabled="!assignProfessionalId || acting"
              @click="submitAssign"
            >
              {{ acting ? 'Assigning…' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CONFIRM DIALOG -->
    <transition name="modal">
      <div v-if="confirmDialog" class="modal-backdrop" @click.self="confirmDialog = null">
        <div class="modal modal-sm">
          <div class="modal-head">
            <div class="modal-title">{{ confirmDialog.title }}</div>
            <button class="modal-close" @click="confirmDialog = null">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">{{ confirmDialog.message }}</p>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmDialog = null">Cancel</button>
            <button
              class="btn-danger"
              :disabled="confirmDialog.loading"
              @click="confirmDialog.onConfirm"
            >
              {{ confirmDialog.loading ? 'Working…' : confirmDialog.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- TOASTS -->
    <div class="toast-wrap">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
        >
          <v-icon small color="white" class="mr-2">{{ t.icon }}</v-icon>
          <span>{{ t.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'AdminDashboard',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      menuOpen: false,
      loadError: '',
      scrolled: false,

      activeTab: 'home',
      tabs: [
        { value: 'home',          label: 'Home',          icon: 'mdi-home-variant-outline' },
        { value: 'verifications', label: 'Verifications', icon: 'mdi-account-check-outline' },
        { value: 'assessments',   label: 'Assessments',   icon: 'mdi-file-document-outline' },
        { value: 'users',         label: 'Users',         icon: 'mdi-account-group-outline' }
      ],

      user: null,
      stats: {
        pending_verifications: 0,
        pending_assessments: 0,
        verified_professionals: 0,
        active_parents: 0,
        total_bookings: 0,
        open_complaints: 0
      },

      // Verifications
      verificationFilter: 'pending',
      verificationFilters: [
        { value: 'pending',  label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'all',      label: 'All' }
      ],
      verificationSearch: '',
      verifications: [],
      selectedVerification: null,
      rejectMode: false,
      rejectNotes: '',
      verificationError: '',

      // Assessments
      assessmentFilter: 'submitted',
      assessmentFilters: [
        { value: 'submitted', label: 'Submitted' },
        { value: 'assigned',  label: 'Assigned' },
        { value: 'all',       label: 'All' }
      ],
      assessmentSearch: '',
      assessments: [],
      verifiedProfessionals: [],
      selectedAssessment: null,
      assignProfessionalId: null,
      assignError: '',

      // Users
      userFilter: 'all',
      userFilters: [
        { value: 'all',          label: 'All' },
        { value: 'parent',       label: 'Parents' },
        { value: 'professional', label: 'Professionals' },
        { value: 'suspended',    label: 'Suspended' }
      ],
      userSearch: '',
      users: [],
      userActing: null,

      acting: false,
      confirmDialog: null,
      toasts: []
    };
  },

  computed: {
    displayName() {
      return this.user?.display_name || this.user?.email || 'Admin';
    },
    email() {
      return this.user?.email || '';
    },
    initials() {
      const n = this.displayName.trim();
      if (!n) return 'A';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    filteredVerifications() {
      const q = this.verificationSearch.toLowerCase();
      if (!q) return this.verifications;
      return this.verifications.filter((v) =>
        [v.display_name, v.type, v.county, v.area, v.email]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q))
      );
    },
    filteredAssessments() {
      const q = this.assessmentSearch.toLowerCase();
      if (!q) return this.assessments;
      return this.assessments.filter((a) =>
        [a.child_name, a.preferred_county, a.child_county, a.parent_name, a.assigned_professional_name]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q))
      );
    },
    filteredUsers() {
      const q = this.userSearch.toLowerCase();
      if (!q) return this.users;
      return this.users.filter((u) =>
        [u.display_name, u.email, u.phone, u.role]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q))
      );
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    const qTab = this.$route.query.tab;
    const valid = ['home', 'verifications', 'assessments', 'users'];
    if (valid.includes(qTab)) this.activeTab = qTab;
    this.loadAll();
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 4;
    },

    toast(message, type = 'success', icon = 'mdi-check-circle-outline') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, icon });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3200);
    },

    _fbAuth() {
      if (this.$fire?.auth) return this.$fire.auth;
      if (this.$firebase) {
        return typeof this.$firebase.auth === 'function' ? this.$firebase.auth() : this.$firebase.auth;
      }
      return null;
    },

    async authHeader() {
      const auth = this._fbAuth();
      const user = auth?.currentUser;
      if (!user) return {};
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    },

    closeMenu() { this.menuOpen = false; },

    setTab(tab) {
      this.menuOpen = false;
      this.activeTab = tab;
      this.$router.replace({ path: '/dashboard/admin', query: { tab } }).catch(() => {});

      if (tab === 'verifications') this.loadVerifications();
      else if (tab === 'assessments') {
        this.loadAssessments();
        this.loadVerifiedProfessionals();
      } else if (tab === 'users') this.loadUsers();
    },

    async loadAll() {
      this.loading = true;
      this.loadError = '';
      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          this.loadError = 'You are not signed in.';
          this.loading = false;
          return;
        }

        const [meRes, statsRes] = await Promise.all([
          axios.get(`${API}/api/users/me`, { headers }),
          axios.get(`${API}/api/admin/stats`, { headers })
        ]);

        this.user = meRes.data?.data || null;
        this.stats = statsRes.data?.data || this.stats;

        if (this.activeTab === 'verifications') await this.loadVerifications();
        else if (this.activeTab === 'assessments') {
          await this.loadAssessments();
          await this.loadVerifiedProfessionals();
        } else if (this.activeTab === 'users') await this.loadUsers();
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          this.loadError = 'Admin access required.';
        } else {
          this.loadError = 'Could not load admin dashboard.';
        }
        console.error('[admin] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    /* Verifications */
    async loadVerifications() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(
          `${API}/api/admin/verifications?status=${this.verificationFilter}`,
          { headers }
        );
        this.verifications = data.data || [];
      } catch (err) {
        console.warn('[admin] load verifications', err.response?.data || err.message);
      }
    },

    openVerification(v) {
      this.selectedVerification = v;
      this.rejectMode = false;
      this.rejectNotes = '';
      this.verificationError = '';
    },

    closeVerification() {
      this.selectedVerification = null;
      this.rejectMode = false;
      this.rejectNotes = '';
      this.verificationError = '';
    },

    async approveVerification() {
      if (!this.selectedVerification || this.acting) return;
      this.acting = true;
      this.verificationError = '';
      try {
        const headers = await this.authHeader();
        await axios.post(
          `${API}/api/admin/verifications/${this.selectedVerification.id}/approve`,
          {},
          { headers }
        );
        this.toast('Professional approved');
        this.closeVerification();
        await this.loadVerifications();
        await this.reloadStats();
      } catch (err) {
        this.verificationError = err.response?.data?.error || 'Could not approve.';
      } finally {
        this.acting = false;
      }
    },

    async submitReject() {
      if (!this.selectedVerification || this.acting || this.rejectNotes.length < 5) return;
      this.acting = true;
      this.verificationError = '';
      try {
        const headers = await this.authHeader();
        await axios.post(
          `${API}/api/admin/verifications/${this.selectedVerification.id}/reject`,
          { notes: this.rejectNotes },
          { headers }
        );
        this.toast('Professional rejected', 'warn', 'mdi-alert-outline');
        this.closeVerification();
        await this.loadVerifications();
        await this.reloadStats();
      } catch (err) {
        this.verificationError = err.response?.data?.error || 'Could not reject.';
      } finally {
        this.acting = false;
      }
    },

    /* Assessments */
    async loadAssessments() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(
          `${API}/api/admin/assessment-requests?status=${this.assessmentFilter}`,
          { headers }
        );
        this.assessments = data.data || [];
      } catch (err) {
        console.warn('[admin] load assessments', err.response?.data || err.message);
      }
    },

    async loadVerifiedProfessionals() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/verified-professionals`, { headers });
        this.verifiedProfessionals = data.data || [];
      } catch (err) {
        console.warn('[admin] load professionals', err.response?.data || err.message);
      }
    },

    openAssessment(a) {
      this.selectedAssessment = a;
      this.assignProfessionalId = a.assigned_professional_id || null;
      this.assignError = '';
    },

    closeAssessment() {
      this.selectedAssessment = null;
      this.assignProfessionalId = null;
      this.assignError = '';
    },

    async submitAssign() {
      if (!this.selectedAssessment || !this.assignProfessionalId || this.acting) return;
      this.acting = true;
      this.assignError = '';
      try {
        const headers = await this.authHeader();
        await axios.post(
          `${API}/api/admin/assessment-requests/${this.selectedAssessment.id}/assign`,
          { professional_id: this.assignProfessionalId },
          { headers }
        );
        this.toast('Assessment assigned');
        this.closeAssessment();
        await this.loadAssessments();
        await this.reloadStats();
      } catch (err) {
        this.assignError = err.response?.data?.error || 'Could not assign.';
      } finally {
        this.acting = false;
      }
    },

    /* Users */
    async loadUsers() {
      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.userFilter === 'parent' || this.userFilter === 'professional') {
          params.role = this.userFilter;
        } else if (this.userFilter === 'suspended') {
          params.status = 'suspended';
        }
        const { data } = await axios.get(`${API}/api/admin/users`, { headers, params });
        this.users = data.data || [];
      } catch (err) {
        console.warn('[admin] load users', err.response?.data || err.message);
      }
    },

    confirmToggleUser(u) {
      const isActive = u.status === 'active';
      this.confirmDialog = {
        title: isActive ? 'Suspend user?' : 'Reactivate user?',
        message: isActive
          ? `${u.display_name || u.email} will no longer be able to sign in.`
          : `${u.display_name || u.email} will regain access to the platform.`,
        confirmLabel: isActive ? 'Suspend' : 'Reactivate',
        loading: false,
        onConfirm: async () => {
          this.confirmDialog.loading = true;
          try {
            const headers = await this.authHeader();
            const newStatus = isActive ? 'suspended' : 'active';
            await axios.patch(
              `${API}/api/admin/users/${u.id}/status`,
              { status: newStatus },
              { headers }
            );
            u.status = newStatus;
            this.toast(isActive ? 'User suspended' : 'User reactivated', isActive ? 'warn' : 'success');
          } catch (err) {
            this.toast(err.response?.data?.error || 'Could not update user', 'error', 'mdi-alert-circle-outline');
          } finally {
            this.confirmDialog = null;
          }
        }
      };
    },

    async reloadStats() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/stats`, { headers });
        this.stats = data.data || this.stats;
      } catch (e) {}
    },

    /* Helpers */
    initialsOf(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },

    avatarBg(id) {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return p[(Number(id) || 0) % p.length];
    },

    statusClass(status) {
      const s = String(status || '').toLowerCase();
      if (['approved', 'verified', 'completed', 'assigned', 'active'].includes(s)) return 'status-green';
      if (['pending', 'submitted', 'routing', 'in_progress'].includes(s)) return 'status-amber';
      if (['rejected', 'cancelled', 'no_show', 'suspended'].includes(s)) return 'status-red';
      return 'status-grey';
    },

    typeLabel(t) {
      const m = {
        speech_therapist: 'Speech & language',
        occupational_therapist: 'Occupational therapy',
        physiotherapist: 'Physiotherapy',
        psychologist: 'Psychology',
        special_needs_teacher: 'Special-needs education',
        learning_support: 'Learning support',
        parent_coach: 'Parent coaching',
        other: 'Other'
      };
      return m[t] || t || '';
    },

    formatPrice(n) {
      return Number(n || 0).toLocaleString('en-US');
    },

    relativeTime(ts) {
      const diff = Date.now() - new Date(ts).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days === 1) return '1 day ago';
      if (days < 30) return `${days} days ago`;
      return new Date(ts).toLocaleDateString();
    },

    async signOut() {
      this.menuOpen = false;
      try {
        const auth = this._fbAuth();
        if (auth) await auth.signOut();
      } catch (e) {}
      try {
        const r = this.$router.push('/login');
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch (e) {}
    }
  }
};
</script>

<style scoped>
/* ============ TOKENS ============ */
.admin-dashboard {
  --purple: #4a3b8c;
  --purple-2: #5b4b9e;
  --teal: #56c2d9;
  --teal-2: #7ec8e3;
  --pink: #e86a8a;
  --pink-2: #f48fb1;
  --ink: #2c3e50;
  --muted: #7f8c8d;
  --line: #ececf1;
  --bg: #f5f7fb;

  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 64px;
}

/* ============ TOPBAR ============ */
.topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid transparent;
  height: 64px; padding: 0 16px;
  display: flex; align-items: center; justify-content: space-between;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.topbar.scrolled {
  border-bottom-color: var(--line);
  box-shadow: 0 8px 24px -18px rgba(44, 62, 80, 0.25);
}
@media (min-width: 768px) { .topbar { padding: 0 32px; } }

.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-mark {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, var(--purple), var(--teal));
  display: grid; place-items: center;
  box-shadow: 0 6px 14px -6px rgba(74, 59, 140, 0.55);
}
.brand-name { font-size: 16px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
.brand-dot { color: var(--pink); }

.topbar-actions { display: flex; align-items: center; gap: 8px; }

.icon-btn {
  width: 36px; height: 36px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}
.icon-btn:hover { background: #e6eef5; }
.icon-btn:active { transform: scale(0.95); }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.user-menu-wrap { position: relative; }
.user-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--teal-2));
  color: #fff; border: 2px solid #fff; font-weight: 800; font-size: 13px;
  cursor: pointer; letter-spacing: 0.3px;
  box-shadow: 0 6px 14px -6px rgba(74, 59, 140, 0.55);
  transition: transform 0.15s ease;
}
.user-avatar:hover { transform: translateY(-1px); }

.user-menu {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 230px;
  background: #fff; border: 1px solid var(--line); border-radius: 16px;
  box-shadow: 0 24px 48px -16px rgba(44, 62, 80, 0.25);
  overflow: hidden; z-index: 50;
}
.user-menu-head { padding: 16px; border-bottom: 1px solid #f0f0f5; }
.user-menu-name { font-size: 0.9rem; font-weight: 800; color: var(--ink); }
.user-menu-email { font-size: 0.76rem; color: var(--muted); margin-top: 2px; }
.role-badge {
  display: inline-block; margin-top: 10px;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
  background: #ede7f8; color: var(--purple);
}
.user-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 13px 16px; background: transparent; border: none;
  text-align: left; font-size: 0.86rem; color: var(--ink); cursor: pointer;
  font-family: inherit; font-weight: 600;
}
.user-menu-item.danger { color: #e74c3c; }
.user-menu-item:hover { background: #f9fafc; }

/* ============ TABS ============ */
.tabs {
  position: sticky; top: 64px; z-index: 30;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid var(--line);
  padding: 0 8px; display: flex; overflow-x: auto; scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 15px 18px; border: none; background: transparent;
  font-size: 0.82rem; font-weight: 700; color: var(--muted);
  border-bottom: 2px solid transparent; cursor: pointer;
  font-family: inherit; white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.tab:hover { color: var(--purple); }
.tab.active { color: var(--purple); border-bottom-color: var(--purple); }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 6px;
  border-radius: 999px; background: var(--pink); color: #fff;
  font-size: 0.62rem; font-weight: 800; margin-left: 4px;
}
.tab:not(.active) .tab-badge { background: #ede7f8; color: var(--purple); }

/* ============ MAIN ============ */
.main { max-width: 980px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 768px) { .main { padding: 32px; } }

.greeting { margin-bottom: 20px; }
.greeting h1 { font-size: 1.65rem; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 6px; }
.greeting p { font-size: 0.95rem; color: var(--muted); margin: 0; }

/* ============ SKELETON ============ */
.skeleton-wrap { padding-top: 4px; }
.sk-greeting { margin-bottom: 20px; }
.sk-line {
  height: 12px; border-radius: 8px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
.sk-title { width: 180px; height: 22px; margin-bottom: 10px; }
.sk-sub { width: 120px; }
.sk-stat {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 14px;
}
.sk-circle { width: 40px; height: 40px; border-radius: 12px; background: #eaedf3; flex: 0 0 auto; animation: shimmer 1.4s ease-in-out infinite; }
.sk-stat-body { flex: 1; }
.sk-label { width: 60%; height: 10px; margin-bottom: 8px; }
.sk-value { width: 40%; height: 16px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ============ ERROR ============ */
.error-card {
  background: #fff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon { width: 84px; height: 84px; border-radius: 50%; background: #fdecea; display: grid; place-items: center; margin: 0 auto 20px; }
.error-card h2 { font-size: 1.2rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 24px; }

/* ============ STATS ============ */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 32px; }
@media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }

.stat-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 16px;
  cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative; overflow: hidden;
}
.stat-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent, rgba(74, 59, 140, 0.04));
  opacity: 0; transition: opacity 0.2s ease; pointer-events: none;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 18px 32px -20px rgba(74, 59, 140, 0.35); border-color: #d9d2ec; }
.stat-card:hover::before { opacity: 1; }
.stat-icon {
  width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.stat-body { flex: 1; min-width: 0; }
.stat-label { font-size: 0.68rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
.stat-value { font-size: 1.5rem; font-weight: 900; color: var(--ink); line-height: 1; font-variant-numeric: tabular-nums; }

.gradient-purple .stat-icon { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-pink   .stat-icon { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-green  .stat-icon { background: linear-gradient(135deg, #229954, #2ecc71); }
.gradient-teal   .stat-icon { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }
.gradient-indigo .stat-icon { background: linear-gradient(135deg, #4a3b8c, #7ec8e3); }
.gradient-amber  .stat-icon { background: linear-gradient(135deg, #b7791f, #f39c12); }

/* ============ TOOLBAR ============ */
.list-toolbar { display: grid; gap: 10px; margin-bottom: 16px; }
@media (min-width: 640px) { .list-toolbar { grid-template-columns: 1fr 260px; align-items: center; } }

.sub-tabs {
  display: flex; gap: 4px; background: #fff;
  border: 1px solid var(--line); border-radius: 12px;
  padding: 4px; overflow-x: auto; scrollbar-width: none;
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex: 1; padding: 9px 14px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700;
  color: var(--muted); cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all 0.15s ease;
}
.sub-tab:hover { color: var(--purple); }
.sub-tab.active { background: var(--purple); color: #fff; box-shadow: 0 6px 14px -8px rgba(74, 59, 140, 0.6); }

.search {
  position: relative; display: flex; align-items: center;
  background: #fff; border: 1px solid var(--line); border-radius: 12px;
  padding: 0 12px; height: 42px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.search:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.search-icon { margin-right: 8px; flex: 0 0 auto; }
.search input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 0.86rem; color: var(--ink); font-family: inherit;
  min-width: 0;
}
.search input::placeholder { color: #aab3bd; }

/* ============ EMPTY ============ */
.mini-empty {
  display: flex; align-items: center; padding: 24px;
  background: #fff; border: 1px dashed #d4dae4;
  border-radius: 16px;
}
.empty-title { font-size: 0.9rem; font-weight: 800; color: var(--ink); }
.empty-sub { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }

/* ============ LIST ============ */
.list { display: grid; gap: 10px; }
.list-row {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 14px 16px;
  cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.list-row:hover { border-color: #d9d2ec; transform: translateY(-1px); box-shadow: 0 16px 28px -20px rgba(74, 59, 140, 0.35); }
.row-avatar {
  width: 46px; height: 46px; border-radius: 14px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px; flex: 0 0 auto;
  letter-spacing: 0.3px;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.row-avatar-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 0.94rem; font-weight: 800; color: var(--ink); margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 0.78rem; color: var(--muted); margin-bottom: 3px; }
.row-meta { font-size: 0.72rem; color: #95a5a6; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.role-chip {
  display: inline-block; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.4px;
  text-transform: uppercase; padding: 2px 8px; border-radius: 999px;
  background: #ede7f8; color: var(--purple);
}

.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.64rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.4px; white-space: nowrap; flex: 0 0 auto;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

.row-action {
  padding: 8px 14px; border-radius: 10px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease; flex: 0 0 auto;
}
.row-action.danger:hover { border-color: #e74c3c; color: #e74c3c; background: #fdecea; }
.row-action.success:hover { border-color: #229954; color: #229954; background: #e6f9ee; }
.row-action:disabled { opacity: 0.55; cursor: not-allowed; }

/* ============ BUTTONS ============ */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.9rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 16px 28px -14px rgba(74, 59, 140, 0.8); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.btn-secondary:hover:not(:disabled) { border-color: var(--purple); color: var(--purple); background: #f9f8ff; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 22px -12px rgba(231, 76, 60, 0.7);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-danger:hover:not(:disabled) { transform: translateY(-1px); }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

/* ============ MODAL ============ */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #fff; border-radius: 22px; padding: 24px;
  max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 40px 80px -24px rgba(15, 13, 36, 0.5);
}
.modal-lg { max-width: 560px; }
.modal-sm { max-width: 400px; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.modal-title { font-size: 1.05rem; font-weight: 800; color: var(--ink); }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 10px;
  transition: background 0.15s ease;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { display: grid; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f5; }
.modal-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.modal-label {
  font-size: 0.72rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px; flex: 0 0 auto;
}
.modal-value {
  font-size: 0.88rem; color: var(--ink); font-weight: 600;
  text-align: right; flex: 1; min-width: 0; word-break: break-word;
}
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }

.section-title-sm {
  font-size: 0.72rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.6px;
  margin: 8px 0 4px;
}
.mt-4 { margin-top: 16px; }

.doc-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; background: #f9fafc; border-radius: 12px;
  border: 1px solid #f0f0f5;
}
.doc-body { flex: 1; min-width: 0; }
.doc-label { font-size: 0.8rem; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
.doc-link { font-size: 0.78rem; color: var(--purple); font-weight: 700; text-decoration: none; }
.doc-link:hover { text-decoration: underline; }

.reject-box { padding: 14px; background: #fdecea; border-radius: 14px; }
.field-label { display: block; font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
.text-input {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.92rem; background: #fff; color: var(--ink);
  outline: none; font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.text-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
.hint { font-size: 0.78rem; color: #95a5a6; margin: 6px 0 0; }

.error-box {
  padding: 12px 14px; border-radius: 12px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500;
}
.confirm-text { font-size: 0.9rem; color: var(--ink); line-height: 1.55; margin: 0; }

/* ============ TOASTS ============ */
.toast-wrap {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
.toast {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 12px 18px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 700; color: #fff;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.5);
  max-width: 340px;
}
.toast-success { background: linear-gradient(135deg, #229954, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

/* ============ TRANSITIONS ============ */
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }

.menu-enter-active, .menu-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.menu-enter { opacity: 0; transform: translateY(-6px) scale(0.98); }
.menu-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease; }
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal { transform: translateY(20px) scale(0.97); opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(20px); }

/* ============ MOBILE ============ */
@media (max-width: 599px) {
  .main { padding: 20px 14px; }
  .greeting h1 { font-size: 1.4rem; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
  .stats-grid { grid-template-columns: 1fr; }
  .list-row { flex-wrap: wrap; }
  .row-action { margin-left: 60px; }
  .toast-wrap { left: 16px; right: 16px; align-items: stretch; }
  .toast { max-width: none; }
}
</style>