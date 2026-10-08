<template>
  <div class="admin-dashboard">
    <!-- TOP BAR -->
    <header class="topbar">
      <nuxt-link to="/" class="brand">
        <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
        <span class="brand-name">No<span class="brand-dot">va</span></span>
      </nuxt-link>

      <div class="topbar-actions">
        <button class="icon-btn" @click="loadAll" :disabled="loading" aria-label="Refresh">
          <v-icon small color="#4a3b8c">mdi-refresh</v-icon>
        </button>

        <div class="user-menu-wrap">
          <button class="user-avatar" @click.stop="menuOpen = !menuOpen">
            {{ initials }}
          </button>

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
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="32" width="3" />
        <span>Loading…</span>
      </div>

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

      <template v-else>
        <!-- ============================================================
             TAB: HOME
             ============================================================ -->
        <template v-if="activeTab === 'home'">
          <section class="greeting">
            <h1>Admin</h1>
            <p>Platform at a glance.</p>
          </section>

          <section class="stats-grid">
            <div class="stat-card" @click="setTab('verifications')">
              <div class="stat-icon" style="background:#e6e0f5">
                <v-icon small color="#4a3b8c">mdi-account-check-outline</v-icon>
              </div>
              <div class="stat-body">
                <div class="stat-label">Pending verifications</div>
                <div class="stat-value">{{ stats.pending_verifications }}</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </div>

            <div class="stat-card" @click="setTab('assessments')">
              <div class="stat-icon" style="background:#fce4ec">
                <v-icon small color="#e86a8a">mdi-file-document-outline</v-icon>
              </div>
              <div class="stat-body">
                <div class="stat-label">Pending assessments</div>
                <div class="stat-value">{{ stats.pending_assessments }}</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background:#e6f9ee">
                <v-icon small color="#229954">mdi-shield-check</v-icon>
              </div>
              <div class="stat-body">
                <div class="stat-label">Verified professionals</div>
                <div class="stat-value">{{ stats.verified_professionals }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background:#d9f0f6">
                <v-icon small color="#56c2d9">mdi-account-group-outline</v-icon>
              </div>
              <div class="stat-body">
                <div class="stat-label">Active parents</div>
                <div class="stat-value">{{ stats.active_parents }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background:#e6e0f5">
                <v-icon small color="#4a3b8c">mdi-calendar-check-outline</v-icon>
              </div>
              <div class="stat-body">
                <div class="stat-label">Total bookings</div>
                <div class="stat-value">{{ stats.total_bookings }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background:#fef3e0">
                <v-icon small color="#b7791f">mdi-alert-outline</v-icon>
              </div>
              <div class="stat-body">
                <div class="stat-label">Open complaints</div>
                <div class="stat-value">{{ stats.open_complaints }}</div>
              </div>
            </div>
          </section>
        </template>

        <!-- ============================================================
             TAB: VERIFICATIONS
             ============================================================ -->
        <template v-else-if="activeTab === 'verifications'">
          <section class="greeting">
            <h1>Verifications</h1>
            <p>Review professional credentials.</p>
          </section>

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

          <div v-if="!verifications.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-check-circle-outline</v-icon>
            <span>No {{ verificationFilter }} verifications.</span>
          </div>

          <div v-else class="list">
            <div
              v-for="v in verifications"
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
              <span class="status-pill" :class="statusClass(v.status)">
                {{ v.status }}
              </span>
            </div>
          </div>
        </template>

        <!-- ============================================================
             TAB: ASSESSMENTS
             ============================================================ -->
        <template v-else-if="activeTab === 'assessments'">
          <section class="greeting">
            <h1>Assessment requests</h1>
            <p>Route requests to verified professionals.</p>
          </section>

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

          <div v-if="!assessments.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-check-circle-outline</v-icon>
            <span>No {{ assessmentFilter }} requests.</span>
          </div>

          <div v-else class="list">
            <div
              v-for="a in assessments"
              :key="a.id"
              class="list-row"
              @click="openAssessment(a)"
            >
              <div class="row-avatar" style="background: #e6e0f5">
                <v-icon small color="#4a3b8c">mdi-file-document-outline</v-icon>
              </div>
              <div class="row-body">
                <div class="row-title">{{ a.child_name }}</div>
                <div class="row-sub">
                  {{ a.preferred_county || a.child_county || '—' }}
                  · {{ relativeTime(a.created_at) }}
                </div>
                <div v-if="a.assigned_professional_name" class="row-meta">
                  Assigned to {{ a.assigned_professional_name }}
                </div>
              </div>
              <span class="status-pill" :class="statusClass(a.status)">
                {{ a.status }}
              </span>
            </div>
          </div>
        </template>

        <!-- ============================================================
             TAB: USERS
             ============================================================ -->
        <template v-else-if="activeTab === 'users'">
          <section class="greeting">
            <h1>Users</h1>
            <p>All registered accounts.</p>
          </section>

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

          <div v-if="!users.length" class="mini-empty">
            <span>No users.</span>
          </div>

          <div v-else class="list">
            <div v-for="u in users" :key="u.id" class="list-row">
              <div class="row-avatar" :style="{ background: avatarBg(u.id) }">
                {{ initialsOf(u.display_name || u.email) }}
              </div>
              <div class="row-body">
                <div class="row-title">{{ u.display_name || 'No name' }}</div>
                <div class="row-sub">{{ u.email || u.phone || '—' }}</div>
                <div class="row-meta">{{ u.role }} · joined {{ relativeTime(u.created_at) }}</div>
              </div>
              <button
                v-if="u.role !== 'admin'"
                class="row-action"
                :class="u.status === 'active' ? 'danger' : 'success'"
                :disabled="userActing === u.id"
                @click.stop="toggleUserStatus(u)"
              >
                {{ u.status === 'active' ? 'Suspend' : 'Reactivate' }}
              </button>
              <span v-else class="status-pill status-grey">{{ u.status }}</span>
            </div>
          </div>
        </template>
      </template>
    </main>

    <!-- ============================================================
         VERIFICATION DETAIL MODAL
         ============================================================ -->
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
              <button class="btn-danger" :disabled="acting" @click="rejectMode = true">
                Reject
              </button>
              <button class="btn-primary" :disabled="acting" @click="approveVerification">
                {{ acting ? 'Approving…' : 'Approve' }}
              </button>
            </template>
            <template v-else>
              <button class="btn-secondary" :disabled="acting" @click="rejectMode = false">
                Back
              </button>
              <button class="btn-danger" :disabled="acting || rejectNotes.length < 5" @click="submitReject">
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

    <!-- ============================================================
         ASSESSMENT ASSIGN MODAL
         ============================================================ -->
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
          <select
            v-model.number="assignProfessionalId"
            class="text-input"
            :disabled="acting"
          >
            <option :value="null" disabled>Select a verified professional</option>
            <option v-for="p in verifiedProfessionals" :key="p.id" :value="p.id">
              {{ p.display_name }} — {{ typeLabel(p.type) }} · {{ p.county || '—' }}
            </option>
          </select>
          <p class="hint">
            Only verified professionals appear here.
          </p>

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
      users: [],
      userActing: null,

      acting: false
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
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu);
    const qTab = this.$route.query.tab;
    const valid = ['home', 'verifications', 'assessments', 'users'];
    if (valid.includes(qTab)) this.activeTab = qTab;
    this.loadAll();
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
  },

  methods: {
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

        // Preload the active tab
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

    /* ---------------- Verifications ---------------- */
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
        this.closeVerification();
        await this.loadVerifications();
        await this.reloadStats();
      } catch (err) {
        this.verificationError = err.response?.data?.error || 'Could not reject.';
      } finally {
        this.acting = false;
      }
    },

    /* ---------------- Assessments ---------------- */
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
        this.closeAssessment();
        await this.loadAssessments();
        await this.reloadStats();
      } catch (err) {
        this.assignError = err.response?.data?.error || 'Could not assign.';
      } finally {
        this.acting = false;
      }
    },

    /* ---------------- Users ---------------- */
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

    async toggleUserStatus(u) {
      if (this.userActing) return;
      this.userActing = u.id;
      try {
        const headers = await this.authHeader();
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        await axios.patch(
          `${API}/api/admin/users/${u.id}/status`,
          { status: newStatus },
          { headers }
        );
        u.status = newStatus;
      } catch (err) {
        alert(err.response?.data?.error || 'Could not update user.');
      } finally {
        this.userActing = null;
      }
    },

    async reloadStats() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/admin/stats`, { headers });
        this.stats = data.data || this.stats;
      } catch (e) {}
    },

    /* ---------------- Helpers ---------------- */
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
.admin-dashboard { min-height: 100vh; background: #f3f7fb; padding-bottom: 48px; }

.topbar {
  position: sticky; top: 0; z-index: 40;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  height: 64px; padding: 0 16px;
  display: flex; align-items: center; justify-content: space-between;
}
@media (min-width: 768px) { .topbar { padding: 0 32px; } }
.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-mark {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  display: grid; place-items: center;
}
.brand-name { font-size: 16px; font-weight: 800; color: #2c3e50; letter-spacing: -0.02em; }
.brand-dot { color: #e86a8a; }
.topbar-actions { display: flex; align-items: center; gap: 8px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
}
.icon-btn:hover { background: #e6eef5; }
.user-menu-wrap { position: relative; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #4a3b8c, #7ec8e3);
  color: #ffffff; border: none; font-weight: 800; font-size: 13px;
  cursor: pointer; letter-spacing: 0.3px;
}
.user-menu {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px;
  background: #ffffff; border: 1px solid #ececf1; border-radius: 14px;
  box-shadow: 0 20px 40px -12px rgba(44, 62, 80, 0.18);
  overflow: hidden; z-index: 50;
}
.user-menu-head { padding: 14px 16px; border-bottom: 1px solid #f0f0f5; }
.user-menu-name { font-size: 0.88rem; font-weight: 800; color: #2c3e50; }
.user-menu-email { font-size: 0.76rem; color: #7f8c8d; margin-top: 2px; }
.role-badge {
  display: inline-block; margin-top: 8px;
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.4px;
  text-transform: uppercase; padding: 3px 8px; border-radius: 999px;
  background: #e6e0f5; color: #4a3b8c;
}
.user-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 12px 16px; background: transparent; border: none;
  text-align: left; font-size: 0.86rem; color: #2c3e50; cursor: pointer;
  font-family: inherit;
}
.user-menu-item.danger { color: #e74c3c; }

.tabs {
  position: sticky; top: 64px; z-index: 30;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  padding: 0 8px; display: flex; overflow-x: auto;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 14px 16px; border: none; background: transparent;
  font-size: 0.82rem; font-weight: 700; color: #7f8c8d;
  border-bottom: 2px solid transparent; cursor: pointer;
  font-family: inherit; white-space: nowrap;
  transition: all 0.15s ease;
}
.tab.active { color: #4a3b8c; border-bottom-color: #4a3b8c; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px; background: #e86a8a; color: #ffffff;
  font-size: 0.62rem; font-weight: 800; margin-left: 4px;
}
.tab:not(.active) .tab-badge { background: #e6e0f5; color: #4a3b8c; }

.main { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 768px) { .main { padding: 32px 32px; } }

.greeting { margin-bottom: 20px; }
.greeting h1 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; color: #2c3e50; margin: 0 0 6px; }
.greeting p { font-size: 0.95rem; color: #7f8c8d; margin: 0; }

.loading { display: flex; align-items: center; gap: 12px; padding: 60px 0; justify-content: center; color: #7f8c8d; font-size: 0.9rem; }

.error-card {
  background: #ffffff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon { width: 84px; height: 84px; border-radius: 50%; background: #fdecea; display: grid; place-items: center; margin: 0 auto 20px; }
.error-card h2 { font-size: 1.2rem; font-weight: 800; color: #2c3e50; margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 24px; }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 32px; }
@media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
.stat-card {
  display: flex; align-items: center; gap: 12px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 14px; padding: 14px;
  cursor: pointer; transition: all 0.15s ease;
}
.stat-card:hover { border-color: #c8c0e0; transform: translateY(-1px); box-shadow: 0 10px 20px -12px rgba(74, 59, 140, 0.2); }
.stat-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex: 0 0 auto; }
.stat-body { flex: 1; min-width: 0; }
.stat-label { font-size: 0.7rem; font-weight: 700; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
.stat-value { font-size: 1.4rem; font-weight: 900; color: #2c3e50; line-height: 1; font-variant-numeric: tabular-nums; }

.sub-tabs {
  display: flex; gap: 4px; background: #ffffff;
  border: 1px solid #ececf1; border-radius: 12px;
  padding: 4px; margin-bottom: 16px;
  overflow-x: auto; scrollbar-width: none;
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex: 1; padding: 10px 12px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700;
  color: #7f8c8d; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all 0.15s ease;
}
.sub-tab.active { background: #4a3b8c; color: #ffffff; }

.mini-empty {
  display: flex; align-items: center; padding: 20px;
  background: #ffffff; border: 1px dashed #d4dae4;
  border-radius: 14px; font-size: 0.86rem; color: #7f8c8d;
}

.list { display: grid; gap: 10px; }
.list-row {
  display: flex; align-items: center; gap: 14px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 14px; padding: 14px;
  cursor: pointer; transition: all 0.15s ease;
}
.list-row:hover { border-color: #c8c0e0; transform: translateY(-1px); box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25); }
.row-avatar {
  width: 44px; height: 44px; border-radius: 12px;
  color: #ffffff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px; flex: 0 0 auto;
  letter-spacing: 0.3px;
}
.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 0.92rem; font-weight: 800; color: #2c3e50; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 0.78rem; color: #7f8c8d; margin-bottom: 2px; }
.row-meta { font-size: 0.72rem; color: #95a5a6; }

.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.66rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.3px; white-space: nowrap; flex: 0 0 auto;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

.row-action {
  padding: 8px 14px; border-radius: 10px; border: 1.5px solid #e0e4eb;
  background: #ffffff; color: #2c3e50;
  font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease; flex: 0 0 auto;
}
.row-action.danger:hover { border-color: #e74c3c; color: #e74c3c; background: #fdecea; }
.row-action.success:hover { border-color: #229954; color: #229954; background: #e6f9ee; }
.row-action:disabled { opacity: 0.55; cursor: not-allowed; }

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.9rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
}
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #ffffff; color: #2c3e50;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: #e74c3c; color: #ffffff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #ffffff; border-radius: 20px; padding: 22px;
  max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
.modal-lg { max-width: 560px; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.modal-title { font-size: 1.05rem; font-weight: 800; color: #2c3e50; }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { display: grid; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f5; }
.modal-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.modal-label {
  font-size: 0.76rem; font-weight: 700; color: #7f8c8d;
  text-transform: uppercase; letter-spacing: 0.4px; flex: 0 0 auto;
}
.modal-value {
  font-size: 0.88rem; color: #2c3e50; font-weight: 600;
  text-align: right; flex: 1; min-width: 0; word-break: break-word;
}
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }

.section-title-sm {
  font-size: 0.78rem; font-weight: 800; color: #7f8c8d;
  text-transform: uppercase; letter-spacing: 0.5px;
  margin: 8px 0 4px;
}
.mt-4 { margin-top: 16px; }

.doc-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; background: #f9fafc; border-radius: 10px;
  border: 1px solid #f0f0f5;
}
.doc-body { flex: 1; min-width: 0; }
.doc-label { font-size: 0.8rem; font-weight: 700; color: #2c3e50; margin-bottom: 2px; }
.doc-link { font-size: 0.78rem; color: #4a3b8c; font-weight: 700; text-decoration: none; }
.doc-link:hover { text-decoration: underline; }

.reject-box { padding: 14px; background: #fdecea; border-radius: 12px; }
.field-label { display: block; font-size: 0.82rem; font-weight: 700; color: #2c3e50; margin-bottom: 8px; }
.text-input {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.92rem; background: #ffffff; color: #2c3e50;
  outline: none; font-family: inherit;
}
.text-input:focus { border-color: #4a3b8c; box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
.hint { font-size: 0.78rem; color: #95a5a6; margin: 6px 0 0; }

.error-box {
  padding: 12px 14px; border-radius: 10px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500;
}

@media (max-width: 599px) {
  .main { padding: 20px 14px; }
  .greeting h1 { font-size: 1.4rem; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>