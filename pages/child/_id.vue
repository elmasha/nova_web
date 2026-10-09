<template>
  <div class="child-page">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Child profile</div>
      <button class="icon-btn" @click="load" :disabled="loading" aria-label="Refresh">
        <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
      </button>
    </header>

    <!-- TABS -->
    <nav v-if="child && !loading && !loadError" class="tabs">
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
        <span v-if="t.value === 'bookings' && upcomingBookings.length" class="tab-badge">
          {{ upcomingBookings.length }}
        </span>
        <span v-else-if="t.value === 'assessments' && openRequests.length" class="tab-badge">
          {{ openRequests.length }}
        </span>
      </button>
    </nav>

    <main class="main">
      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-wrap">
        <div class="sk-hero"></div>
        <div class="sk-strip">
          <div v-for="n in 3" :key="n" class="sk-chip"></div>
        </div>
        <div class="sk-card"></div>
        <div class="sk-card"></div>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="38" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Could not load child</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
        <button class="link-btn mt-3" @click="goBack">Back to dashboard</button>
      </section>

      <template v-else-if="child">
        <transition name="fade-slide" mode="out-in">
          <template>
            <!-- ============================================================
                 OVERVIEW
                 ============================================================ -->
            <section v-if="activeTab === 'overview'" key="overview">
              <!-- HERO -->
              <div class="hero">
                <div class="hero-body">
                  <div class="hero-avatar" :style="{ background: avatarBg }">
                    {{ initials }}
                  </div>
                  <div class="hero-info">
                    <div class="hero-kicker">Child profile</div>
                    <h1 class="hero-title">{{ child.full_name }}</h1>
                    <div class="hero-meta">
                      <span class="hero-chip">{{ age(child.dob) }}</span>
                      <span v-if="child.gender" class="hero-chip">{{ genderLabel(child.gender) }}</span>
                      <span v-if="child.county" class="hero-chip">{{ child.county }}</span>
                    </div>
                  </div>
                  <button class="hero-copy" @click="copyChildId" :aria-label="'Copy child ID'">
                    <v-icon x-small color="white">mdi-content-copy</v-icon>
                  </button>
                </div>
                <div class="hero-glow"></div>
              </div>

              <!-- STAT STRIP -->
              <div class="stat-strip">
                <div class="stat-chip" @click="setTab('bookings')">
                  <div class="stat-icon gradient-purple">
                    <v-icon small color="white">mdi-calendar-check-outline</v-icon>
                  </div>
                  <div class="stat-body">
                    <div class="stat-value">{{ upcomingBookings.length }}</div>
                    <div class="stat-label">Upcoming</div>
                  </div>
                </div>

                <div class="stat-chip" @click="setTab('assessments')">
                  <div class="stat-icon gradient-pink">
                    <v-icon small color="white">mdi-file-document-outline</v-icon>
                  </div>
                  <div class="stat-body">
                    <div class="stat-value">{{ openRequests.length }}</div>
                    <div class="stat-label">Open requests</div>
                  </div>
                </div>

                <div class="stat-chip" @click="setTab('edit')">
                  <div class="stat-icon gradient-teal">
                    <v-icon small color="white">mdi-pencil-outline</v-icon>
                  </div>
                  <div class="stat-body">
                    <div class="stat-value">{{ updatedLabel }}</div>
                    <div class="stat-label">Last updated</div>
                  </div>
                </div>
              </div>

              <!-- QUICK ACTIONS -->
              <div class="section-head">
                <h2>Quick actions</h2>
              </div>
              <div class="quick-actions">
                <button class="qa-card" @click="startAssessment">
                  <div class="qa-icon gradient-purple">
                    <v-icon small color="white">mdi-clipboard-text-outline</v-icon>
                  </div>
                  <div class="qa-text">
                    <div class="qa-title">Start assessment</div>
                    <div class="qa-sub">Route to a specialist</div>
                  </div>
                  <v-icon small color="#c8c0e0" class="qa-arrow">mdi-chevron-right</v-icon>
                </button>

                <button class="qa-card" @click="goTo('/professionals')">
                  <div class="qa-icon gradient-teal">
                    <v-icon small color="white">mdi-account-search-outline</v-icon>
                  </div>
                  <div class="qa-text">
                    <div class="qa-title">Find professional</div>
                    <div class="qa-sub">Browse verified experts</div>
                  </div>
                  <v-icon small color="#c8c0e0" class="qa-arrow">mdi-chevron-right</v-icon>
                </button>

                <button class="qa-card" @click="setTab('bookings')">
                  <div class="qa-icon gradient-pink">
                    <v-icon small color="white">mdi-calendar-month-outline</v-icon>
                  </div>
                  <div class="qa-text">
                    <div class="qa-title">View sessions</div>
                    <div class="qa-sub">Upcoming and past</div>
                  </div>
                  <v-icon small color="#c8c0e0" class="qa-arrow">mdi-chevron-right</v-icon>
                </button>
              </div>

              <!-- NOTES -->
              <div v-if="child.notes" class="section-head mt-6">
                <h2>Notes</h2>
                <button class="link-btn" @click="setTab('edit')">Edit</button>
              </div>
              <div v-if="child.notes" class="card">
                <p class="note-text">{{ child.notes }}</p>
              </div>

              <!-- UPCOMING -->
              <div class="section-head mt-6">
                <h2>Upcoming sessions</h2>
                <button v-if="upcomingBookings.length" class="link-btn" @click="setTab('bookings')">
                  View all
                </button>
              </div>

              <div v-if="!upcomingBookings.length" class="empty-state">
                <div class="empty-illustration">
                  <v-icon size="30" color="#4a3b8c">mdi-calendar-blank-outline</v-icon>
                </div>
                <div class="empty-title">No upcoming sessions</div>
                <div class="empty-sub">Book a professional to schedule the first session.</div>
                <button class="primary-btn small mt-3" @click="goTo('/professionals')">
                  Find a professional
                </button>
              </div>

              <div v-else class="list">
                <div
                  v-for="b in upcomingBookings.slice(0, 3)"
                  :key="b.id"
                  class="list-row clickable"
                  @click="goTo(`/bookings/${b.id}`)"
                >
                  <div class="date-block">
                    <div class="db-dow">{{ dowOf(b.scheduled_at) }}</div>
                    <div class="db-day">{{ dayOf(b.scheduled_at) }}</div>
                    <div class="db-mon">{{ monthOf(b.scheduled_at) }}</div>
                  </div>
                  <div class="row-body">
                    <div class="row-title">{{ b.professional_name || 'Professional' }}</div>
                    <div class="row-sub">{{ b.professional_type || 'Session' }}</div>
                    <div class="row-meta">
                      <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                      {{ timeOf(b.scheduled_at) }}
                    </div>
                  </div>
                  <div class="row-tail">
                    <span class="status-pill" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
                    <v-icon small color="#c8c0e0" class="chev">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </div>
            </section>

            <!-- ============================================================
                 BOOKINGS
                 ============================================================ -->
            <section v-else-if="activeTab === 'bookings'" key="bookings">
              <div class="greeting">
                <h1>Sessions</h1>
                <p>Every booked session for {{ child.full_name }}.</p>
              </div>

              <div class="sub-tabs">
                <button
                  v-for="f in bookingFilters"
                  :key="f.value"
                  class="sub-tab"
                  :class="{ active: bookingFilter === f.value }"
                  @click="bookingFilter = f.value"
                >
                  {{ f.label }}
                </button>
              </div>

              <div v-if="!filteredBookings.length" class="empty-state">
                <div class="empty-illustration">
                  <v-icon size="30" color="#4a3b8c">mdi-calendar-blank-outline</v-icon>
                </div>
                <div class="empty-title">No {{ bookingFilter }} sessions</div>
                <div class="empty-sub">Sessions you book for this child appear here.</div>
              </div>

              <div v-else class="list">
                <div
                  v-for="b in filteredBookings"
                  :key="b.id"
                  class="list-row clickable"
                  @click="goTo(`/bookings/${b.id}`)"
                >
                  <div class="date-block">
                    <div class="db-dow">{{ dowOf(b.scheduled_at) }}</div>
                    <div class="db-day">{{ dayOf(b.scheduled_at) }}</div>
                    <div class="db-mon">{{ monthOf(b.scheduled_at) }}</div>
                  </div>
                  <div class="row-body">
                    <div class="row-title">{{ b.professional_name || 'Professional' }}</div>
                    <div class="row-sub">{{ b.professional_type || 'Session' }}</div>
                    <div class="row-meta">
                      <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                      {{ timeOf(b.scheduled_at) }}
                    </div>
                  </div>
                  <div class="row-tail">
                    <span class="status-pill" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
                    <v-icon small color="#c8c0e0" class="chev">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </div>
            </section>

            <!-- ============================================================
                 ASSESSMENTS
                 ============================================================ -->
            <section v-else-if="activeTab === 'assessments'" key="assessments">
              <div class="greeting-row">
                <div>
                  <h1>Assessments</h1>
                  <p>Assessment requests and reports.</p>
                </div>
                <button class="primary-btn" @click="startAssessment">
                  <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                  New request
                </button>
              </div>

              <div v-if="!requests.length" class="empty-state">
                <div class="empty-illustration">
                  <v-icon size="30" color="#4a3b8c">mdi-file-document-outline</v-icon>
                </div>
                <div class="empty-title">No assessment requests</div>
                <div class="empty-sub">Start one to route {{ child.full_name }} to a specialist.</div>
                <button class="primary-btn small mt-3" @click="startAssessment">
                  Start assessment
                </button>
              </div>

              <div v-else class="list">
                <div v-for="r in requests" :key="r.id" class="assessment-row">
                  <div class="assess-head">
                    <div class="assess-icon gradient-purple">
                      <v-icon small color="white">mdi-file-document-outline</v-icon>
                    </div>
                    <div class="assess-body">
                      <div class="row-title">Assessment request</div>
                      <div class="row-meta">Submitted {{ relativeTime(r.created_at) }}</div>
                    </div>
                    <span class="status-pill" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
                  </div>

                  <div v-if="r.concerns" class="assess-concern">
                    "{{ r.concerns }}"
                  </div>

                  <div class="assess-progress">
                    <div class="progress-track">
                      <div
                        class="progress-fill"
                        :style="{ width: progressPercent(r.status) + '%' }"
                      ></div>
                    </div>
                    <div class="progress-label">{{ progressLabel(r.status) }}</div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ============================================================
                 EDIT
                 ============================================================ -->
            <section v-else-if="activeTab === 'edit'" key="edit">
              <div class="greeting">
                <h1>Edit details</h1>
                <p>Keep {{ child.full_name }}'s profile up to date.</p>
              </div>

              <div class="card">
                <label class="field-label">Full name</label>
                <input
                  v-model.trim="form.full_name"
                  type="text"
                  class="text-input"
                  :disabled="saving"
                />

                <label class="field-label mt-4">Date of birth</label>
                <input
                  v-model="form.dob"
                  type="date"
                  class="text-input"
                  :disabled="saving"
                  :max="todayISO"
                />

                <label class="field-label mt-4">Gender</label>
                <div class="chip-row">
                  <button
                    v-for="g in genders"
                    :key="g.value"
                    type="button"
                    class="chip"
                    :class="{ active: form.gender === g.value }"
                    :disabled="saving"
                    @click="form.gender = g.value"
                  >
                    {{ g.label }}
                  </button>
                </div>

                <label class="field-label mt-4">County</label>
                <select v-model="form.county" class="text-input" :disabled="saving">
                  <option value="">Select a county</option>
                  <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
                </select>

                <label class="field-label mt-4">Area (optional)</label>
                <input
                  v-model.trim="form.area"
                  type="text"
                  class="text-input"
                  :disabled="saving"
                />

                <label class="field-label mt-4">School (optional)</label>
                <input
                  v-model.trim="form.school_name"
                  type="text"
                  class="text-input"
                  :disabled="saving"
                />

                <label class="field-label mt-4">Existing diagnosis (optional)</label>
                <input
                  v-model.trim="form.diagnosis_optional"
                  type="text"
                  placeholder="e.g. Autism, Down syndrome"
                  class="text-input"
                  :disabled="saving"
                />

                <label class="field-label mt-4">
                  Notes (optional)
                  <span class="field-hint">{{ form.notes.length }}/2000</span>
                </label>
                <textarea
                  v-model.trim="form.notes"
                  rows="4"
                  maxlength="2000"
                  class="text-input textarea"
                  :disabled="saving"
                ></textarea>

                <div v-if="saveError" class="error-box">
                  <v-icon small color="#e74c3c" class="mr-2">mdi-alert-circle-outline</v-icon>
                  <span>{{ saveError }}</span>
                </div>

                <button
                  class="primary-btn mt-4"
                  :disabled="!canSave || saving"
                  @click="save"
                >
                  <span v-if="!saving">
                    Save changes
                    <v-icon small color="white" class="ml-2">mdi-check</v-icon>
                  </span>
                  <span v-else class="loading-row">
                    <v-progress-circular indeterminate size="18" width="2" color="white" />
                    <span class="ml-2">Saving…</span>
                  </span>
                </button>
              </div>

              <!-- DANGER -->
              <div class="card danger-card">
                <h2 class="card-title danger-title">Danger zone</h2>
                <button class="row-btn danger-row" @click="confirmArchive">
                  <div class="row-icon" style="background: #fdecea">
                    <v-icon small color="#e74c3c">mdi-archive-outline</v-icon>
                  </div>
                  <div class="row-body">
                    <div class="row-title">Archive this child</div>
                    <div class="row-sub">Hides from dashboard. Data is kept.</div>
                  </div>
                  <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
                </button>
              </div>
            </section>
          </template>
        </transition>
      </template>
    </main>

    <!-- ARCHIVE CONFIRM -->
    <transition name="modal">
      <div v-if="showArchiveConfirm" class="modal-backdrop" @click.self="showArchiveConfirm = false">
        <div class="modal modal-sm">
          <div class="confirm-icon danger">
            <v-icon size="34" color="#e74c3c">mdi-archive-outline</v-icon>
          </div>
          <h3 class="confirm-title">Archive {{ child?.full_name }}?</h3>
          <p class="confirm-text">
            The child will be hidden from your dashboard. You can restore later by contacting support.
          </p>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showArchiveConfirm = false">Cancel</button>
            <button class="btn-danger" :disabled="saving" @click="archiveChild">
              {{ saving ? 'Archiving…' : 'Archive' }}
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
          <span class="toast-text">{{ t.message }}</span>
          <span class="toast-bar" />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

const ROLE_TABS = ['overview', 'bookings', 'assessments', 'edit'];

export default {
  name: 'ChildDetailPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      saving: false,
      loadError: '',
      saveError: '',
      scrolled: false,

      child: null,
      bookings: [],
      requests: [],

      activeTab: 'overview',
      tabs: [
        { value: 'overview',    label: 'Overview',    icon: 'mdi-view-dashboard-outline' },
        { value: 'bookings',    label: 'Sessions',    icon: 'mdi-calendar-check-outline' },
        { value: 'assessments', label: 'Assessments', icon: 'mdi-file-document-outline' },
        { value: 'edit',        label: 'Edit',        icon: 'mdi-pencil-outline' }
      ],

      bookingFilter: 'upcoming',
      bookingFilters: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past',     label: 'Past' },
        { value: 'all',      label: 'All' }
      ],

      form: {
        full_name: '',
        dob: '',
        gender: '',
        county: '',
        area: '',
        school_name: '',
        notes: '',
        diagnosis_optional: ''
      },

      genders: [
        { value: 'male', label: 'Boy' },
        { value: 'female', label: 'Girl' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],

      showArchiveConfirm: false,
      toasts: [],

      counties: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi',
        'Meru', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira',
        'Kitui', 'Garissa', 'Turkana', 'Other'
      ]
    };
  },

  computed: {
    childId() {
      return this.$route.params.id;
    },
    initials() {
      const n = (this.child?.full_name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg() {
      const palette = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return palette[(Number(this.childId) || 0) % palette.length];
    },
    todayISO() {
      return new Date().toISOString().split('T')[0];
    },
    upcomingBookings() {
      const now = Date.now();
      return this.bookings
        .filter((b) => {
          const t = new Date(b.scheduled_at).getTime();
          return t >= now && ['pending', 'confirmed'].includes(b.status);
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    filteredBookings() {
      const now = Date.now();
      if (this.bookingFilter === 'upcoming') {
        return this.bookings
          .filter((b) => {
            const t = new Date(b.scheduled_at).getTime();
            return t >= now && ['pending', 'confirmed'].includes(b.status);
          })
          .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      }
      if (this.bookingFilter === 'past') {
        return this.bookings
          .filter((b) => {
            const t = new Date(b.scheduled_at).getTime();
            return t < now || ['completed', 'cancelled', 'no_show'].includes(b.status);
          })
          .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
      }
      return this.bookings.slice().sort(
        (a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)
      );
    },
    openRequests() {
      return this.requests.filter(
        (r) => ['submitted', 'routing', 'assigned', 'in_progress'].includes(r.status)
      );
    },
    updatedLabel() {
      if (!this.child?.updated_at) return '—';
      const diff = Date.now() - new Date(this.child.updated_at).getTime();
      const days = Math.floor(diff / 86400000);
      if (days < 1) return 'today';
      if (days === 1) return '1d';
      if (days < 30) return `${days}d`;
      const months = Math.floor(days / 30);
      return `${months}mo`;
    },
    canSave() {
      if (!this.child) return false;
      const fields = ['full_name', 'dob', 'gender', 'county', 'area', 'school_name', 'notes', 'diagnosis_optional'];
      const changed = fields.some((f) => (this.form[f] || '') !== (this.child[f] || ''));
      return changed && this.form.full_name.trim().length >= 2;
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });

    const qTab = this.$route.query.tab;
    if (ROLE_TABS.includes(qTab)) this.activeTab = qTab;

    // Warn on leaving with unsaved edit changes
    window.addEventListener('beforeunload', this.onBeforeUnload);

    this.load();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  },

  methods: {
    onScroll() { this.scrolled = window.scrollY > 4; },

    onBeforeUnload(e) {
      if (this.canSave) {
        e.preventDefault();
        e.returnValue = '';
      }
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
        return typeof this.$firebase.auth === 'function'
          ? this.$firebase.auth()
          : this.$firebase.auth;
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

    goBack() {
      this.$router.push('/dashboard/parent?tab=children').catch(() => {});
    },

    goTo(path) {
      if (!path) return;
      this.$router.push(path).catch(() => {});
    },

    setTab(tab) {
      if (!ROLE_TABS.includes(tab)) return;
      this.activeTab = tab;
      this.$router.replace({ path: this.$route.path, query: { tab } }).catch(() => {});
    },

    async copyChildId() {
      if (!this.child) return;
      try {
        await navigator.clipboard.writeText(String(this.child.id));
        this.toast('Child ID copied');
      } catch (e) {
        this.toast('Copy not supported', 'warn', 'mdi-alert-outline');
      }
    },

    async load() {
      this.loading = true;
      this.loadError = '';

      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          this.loadError = 'You are not signed in.';
          this.loading = false;
          return;
        }

        const [childRes, bookingsRes, requestsRes] = await Promise.all([
          axios.get(`${API}/api/children/${this.childId}`, { headers }),
          axios.get(`${API}/api/bookings/mine`, { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get(`${API}/api/assessments/requests/mine`, { headers })
            .catch(() => ({ data: { data: [] } }))
        ]);

        this.child = childRes.data?.data || null;

        const allBookings = bookingsRes.data?.data || [];
        const allRequests = requestsRes.data?.data || [];
        this.bookings = allBookings.filter((b) => String(b.child_id) === String(this.childId));
        this.requests = allRequests
          .filter((r) => String(r.child_id) === String(this.childId))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (this.child) this.syncForm();
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          this.loadError = 'This child could not be found.';
        } else if (status === 403) {
          this.loadError = 'You don\'t have access to this child\'s profile.';
        } else if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else {
          this.loadError = 'Could not load this child. Please try again.';
        }
        console.error('[child] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    syncForm() {
      if (!this.child) return;
      this.form.full_name = this.child.full_name || '';
      this.form.dob = this.child.dob ? String(this.child.dob).split('T')[0] : '';
      this.form.gender = this.child.gender || '';
      this.form.county = this.child.county || '';
      this.form.area = this.child.area || '';
      this.form.school_name = this.child.school_name || '';
      this.form.notes = this.child.notes || '';
      this.form.diagnosis_optional = this.child.diagnosis_optional || '';
    },

    async save() {
      if (!this.canSave || this.saving) return;
      this.saveError = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();
        const payload = {
          full_name: this.form.full_name,
          dob: this.form.dob || null,
          gender: this.form.gender || null,
          county: this.form.county || null,
          area: this.form.area || null,
          school_name: this.form.school_name || null,
          notes: this.form.notes || null,
          diagnosis_optional: this.form.diagnosis_optional || null
        };

        const { data } = await axios.patch(
          `${API}/api/children/${this.childId}`,
          payload,
          { headers }
        );

        this.child = data.data || this.child;
        this.syncForm();
        this.toast('Changes saved');
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;
        this.saveError = status === 400
          ? `Check the form: ${body?.details?.[0]?.message || body?.error}`
          : body?.message || 'Could not save. Please try again.';
        console.error('[child] save failed', status, body);
      } finally {
        this.saving = false;
      }
    },

    confirmArchive() {
      this.showArchiveConfirm = true;
    },

    async archiveChild() {
      this.saving = true;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/children/${this.childId}`, { headers });
        this.toast('Child archived', 'warn', 'mdi-archive-outline');
        setTimeout(() => this.goBack(), 500);
      } catch (err) {
        this.toast('Could not archive. Try again.', 'error', 'mdi-alert-circle-outline');
        this.showArchiveConfirm = false;
      } finally {
        this.saving = false;
      }
    },

    startAssessment() {
      this.$router.push({
        path: '/assessments/new',
        query: { child: this.childId }
      }).catch(() => {});
    },

    /* ---- Helpers ---- */
    age(dob) {
      if (!dob) return 'Age not set';
      const d = new Date(dob);
      if (isNaN(d.getTime())) return 'Age not set';
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      let months = now.getMonth() - d.getMonth();
      if (months < 0) { years--; months += 12; }
      if (years <= 0) return `${months} mo`;
      if (years === 1) return '1 yr';
      return `${years} yrs`;
    },

    genderLabel(g) {
      const map = {
        male: 'Boy',
        female: 'Girl',
        other: 'Other',
        prefer_not_to_say: ''
      };
      return map[g] || '';
    },

    dowOf(ts)   { return new Date(ts).toLocaleDateString('en-KE', { weekday: 'short' }); },
    dayOf(ts)   { return new Date(ts).getDate(); },
    monthOf(ts) { return new Date(ts).toLocaleDateString('en-KE', { month: 'short' }).toUpperCase(); },
    timeOf(ts)  { return new Date(ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); },

    statusClass(status) {
      const s = String(status || '').toLowerCase();
      if (['confirmed', 'completed', 'assigned', 'active'].includes(s)) return 'status-green';
      if (['pending', 'submitted', 'routing', 'in_progress'].includes(s)) return 'status-amber';
      if (['cancelled', 'no_show', 'rejected'].includes(s)) return 'status-red';
      return 'status-grey';
    },

    statusLabel(status) {
      const s = String(status || '').toLowerCase();
      const m = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
        no_show: 'No-show',
        submitted: 'Submitted',
        routing: 'Routing',
        assigned: 'Assigned',
        in_progress: 'In progress'
      };
      return m[s] || s || 'Unknown';
    },

    relativeTime(ts) {
      const diff = Date.now() - new Date(ts).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hr ago`;
      const days = Math.floor(hrs / 24);
      if (days === 1) return '1 day ago';
      if (days < 30) return `${days} days ago`;
      return new Date(ts).toLocaleDateString();
    },

    progressPercent(status) {
      return {
        submitted:   20,
        routing:     45,
        assigned:    70,
        in_progress: 85,
        completed:   100,
        cancelled:   0
      }[status] || 0;
    },

    progressLabel(status) {
      return {
        submitted:   'Submitted — waiting for review',
        routing:     'Routing to a professional',
        assigned:    'Assigned to a professional',
        in_progress: 'Assessment in progress',
        completed:   'Report ready',
        cancelled:   'Cancelled'
      }[status] || status;
    }
  }
};
</script>

<style scoped>
.child-page {
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
  padding-bottom: 48px;
}

/* TOPBAR */
.topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid transparent;
  height: 60px; padding: 0 12px;
  display: flex; align-items: center; justify-content: space-between;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.topbar.scrolled { border-bottom-color: var(--line); box-shadow: 0 8px 24px -18px rgba(44, 62, 80, 0.25); }
@media (min-width: 768px) { .topbar { padding: 0 24px; } }

.back-btn, .icon-btn {
  width: 38px; height: 38px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
  transition: background 0.15s ease;
}
.back-btn:hover, .icon-btn:hover { background: #e6eef5; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.topbar-title { font-size: 0.98rem; font-weight: 800; color: var(--ink); letter-spacing: -0.01em; }

/* TABS */
.tabs {
  position: sticky; top: 60px; z-index: 30;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid var(--line);
  padding: 0 8px;
  display: flex; gap: 2px;
  overflow-x: auto; scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .tabs { padding: 0 24px; } }

.tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 15px 16px; border: none; background: transparent;
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

/* MAIN */
.main { max-width: 680px; margin: 0 auto; padding: 20px 16px; }
@media (min-width: 768px) { .main { padding: 32px 24px; } }

/* SKELETON */
.skeleton-wrap { padding-top: 4px; }
.sk-hero {
  height: 128px; border-radius: 22px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 14px;
}
.sk-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
.sk-chip {
  height: 58px; border-radius: 14px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
.sk-card {
  height: 90px; border-radius: 18px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 12px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ERROR */
.error-card {
  background: #fff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon {
  width: 76px; height: 76px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 16px;
}
.error-card h2 { font-size: 1.15rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 22px; }
.error-card .link-btn { display: inline-block; margin-top: 12px; }

/* HERO */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #4a3b8c 0%, #5b4b9e 55%, #7ec8e3 140%);
  color: #fff;
  border-radius: 22px;
  padding: 22px 20px;
  margin-bottom: 16px;
  box-shadow: 0 24px 48px -20px rgba(74, 59, 140, 0.55);
}
.hero-body {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 14px;
}
.hero-avatar {
  width: 64px; height: 64px; border-radius: 18px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 20px;
  letter-spacing: 0.4px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 12px 24px -12px rgba(15, 13, 36, 0.5);
  flex: 0 0 auto;
}
.hero-info { flex: 1; min-width: 0; }
.hero-kicker {
  font-size: 0.66rem; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase; opacity: 0.78; margin-bottom: 4px;
}
.hero-title {
  font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;
  margin: 0 0 8px; line-height: 1.2;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hero-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.hero-chip {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.68rem; font-weight: 700;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  text-transform: capitalize;
  backdrop-filter: blur(6px);
}
.hero-copy {
  flex: 0 0 auto;
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  display: grid; place-items: center; cursor: pointer;
  transition: background 0.15s ease;
}
.hero-copy:hover { background: rgba(255, 255, 255, 0.28); }
.hero-glow {
  position: absolute; top: -40%; right: -20%; width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.5), transparent 70%);
  filter: blur(20px); pointer-events: none;
}

/* STAT STRIP */
.stat-strip {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 24px;
}
.stat-chip {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid var(--line); border-radius: 14px;
  padding: 12px; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.stat-chip:hover { transform: translateY(-2px); box-shadow: 0 14px 24px -18px rgba(74, 59, 140, 0.4); border-color: #d9d2ec; }
.stat-chip:active { transform: translateY(0) scale(0.99); }
.stat-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-body { min-width: 0; }
.stat-value { font-size: 1.05rem; font-weight: 900; color: var(--ink); line-height: 1; }
.stat-label { font-size: 0.62rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px; }
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }

/* GREETING */
.greeting { margin-bottom: 18px; }
.greeting h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 6px; }
.greeting p { font-size: 0.9rem; color: var(--muted); margin: 0; }

.greeting-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 18px; flex-wrap: wrap;
}
.greeting-row h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 6px; }
.greeting-row p { font-size: 0.9rem; color: var(--muted); margin: 0; }

.section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 0 12px;
}
.section-head h2 { font-size: 1.02rem; font-weight: 800; color: var(--ink); margin: 0; letter-spacing: -0.01em; }
.link-btn {
  background: transparent; border: none; color: var(--purple);
  font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.mt-6 { margin-top: 24px; }
.mt-4 { margin-top: 16px; }
.mt-3 { margin-top: 12px; }

/* QUICK ACTIONS */
.quick-actions { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 4px; }
@media (min-width: 640px) { .quick-actions { grid-template-columns: repeat(3, 1fr); } }
.qa-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1px solid var(--line); border-radius: 16px;
  padding: 14px; cursor: pointer; font-family: inherit;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.qa-card:hover { transform: translateY(-2px); box-shadow: 0 18px 32px -20px rgba(74, 59, 140, 0.35); border-color: #d9d2ec; }
.qa-card:active { transform: translateY(0) scale(0.99); }
.qa-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.qa-text { flex: 1; min-width: 0; text-align: left; }
.qa-title { font-size: 0.88rem; font-weight: 800; color: var(--ink); margin-bottom: 2px; }
.qa-sub { font-size: 0.72rem; color: var(--muted); }
.qa-arrow { flex: 0 0 auto; }

/* CARD */
.card {
  background: #fff; border: 1px solid var(--line);
  border-radius: 18px; padding: 20px; margin-bottom: 16px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: var(--ink);
  margin: 0 0 14px; letter-spacing: -0.01em;
}
.danger-card { border-color: #fdecea; }
.danger-title { color: #c0392b; }

.note-text {
  font-size: 0.9rem; color: #4a5568; line-height: 1.65;
  margin: 0; white-space: pre-wrap;
}

/* LISTS */
.list { display: grid; gap: 10px; }
.list-row {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.list-row:hover { border-color: #d9d2ec; transform: translateY(-1px); box-shadow: 0 16px 28px -20px rgba(74, 59, 140, 0.35); }
.list-row:active { transform: translateY(0) scale(0.995); }
.list-row.clickable { position: relative; }
.list-row.clickable::before {
  content: ''; position: absolute; left: 0; top: 14px; bottom: 14px;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--purple), var(--teal-2));
  opacity: 0; transition: opacity 0.15s ease;
}
.list-row.clickable:hover::before { opacity: 1; }

/* DATE BLOCK */
.date-block {
  width: 52px; flex: 0 0 auto;
  background: linear-gradient(180deg, #f7f5ff, #ece7fa);
  border-radius: 14px;
  padding: 8px 0;
  text-align: center;
  border: 1px solid #e5def5;
}
.db-dow {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--purple);
  opacity: 0.75;
}
.db-day {
  font-size: 1.25rem; font-weight: 900; color: var(--purple);
  line-height: 1; margin: 3px 0;
}
.db-mon {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--purple);
  opacity: 0.7;
}

.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 0.94rem; font-weight: 800; color: var(--ink); margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 0.78rem; color: var(--muted); margin-bottom: 3px; text-transform: capitalize; }
.row-meta { font-size: 0.72rem; color: #95a5a6; display: flex; align-items: center; gap: 6px; }
.row-tail { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.chev { opacity: 0.55; transition: opacity 0.15s ease, transform 0.15s ease; }
.list-row:hover .chev { opacity: 1; transform: translateX(2px); }

/* EMPTY STATE */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 24px; text-align: center;
  background: #fff; border: 1px dashed #d4dae4; border-radius: 18px;
}
.empty-illustration {
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, #ede7f8, #e6f4f8);
  display: grid; place-items: center;
  margin-bottom: 14px;
}
.empty-title { font-size: 0.95rem; font-weight: 800; color: var(--ink); }
.empty-sub   { font-size: 0.82rem; color: var(--muted); margin-top: 4px; max-width: 320px; line-height: 1.5; }

/* SUB TABS */
.sub-tabs {
  display: flex; gap: 4px; background: #fff;
  border: 1px solid var(--line); border-radius: 12px;
  padding: 4px; margin-bottom: 16px;
  overflow-x: auto; scrollbar-width: none;
}
.sub-tabs::-webkit-scrollbar { display: none; }
.sub-tab {
  flex: 1; padding: 9px 14px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700;
  color: var(--muted); cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: all 0.15s ease;
}
.sub-tab.active { background: var(--purple); color: #fff; box-shadow: 0 6px 14px -8px rgba(74, 59, 140, 0.6); }

/* ASSESSMENT ROW */
.assessment-row {
  background: #fff; border: 1px solid var(--line); border-radius: 16px;
  padding: 14px 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.assessment-row:hover { border-color: #d9d2ec; transform: translateY(-1px); }
.assess-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.assess-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.assess-body { flex: 1; min-width: 0; }
.assess-concern {
  font-size: 0.82rem; color: #556; font-style: italic;
  padding: 10px 12px; background: #f7f9fc;
  border-left: 3px solid #c8c0e0;
  border-radius: 6px;
  margin-bottom: 12px;
  line-height: 1.5;
}
.assess-progress { margin-top: 4px; }
.progress-track { height: 6px; background: #eef1f6; border-radius: 999px; overflow: hidden; }
.progress-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #4a3b8c, #7ec8e3);
  transition: width 0.5s ease;
}
.progress-label { font-size: 0.72rem; color: var(--muted); margin-top: 6px; font-weight: 600; }

/* STATUS PILLS */
.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.62rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.4px; white-space: nowrap; flex: 0 0 auto;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

/* FORM */
.field-label {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 8px;
}
.field-hint { font-size: 0.7rem; font-weight: 600; color: var(--muted); }

.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #fff; color: var(--ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none; font-family: inherit;
  -webkit-appearance: none; appearance: none;
}
.text-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.textarea { resize: vertical; min-height: 100px; line-height: 1.55; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

/* CHIP SELECTOR */
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center;
  padding: 10px 16px; border-radius: 999px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s ease; font-family: inherit;
  min-height: 40px;
}
.chip:hover:not(:disabled) { border-color: var(--purple); color: var(--purple); }
.chip.active {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; border-color: var(--purple);
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.6);
}
.chip:disabled { opacity: 0.6; cursor: not-allowed; }

/* ROW BUTTONS (danger zone) */
.row-btn {
  display: flex; align-items: center; gap: 14px;
  width: 100%; padding: 12px 4px;
  background: transparent; border: none;
  text-align: left; cursor: pointer; font-family: inherit;
  border-radius: 10px; transition: background 0.15s ease;
}
.row-btn:hover { background: #f7f8fb; }
.row-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.row-btn .row-body { flex: 1; min-width: 0; }
.row-btn .row-title { font-size: 0.9rem; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
.row-btn .row-sub { font-size: 0.76rem; color: var(--muted); }
.danger-row .row-title { color: #c0392b; }

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.92rem; font-weight: 700; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  font-family: inherit; min-height: 50px;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.primary-btn.small { padding: 9px 16px; font-size: 0.82rem; min-height: 40px; width: auto; }

.btn-secondary {
  padding: 12px 20px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger {
  padding: 12px 20px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 22px -12px rgba(231, 76, 60, 0.7);
}
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: var(--purple); font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }

/* MESSAGES */
.error-box {
  margin-top: 14px; padding: 12px 14px;
  border-radius: 12px; background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500;
  display: flex; align-items: center; line-height: 1.45;
}

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #fff; border-radius: 22px;
  max-width: 420px; width: 100%; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 40px 80px -24px rgba(15, 13, 36, 0.5);
  padding: 24px 22px 18px;
  text-align: center;
}
.modal-sm { max-width: 400px; }
.confirm-icon {
  width: 68px; height: 68px; border-radius: 50%;
  background: #fdecea;
  display: grid; place-items: center;
  margin: 0 auto 14px;
}
.confirm-title { font-size: 1.05rem; font-weight: 800; color: var(--ink); margin: 0 0 8px; }
.confirm-text { font-size: 0.88rem; color: var(--muted); line-height: 1.55; margin: 0 0 20px; }
.modal-footer {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
.modal-footer button { min-width: 130px; }

/* TOASTS */
.toast-wrap {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
.toast {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center;
  padding: 12px 18px 14px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 700; color: #fff;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.5);
  max-width: 340px;
}
.toast-text { flex: 1; }
.toast-bar {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: rgba(255, 255, 255, 0.45);
  transform-origin: left;
  animation: toastBar 3.2s linear forwards;
}
@keyframes toastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.toast-success { background: linear-gradient(135deg, #229954, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

/* TRANSITIONS */
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease; }
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal { transform: translateY(20px) scale(0.97); opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(20px); }

/* MOBILE */
@media (max-width: 599px) {
  .main { padding: 18px 14px; }
  .hero { padding: 20px 16px; border-radius: 18px; }
  .hero-avatar { width: 56px; height: 56px; font-size: 18px; }
  .hero-title { font-size: 1.1rem; }
  .stat-strip { gap: 8px; }
  .stat-chip { flex-direction: column; align-items: flex-start; padding: 10px; gap: 6px; }
  .stat-value { font-size: 1rem; }
  .card { padding: 16px; }
  .quick-actions { grid-template-columns: 1fr; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-footer button { width: 100%; min-width: 0; }
  .toast-wrap { left: 14px; right: 14px; align-items: stretch; }
  .toast { max-width: none; }
}
</style>