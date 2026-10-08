<template>
  <div class="parent-dashboard">
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
              <span class="role-badge">Parent</span>
            </div>
            <button class="user-menu-item" @click="setTab('profile')">
              <v-icon small>mdi-account-outline</v-icon>
              Profile
            </button>
            <button class="user-menu-item" @click="setTab('bookings')">
              <v-icon small>mdi-calendar-check-outline</v-icon>
              My bookings
            </button>
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
        <span v-if="t.value === 'bookings' && upcomingCount" class="tab-badge">
          {{ upcomingCount }}
        </span>
      </button>
    </nav>

    <main class="main">
      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="32" width="3" />
        <span>Loading…</span>
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
        <button class="link-btn mt-3" @click="signOut">Sign in again</button>
      </section>

      <template v-else>
        <!-- ============================================================
             TAB: HOME
             ============================================================ -->
        <template v-if="activeTab === 'home'">
          <section class="greeting">
            <h1>Hello, {{ firstName }} 👋</h1>
            <p>Here's what's happening with your child's support.</p>
          </section>

          <section v-if="!children.length" class="empty-card">
            <div class="empty-icon">
              <v-icon size="48" color="#4a3b8c">mdi-account-child-outline</v-icon>
            </div>
            <h2>Start with your child</h2>
            <p>
              Add your child's profile so we can help you understand their needs,
              connect with the right professionals, and track progress.
            </p>
            <button class="primary-btn" @click="goTo('/onboarding/child')">
              <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
              Add your child
            </button>
            <span class="empty-note">
              No diagnosis needed. It takes about two minutes.
            </span>
          </section>

          <template v-else>
            <section class="quick-actions">
              <button class="quick-action" @click="goTo('/assessments/new')">
                <div class="qa-icon" style="background:#e6e0f5">
                  <v-icon small color="#4a3b8c">mdi-clipboard-text-outline</v-icon>
                </div>
                <span>Start assessment</span>
              </button>

              <button class="quick-action" @click="goTo('/professionals')">
                <div class="qa-icon" style="background:#d9f0f6">
                  <v-icon small color="#56c2d9">mdi-account-search-outline</v-icon>
                </div>
                <span>Find a professional</span>
              </button>

              <button class="quick-action" @click="setTab('bookings')">
                <div class="qa-icon" style="background:#fce4ec">
                  <v-icon small color="#e86a8a">mdi-calendar-month-outline</v-icon>
                </div>
                <span>My bookings</span>
              </button>
            </section>

            <section class="section">
              <div class="section-head">
                <h2 class="section-title">Your children</h2>
                <button class="link-btn" @click="goTo('/onboarding/child')">
                  <v-icon x-small class="mr-1">mdi-plus</v-icon>
                  Add child
                </button>
              </div>

              <div class="children-grid">
                <div
                  v-for="child in children"
                  :key="child.id"
                  class="child-card"
                  @click="goTo(`/child/${child.id}`)"
                >
                  <div class="child-avatar" :style="{ background: avatarBg(child) }">
                    {{ childInitials(child) }}
                  </div>
                  <div class="child-body">
                    <div class="child-name">{{ child.full_name }}</div>
                    <div class="child-meta">
                      {{ age(child.dob) }}<span v-if="child.county"> · {{ child.county }}</span>
                    </div>
                    <div class="child-tags">
                      <span v-if="childCounts[child.id]?.sessions" class="tag tag-pink">
                        {{ childCounts[child.id].sessions }} sessions
                      </span>
                      <span v-else class="tag tag-grey">No plan yet</span>
                    </div>
                  </div>
                  <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-head">
                <h2 class="section-title">Upcoming sessions</h2>
                <button class="link-btn" @click="setTab('bookings')">View all</button>
              </div>

              <div v-if="!upcomingBookings.length" class="mini-empty">
                <v-icon small color="#95a5a6" class="mr-2">mdi-calendar-blank-outline</v-icon>
                <span>No upcoming sessions. Book one from a professional's profile.</span>
              </div>

              <div v-else class="booking-list">
                <div
                  v-for="b in upcomingBookings.slice(0, 4)"
                  :key="b.id"
                  class="booking-row"
                  @click="goTo(`/bookings/${b.id}`)"
                >
                  <div class="booking-date">
                    <div class="booking-day">{{ dayOf(b.scheduled_at) }}</div>
                    <div class="booking-month">{{ monthOf(b.scheduled_at) }}</div>
                  </div>
                  <div class="booking-info">
                    <div class="booking-title">{{ b.professional_name || 'Professional' }}</div>
                    <div class="booking-sub">
                      {{ b.professional_type || 'Session' }} · {{ timeOf(b.scheduled_at) }}
                    </div>
                  </div>
                  <span class="status-pill" :class="statusClass(b.status)">
                    {{ statusLabel(b.status) }}
                  </span>
                </div>
              </div>
            </section>

            <section v-if="requests.length" class="section">
              <div class="section-head">
                <h2 class="section-title">Assessment requests</h2>
              </div>

              <div class="request-list">
                <div v-for="r in requests.slice(0, 4)" :key="r.id" class="request-row">
                  <div class="request-icon">
                    <v-icon small color="#4a3b8c">mdi-file-document-outline</v-icon>
                  </div>
                  <div class="request-body">
                    <div class="request-title">
                      {{ childName(r.child_id) }} — assessment request
                    </div>
                    <div class="request-sub">
                      Submitted {{ relativeTime(r.created_at) }}
                    </div>
                  </div>
                  <span class="status-pill" :class="statusClass(r.status)">
                    {{ statusLabel(r.status) }}
                  </span>
                </div>
              </div>
            </section>
          </template>
        </template>

        <!-- ============================================================
             TAB: BOOKINGS
             ============================================================ -->
        <template v-else-if="activeTab === 'bookings'">
          <section class="greeting">
            <h1>My bookings</h1>
            <p>All sessions you've booked.</p>
          </section>

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

          <div v-if="!filteredBookings.length" class="empty-card">
            <div class="empty-icon">
              <v-icon size="48" color="#4a3b8c">mdi-calendar-blank-outline</v-icon>
            </div>
            <h2>No {{ bookingFilter === 'all' ? '' : bookingFilter }} bookings</h2>
            <p>
              Find a professional and book a session to get started.
            </p>
            <button class="primary-btn" @click="goTo('/professionals')">
              <v-icon small color="white" class="mr-2">mdi-account-search-outline</v-icon>
              Find a professional
            </button>
          </div>

          <div v-else class="booking-list">
            <div
              v-for="b in filteredBookings"
              :key="b.id"
              class="booking-row"
              @click="goTo(`/bookings/${b.id}`)"
            >
              <div class="booking-date">
                <div class="booking-day">{{ dayOf(b.scheduled_at) }}</div>
                <div class="booking-month">{{ monthOf(b.scheduled_at) }}</div>
              </div>
              <div class="booking-info">
                <div class="booking-title">{{ b.professional_name || 'Professional' }}</div>
                <div class="booking-sub">
                  {{ b.professional_type || 'Session' }} · {{ timeOf(b.scheduled_at) }}
                </div>
              </div>
              <span class="status-pill" :class="statusClass(b.status)">
                {{ statusLabel(b.status) }}
              </span>
            </div>
          </div>
        </template>

        <!-- ============================================================
             TAB: CHILDREN
             ============================================================ -->
        <template v-else-if="activeTab === 'children'">
          <section class="greeting">
            <h1>Your children</h1>
            <p>Manage profiles and track their support.</p>
          </section>

          <button class="add-btn" @click="goTo('/onboarding/child')">
            <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
            Add a child
          </button>

          <section v-if="!children.length" class="empty-card">
            <div class="empty-icon">
              <v-icon size="48" color="#4a3b8c">mdi-account-child-outline</v-icon>
            </div>
            <h2>No children yet</h2>
            <p>Add your first child to get started.</p>
          </section>

          <section v-else class="children-list">
            <div
              v-for="child in children"
              :key="child.id"
              class="child-card-large"
              @click="goTo(`/child/${child.id}`)"
            >
              <div class="child-head">
                <div class="child-avatar-lg" :style="{ background: avatarBg(child) }">
                  {{ childInitials(child) }}
                </div>
                <div class="child-body">
                  <div class="child-name">{{ child.full_name }}</div>
                  <div class="child-meta">
                    {{ age(child.dob) }}<span v-if="child.gender"> · {{ genderLabel(child.gender) }}</span>
                  </div>
                </div>
                <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
              </div>

              <div class="child-info-grid">
                <div v-if="child.county" class="info-row">
                  <v-icon x-small color="#7f8c8d" class="mr-1">mdi-map-marker-outline</v-icon>
                  <span>{{ child.county }}<template v-if="child.area">, {{ child.area }}</template></span>
                </div>
                <div v-if="child.school_name" class="info-row">
                  <v-icon x-small color="#7f8c8d" class="mr-1">mdi-school-outline</v-icon>
                  <span>{{ child.school_name }}</span>
                </div>
                <div v-if="child.diagnosis_optional" class="info-row">
                  <v-icon x-small color="#7f8c8d" class="mr-1">mdi-information-outline</v-icon>
                  <span>{{ child.diagnosis_optional }}</span>
                </div>
              </div>

              <div class="child-actions">
                <button class="action-btn" @click.stop="goTo(`/assessments/new?child=${child.id}`)">
                  <v-icon x-small color="#4a3b8c" class="mr-1">mdi-clipboard-text-outline</v-icon>
                  Start assessment
                </button>
                <button class="action-btn" @click.stop="goTo('/professionals')">
                  <v-icon x-small color="#56c2d9" class="mr-1">mdi-account-search-outline</v-icon>
                  Find professional
                </button>
              </div>
            </div>
          </section>
        </template>

        <!-- ============================================================
             TAB: PROFILE
             ============================================================ -->
        <template v-else-if="activeTab === 'profile'">
          <section class="greeting">
            <h1>Your profile</h1>
            <p>Account settings.</p>
          </section>

          <!-- IDENTITY -->
          <section class="card">
            <div class="identity-head">
              <div class="identity-avatar">{{ initials }}</div>
              <div class="identity-body">
                <div class="identity-name">{{ displayName }}</div>
                <div class="identity-email">{{ email || phone || 'No contact on file' }}</div>
              </div>
            </div>
          </section>

          <!-- PERSONAL INFO -->
          <section class="card">
            <h2 class="card-title">Personal information</h2>

            <label class="field-label">Full name</label>
            <input
              v-model.trim="profile.display_name"
              type="text"
              class="text-input"
              :disabled="savingProfile"
            />

            <label class="field-label mt-4">Phone (optional)</label>
            <input
              v-model.trim="profile.phone"
              type="tel"
              placeholder="+254 700 000 000"
              class="text-input"
              :disabled="savingProfile"
            />

            <label class="field-label mt-4">Email</label>
            <input :value="email" type="email" class="text-input" disabled />
            <p class="hint">Email is managed by your sign-in. Contact support to change it.</p>

            <div v-if="profileError" class="error-box mt-4">{{ profileError }}</div>
            <div v-if="profileSuccess" class="success-box mt-4">{{ profileSuccess }}</div>

            <button
              class="primary-btn mt-4"
              :disabled="!canSaveProfile || savingProfile"
              @click="saveProfile"
            >
              <span v-if="!savingProfile">
                Save changes
                <v-icon small color="white" class="ml-2">mdi-check</v-icon>
              </span>
              <span v-else class="loading-row">
                <v-progress-circular indeterminate size="16" width="2" color="white" />
                <span class="ml-2">Saving…</span>
              </span>
            </button>

            <!-- Account identity (read-only) -->
            <div class="identity-row mt-4">
              <div class="identity-icon">
                <v-icon small color="#4a3b8c">mdi-fingerprint</v-icon>
              </div>
              <div class="identity-body">
                <div class="identity-label">Firebase UID</div>
                <div class="identity-value">{{ user?.firebase_uid || '—' }}</div>
              </div>
              <button
                class="copy-btn"
                @click="copyUid"
                :disabled="!user?.firebase_uid"
                aria-label="Copy UID"
              >
                <v-icon x-small color="#4a3b8c">
                  {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
                </v-icon>
              </button>
            </div>

            <div class="identity-row mt-3">
              <div class="identity-icon">
                <v-icon small color="#4a3b8c">mdi-identifier</v-icon>
              </div>
              <div class="identity-body">
                <div class="identity-label">User ID</div>
                <div class="identity-value">{{ user?.id || '—' }}</div>
              </div>
            </div>
          </section>

          <!-- SECURITY -->
          <section class="card">
            <h2 class="card-title">Security</h2>

            <button class="row-btn" :disabled="sendingReset" @click="sendPasswordReset">
              <div class="row-icon" style="background: #e6e0f5">
                <v-icon small color="#4a3b8c">mdi-lock-outline</v-icon>
              </div>
              <div class="row-body">
                <div class="row-title">Change password</div>
                <div class="row-sub">We'll email you a reset link</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </button>

            <div v-if="resetMsg" class="success-box mt-3">{{ resetMsg }}</div>
          </section>

          <!-- SUPPORT -->
          <section class="card">
            <h2 class="card-title">Support</h2>

            <nuxt-link to="/privacy" class="row-btn">
              <div class="row-icon" style="background: #f3f7fb">
                <v-icon small color="#7f8c8d">mdi-shield-lock-outline</v-icon>
              </div>
              <div class="row-body">
                <div class="row-title">Privacy Policy</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </nuxt-link>

            <nuxt-link to="/terms" class="row-btn">
              <div class="row-icon" style="background: #f3f7fb">
                <v-icon small color="#7f8c8d">mdi-file-document-outline</v-icon>
              </div>
              <div class="row-body">
                <div class="row-title">Terms of Service</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </nuxt-link>

            <a href="mailto:hello@nova.co.ke" class="row-btn">
              <div class="row-icon" style="background: #f3f7fb">
                <v-icon small color="#7f8c8d">mdi-email-outline</v-icon>
              </div>
              <div class="row-body">
                <div class="row-title">Contact support</div>
                <div class="row-sub">hello@nova.co.ke</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </a>
          </section>

          <!-- SIGN OUT -->
          <section class="card danger-card">
            <button class="row-btn danger-row" @click="confirmSignOut = true">
              <div class="row-icon" style="background: #fdecea">
                <v-icon small color="#e74c3c">mdi-logout</v-icon>
              </div>
              <div class="row-body">
                <div class="row-title">Sign out</div>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
            </button>
          </section>
        </template>
      </template>
    </main>

    <!-- BOTTOM NAV (mobile) -->
    <nav class="bottom-nav">
      <button
        v-for="t in bottomTabs"
        :key="t.value"
        class="nav-item"
        :class="{ active: activeTab === t.value }"
        @click="setTab(t.value)"
      >
        <v-icon small :color="activeTab === t.value ? '#4a3b8c' : '#95a5a6'">
          {{ t.icon }}
        </v-icon>
        <span>{{ t.label }}</span>
      </button>
    </nav>

    <!-- SIGN OUT CONFIRM -->
    <div v-if="confirmSignOut" class="modal-backdrop" @click.self="confirmSignOut = false">
      <div class="modal modal-sm">
        <h3 class="modal-title">Sign out?</h3>
        <p class="modal-text">You can sign back in anytime.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmSignOut = false">Cancel</button>
          <button class="btn-danger" @click="signOut">Sign out</button>
        </div>
      </div>
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
      copied: false,

      activeTab: 'home',
      tabs: [
        { value: 'home',     label: 'Home',     icon: 'mdi-home-variant-outline' },
        { value: 'bookings', label: 'Bookings', icon: 'mdi-calendar-month-outline' },
        { value: 'children', label: 'Children', icon: 'mdi-account-child-outline' },
        { value: 'profile',  label: 'Profile',  icon: 'mdi-account-outline' }
      ],
      bottomTabs: [
        { value: 'home',     label: 'Home',     icon: 'mdi-home-variant-outline' },
        { value: 'bookings', label: 'Bookings', icon: 'mdi-calendar-month-outline' },
        { value: 'children', label: 'Children', icon: 'mdi-account-child-outline' },
        { value: 'profile',  label: 'Profile',  icon: 'mdi-account-outline' }
      ],

      bookingFilter: 'upcoming',
      bookingFilters: [
        { value: 'upcoming',  label: 'Upcoming' },
        { value: 'past',      label: 'Past' },
        { value: 'all',       label: 'All' }
      ],

      user: null,
      children: [],
      bookings: [],
      requests: [],
      childCounts: {},

      profile: {
        display_name: '',
        phone: ''
      },
      savingProfile: false,
      profileError: '',
      profileSuccess: '',

      sendingReset: false,
      resetMsg: '',
      confirmSignOut: false
    };
  },

  computed: {
    displayName() {
      return this.user?.display_name || this.user?.email || 'User';
    },
    firstName() {
      const n = this.user?.display_name || '';
      return n.split(' ')[0] || 'there';
    },
    email() {
      return this.user?.email || '';
    },
    phone() {
      return this.user?.phone || '';
    },
    initials() {
      const n = this.displayName.trim();
      if (!n) return 'U';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },

    upcomingBookings() {
      const now = Date.now();
      return this.bookings
        .filter((b) => {
          const t = new Date(b.scheduled_at).getTime();
          return t >= now && (b.status === 'pending' || b.status === 'confirmed');
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    pastBookings() {
      const now = Date.now();
      return this.bookings
        .filter((b) => {
          const t = new Date(b.scheduled_at).getTime();
          return t < now || ['completed', 'cancelled', 'no_show'].includes(b.status);
        })
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    },
    filteredBookings() {
      if (this.bookingFilter === 'upcoming') return this.upcomingBookings;
      if (this.bookingFilter === 'past') return this.pastBookings;
      return this.bookings.slice().sort((a, b) =>
        new Date(b.scheduled_at) - new Date(a.scheduled_at)
      );
    },
    upcomingCount() {
      return this.upcomingBookings.length;
    },

    canSaveProfile() {
      const nameChanged = this.profile.display_name !== (this.user?.display_name || '');
      const phoneChanged = this.profile.phone !== (this.user?.phone || '');
      return this.profile.display_name.trim().length >= 2 && (nameChanged || phoneChanged);
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu);
    const qTab = this.$route.query.tab;
    const valid = ['home', 'bookings', 'children', 'profile'];
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

    closeMenu() {
      this.menuOpen = false;
    },

    setTab(tab) {
      this.menuOpen = false;
      this.activeTab = tab;
      this.$router.replace({ path: '/dashboard/parent', query: { tab } }).catch(() => {});
    },

    goTo(path) {
      if (!path) return;
      if (this.$route.path === path) return;
      try {
        const r = this.$router.push(path);
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch (e) {}
    },

    async copyUid() {
      const uid = this.user?.firebase_uid;
      if (!uid) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(uid);
        } else {
          const el = document.createElement('textarea');
          el.value = uid;
          el.style.position = 'fixed';
          el.style.opacity = '0';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 1500);
      } catch (e) {
        console.warn('[copyUid]', e);
      }
    },

    async loadAll() {
      this.loading = true;
      this.loadError = '';

      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          this.loadError = 'You are not signed in. Please sign in again.';
          this.loading = false;
          return;
        }

        const [meRes, childrenRes] = await Promise.all([
          axios.get(`${API}/api/users/me`, { headers }),
          axios.get(`${API}/api/children`, { headers })
        ]);

        this.user = meRes.data?.data || null;
        this.children = childrenRes.data?.data || [];

        const [bookingsRes, requestsRes] = await Promise.all([
          axios.get(`${API}/api/bookings/mine`, { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get(`${API}/api/assessments/requests/mine`, { headers })
            .catch(() => ({ data: { data: [] } }))
        ]);

        this.bookings = bookingsRes.data?.data || [];
        this.requests = requestsRes.data?.data || [];

        this.profile.display_name = this.user?.display_name || '';
        this.profile.phone = this.user?.phone || '';

        const counts = {};
        for (const c of this.children) {
          counts[c.id] = {
            sessions: this.bookings.filter((b) => b.child_id === c.id).length
          };
        }
        this.childCounts = counts;
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;
        console.error('[parent dashboard]', status, body);

        if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          if (body?.error === 'user_not_provisioned') {
            this.loadError = 'Your account wasn\u2019t set up correctly. Please sign in again.';
          } else if (body?.error === 'forbidden') {
            this.loadError = 'This account doesn\u2019t have parent access.';
          } else {
            this.loadError = 'Access denied. Please sign in again.';
          }
        } else {
          this.loadError = 'Could not load your dashboard. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    },

    async saveProfile() {
      if (!this.canSaveProfile || this.savingProfile) return;
      this.profileError = '';
      this.profileSuccess = '';
      this.savingProfile = true;

      try {
        const headers = await this.authHeader();
        await axios.patch(
          `${API}/api/users/me`,
          {
            display_name: this.profile.display_name || null,
            phone: this.profile.phone || null
          },
          { headers }
        );

        const auth = this._fbAuth();
        const current = auth?.currentUser;
        if (current && this.profile.display_name) {
          try {
            await current.updateProfile({ displayName: this.profile.display_name });
          } catch (e) {}
        }

        this.user = {
          ...this.user,
          display_name: this.profile.display_name,
          phone: this.profile.phone
        };

        this.profileSuccess = 'Profile updated.';
        setTimeout(() => { this.profileSuccess = ''; }, 3000);
      } catch (err) {
        this.profileError =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Could not save changes.';
      } finally {
        this.savingProfile = false;
      }
    },

    async sendPasswordReset() {
      if (this.sendingReset) return;
      this.resetMsg = '';
      const auth = this._fbAuth();
      const email = this.email || auth?.currentUser?.email;
      if (!email) return;

      this.sendingReset = true;
      try {
        await auth.sendPasswordResetEmail(email);
        this.resetMsg = `Reset link sent to ${email}.`;
        setTimeout(() => { this.resetMsg = ''; }, 5000);
      } catch (err) {
        this.profileError = 'Could not send reset email.';
      } finally {
        this.sendingReset = false;
      }
    },

    async signOut() {
      this.menuOpen = false;
      this.confirmSignOut = false;
      try {
        const auth = this._fbAuth();
        if (auth) await auth.signOut();
      } catch (e) {}
      try {
        const r = this.$router.push('/login');
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch (e) {}
    },

    childInitials(child) {
      const n = (child.full_name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg(child) {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return p[(child.id || 0) % p.length];
    },
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
      const m = { male: 'Boy', female: 'Girl', other: 'Other', prefer_not_to_say: '' };
      return m[g] || '';
    },
    dayOf(dt) { return new Date(dt).getDate(); },
    monthOf(dt) { return new Date(dt).toLocaleString('en-US', { month: 'short' }).toUpperCase(); },
    timeOf(dt) {
      return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
    childName(childId) {
      const c = this.children.find((x) => x.id === childId);
      return c ? c.full_name : 'Your child';
    },
    statusClass(status) {
      const s = String(status || '').toLowerCase();
      if (['confirmed', 'completed', 'assigned', 'active'].includes(s)) return 'status-green';
      if (['pending', 'submitted', 'routing', 'in_progress'].includes(s)) return 'status-amber';
      if (['cancelled', 'no_show', 'rejected'].includes(s)) return 'status-red';
      return 'status-grey';
    },
    statusLabel(status) {
      const s = String(status || '').toLowerCase();
      const m = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show', submitted: 'Submitted', assigned: 'Assigned', routing: 'Routing' };
      return m[s] || s || 'Unknown';
    }
  }
};
</script>

<style scoped>
/* ============================================================
   LAYOUT
   ============================================================ */
.parent-dashboard {
  min-height: 100vh;
  background: #f3f7fb;
  padding-bottom: 100px;
}

/* TOP BAR */
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
  transition: background 0.15s ease;
}
.icon-btn:hover { background: #e6eef5; }
.user-menu-wrap { position: relative; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  color: #ffffff; border: none; font-weight: 800; font-size: 13px;
  cursor: pointer; letter-spacing: 0.3px;
}
.user-menu {
  position: absolute; top: calc(100% + 8px); right: 0; min-width: 240px;
  background: #ffffff; border: 1px solid #ececf1; border-radius: 14px;
  box-shadow: 0 20px 40px -12px rgba(44, 62, 80, 0.18);
  overflow: hidden; z-index: 50;
}
.user-menu-head { padding: 14px 16px; border-bottom: 1px solid #f0f0f5; }
.user-menu-name { font-size: 0.88rem; font-weight: 800; color: #2c3e50; }
.user-menu-email {
  font-size: 0.76rem; color: #7f8c8d; margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
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
.user-menu-item:hover { background: #f7f8fb; }
.user-menu-item.danger { color: #e74c3c; }

/* TABS */
.tabs {
  position: sticky; top: 64px; z-index: 30;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  padding: 0 8px; display: flex; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
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
.tab:hover { color: #4a3b8c; }
.tab.active { color: #4a3b8c; border-bottom-color: #4a3b8c; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 999px; background: #e86a8a; color: #ffffff;
  font-size: 0.62rem; font-weight: 800; margin-left: 4px;
}
.tab:not(.active) .tab-badge { background: #e6e0f5; color: #4a3b8c; }

/* MAIN */
.main { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 768px) { .main { padding: 32px 32px; } }

.greeting { margin-bottom: 20px; }
.greeting h1 {
  font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em;
  color: #2c3e50; margin: 0 0 6px;
}
.greeting p { font-size: 0.95rem; color: #7f8c8d; margin: 0; }

.loading {
  display: flex; align-items: center; gap: 12px;
  padding: 60px 0; justify-content: center;
  color: #7f8c8d; font-size: 0.9rem;
}

/* ERROR */
.error-card {
  background: #ffffff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon {
  width: 84px; height: 84px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 20px;
}
.error-card h2 { font-size: 1.2rem; font-weight: 800; color: #2c3e50; margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 24px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 20px; }

/* EMPTY */
.empty-card {
  background: #ffffff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #ececf1;
  max-width: 520px; margin: 24px auto;
}
.empty-icon {
  width: 84px; height: 84px; border-radius: 50%; background: #e6e0f5;
  display: grid; place-items: center; margin: 0 auto 20px;
}
.empty-card h2 { font-size: 1.2rem; font-weight: 800; color: #2c3e50; margin: 0 0 10px; }
.empty-card p { font-size: 0.92rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 24px; }
.empty-note {
  display: block; font-size: 0.78rem; color: #95a5a6; margin-top: 12px;
}

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 13px 24px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; border: none; border-radius: 12px;
  font-size: 0.92rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  transition: transform 0.15s ease; font-family: inherit;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #ffffff; color: #2c3e50;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-secondary:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }

.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: #e74c3c; color: #ffffff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:hover:not(:disabled) { background: #c0392b; }

.add-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.92rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  margin-bottom: 20px; min-height: 50px;
}

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: #4a3b8c; font-weight: 700; font-size: 0.82rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }
.loading-row { display: inline-flex; align-items: center; gap: 8px; }

/* QUICK ACTIONS */
.quick-actions {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 32px;
}
.quick-action {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 16px 8px; background: #ffffff;
  border: 1px solid #ececf1; border-radius: 14px;
  cursor: pointer; transition: all 0.2s ease; font-family: inherit;
}
.quick-action:hover {
  transform: translateY(-2px); border-color: #c8c0e0;
  box-shadow: 0 10px 20px -10px rgba(74, 59, 140, 0.2);
}
.qa-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center;
}
.quick-action span {
  font-size: 0.78rem; font-weight: 700; color: #2c3e50;
  text-align: center; line-height: 1.3;
}

/* SECTIONS */
.section { margin-bottom: 32px; }
.section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 1.05rem; font-weight: 800; color: #2c3e50;
  margin: 0; letter-spacing: -0.01em;
}

/* CHILDREN */
.children-grid { display: grid; gap: 12px; }
.child-card {
  display: flex; align-items: center; gap: 14px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 16px; padding: 16px; cursor: pointer;
  transition: all 0.2s ease;
}
.child-card:hover {
  border-color: #c8c0e0; transform: translateY(-1px);
  box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25);
}
.child-avatar {
  width: 52px; height: 52px; border-radius: 14px; color: #ffffff;
  display: grid; place-items: center; font-weight: 800;
  font-size: 15px; flex: 0 0 auto; letter-spacing: 0.3px;
}
.child-body { flex: 1; min-width: 0; }
.child-name {
  font-size: 0.98rem; font-weight: 800; color: #2c3e50; margin-bottom: 3px;
}
.child-meta { font-size: 0.78rem; color: #7f8c8d; margin-bottom: 8px; }
.child-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  font-size: 0.68rem; font-weight: 700; padding: 3px 9px;
  border-radius: 999px; letter-spacing: 0.2px; text-transform: uppercase;
}
.tag-purple { background: #e6e0f5; color: #4a3b8c; }
.tag-pink { background: #fce4ec; color: #e86a8a; }
.tag-grey { background: #ececf1; color: #7f8c8d; }

/* CHILDREN LARGE CARDS */
.children-list { display: grid; gap: 12px; }
.child-card-large {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 18px; padding: 18px; cursor: pointer;
  transition: all 0.2s ease;
}
.child-card-large:hover {
  border-color: #c8c0e0; transform: translateY(-1px);
  box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25);
}
.child-head {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 14px;
}
.child-avatar-lg {
  width: 56px; height: 56px; border-radius: 16px; color: #ffffff;
  display: grid; place-items: center; font-weight: 800;
  font-size: 16px; flex: 0 0 auto; letter-spacing: 0.3px;
}
.child-info-grid { display: grid; gap: 8px; margin-bottom: 14px; }
.info-row {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.82rem; color: #4a5568;
}
.child-actions {
  display: flex; gap: 8px; flex-wrap: wrap;
  padding-top: 14px; border-top: 1px solid #f0f0f5;
}
.action-btn {
  display: inline-flex; align-items: center;
  padding: 9px 14px; border-radius: 10px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  color: #2c3e50; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s ease; font-family: inherit;
}
.action-btn:hover { border-color: #c8c0e0; background: #f7f8fb; }

/* BOOKINGS */
.mini-empty {
  display: flex; align-items: center; padding: 20px;
  background: #ffffff; border: 1px dashed #d4dae4;
  border-radius: 14px; font-size: 0.86rem; color: #7f8c8d;
}
.booking-list, .request-list { display: grid; gap: 10px; }
.booking-row, .request-row {
  display: flex; align-items: center; gap: 14px;
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 14px; padding: 14px;
  cursor: pointer; transition: all 0.15s ease;
}
.booking-row:hover {
  border-color: #c8c0e0;
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25);
}
.booking-date {
  flex: 0 0 52px; text-align: center;
  background: #f3f7fb; border-radius: 10px; padding: 8px 4px;
}
.booking-day {
  font-size: 1.15rem; font-weight: 900; color: #4a3b8c;
  line-height: 1; letter-spacing: -0.02em;
}
.booking-month {
  font-size: 0.62rem; font-weight: 800; color: #7f8c8d;
  letter-spacing: 1px; margin-top: 4px;
}
.booking-info { flex: 1; min-width: 0; }
.booking-title {
  font-size: 0.9rem; font-weight: 700; color: #2c3e50; margin-bottom: 2px;
}
.booking-sub {
  font-size: 0.78rem; color: #7f8c8d; text-transform: capitalize;
}
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

.request-icon {
  flex: 0 0 42px; height: 42px; border-radius: 12px;
  background: #e6e0f5; display: grid; place-items: center;
}
.request-body { flex: 1; min-width: 0; }
.request-title {
  font-size: 0.9rem; font-weight: 700; color: #2c3e50; margin-bottom: 2px;
}
.request-sub { font-size: 0.76rem; color: #7f8c8d; }

/* SUB TABS */
.sub-tabs {
  display: flex; gap: 4px; background: #ffffff;
  border: 1px solid #ececf1; border-radius: 12px;
  padding: 4px; margin-bottom: 16px;
}
.sub-tab {
  flex: 1; padding: 10px 12px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.82rem; font-weight: 700;
  color: #7f8c8d; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.sub-tab.active {
  background: #4a3b8c; color: #ffffff;
  box-shadow: 0 4px 10px rgba(74, 59, 140, 0.22);
}

/* CARD */
.card {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 18px; padding: 20px; margin-bottom: 16px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: #2c3e50;
  margin: 0 0 16px; letter-spacing: -0.01em;
}
.danger-card { border-color: #fdecea; }

/* IDENTITY */
.identity-head {
  display: flex; align-items: center; gap: 16px;
}
.identity-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  color: #ffffff; display: grid; place-items: center;
  font-weight: 800; font-size: 22px; flex: 0 0 auto;
  letter-spacing: 0.5px;
}
.identity-body { min-width: 0; flex: 1; }
.identity-name {
  font-size: 1.05rem; font-weight: 800; color: #2c3e50; margin-bottom: 3px;
}
.identity-email {
  font-size: 0.82rem; color: #7f8c8d;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* IDENTITY ROWS (uid + id) */
.identity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f9fafc;
  border: 1px solid #f0f0f5;
  border-radius: 12px;
}
.identity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e6e0f5;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.identity-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}
.identity-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.copy-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  transition: all 0.15s ease;
}
.copy-btn:hover:not(:disabled) {
  border-color: #4a3b8c;
  background: #f7f5fd;
}
.copy-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* FORM */
.field-label {
  display: block; font-size: 0.82rem; font-weight: 700;
  color: #2c3e50; margin-bottom: 8px;
}
.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #ffffff; color: #2c3e50;
  outline: none; font-family: inherit;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; color: #95a5a6; }
.hint { font-size: 0.78rem; color: #95a5a6; margin: 6px 0 0; }

.error-box, .success-box {
  padding: 12px 14px; border-radius: 10px;
  font-size: 0.83rem; font-weight: 500; line-height: 1.45;
}
.error-box { background: #fdecea; color: #c0392b; }
.success-box { background: #e6f9ee; color: #229954; }

/* ROW BUTTONS */
.row-btn {
  display: flex; align-items: center; gap: 14px;
  width: 100%; padding: 12px 4px; background: transparent;
  border: none; text-align: left; cursor: pointer;
  font-family: inherit; text-decoration: none; color: inherit;
  border-radius: 10px; transition: background 0.15s ease;
}
.row-btn:hover { background: #f7f8fb; }
.row-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.row-body { flex: 1; min-width: 0; }
.row-title {
  font-size: 0.9rem; font-weight: 700; color: #2c3e50; margin-bottom: 2px;
}
.row-sub { font-size: 0.76rem; color: #7f8c8d; }
.danger-row .row-title { color: #c0392b; }

/* BOTTOM NAV */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 68px; background: #ffffff;
  border-top: 1px solid #ececf1;
  display: flex; align-items: center; justify-content: space-around;
  z-index: 30; padding-bottom: env(safe-area-inset-bottom, 0);
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: transparent; border: none; cursor: pointer;
  color: #95a5a6; font-size: 0.68rem; font-weight: 700;
  font-family: inherit; padding: 6px 12px;
  transition: color 0.15s ease;
}
.nav-item.active, .nav-item:hover { color: #4a3b8c; }

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #ffffff; border-radius: 20px; padding: 22px;
  max-width: 440px; width: 100%;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
.modal-sm { max-width: 380px; text-align: center; }
.modal-sm .modal-actions { justify-content: center; }
.modal-title {
  font-size: 1.05rem; font-weight: 800; color: #2c3e50; margin: 0 0 8px;
}
.modal-text {
  font-size: 0.88rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 20px;
}
.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
}

/* RESPONSIVE */
@media (min-width: 768px) {
  .parent-dashboard { padding-bottom: 48px; }
  .bottom-nav { display: none; }
}
@media (max-width: 599px) {
  .main { padding: 20px 14px; }
  .greeting h1 { font-size: 1.4rem; }
  .child-head { gap: 10px; }
  .child-avatar-lg { width: 48px; height: 48px; font-size: 14px; border-radius: 13px; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
}
</style>