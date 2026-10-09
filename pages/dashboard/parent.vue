<template>
  <div class="parent-dashboard">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
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
                <span class="role-badge">Parent</span>
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

    <!-- TABS (desktop) -->
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
        <span v-if="t.value === 'bookings' && upcomingBookings.length" class="tab-badge">
          {{ upcomingBookings.length }}
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
        <h2>Something went wrong</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="loadAll">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
      </section>

      <transition v-else name="fade-slide" mode="out-in">
        <template>
          <!-- ============================================================
               HOME
               ============================================================ -->
          <section v-if="activeTab === 'home'" key="home">
            <!-- HERO -->
            <div class="hero">
              <div class="hero-body">
                <div class="hero-kicker">Welcome back</div>
                <h1 class="hero-title">Hello, {{ firstName }} 👋</h1>
                <p class="hero-sub">{{ heroSubtitle }}</p>
              </div>
              <div class="hero-glow"></div>
            </div>

            <!-- STAT STRIP -->
            <div class="stat-strip">
              <div class="stat-chip" @click="setTab('children')">
                <div class="stat-icon gradient-purple">
                  <v-icon small color="white">mdi-account-child-outline</v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-value">{{ children.length }}</div>
                  <div class="stat-label">{{ children.length === 1 ? 'Child' : 'Children' }}</div>
                </div>
              </div>

              <div class="stat-chip" @click="setTab('bookings')">
                <div class="stat-icon gradient-teal">
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
                  <div class="stat-value">{{ openAssessments }}</div>
                  <div class="stat-label">Open requests</div>
                </div>
              </div>
            </div>

            <!-- QUICK ACTIONS -->
            <div class="section-head">
              <h2>Quick actions</h2>
            </div>
            <div class="quick-actions">
              <button class="qa-card" @click="openAddChild">
                <div class="qa-icon gradient-purple">
                  <v-icon small color="white">mdi-account-plus</v-icon>
                </div>
                <div class="qa-text">
                  <div class="qa-title">Add child</div>
                  <div class="qa-sub">Start with a profile</div>
                </div>
                <v-icon small color="#c8c0e0" class="qa-arrow">mdi-chevron-right</v-icon>
              </button>

              <button class="qa-card" @click="setTab('assessments')">
                <div class="qa-icon gradient-pink">
                  <v-icon small color="white">mdi-file-document-plus-outline</v-icon>
                </div>
                <div class="qa-text">
                  <div class="qa-title">New assessment</div>
                  <div class="qa-sub">Find the right support</div>
                </div>
                <v-icon small color="#c8c0e0" class="qa-arrow">mdi-chevron-right</v-icon>
              </button>

              <button class="qa-card" @click="$router.push('/professionals')">
                <div class="qa-icon gradient-teal">
                  <v-icon small color="white">mdi-magnify</v-icon>
                </div>
                <div class="qa-text">
                  <div class="qa-title">Find professional</div>
                  <div class="qa-sub">Browse verified experts</div>
                </div>
                <v-icon small color="#c8c0e0" class="qa-arrow">mdi-chevron-right</v-icon>
              </button>
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
              <div class="empty-sub">Book a session with a verified professional to get started.</div>
              <button class="primary-btn small mt-3" @click="$router.push('/professionals')">
                Find a professional
              </button>
            </div>

            <div v-else class="list">
              <div
                v-for="b in upcomingBookings.slice(0, 3)"
                :key="b.id"
                class="list-row clickable"
                @click="openBooking(b)"
              >
                <div class="date-block">
                  <div class="db-dow">{{ dowOf(b.scheduled_at) }}</div>
                  <div class="db-day">{{ dayOf(b.scheduled_at) }}</div>
                  <div class="db-mon">{{ monthOf(b.scheduled_at) }}</div>
                </div>
                <div class="row-body">
                  <div class="row-title">{{ b.professional_name }}</div>
                  <div class="row-sub">{{ b.professional_type }} · {{ b.child_name }}</div>
                  <div class="row-meta">
                    <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                    {{ timeOf(b.scheduled_at) }}
                  </div>
                </div>
                <div class="row-tail">
                  <span class="status-pill" :class="statusClass(b.status)">{{ b.status }}</span>
                  <v-icon small color="#c8c0e0" class="chev">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>
          </section>

          <!-- ============================================================
               CHILDREN
               ============================================================ -->
          <section v-else-if="activeTab === 'children'" key="children">
            <div class="greeting-row">
              <div>
                <h1>Children</h1>
                <p>Manage the children in your account.</p>
              </div>
              <button class="primary-btn" @click="openAddChild">
                <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                Add child
              </button>
            </div>

            <div v-if="!children.length" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="30" color="#4a3b8c">mdi-account-child-outline</v-icon>
              </div>
              <div class="empty-title">No children yet</div>
              <div class="empty-sub">Add a child to start finding support.</div>
              <button class="primary-btn small mt-3" @click="openAddChild">Add child</button>
            </div>

            <div v-else class="list">
              <div
                v-for="c in children"
                :key="c.id"
                class="child-row clickable"
                @click="openChild(c)"
              >
                <div class="child-avatar lg" :style="{ background: avatarBg(c.id) }">
                  {{ initialsOf(c.full_name) }}
                </div>
                <div class="row-body">
                  <div class="row-title">{{ c.full_name }}</div>
                  <div class="row-sub">
                    <span class="mini-chip">{{ ageOf(c.dob) }}</span>
                    <span v-if="c.gender" class="mini-chip subtle">{{ c.gender }}</span>
                    <span v-if="c.county" class="mini-chip subtle">{{ c.county }}</span>
                  </div>
                  <div v-if="c.school_name" class="row-meta">
                    <v-icon x-small color="#95a5a6">mdi-school-outline</v-icon>
                    {{ c.school_name }}
                  </div>
                </div>
                <div class="row-tail">
                  <button
                    class="row-action danger"
                    :disabled="archivingId === c.id"
                    @click.stop="confirmArchiveChild(c)"
                  >
                    {{ archivingId === c.id ? '…' : 'Archive' }}
                  </button>
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
              <h1>Bookings</h1>
              <p>Sessions you've booked with professionals.</p>
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
              <div class="empty-title">No {{ bookingFilter }} bookings</div>
              <div class="empty-sub">Book a session with a verified professional.</div>
            </div>

            <div v-else class="list">
              <div
                v-for="b in filteredBookings"
                :key="b.id"
                class="list-row booking-row clickable"
                @click="openBooking(b)"
              >
                <div class="date-block">
                  <div class="db-dow">{{ dowOf(b.scheduled_at) }}</div>
                  <div class="db-day">{{ dayOf(b.scheduled_at) }}</div>
                  <div class="db-mon">{{ monthOf(b.scheduled_at) }}</div>
                </div>
                <div class="row-body">
                  <div class="row-title">{{ b.professional_name }}</div>
                  <div class="row-sub">
                    {{ b.professional_type }} · {{ b.child_name }}
                  </div>
                  <div class="row-meta">
                    <v-icon x-small color="#95a5a6">mdi-clock-outline</v-icon>
                    {{ timeOf(b.scheduled_at) }}
                  </div>
                </div>
                <div class="row-end">
                  <span class="status-pill" :class="statusClass(b.status)">{{ b.status }}</span>
                  <button
                    v-if="canCancel(b)"
                    class="row-action danger small"
                    :disabled="actingOn === b.id"
                    @click.stop="confirmCancelBooking(b)"
                  >
                    {{ actingOn === b.id ? '…' : 'Cancel' }}
                  </button>
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
                <p>Requests and reports for your children.</p>
              </div>
              <button
                class="primary-btn"
                :disabled="!children.length"
                @click="openNewAssessment"
              >
                <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                New request
              </button>
            </div>

            <div v-if="!assessments.length" class="empty-state">
              <div class="empty-illustration">
                <v-icon size="30" color="#4a3b8c">mdi-file-document-outline</v-icon>
              </div>
              <div class="empty-title">No assessment requests</div>
              <div class="empty-sub">
                {{ children.length ? 'Start one to find the right professional.' : 'Add a child first.' }}
              </div>
            </div>

            <div v-else class="list">
              <div v-for="a in assessments" :key="a.id" class="assessment-row">
                <div class="assess-head">
                  <div class="assess-icon gradient-purple">
                    <v-icon small color="white">mdi-file-document-outline</v-icon>
                  </div>
                  <div class="assess-body">
                    <div class="row-title">{{ childName(a.child_id) }}</div>
                    <div class="row-meta">Submitted {{ relativeTime(a.created_at) }}</div>
                  </div>
                  <span class="status-pill" :class="statusClass(a.status)">{{ a.status }}</span>
                </div>

                <div v-if="a.concerns" class="assess-concern">
                  "{{ a.concerns }}"
                </div>

                <div class="assess-progress">
                  <div class="progress-track">
                    <div
                      class="progress-fill"
                      :style="{ width: progressPercent(a.status) + '%' }"
                    ></div>
                  </div>
                  <div class="progress-label">{{ progressLabel(a.status) }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- ============================================================
               PROFILE
               ============================================================ -->
          <section v-else-if="activeTab === 'profile'" key="profile">
            <div class="greeting">
              <h1>Profile</h1>
              <p>Your account details.</p>
            </div>

            <div class="profile-header">
              <div class="profile-avatar" :style="{ background: avatarBg(user?.id || 0) }">
                {{ initials }}
              </div>
              <div class="profile-name">{{ displayName }}</div>
              <div class="profile-role">Parent</div>
            </div>

            <div class="card">
              <div class="profile-row">
                <div class="modal-label">Name</div>
                <div class="modal-value">{{ displayName }}</div>
              </div>
              <div class="profile-row">
                <div class="modal-label">Email</div>
                <div class="modal-value">{{ email || '—' }}</div>
              </div>
              <div class="profile-row">
                <div class="modal-label">Phone</div>
                <div class="modal-value">{{ user?.phone || '—' }}</div>
              </div>
              <div class="profile-row">
                <div class="modal-label">Role</div>
                <div class="modal-value">Parent</div>
              </div>
            </div>

            <button class="btn-secondary full mt-4" @click="signOut">
              <v-icon small class="mr-2">mdi-logout</v-icon>
              Sign out
            </button>
          </section>
        </template>
      </transition>
    </main>

    <!-- BOTTOM NAV (mobile) -->
    <nav class="bottom-nav">
      <button
        v-for="t in tabs.slice(0, 4)"
        :key="'bn-' + t.value"
        class="bn-item"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon small :color="activeTab === t.value ? '#4a3b8c' : '#95a5a6'">{{ t.icon }}</v-icon>
        <span>{{ t.label }}</span>
      </button>
      <button
        class="bn-item"
        :class="{ active: activeTab === 'profile' }"
        @click="setTab('profile')"
      >
        <v-icon small :color="activeTab === 'profile' ? '#4a3b8c' : '#95a5a6'">mdi-account-outline</v-icon>
        <span>Profile</span>
      </button>
    </nav>

    <!-- ADD CHILD MODAL -->
    <transition name="modal">
      <div v-if="addChildOpen" class="modal-backdrop" @click.self="closeAddChild">
        <div class="modal">
          <div class="modal-head">
            <div class="modal-title">Add a child</div>
            <button class="modal-close" @click="closeAddChild">
              <v-icon small color="#7f8c8d">mdi-close</v-icon>
            </button>
          </div>

          <div class="modal-body">
            <label class="field-label">Full name</label>
            <input v-model.trim="childForm.full_name" class="text-input" placeholder="e.g. Jane Wangui" />

            <label class="field-label mt-3">Date of birth</label>
            <input v-model="childForm.dob" type="date" class="text-input" />

            <label class="field-label mt-3">Gender</label>
            <select v-model="childForm.gender" class="text-input">
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <label class="field-label mt-3">County</label>
            <input v-model.trim="childForm.county" class="text-input" placeholder="e.g. Nairobi" />

            <label class="field-label mt-3">Area</label>
            <input v-model.trim="childForm.area" class="text-input" placeholder="e.g. Kilimani" />

            <label class="field-label mt-3">School (optional)</label>
            <input v-model.trim="childForm.school_name" class="text-input" />

            <label class="field-label mt-3">Notes (optional)</label>
            <textarea
              v-model.trim="childForm.notes"
              rows="3"
              class="text-input textarea"
              placeholder="Anything else we should know?"
            ></textarea>

            <div v-if="childError" class="error-box mt-3">{{ childError }}</div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" :disabled="savingChild" @click="closeAddChild">Cancel</button>
            <button
              class="btn-primary"
              :disabled="savingChild || !childForm.full_name"
              @click="saveChild"
            >
              {{ savingChild ? 'Saving…' : 'Save' }}
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
          <div class="modal-footer">
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

export default {
  name: 'ParentDashboard',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      menuOpen: false,
      loadError: '',
      scrolled: false,

      activeTab: 'home',
      tabs: [
        { value: 'home',        label: 'Home',        icon: 'mdi-home-variant-outline' },
        { value: 'children',    label: 'Children',    icon: 'mdi-account-child-outline' },
        { value: 'bookings',    label: 'Bookings',    icon: 'mdi-calendar-check-outline' },
        { value: 'assessments', label: 'Assessments', icon: 'mdi-file-document-outline' },
        { value: 'profile',     label: 'Profile',     icon: 'mdi-account-outline' }
      ],

      user: null,
      children: [],
      bookings: [],
      assessments: [],

      addChildOpen: false,
      savingChild: false,
      childError: '',
      childForm: this.blankChild(),

      archivingId: null,

      bookingFilter: 'upcoming',
      bookingFilters: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past',     label: 'Past' },
        { value: 'all',      label: 'All' }
      ],

      actingOn: null,
      confirmDialog: null,
      toasts: []
    };
  },

  computed: {
    displayName() {
      return this.user?.display_name || this.user?.email || 'Parent';
    },
    email() {
      return this.user?.email || '';
    },
    firstName() {
      const n = (this.user?.display_name || '').trim();
      return n ? n.split(' ')[0] : 'there';
    },
    initials() {
      const n = this.displayName.trim();
      if (!n) return 'P';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    heroSubtitle() {
      if (!this.children.length) {
        return 'Add your first child to start finding the right support.';
      }
      if (this.upcomingBookings.length) {
        return `You have ${this.upcomingBookings.length} upcoming ${this.upcomingBookings.length === 1 ? 'session' : 'sessions'}.`;
      }
      return 'No upcoming sessions — book a professional whenever you\'re ready.';
    },
    openAssessments() {
      return this.assessments.filter(
        (a) => ['submitted', 'routing', 'assigned', 'in_progress'].includes(a.status)
      ).length;
    },
    upcomingBookings() {
      const now = Date.now();
      return this.bookings
        .filter((b) => new Date(b.scheduled_at).getTime() >= now &&
                       !['cancelled', 'completed', 'no_show'].includes(b.status))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    filteredBookings() {
      const now = Date.now();
      if (this.bookingFilter === 'upcoming') {
        return this.bookings.filter(
          (b) => new Date(b.scheduled_at).getTime() >= now &&
                 !['cancelled', 'completed', 'no_show'].includes(b.status)
        );
      }
      if (this.bookingFilter === 'past') {
        return this.bookings.filter(
          (b) => new Date(b.scheduled_at).getTime() < now ||
                 ['completed', 'cancelled', 'no_show'].includes(b.status)
        );
      }
      return this.bookings;
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu);
    window.addEventListener('scroll', this.onScroll, { passive: true });

    const qTab = this.$route.query.tab;
    const valid = this.tabs.map((t) => t.value);
    if (valid.includes(qTab)) this.activeTab = qTab;

    this.loadAll();
  },

  beforeDestroy() {
    document.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    blankChild() {
      return { full_name: '', dob: '', gender: '', county: '', area: '', school_name: '', notes: '' };
    },

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

    closeMenu() { this.menuOpen = false; },

    setTab(tab) {
      this.menuOpen = false;
      this.activeTab = tab;
      this.$router.replace({ path: '/dashboard/parent', query: { tab } }).catch(() => {});
    },

    openBooking(b) {
      if (!b || !b.id) return;
      this.$router.push(`/bookings/${b.id}`).catch(() => {});
    },

    openChild(c) {
      if (!c || !c.id) return;
      this.$router.push(`/child/${c.id}`).catch(() => {});
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

        const [meRes, childRes, bookingRes, assessRes] = await Promise.all([
          axios.get(`${API}/api/users/me`, { headers }),
          axios.get(`${API}/api/children`, { headers }),
          axios.get(`${API}/api/bookings/mine`, { headers }),
          axios.get(`${API}/api/assessments/requests/mine`, { headers })
        ]);

        this.user = meRes.data?.data || null;
        this.children = childRes.data?.data || [];
        this.bookings = bookingRes.data?.data || [];
        this.assessments = assessRes.data?.data || [];
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          this.loadError = 'Session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          this.loadError = 'Parent access required.';
        } else {
          this.loadError = 'Could not load your dashboard.';
        }
        console.error('[parent] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    openAddChild() {
      this.childForm = this.blankChild();
      this.childError = '';
      this.addChildOpen = true;
    },

    closeAddChild() {
      this.addChildOpen = false;
      this.childError = '';
    },

    async saveChild() {
      if (!this.childForm.full_name) return;
      this.savingChild = true;
      this.childError = '';
      try {
        const headers = await this.authHeader();
        const payload = { ...this.childForm };
        if (!payload.dob) delete payload.dob;
        if (!payload.gender) delete payload.gender;

        const { data } = await axios.post(`${API}/api/children`, payload, { headers });
        this.children.unshift(data.data);
        this.toast('Child added');
        this.closeAddChild();
      } catch (err) {
        this.childError = err.response?.data?.message || 'Could not save.';
      } finally {
        this.savingChild = false;
      }
    },

    confirmArchiveChild(child) {
      this.confirmDialog = {
        title: 'Archive child?',
        message: `${child.full_name} will be removed from your active list. You can restore them later.`,
        confirmLabel: 'Archive',
        loading: false,
        onConfirm: async () => {
          this.confirmDialog.loading = true;
          this.archivingId = child.id;
          try {
            const headers = await this.authHeader();
            await axios.delete(`${API}/api/children/${child.id}`, { headers });
            this.children = this.children.filter((c) => c.id !== child.id);
            this.toast('Child archived', 'warn', 'mdi-archive-outline');
          } catch (err) {
            this.toast(err.response?.data?.error || 'Could not archive', 'error', 'mdi-alert-circle-outline');
          } finally {
            this.archivingId = null;
            this.confirmDialog = null;
          }
        }
      };
    },

    canCancel(b) {
      return ['pending', 'confirmed'].includes(b.status) &&
             new Date(b.scheduled_at).getTime() > Date.now();
    },

    confirmCancelBooking(b) {
      this.confirmDialog = {
        title: 'Cancel booking?',
        message: `Cancel your session with ${b.professional_name} on ${this.formatDateTime(b.scheduled_at)}?`,
        confirmLabel: 'Cancel booking',
        loading: false,
        onConfirm: async () => {
          this.confirmDialog.loading = true;
          this.actingOn = b.id;
          try {
            const headers = await this.authHeader();
            await axios.patch(
              `${API}/api/bookings/${b.id}/status`,
              { status: 'cancelled' },
              { headers }
            );
            b.status = 'cancelled';
            this.toast('Booking cancelled', 'warn', 'mdi-calendar-remove-outline');
          } catch (err) {
            this.toast(err.response?.data?.error || 'Could not cancel', 'error', 'mdi-alert-circle-outline');
          } finally {
            this.actingOn = null;
            this.confirmDialog = null;
          }
        }
      };
    },

    openNewAssessment() {
      if (!this.children.length) {
        this.toast('Add a child first', 'warn', 'mdi-account-alert-outline');
        return;
      }
      this.$router.push('/assessments/new');
    },

    /* ---- Helpers ---- */
    initialsOf(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },

    avatarBg(id) {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return p[(Number(id) || 0) % p.length];
    },

    ageOf(dob) {
      if (!dob) return '—';
      const d = new Date(dob);
      const diff = Date.now() - d.getTime();
      const years = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
      if (years < 1) {
        const months = Math.floor(diff / (30.4 * 24 * 3600 * 1000));
        return `${months} mo`;
      }
      return `${years} yr`;
    },

    childName(id) {
      const c = this.children.find((x) => x.id === id);
      return c ? c.full_name : 'Child';
    },

    statusClass(status) {
      const s = String(status || '').toLowerCase();
      if (['approved', 'verified', 'completed', 'assigned', 'confirmed', 'active'].includes(s)) return 'status-green';
      if (['pending', 'submitted', 'routing', 'in_progress'].includes(s)) return 'status-amber';
      if (['rejected', 'cancelled', 'no_show', 'suspended'].includes(s)) return 'status-red';
      return 'status-grey';
    },

    formatDateTime(ts) {
      if (!ts) return '—';
      const d = new Date(ts);
      return d.toLocaleString('en-KE', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit'
      });
    },

    dowOf(ts)   { return new Date(ts).toLocaleDateString('en-KE', { weekday: 'short' }); },
    dayOf(ts)   { return new Date(ts).getDate(); },
    monthOf(ts) { return new Date(ts).toLocaleDateString('en-KE', { month: 'short' }); },
    timeOf(ts)  { return new Date(ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }); },

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
    },

    async signOut() {
      this.menuOpen = false;
      try {
        const auth = this._fbAuth();
        if (auth) await auth.signOut();
      } catch (e) {}
      this.$router.replace('/login');
    }
  }
};
</script>

<style scoped>
.parent-dashboard {
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
  padding-bottom: 96px;
}
@media (min-width: 768px) { .parent-dashboard { padding-bottom: 64px; } }

/* TOPBAR */
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
.topbar.scrolled { border-bottom-color: var(--line); box-shadow: 0 8px 24px -18px rgba(44, 62, 80, 0.25); }
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
  transition: background 0.15s ease;
}
.icon-btn:hover { background: #e6eef5; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.user-menu-wrap { position: relative; }
.user-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--teal-2));
  color: #fff; border: 2px solid #fff; font-weight: 800; font-size: 13px;
  cursor: pointer; letter-spacing: 0.3px;
  box-shadow: 0 6px 14px -6px rgba(74, 59, 140, 0.55);
}
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

/* TABS (desktop) */
.tabs { display: none; }
@media (min-width: 768px) {
  .tabs {
    position: sticky; top: 64px; z-index: 30;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: saturate(160%) blur(10px);
    -webkit-backdrop-filter: saturate(160%) blur(10px);
    border-bottom: 1px solid var(--line);
    padding: 0 32px;
    display: flex;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
}
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

/* BOTTOM NAV (mobile) */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-top: 1px solid var(--line);
  display: flex;
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 24px -18px rgba(44, 62, 80, 0.25);
}
@media (min-width: 768px) { .bottom-nav { display: none; } }
.bn-item {
  flex: 1;
  background: transparent; border: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 8px 4px; border-radius: 12px;
  color: #95a5a6; font-size: 0.62rem; font-weight: 700;
  font-family: inherit; letter-spacing: 0.2px;
  transition: background 0.15s ease, color 0.15s ease;
}
.bn-item.active { color: var(--purple); background: #f0ecfa; }

/* MAIN */
.main { max-width: 980px; margin: 0 auto; padding: 20px 16px; }
@media (min-width: 768px) { .main { padding: 32px; } }

/* HERO */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #4a3b8c 0%, #5b4b9e 55%, #7ec8e3 140%);
  color: #fff;
  border-radius: 22px;
  padding: 24px 22px;
  margin-bottom: 16px;
  box-shadow: 0 24px 48px -20px rgba(74, 59, 140, 0.55);
}
.hero-body { position: relative; z-index: 2; }
.hero-kicker {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase; opacity: 0.75; margin-bottom: 6px;
}
.hero-title {
  font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em;
  margin: 0 0 8px; line-height: 1.2;
}
.hero-sub {
  font-size: 0.86rem; opacity: 0.88; margin: 0; line-height: 1.5; max-width: 480px;
}
.hero-glow {
  position: absolute; top: -40%; right: -20%; width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.55), transparent 70%);
  filter: blur(20px); pointer-events: none;
}

/* STAT STRIP */
.stat-strip {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 28px;
}
.stat-chip {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid var(--line); border-radius: 14px;
  padding: 12px; cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.stat-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px -18px rgba(74, 59, 140, 0.4);
  border-color: #d9d2ec;
}
.stat-chip:active { transform: translateY(0) scale(0.99); }
.stat-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.stat-body { min-width: 0; }
.stat-value { font-size: 1.15rem; font-weight: 900; color: var(--ink); line-height: 1; }
.stat-label { font-size: 0.66rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px; }
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }

/* GREETING */
.greeting { margin-bottom: 20px; }
.greeting h1 { font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 6px; }
.greeting p { font-size: 0.92rem; color: var(--muted); margin: 0; }

.greeting-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
}
.greeting-row h1 { font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); margin: 0 0 6px; }
.greeting-row p { font-size: 0.92rem; color: var(--muted); margin: 0; }

.section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 0 12px;
}
.section-head h2 { font-size: 1.05rem; font-weight: 800; color: var(--ink); margin: 0; letter-spacing: -0.01em; }
.link-btn {
  background: transparent; border: none; color: var(--purple);
  font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.mt-6 { margin-top: 28px; }
.mt-4 { margin-top: 16px; }
.mt-3 { margin-top: 12px; }

/* QUICK ACTIONS */
.quick-actions {
  display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 28px;
}
@media (min-width: 640px) {
  .quick-actions { grid-template-columns: repeat(3, 1fr); }
}
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

/* SKELETON */
.skeleton-wrap { padding-top: 4px; }
.sk-hero {
  height: 130px; border-radius: 22px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 16px;
}
.sk-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
.sk-chip {
  height: 58px; border-radius: 14px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
.sk-card {
  height: 76px; border-radius: 16px;
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
.error-card h2 { font-size: 1.2rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 24px; }

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

/* Clickable rows get an accent border-left on hover */
.list-row.clickable,
.child-row.clickable { position: relative; }
.list-row.clickable::before,
.child-row.clickable::before {
  content: ''; position: absolute; left: 0; top: 14px; bottom: 14px;
  width: 3px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--purple), var(--teal-2));
  opacity: 0; transition: opacity 0.15s ease;
}
.list-row.clickable:hover::before,
.child-row.clickable:hover::before { opacity: 1; }

.child-row {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 1px solid var(--line);
  border-radius: 16px; padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.child-row:hover {
  border-color: #d9d2ec;
  transform: translateY(-1px);
  box-shadow: 0 16px 28px -20px rgba(74, 59, 140, 0.35);
}
.child-row:active { transform: translateY(0) scale(0.995); }

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

/* CHILD AVATAR */
.child-avatar {
  width: 46px; height: 46px; border-radius: 14px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px; flex: 0 0 auto;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.child-avatar.lg { width: 54px; height: 54px; font-size: 16px; }

.row-body { flex: 1; min-width: 0; }
.row-title { font-size: 0.94rem; font-weight: 800; color: var(--ink); margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-sub { font-size: 0.78rem; color: var(--muted); margin-bottom: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.row-meta { font-size: 0.72rem; color: #95a5a6; display: flex; align-items: center; gap: 6px; }
.row-end { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.row-tail { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }

.chev {
  opacity: 0.55;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.list-row:hover .chev,
.child-row:hover .chev { opacity: 1; transform: translateX(2px); }

.mini-chip {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 999px;
  font-size: 0.68rem; font-weight: 700;
  background: #ede7f8; color: var(--purple);
  text-transform: capitalize;
}
.mini-chip.subtle { background: #f0f3f7; color: #556; }

/* STATUS PILLS */
.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.64rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.4px; white-space: nowrap;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

/* ROW ACTIONS */
.row-action {
  padding: 8px 14px; border-radius: 10px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease; flex: 0 0 auto;
}
.row-action.small { padding: 6px 12px; font-size: 0.74rem; }
.row-action.danger:hover { border-color: #e74c3c; color: #e74c3c; background: #fdecea; }
.row-action:disabled { opacity: 0.55; cursor: not-allowed; }

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
.progress-track {
  height: 6px; background: #eef1f6; border-radius: 999px; overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #4a3b8c, #7ec8e3);
  transition: width 0.5s ease;
}
.progress-label {
  font-size: 0.72rem; color: var(--muted); margin-top: 6px; font-weight: 600;
}

/* PROFILE */
.profile-header {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 8px 0 20px;
}
.profile-avatar {
  width: 76px; height: 76px; border-radius: 50%;
  display: grid; place-items: center;
  color: #fff; font-weight: 800; font-size: 26px;
  box-shadow: 0 18px 32px -14px rgba(74, 59, 140, 0.55);
  margin-bottom: 12px;
}
.profile-name { font-size: 1.15rem; font-weight: 800; color: var(--ink); }
.profile-role {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--purple);
  background: #ede7f8; padding: 3px 10px; border-radius: 999px;
  margin-top: 6px;
}

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.9rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.primary-btn.small { padding: 9px 16px; font-size: 0.82rem; }
.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-secondary.full { width: 100%; display: inline-flex; align-items: center; justify-content: center; }
.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #fff; border-radius: 22px;
  max-width: 480px; width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 40px 80px -24px rgba(15, 13, 36, 0.5);
}
.modal-sm { max-width: 400px; }
.modal-head {
  padding: 20px 22px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #f0f0f5;
}
.modal-title { font-size: 1.02rem; font-weight: 800; color: var(--ink); }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 10px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { padding: 16px 22px; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 14px 22px 18px;
  display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
  border-top: 1px solid #f0f0f5;
  background: #fbfcfe;
}

.modal-label {
  font-size: 0.7rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.modal-value { font-size: 0.9rem; color: var(--ink); font-weight: 600; margin-top: 2px; }
.profile-row { padding: 12px 0; border-bottom: 1px solid #f0f0f5; }
.profile-row:last-child { border-bottom: none; }

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

.error-box {
  padding: 12px 14px; border-radius: 12px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500;
}
.confirm-text { font-size: 0.9rem; color: var(--ink); line-height: 1.55; margin: 0; }

.card {
  background: #fff; border-radius: 16px; padding: 6px 20px;
  border: 1px solid var(--line);
}

/* TOASTS */
.toast-wrap {
  position: fixed; bottom: 90px; right: 24px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
@media (min-width: 768px) { .toast-wrap { bottom: 24px; } }
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
  height: 2px; background: rgba(255, 255, 255, 0.4);
  animation: toastBar 3.2s linear forwards;
  transform-origin: left;
}
@keyframes toastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.toast-success { background: linear-gradient(135deg, #229954, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

/* TRANSITIONS */
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

/* MOBILE */
@media (max-width: 599px) {
  .main { padding: 18px 14px; }
  .hero { padding: 20px 18px; border-radius: 18px; }
  .hero-title { font-size: 1.35rem; }
  .greeting h1, .greeting-row h1 { font-size: 1.4rem; }
  .stat-strip { gap: 8px; }
  .stat-chip { flex-direction: column; align-items: flex-start; padding: 10px; gap: 6px; }
  .stat-value { font-size: 1.05rem; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-footer button { width: 100%; }
  .quick-actions { grid-template-columns: 1fr; }
  .list-row { flex-wrap: wrap; }
  .booking-row .row-end { margin-left: 66px; width: 100%; justify-content: space-between; }
  .child-row { flex-wrap: wrap; }
  .child-row .row-tail { margin-left: 68px; width: 100%; justify-content: space-between; }
  .child-row .chev { display: none; }
  .toast-wrap { left: 14px; right: 14px; align-items: stretch; }
  .toast { max-width: none; }
}
</style>