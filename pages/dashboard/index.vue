<template>
  <div class="redirect-page">
    <!-- LOADING -->
    <div v-if="stage === 'loading'" class="spinner-wrap">
      <v-progress-circular indeterminate color="#4a3b8c" size="36" width="3" />
      <p>Loading your account…</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="stage === 'error'" class="error-wrap">
      <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
      <h2>Couldn't load your account</h2>
      <p>{{ error }}</p>
      <button class="btn-primary" @click="load">Try again</button>
      <button class="btn-secondary" @click="signOut">Sign out</button>
    </div>

    <!-- PICKER -->
    <div v-else class="picker-wrap">
      <!-- HEADER -->
      <div class="picker-head">
        <div class="picker-mark">
          <v-icon small color="white">mdi-bridge</v-icon>
        </div>
        <h1>{{ heading }}</h1>
        <p>{{ subheading }}</p>
      </div>

      <!-- USER BADGE -->
      <div v-if="user" class="user-badge">
        <div class="user-avatar" :style="{ background: avatarBg }">
          {{ initials }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.display_name || 'Your account' }}</div>
          <div class="user-email">{{ user.email || user.phone || '—' }}</div>
        </div>
        <span class="role-pill" :class="`role-${user.role}`">{{ roleLabel(user.role) }}</span>
      </div>

      <!-- ROLE CARDS -->
      <div class="role-cards" role="radiogroup" aria-label="Choose dashboard">
        <!-- PARENT -->
        <button
          class="role-card"
          :class="{
            active: chosenRole === 'parent',
            current: user && user.role === 'parent'
          }"
          role="radio"
          :aria-checked="chosenRole === 'parent'"
          :disabled="saving"
          @click="selectRole('parent')"
          @keydown.enter.prevent="selectRole('parent')"
          @keydown.space.prevent="selectRole('parent')"
        >
          <div class="role-icon gradient-purple">
            <v-icon small color="white">mdi-account-child-outline</v-icon>
          </div>
          <div class="role-text">
            <div class="role-title">
              Parent dashboard
              <span v-if="user && user.role === 'parent'" class="current-chip">Current</span>
            </div>
            <div class="role-sub">Manage children, sessions, and assessments.</div>
            <div class="role-bullets">
              <span class="bullet"><v-icon x-small color="#4a3b8c">mdi-check</v-icon>Add children</span>
              <span class="bullet"><v-icon x-small color="#4a3b8c">mdi-check</v-icon>Book sessions</span>
              <span class="bullet"><v-icon x-small color="#4a3b8c">mdi-check</v-icon>Track progress</span>
            </div>
          </div>
          <div class="role-check" :class="{ on: chosenRole === 'parent' }">
            <v-icon x-small color="white">mdi-check</v-icon>
          </div>
        </button>

        <!-- PROFESSIONAL -->
        <button
          class="role-card"
          :class="{
            active: chosenRole === 'professional',
            current: user && user.role === 'professional'
          }"
          role="radio"
          :aria-checked="chosenRole === 'professional'"
          :disabled="saving"
          @click="selectRole('professional')"
          @keydown.enter.prevent="selectRole('professional')"
          @keydown.space.prevent="selectRole('professional')"
        >
          <div class="role-icon gradient-teal">
            <v-icon small color="white">mdi-stethoscope</v-icon>
          </div>
          <div class="role-text">
            <div class="role-title">
              Professional dashboard
              <span v-if="user && user.role === 'professional'" class="current-chip">Current</span>
            </div>
            <div class="role-sub">Offer assessments and sessions to families.</div>
            <div class="role-bullets">
              <span class="bullet"><v-icon x-small color="#0288a5">mdi-check</v-icon>Manage services</span>
              <span class="bullet"><v-icon x-small color="#0288a5">mdi-check</v-icon>Set availability</span>
              <span class="bullet"><v-icon x-small color="#0288a5">mdi-check</v-icon>Write reports</span>
            </div>
          </div>
          <div class="role-check" :class="{ on: chosenRole === 'professional' }">
            <v-icon x-small color="white">mdi-check</v-icon>
          </div>
        </button>

        <!-- ADMIN -->
        <button
          v-if="user && user.role === 'admin'"
          class="role-card"
          :class="{ active: chosenRole === 'admin', current: true }"
          role="radio"
          :aria-checked="chosenRole === 'admin'"
          :disabled="saving"
          @click="selectRole('admin')"
          @keydown.enter.prevent="selectRole('admin')"
          @keydown.space.prevent="selectRole('admin')"
        >
          <div class="role-icon gradient-pink">
            <v-icon small color="white">mdi-shield-account-outline</v-icon>
          </div>
          <div class="role-text">
            <div class="role-title">
              Admin dashboard
              <span class="current-chip">Current</span>
            </div>
            <div class="role-sub">Verify professionals, route assessments, manage users.</div>
            <div class="role-bullets">
              <span class="bullet"><v-icon x-small color="#c2185b">mdi-check</v-icon>Verifications</span>
              <span class="bullet"><v-icon x-small color="#c2185b">mdi-check</v-icon>Assessments</span>
              <span class="bullet"><v-icon x-small color="#c2185b">mdi-check</v-icon>Users</span>
            </div>
          </div>
          <div class="role-check" :class="{ on: chosenRole === 'admin' }">
            <v-icon x-small color="white">mdi-check</v-icon>
          </div>
        </button>
      </div>

      <!-- ERROR -->
      <div v-if="error" class="error-box">{{ error }}</div>

      <!-- PROCEED -->
      <button
        class="primary-btn"
        :disabled="!chosenRole || saving"
        @click="continueTo"
      >
        <span v-if="saving" class="loading-row">
          <v-progress-circular indeterminate size="16" width="2" color="white" />
          <span class="ml-2">Setting up…</span>
        </span>
        <span v-else>
          <v-icon small color="white" class="mr-2">{{ ctaIcon }}</v-icon>
          {{ ctaLabel }}
        </span>
      </button>

      <button class="link-btn mt-3" @click="signOut">Sign out</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

const ROLE_ROUTES = {
  parent:       '/dashboard/parent',
  professional: '/dashboard/professional',
  admin:        '/dashboard/admin',
  org_admin:    '/dashboard/organisation'
};

const ROLE_LABELS = {
  parent: 'Parent',
  professional: 'Professional',
  admin: 'Admin',
  org_admin: 'Organisation'
};

export default {
  name: 'DashboardRedirect',
  middleware: 'auth',

  data() {
    return {
      stage: 'loading', // 'loading' | 'ready' | 'error'
      error: '',
      chosenRole: '',
      saving: false,
      user: null
    };
  },

  computed: {
    heading() {
      if (!this.user) return 'Welcome to Nova';
      return `Hi ${this.firstName}`;
    },
    subheading() {
      if (!this.user) return 'Pick how you want to use the platform.';
      return 'Pick a dashboard to open. You can switch anytime.';
    },
    firstName() {
      const n = (this.user?.display_name || '').trim();
      return n ? n.split(' ')[0] : 'there';
    },
    initials() {
      const n = (this.user?.display_name || this.user?.email || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg() {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      const id = this.user?.id || 0;
      return p[(Number(id) || 0) % p.length];
    },
    isCurrentSelection() {
      if (!this.user || !this.chosenRole) return false;
      return this.user.role === this.chosenRole;
    },
    ctaLabel() {
      if (!this.chosenRole) return 'Pick a dashboard';
      if (this.isCurrentSelection) return 'Open dashboard';
      return this.user ? 'Switch to this dashboard' : 'Create my account';
    },
    ctaIcon() {
      if (this.isCurrentSelection) return 'mdi-arrow-right';
      return this.user ? 'mdi-swap-horizontal' : 'mdi-account-plus-outline';
    }
  },

  mounted() {
    this.load();
    window.addEventListener('keydown', this.onKeydown);
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown);
  },

  methods: {
    onKeydown(e) {
      if (this.stage !== 'ready') return;
      if (e.key === 'Enter' && this.chosenRole && !this.saving) {
        // Only trigger if not focused on an input
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          this.continueTo();
        }
      }
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

    roleLabel(role) {
      return ROLE_LABELS[role] || role || '';
    },

    async load() {
      this.stage = 'loading';
      this.error = '';
      this.chosenRole = '';

      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          return this.$router.replace('/login');
        }

        const { data } = await axios.get(`${API}/api/auth/me`, { headers });

        // New user — no row yet
        if (data.needs_role) {
          this.user = null;
          // Pre-select based on last choice, if any
          const last = this.readLastRole();
          this.chosenRole = last || '';
          this.stage = 'ready';
          return;
        }

        // Existing user
        this.user = data.data;
        this.chosenRole = data.data.role;
        this.stage = 'ready';
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          return this.$router.replace('/login');
        }
        if (status === 403) {
          this.error = 'Your account is not active. Contact support.';
        } else {
          this.error = 'Network error. Check your connection.';
        }
        this.stage = 'error';
        console.error('[dashboard picker]', status, err.response?.data);
      }
    },

    selectRole(role) {
      if (this.saving) return;
      this.chosenRole = role;
      this.error = '';
    },

    async continueTo() {
      if (!this.chosenRole || this.saving) return;

      // Remember choice locally (used as a pre-select next time)
      this.writeLastRole(this.chosenRole);

      // Existing user with the same role → just navigate
      if (this.user && this.user.role === this.chosenRole) {
        this.goTo(this.chosenRole);
        return;
      }

      // New user OR role change → commit through register-first
      this.saving = true;
      this.error = '';

      try {
        const auth = this._fbAuth();
        const fbUser = auth?.currentUser;
        if (!fbUser) return this.$router.replace('/login');

        const token = await fbUser.getIdToken();

        await axios.post(
          `${API}/api/auth/register-first`,
          {
            role: this.chosenRole,
            display_name: fbUser.displayName || null,
            email: fbUser.email || null,
            phone: fbUser.phoneNumber || null,
            firebase_uid: fbUser.uid
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.goTo(this.chosenRole);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          return this.$router.replace('/login');
        }
        this.error = err.response?.data?.error || 'Could not save your choice. Try again.';
      } finally {
        this.saving = false;
      }
    },

    goTo(role) {
      const target = ROLE_ROUTES[role];
      if (!target) {
        this.error = 'Unknown role. Contact support.';
        return;
      }
      this.$router.push(target).catch(() => {});
    },

    readLastRole() {
      try {
        const v = window.localStorage.getItem('nova:lastRole');
        return ROLE_ROUTES[v] ? v : '';
      } catch (e) { return ''; }
    },

    writeLastRole(role) {
      try { window.localStorage.setItem('nova:lastRole', role); } catch (e) {}
    },

    async signOut() {
      try {
        const auth = this._fbAuth();
        if (auth) await auth.signOut();
      } catch (e) {}
      try { window.localStorage.removeItem('nova:lastRole'); } catch (e) {}
      this.$router.replace('/login');
    }
  }
};
</script>

<style scoped>
.redirect-page {
  min-height: 100vh;
  background:
    radial-gradient(1000px 500px at 0% 0%, #ece7fa 0%, transparent 55%),
    radial-gradient(900px 500px at 100% 100%, #e6f4f8 0%, transparent 55%),
    #f5f7fb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.spinner-wrap { text-align: center; color: #7f8c8d; font-size: 0.9rem; }
.spinner-wrap p { margin-top: 14px; }

/* PICKER */
.picker-wrap {
  background: #fff;
  border-radius: 24px;
  padding: 32px 26px 24px;
  max-width: 520px;
  width: 100%;
  box-shadow:
    0 24px 48px -20px rgba(44, 62, 80, 0.2),
    0 2px 6px -2px rgba(44, 62, 80, 0.06);
  animation: rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.picker-head { text-align: center; margin-bottom: 22px; }
.picker-mark {
  width: 46px; height: 46px; border-radius: 14px;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  display: grid; place-items: center;
  margin: 0 auto 14px;
  box-shadow: 0 12px 24px -10px rgba(74, 59, 140, 0.65);
}
.picker-head h1 {
  font-size: 1.4rem; font-weight: 800; color: #2c3e50;
  margin: 0 0 6px; letter-spacing: -0.02em;
}
.picker-head p {
  font-size: 0.88rem; color: #7f8c8d; margin: 0; line-height: 1.5;
}

/* USER BADGE */
.user-badge {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 14px;
  background: linear-gradient(135deg, #f7f5ff, #f3f9fc);
  border: 1px solid #ececf1;
  margin-bottom: 18px;
}
.user-avatar {
  width: 42px; height: 42px; border-radius: 12px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 14px; flex: 0 0 auto;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.55);
}
.user-info { flex: 1; min-width: 0; }
.user-name {
  font-size: 0.9rem; font-weight: 800; color: #2c3e50;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.user-email {
  font-size: 0.76rem; color: #7f8c8d;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.role-pill {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.4px;
  text-transform: uppercase; padding: 4px 9px; border-radius: 999px;
  flex: 0 0 auto;
}
.role-parent       { background: #ede7f8; color: #4a3b8c; }
.role-professional { background: #d9f0f6; color: #0288a5; }
.role-admin        { background: #fce4ec; color: #c2185b; }
.role-org_admin    { background: #fef3e0; color: #b7791f; }

/* ROLE CARDS */
.role-cards { display: grid; gap: 12px; margin-bottom: 22px; }
.role-card {
  display: flex; align-items: flex-start; gap: 14px;
  background: #fff; border: 2px solid #ececf1; border-radius: 18px;
  padding: 16px; cursor: pointer; font-family: inherit;
  text-align: left;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
  position: relative;
  outline: none;
}
.role-card:hover:not(:disabled) {
  border-color: #d9d2ec;
  transform: translateY(-2px);
  box-shadow: 0 18px 32px -20px rgba(74, 59, 140, 0.4);
}
.role-card:focus-visible {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 4px rgba(74, 59, 140, 0.18);
}
.role-card.active {
  border-color: #4a3b8c;
  background: linear-gradient(180deg, #faf8ff 0%, #f4f0ff 100%);
  box-shadow: 0 18px 32px -18px rgba(74, 59, 140, 0.45);
}
.role-card.current::after {
  content: '';
  position: absolute;
  top: 10px; right: 10px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.18);
  animation: pulseDot 2.4s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.18); }
  50%      { box-shadow: 0 0 0 7px rgba(46, 204, 113, 0.08); }
}
.role-card:disabled { opacity: 0.6; cursor: not-allowed; }

.role-icon {
  width: 46px; height: 46px; border-radius: 13px;
  display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 10px 20px -10px rgba(74, 59, 140, 0.55);
}
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }

.role-text { flex: 1; min-width: 0; }
.role-title {
  font-size: 0.95rem; font-weight: 800; color: #2c3e50;
  margin-bottom: 4px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.current-chip {
  font-size: 0.58rem; font-weight: 800; letter-spacing: 0.4px;
  text-transform: uppercase;
  background: #e6f9ee; color: #229954;
  padding: 2px 8px; border-radius: 999px;
}
.role-sub { font-size: 0.8rem; color: #7f8c8d; line-height: 1.45; margin-bottom: 8px; }
.role-bullets {
  display: flex; flex-wrap: wrap; gap: 4px 10px;
  font-size: 0.72rem; color: #556;
}
.bullet { display: inline-flex; align-items: center; gap: 3px; }
.bullet .v-icon { opacity: 0.8; }

.role-check {
  width: 26px; height: 26px; border-radius: 50%;
  background: #ececf1;
  display: grid; place-items: center;
  flex: 0 0 auto;
  margin-top: 2px;
  transition: background 0.15s ease, transform 0.15s ease;
}
.role-check .v-icon { opacity: 0; transition: opacity 0.15s ease; }
.role-check.on {
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  transform: scale(1.08);
}
.role-check.on .v-icon { opacity: 1; }

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #fff; font-size: 0.92rem; font-weight: 800; cursor: pointer;
  font-family: inherit; min-height: 50px;
  box-shadow: 0 14px 28px -12px rgba(74, 59, 140, 0.75);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px -14px rgba(74, 59, 140, 0.85);
}
.primary-btn:active:not(:disabled) { transform: translateY(0) scale(0.995); }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

.link-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%;
  background: transparent; border: none;
  color: #4a3b8c; font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 10px 0;
  transition: color 0.15s ease;
}
.link-btn:hover { text-decoration: underline; color: #5b4b9e; }
.mt-3 { margin-top: 6px; }

.error-box {
  margin-bottom: 14px;
  padding: 12px 14px; border-radius: 12px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500;
  line-height: 1.45;
  border: 1px solid #f5c2bd;
}

/* ERROR WRAP */
.error-wrap {
  background: #fff; border-radius: 20px; padding: 40px 28px;
  max-width: 420px; width: 100%; text-align: center;
  box-shadow: 0 20px 48px -20px rgba(44, 62, 80, 0.2);
}
.error-wrap h2 { font-size: 1.2rem; font-weight: 800; color: #2c3e50; margin: 16px 0 8px; }
.error-wrap p  { font-size: 0.9rem; color: #7f8c8d; margin: 0 0 22px; line-height: 1.55; }
.error-wrap .btn-primary,
.error-wrap .btn-secondary { width: 100%; margin-bottom: 8px; }

.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #fff; color: #2c3e50;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}

@media (max-width: 480px) {
  .picker-wrap { padding: 24px 18px 18px; border-radius: 20px; }
  .picker-head h1 { font-size: 1.22rem; }
  .role-card { padding: 14px; }
  .role-icon { width: 42px; height: 42px; }
  .role-title { font-size: 0.9rem; }
  .role-bullets { display: none; }
}
</style>