<template>
  <div class="login-page">
    <!-- LEFT: FORM -->
    <div class="form-side">
      <div class="form-wrap">
        <!-- Brand -->
        <nuxt-link to="/" class="brand">
          <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
          <span class="brand-name">No<span class="brand-dot">va</span></span>
        </nuxt-link>

        <h1 class="title">
          {{ isSignup ? 'Create your account' : 'Welcome back' }}
        </h1>
        <p class="subtitle">
          {{ isSignup
            ? 'It takes about a minute. No diagnosis needed to start.'
            : 'Sign in to continue where you left off.' }}
        </p>

        <!-- ROLE SELECTOR (signup only) -->
        <div v-if="isSignup" class="role-toggle">
          <button
            type="button"
            class="role-btn"
            :class="{ active: role === 'parent' }"
            :disabled="loading"
            @click="setRole('parent')"
          >
            <v-icon small :color="role === 'parent' ? 'white' : '#4a3b8c'">
              mdi-account-child
            </v-icon>
            <span>I'm a parent</span>
          </button>

          <button
            type="button"
            class="role-btn"
            :class="{ active: role === 'professional' }"
            :disabled="loading"
            @click="setRole('professional')"
          >
            <v-icon small :color="role === 'professional' ? 'white' : '#e86a8a'">
              mdi-stethoscope
            </v-icon>
            <span>I'm a professional</span>
          </button>
        </div>

        <!-- FORM -->
        <form @submit.prevent="submit" class="form" autocomplete="on">
          <label class="field-label">Email address</label>
          <input
            v-model.trim="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            class="text-input"
            :disabled="loading"
          />

          <label class="field-label mt-4">Password</label>
          <div class="password-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 6 characters"
              :autocomplete="isSignup ? 'new-password' : 'current-password'"
              class="text-input"
              :disabled="loading"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <v-icon small color="#7f8c8d">
                {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
              </v-icon>
            </button>
          </div>

          <template v-if="isSignup">
            <label class="field-label mt-4">Your name</label>
            <input
              v-model.trim="displayName"
              type="text"
              placeholder="Your full name"
              autocomplete="name"
              class="text-input"
              :disabled="loading"
            />

            <p class="hint mt-3">
              By creating an account you agree to our
              <nuxt-link to="/terms">Terms</nuxt-link>
              and
              <nuxt-link to="/privacy">Privacy Policy</nuxt-link>.
            </p>
          </template>

          <div v-if="error" class="error-box">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ error }}</span>
          </div>

          <div v-if="success" class="success-box">
            <v-icon small color="#2ecc71" class="mr-1">mdi-check-circle-outline</v-icon>
            <span>{{ success }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || !canSubmit">
            <span v-if="!loading">
              {{ isSignup ? 'Create account' : 'Sign in' }}
              <v-icon small color="white" class="ml-2">mdi-arrow-right</v-icon>
            </span>
            <span v-else>
              <v-progress-circular indeterminate size="18" width="2" color="white" />
            </span>
          </button>

          <p class="hint center" v-if="!isSignup">
            <button type="button" class="link-btn" :disabled="loading" @click="resetPassword">
              Forgot your password?
            </button>
          </p>
        </form>

        <!-- TOGGLE SIGNUP/LOGIN -->
        <p class="toggle-mode">
          {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
          <button type="button" class="link-btn" :disabled="loading" @click="toggleMode">
            {{ isSignup ? 'Sign in' : 'Create one' }}
          </button>
        </p>

        <!-- TRUST FOOTER -->
        <div class="trust-line">
          <v-icon small color="#7f8c8d" class="mr-2">mdi-shield-lock-outline</v-icon>
          <span>Your data is encrypted and private.</span>
        </div>
      </div>
    </div>

    <!-- RIGHT: VISUAL -->
    <div class="visual-side">
      <div class="visual-blob visual-blob-a" />
      <div class="visual-blob visual-blob-b" />
      <div class="visual-blob visual-blob-c" />

      <div class="visual-content">
        <div class="visual-card">
          <div class="visual-card-head">
            <div class="visual-avatar" :style="{ background: roleColor.bg }">
              <v-icon :color="roleColor.color" size="22">{{ roleColor.icon }}</v-icon>
            </div>
            <div>
              <div class="visual-card-title">{{ roleTitle }}</div>
              <div class="visual-card-sub">{{ roleSubtitle }}</div>
            </div>
          </div>

          <div class="visual-card-body">
            <ul class="visual-list">
              <li v-for="(item, i) in roleFeatures" :key="i">
                <v-icon small color="#f48fb1" class="mr-2">mdi-check-circle</v-icon>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="visual-tagline">
          <h2>From concern<br />to support,<br /><span>step by step.</span></h2>
          <p>Built for Kenyan families.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'LoginPage',

  data() {
    return {
      role: 'parent',
      isSignup: false,

      email: '',
      password: '',
      displayName: '',
      showPassword: false,

      loading: false,
      error: '',
      success: ''
    };
  },

  computed: {
    canSubmit() {
      const emailOk = this.email.includes('@') && this.email.includes('.');
      const passOk = this.password.length >= 6;
      if (!this.isSignup) return emailOk && passOk;
      return emailOk && passOk && this.displayName.length >= 2;
    },
    roleColor() {
      return this.role === 'professional'
        ? { color: '#e86a8a', bg: '#fce4ec', icon: 'mdi-stethoscope' }
        : { color: '#4a3b8c', bg: '#e6e0f5', icon: 'mdi-account-child' };
    },
    roleTitle() {
      return this.role === 'professional'
        ? 'Verified Professionals'
        : 'Parents & Caregivers';
    },
    roleSubtitle() {
      return this.role === 'professional'
        ? 'Reach families who need your services.'
        : 'Find the right support for your child.';
    },
    roleFeatures() {
      return this.role === 'professional'
        ? [
            'Steady client flow',
            'Structured reports & notes',
            'M-Pesa payouts after sessions',
            'Availability & booking tools'
          ]
        : [
            'No diagnosis needed to start',
            'Verified professionals only',
            "Track your child's progress",
            'Everything in one place'
          ];
    }
  },

  mounted() {
    const qRole = this.$route.query.role;
    if (qRole === 'professional' || qRole === 'parent') {
      this.role = qRole;
    }
    const qMode = this.$route.query.mode;
    if (qMode === 'signup') this.isSignup = true;
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

    setRole(r) {
      this.role = r;
      this.error = '';
    },

    toggleMode() {
      this.isSignup = !this.isSignup;
      this.error = '';
      this.success = '';
    },

    async submit() {
      if (!this.canSubmit || this.loading) return;
      this.error = '';
      this.success = '';
      this.loading = true;

      const auth = this._fbAuth();
      if (!auth) {
        this.error = 'Authentication is not ready. Please refresh and try again.';
        this.loading = false;
        return;
      }

      try {
        let user;
        if (this.isSignup) {
          const cred = await auth.createUserWithEmailAndPassword(this.email, this.password);
          user = cred.user;
          if (this.displayName) {
            await user.updateProfile({ displayName: this.displayName });
          }
        } else {
          const cred = await auth.signInWithEmailAndPassword(this.email, this.password);
          user = cred.user;
        }

        await this.afterAuth(user);
      } catch (err) {
        this.error = this.mapError(err);
        this.loading = false;
      }
    },

    async resetPassword() {
      if (!this.email || !this.email.includes('@')) {
        this.error = 'Enter your email address above, then tap reset.';
        this.success = '';
        return;
      }
      this.error = '';
      this.success = '';
      this.loading = true;
      try {
        const auth = this._fbAuth();
        await auth.sendPasswordResetEmail(this.email);
        this.success = 'Password reset email sent. Check your inbox.';
      } catch (err) {
        this.error = this.mapError(err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * After Firebase auth succeeds:
     * 1. Provision the user row (create if missing, update role if existing).
     * 2. Push to /dashboard — the redirector reads the role and routes.
     */
    async afterAuth(user) {
      try {
        const token = await user.getIdToken();
        const authHeader = { Authorization: `Bearer ${token}` };

        // 1) Try /provision — works if the user row already exists
        let provisioned = false;
        try {
          await axios.post(
            `${API}/api/auth/provision`,
            {
              role: this.role,
              display_name: user.displayName || this.displayName || null,
              email: user.email || this.email || null
            },
            { headers: authHeader }
          );
          provisioned = true;
        } catch (provErr) {
          // 403 => user row doesn't exist yet on a brand-new signup
          if (provErr.response?.status !== 403) {
            console.warn('[provision]', provErr.response?.data || provErr.message);
          }
        }

        // 2) If not provisioned, create the first row via /register-first
        if (!provisioned) {
          try {
            await axios.post(
              `${API}/api/auth/register-first`,
              {
                firebase_uid: user.uid,
                role: this.role,
                display_name: user.displayName || this.displayName || null,
                email: user.email || this.email || null
              },
              { headers: authHeader }
            );
          } catch (innerErr) {
            // Auto-provision in the auth middleware will handle it on the next call
            console.warn('[register-first]', innerErr.response?.data || innerErr.message);
          }
        }

        // 3) Route to the role-aware dashboard redirector
        this.safePush('/dashboard');
      } catch (err) {
        console.error('[afterAuth]', err);
        // Fallback: still attempt the redirector — it re-reads role from the backend
        this.safePush('/dashboard');
      }
    },

    safePush(path) {
      try {
        const result = this.$router.push(path);
        if (result && typeof result.catch === 'function') {
          result.catch((err) => {
            if (err && err.name !== 'NavigationDuplicated') {
              console.warn('[nav]', err.message);
            }
          });
        }
      } catch (err) {
        window.location.href = path;
      }
    },

    mapError(err) {
      const code = err?.code || '';
      switch (code) {
        case 'auth/email-already-in-use':
          return 'That email is already registered. Try signing in instead.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/weak-password':
          return 'Password must be at least 6 characters.';
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          return 'Incorrect email or password.';
        case 'auth/too-many-requests':
          return 'Too many attempts. Please wait a few minutes and try again.';
        case 'auth/network-request-failed':
          return 'Network issue. Check your connection and try again.';
        case 'auth/operation-not-allowed':
          return 'Email/password sign-in is not enabled. Contact support.';
        default:
          return err?.message || 'Something went wrong. Please try again.';
      }
    }
  }
};
</script>

<style scoped>
/* ============================================================
   LAYOUT
   ============================================================ */
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  background: #ffffff;
}
@media (min-width: 960px) {
  .login-page { grid-template-columns: 1.1fr 0.9fr; }
}

/* ============================================================
   FORM SIDE
   ============================================================ */
.form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 64px;
}
.form-wrap { width: 100%; max-width: 420px; }

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  margin-bottom: 40px;
}
.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  display: grid;
  place-items: center;
}
.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.02em;
}
.brand-dot { color: #e86a8a; }

.title {
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #2c3e50;
  margin: 0 0 8px;
  line-height: 1.2;
}
.subtitle {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0 0 28px;
  line-height: 1.55;
}

/* ROLE TOGGLE */
.role-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #f3f7fb;
  padding: 6px;
  border-radius: 14px;
  margin-bottom: 24px;
}
.role-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  font-family: inherit;
}
.role-btn.active {
  background: #4a3b8c;
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(74, 59, 140, 0.25);
}
.role-btn.active:nth-child(2) {
  background: #e86a8a;
  box-shadow: 0 6px 14px rgba(232, 106, 138, 0.25);
}
.role-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* FORM */
.form { display: flex; flex-direction: column; }
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 20px; }

.text-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e0e4eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #ffffff;
  color: #2c3e50;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
  font-family: inherit;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }

/* Password */
.password-wrap { position: relative; }
.password-wrap .text-input { padding-right: 48px; }
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: grid;
  place-items: center;
  border-radius: 8px;
}
.password-toggle:hover { background: #f3f7fb; }

/* Hints / errors */
.hint {
  font-size: 0.82rem;
  color: #7f8c8d;
  margin: 10px 0 0;
  line-height: 1.5;
}
.hint.center { text-align: center; }
.hint a {
  color: #4a3b8c;
  text-decoration: none;
  font-weight: 600;
}
.hint a:hover { text-decoration: underline; }
.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: #4a3b8c;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
}
.link-btn:hover { text-decoration: underline; }
.link-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-box,
.success-box {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  line-height: 1.45;
}
.error-box { background: #fdecea; color: #c0392b; }
.success-box { background: #e6f9ee; color: #229954; }

/* Submit */
.submit-btn {
  margin-top: 24px;
  width: 100%;
  padding: 15px 20px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  font-family: inherit;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(74, 59, 140, 0.34);
}
.submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 10px rgba(74, 59, 140, 0.18);
}

.toggle-mode {
  margin: 24px 0 0;
  font-size: 0.88rem;
  color: #7f8c8d;
  text-align: center;
}

.trust-line {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f5;
  font-size: 0.78rem;
  color: #7f8c8d;
  font-weight: 500;
}

/* ============================================================
   VISUAL SIDE
   ============================================================ */
.visual-side {
  display: none;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #4a3b8c 0%, #5b4b9e 50%, #56c2d9 130%);
}
@media (min-width: 960px) { .visual-side { display: block; } }

.visual-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
}
.visual-blob-a { width: 400px; height: 400px; background: #7ec8e3; top: -80px; right: -80px; }
.visual-blob-b { width: 320px; height: 320px; background: #e86a8a; bottom: 10%; left: -100px; }
.visual-blob-c { width: 260px; height: 260px; background: #7ec8e3; bottom: -60px; right: 20%; }

.visual-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 60px 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #ffffff;
}

.visual-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
}

.visual-card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.visual-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.visual-card-title { font-size: 1rem; font-weight: 800; letter-spacing: -0.01em; }
.visual-card-sub { font-size: 0.82rem; color: rgba(255, 255, 255, 0.75); margin-top: 2px; }

.visual-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.visual-list li {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.5;
}

.visual-tagline { margin-top: 40px; }
.visual-tagline h2 {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
}
.visual-tagline h2 span {
  background: linear-gradient(135deg, #f48fb1, #7ec8e3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.visual-tagline p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .form-side { padding: 28px 20px 48px; }
  .title { font-size: 1.6rem; }
  .role-btn { font-size: 0.78rem; padding: 10px 8px; }
}
</style>