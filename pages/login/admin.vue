<template>
  <div class="admin-login">
    <!-- LEFT: brand panel (hidden on mobile) -->
    <aside class="brand-panel">
      <div class="brand-panel-inner">
        <div class="brand-mark">
          <v-icon color="white" size="28">mdi-bridge</v-icon>
        </div>
        <h1 class="brand-name">No<span class="dot">va</span></h1>
        <p class="brand-tag">Admin console</p>

        <ul class="brand-points">
          <li>
            <v-icon small color="#7ec8e3" class="mr-2">mdi-shield-account-outline</v-icon>
            Verify professionals
          </li>
          <li>
            <v-icon small color="#7ec8e3" class="mr-2">mdi-file-document-outline</v-icon>
            Route assessment requests
          </li>
          <li>
            <v-icon small color="#7ec8e3" class="mr-2">mdi-account-group-outline</v-icon>
            Manage users &amp; access
          </li>
        </ul>

        <div class="brand-foot">
          Restricted access · Authorised staff only
        </div>
      </div>
      <div class="brand-glow"></div>
    </aside>

    <!-- RIGHT: form -->
    <main class="form-panel">
      <div class="form-wrap">
        <!-- Mobile brand -->
        <div class="mobile-brand">
          <div class="brand-mark sm">
            <v-icon color="white" size="20">mdi-bridge</v-icon>
          </div>
          <span class="brand-name sm">No<span class="dot">va</span></span>
        </div>

        <header class="form-head">
          <h2>Admin sign in</h2>
          <p>Enter your credentials to access the console.</p>
        </header>

        <!-- ERROR -->
        <transition name="fade">
          <div v-if="errorMsg" class="alert alert-error">
            <v-icon small color="#c0392b" class="mr-2">mdi-alert-circle-outline</v-icon>
            <span>{{ errorMsg }}</span>
          </div>
        </transition>

        <!-- FORM -->
        <form @submit.prevent="submit" novalidate>
          <div class="field">
            <label class="field-label" for="admin-email">Email</label>
            <div class="field-input" :class="{ focused: focusField === 'email' }">
              <v-icon small color="#7f8c8d" class="field-icon">mdi-email-outline</v-icon>
              <input
                id="admin-email"
                v-model.trim="email"
                type="email"
                autocomplete="username"
                placeholder="admin@nova.app"
                :disabled="loading"
                @focus="focusField = 'email'"
                @blur="focusField = null"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="admin-password">Password</label>
            <div class="field-input" :class="{ focused: focusField === 'password' }">
              <v-icon small color="#7f8c8d" class="field-icon">mdi-lock-outline</v-icon>
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="loading"
                @focus="focusField = 'password'"
                @blur="focusField = null"
                required
              />
              <button
                type="button"
                class="field-action"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <v-icon small color="#7f8c8d">
                  {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
              </button>
            </div>
          </div>

          <div class="row-between">
            <label class="checkbox">
              <input v-model="remember" type="checkbox" :disabled="loading" />
              <span>Remember me</span>
            </label>
            <a href="#" class="link" @click.prevent="forgotPassword">Forgot password?</a>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading || !canSubmit">
            <template v-if="!loading">
              <v-icon small color="white" class="mr-2">mdi-login-variant</v-icon>
              Sign in
            </template>
            <template v-else>
              <v-progress-circular indeterminate size="16" width="2" color="white" />
              <span class="ml-2">Signing in…</span>
            </template>
          </button>
        </form>

        <p class="foot-note">
          Not an admin? <nuxt-link to="/login" class="link">Go to member login</nuxt-link>
        </p>
      </div>
    </main>

    <!-- TOASTS -->
    <div class="toast-wrap">
      <transition-group name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast-${t.type}`">
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
  name: 'AdminLoginPage',
  layout: 'empty', // remove this line if you don't have an empty layout
  auth: false,
  middleware: 'guest', // assumes you have a guest middleware; remove if not

  data() {
    return {
      email: '',
      password: '',
      remember: true,
      showPassword: false,
      loading: false,
      errorMsg: '',
      focusField: null,
      toasts: []
    };
  },

  computed: {
    canSubmit() {
      return this.email.length > 3 && this.password.length >= 6;
    }
  },

  mounted() {
    // Pre-fill remembered email
    try {
      const saved = localStorage.getItem('nova_admin_email');
      if (saved) this.email = saved;
    } catch (e) {}
  },

  methods: {
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

    async submit() {
      if (this.loading || !this.canSubmit) return;
      this.loading = true;
      this.errorMsg = '';

      try {
        const auth = this._fbAuth();
        if (!auth) {
          throw new Error('Authentication is not configured.');
        }

        // 1. Firebase sign-in
        const cred = await auth.signInWithEmailAndPassword(this.email, this.password);
        const user = cred.user;

        // 2. Get fresh ID token
        const token = await user.getIdToken(true);

        // 3. Verify the user is actually an admin
        const { data } = await axios.get(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const me = data?.data;
        if (!me || me.role !== 'admin') {
          // Kick them back out — do not leave a half-signed-in session
          await auth.signOut();
          throw new Error('This account does not have admin access.');
        }

        // 4. Persist remembered email
        try {
          if (this.remember) localStorage.setItem('nova_admin_email', this.email);
          else localStorage.removeItem('nova_admin_email');
        } catch (e) {}

        this.toast('Welcome back, admin', 'success', 'mdi-shield-check-outline');

        // 5. Redirect
        const redirect = this.$route.query.redirect || '/dashboard/admin';
        this.$router.replace(redirect).catch(() => {});
      } catch (err) {
        const code = err?.code || '';
        const map = {
          'auth/invalid-email': 'That email address looks invalid.',
          'auth/user-disabled': 'This account has been disabled.',
          'auth/user-not-found': 'No account found with that email.',
          'auth/wrong-password': 'Incorrect email or password.',
          'auth/invalid-credential': 'Incorrect email or password.',
          'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
          'auth/network-request-failed': 'Network error. Check your connection.'
        };
        this.errorMsg =
          map[code] ||
          err?.response?.data?.error ||
          err?.message ||
          'Sign in failed. Please try again.';
        console.warn('[admin login]', code, err?.message);
      } finally {
        this.loading = false;
      }
    },

    async forgotPassword() {
      if (!this.email) {
        this.errorMsg = 'Enter your email first, then tap "Forgot password?".';
        return;
      }
      try {
        const auth = this._fbAuth();
        if (!auth) throw new Error('Authentication is not configured.');
        await auth.sendPasswordResetEmail(this.email);
        this.toast('Reset link sent. Check your inbox.', 'success', 'mdi-email-check-outline');
      } catch (err) {
        this.errorMsg = err?.message || 'Could not send reset email.';
      }
    }
  }
};
</script>

<style scoped>
.admin-login {
  --purple: #4a3b8c;
  --purple-2: #5b4b9e;
  --teal: #56c2d9;
  --teal-2: #7ec8e3;
  --pink: #e86a8a;
  --ink: #2c3e50;
  --muted: #7f8c8d;
  --line: #ececf1;
  --bg: #f5f7fb;

  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  background: var(--bg);
}
@media (min-width: 900px) {
  .admin-login { grid-template-columns: 1.05fr 1fr; }
}

/* BRAND PANEL */
.brand-panel {
  position: relative;
  overflow: hidden;
  display: none;
  background: linear-gradient(135deg, #2f2560 0%, #4a3b8c 45%, #5b4b9e 100%);
  color: #fff;
  padding: 56px 56px 40px;
}
@media (min-width: 900px) {
  .brand-panel { display: flex; align-items: stretch; }
}
.brand-panel-inner {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; justify-content: center;
  width: 100%; max-width: 440px; margin: 0 auto;
}
.brand-mark {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, var(--teal), var(--pink));
  display: grid; place-items: center;
  box-shadow: 0 18px 36px -14px rgba(126, 200, 227, 0.7);
  margin-bottom: 24px;
}
.brand-mark.sm {
  width: 38px; height: 38px; border-radius: 12px; margin: 0;
  background: linear-gradient(135deg, var(--purple), var(--teal));
}
.brand-name {
  font-size: 2rem; font-weight: 900; letter-spacing: -0.02em; margin: 0;
}
.brand-name.sm { font-size: 1.05rem; }
.brand-name .dot { color: var(--teal-2); }
.brand-tag {
  font-size: 0.9rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1.5px; opacity: 0.7; margin: 8px 0 40px;
}
.brand-points {
  list-style: none; padding: 0; margin: 0 0 auto;
  display: flex; flex-direction: column; gap: 14px;
}
.brand-points li {
  display: flex; align-items: center;
  font-size: 0.95rem; font-weight: 600; opacity: 0.92;
}
.brand-foot {
  margin-top: 48px;
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.2px;
  opacity: 0.55;
}
.brand-glow {
  position: absolute; top: -30%; right: -25%; width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.55), transparent 65%);
  filter: blur(30px); pointer-events: none;
}

/* FORM PANEL */
.form-panel {
  display: flex; align-items: center; justify-content: center;
  padding: 32px 20px;
}
.form-wrap {
  width: 100%; max-width: 400px;
}
.mobile-brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 28px;
}
@media (min-width: 900px) { .mobile-brand { display: none; } }

.form-head { margin-bottom: 24px; }
.form-head h2 {
  font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em;
  color: var(--ink); margin: 0 0 6px;
}
.form-head p { font-size: 0.92rem; color: var(--muted); margin: 0; }

/* ALERT */
.alert {
  display: flex; align-items: flex-start;
  padding: 12px 14px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 600; line-height: 1.45;
  margin-bottom: 18px;
}
.alert-error {
  background: #fdecea; color: #c0392b;
  border: 1px solid #f5c2bd;
}
.alert .v-icon { margin-top: 1px; flex: 0 0 auto; }

/* FIELD */
.field { margin-bottom: 16px; }
.field-label {
  display: block; font-size: 0.82rem; font-weight: 700;
  color: var(--ink); margin-bottom: 8px;
}
.field-input {
  display: flex; align-items: center;
  background: #fff; border: 1.5px solid #e0e4eb; border-radius: 12px;
  padding: 0 12px;
  height: 50px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.field-input.focused {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.field-icon { margin-right: 10px; flex: 0 0 auto; }
.field-input input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 0.95rem; color: var(--ink); font-family: inherit;
  height: 100%;
  min-width: 0;
}
.field-input input::placeholder { color: #b2bcc5; }
.field-input input:disabled { opacity: 0.6; }
.field-action {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px;
  display: grid; place-items: center;
}
.field-action:hover { background: #f3f7fb; }

/* ROW */
.row-between {
  display: flex; align-items: center; justify-content: space-between;
  margin: 4px 0 20px;
}
.checkbox {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.84rem; color: var(--ink); font-weight: 600;
  cursor: pointer; user-select: none;
}
.checkbox input {
  width: 16px; height: 16px; accent-color: var(--purple);
  cursor: pointer;
}
.link {
  color: var(--purple); font-weight: 700; font-size: 0.84rem;
  text-decoration: none; background: transparent; border: none;
  cursor: pointer; font-family: inherit; padding: 0;
}
.link:hover { text-decoration: underline; }

/* SUBMIT */
.submit-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.95rem; font-weight: 800;
  cursor: pointer; font-family: inherit; min-height: 50px;
  box-shadow: 0 14px 28px -14px rgba(74, 59, 140, 0.75);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px -14px rgba(74, 59, 140, 0.85);
}
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.foot-note {
  margin-top: 24px; text-align: center;
  font-size: 0.84rem; color: var(--muted);
}

/* TOASTS */
.toast-wrap {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
.toast {
  display: inline-flex; align-items: center;
  padding: 12px 18px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 700; color: #fff;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.5);
  max-width: 340px;
}
.toast-success { background: linear-gradient(135deg, #229954, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(20px); }

@media (max-width: 599px) {
  .toast-wrap { left: 14px; right: 14px; align-items: stretch; }
  .toast { max-width: none; }
  .form-head h2 { font-size: 1.4rem; }
}
</style>