<template>
  <div class="match-page">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Choose a professional</div>
      <div class="topbar-spacer" />
    </header>

    <main class="main">
      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="32" width="3" />
        <span>Finding the right professionals…</span>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Couldn't load suggestions</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
        <button class="link-btn mt-3" @click="goBack">Back to dashboard</button>
      </section>

      <template v-else>
        <!-- HEADER -->
        <div class="head">
          <div class="head-kicker">Recommended for your child</div>
          <h1 class="head-title">{{ inferredTitle }}</h1>
          <p class="head-sub">
            Based on the questionnaire, we recommend a
            <strong>{{ inferredTypeLabel }}</strong>.
            Pick the one you'd like to work with — or let Nova choose.
          </p>
        </div>

        <!-- SUGGESTIONS -->
        <div v-if="!suggestions.length" class="empty-card">
          <div class="empty-icon">
            <v-icon size="42" color="#4a3b8c">mdi-account-search-outline</v-icon>
          </div>
          <h2>No matches found yet</h2>
          <p>
            We don't have a verified {{ inferredTypeLabel }} in
            {{ countyUsed || 'your area' }} right now.
            Our team will find one and get back to you.
          </p>
          <button class="primary-btn mt-4" @click="skip">
            Continue without choosing
          </button>
        </div>

        <div v-else class="suggestions">
          <button
            v-for="(s, i) in suggestions"
            :key="s.id"
            class="sug-card"
            :class="{ active: chosenId === s.id }"
            :disabled="saving"
            @click="chosenId = s.id"
          >
            <!-- TOP BADGE -->
            <div v-if="i === 0" class="sug-badge">
              <v-icon x-small color="white">mdi-star</v-icon>
              Top match
            </div>

            <div class="sug-head">
              <div class="sug-avatar" :style="{ background: avatarBg(s.id) }">
                {{ initials(s.display_name) }}
              </div>
              <div class="sug-body">
                <div class="sug-name">{{ s.display_name }}</div>
                <div class="sug-type">{{ typeLabel(s.type) }}</div>
              </div>
              <div class="sug-check" :class="{ on: chosenId === s.id }">
                <v-icon x-small color="white">mdi-check</v-icon>
              </div>
            </div>

            <div class="sug-meta">
              <span v-if="s.county" class="sug-chip">
                <v-icon x-small class="mr-1">mdi-map-marker-outline</v-icon>
                {{ s.county }}
              </span>
              <span v-if="s.years_experience" class="sug-chip">
                <v-icon x-small class="mr-1">mdi-briefcase-outline</v-icon>
                {{ s.years_experience }} yrs
              </span>
              <span v-if="s.online" class="sug-chip sug-chip-online">
                <v-icon x-small class="mr-1">mdi-video-outline</v-icon>
                Online
              </span>
              <span v-if="s.languages && s.languages.length" class="sug-chip">
                <v-icon x-small class="mr-1">mdi-translate</v-icon>
                {{ languagesLabel(s.languages) }}
              </span>
            </div>

            <div v-if="s.price_min || s.price_max" class="sug-price">
              KSh {{ formatPrice(s.price_min) }} – {{ formatPrice(s.price_max) }} per session
            </div>
          </button>
        </div>

        <!-- ACTIONS -->
        <div v-if="suggestions.length" class="actions">
          <button class="btn-secondary" :disabled="saving" @click="skip">
            Let Nova choose
          </button>
          <button
            class="btn-primary"
            :disabled="!chosenId || saving"
            @click="confirmChoice"
          >
            <span v-if="!saving">Confirm choice</span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="16" width="2" color="white" />
              <span class="ml-2">Saving…</span>
            </span>
          </button>
        </div>

        <div v-if="error" class="error-box mt-4">
          <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
          <span>{{ error }}</span>
        </div>
      </template>
    </main>

    <!-- SUCCESS MODAL -->
    <transition name="modal">
      <div v-if="showSuccess" class="modal-backdrop">
        <div class="modal">
          <div class="success-icon">
            <div class="success-pulse"></div>
            <v-icon size="38" color="white">mdi-check</v-icon>
          </div>
          <h3 class="modal-title">{{ successTitle }}</h3>
          <p class="modal-text">{{ successText }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="goToAssessments">
              View requests
            </button>
            <button class="btn-primary" @click="goToDashboard">
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'AssessmentMatchPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',
      error: '',
      saving: false,
      scrolled: false,
      showSuccess: false,
      successTitle: 'Request confirmed',
      successText: '',

      requestId: null,
      suggestions: [],
      inferredType: null,
      countyUsed: null,
      chosenId: null
    };
  },

  computed: {
    inferredTypeLabel() {
      return {
        speech_therapist: 'Speech & Language Therapist',
        occupational_therapist: 'Occupational Therapist',
        physiotherapist: 'Physiotherapist',
        psychologist: 'Psychologist',
        special_needs_teacher: 'Special Needs Teacher'
      }[this.inferredType] || 'Specialist';
    },
    inferredTitle() {
      return `We recommend a ${this.inferredTypeLabel}`;
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.requestId = Number(this.$route.params.id);
    if (!this.requestId) {
      this.loadError = 'Invalid request.';
      this.loading = false;
      return;
    }
    this.load();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    onScroll() { this.scrolled = window.scrollY > 4; },

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
      this.$router.push('/dashboard/parent?tab=assessments').catch(() => {});
    },
    goToDashboard() {
      this.$router.push('/dashboard/parent').catch(() => {});
    },
    goToAssessments() {
      this.$router.push('/dashboard/parent?tab=assessments').catch(() => {});
    },

    async load() {
      this.loading = true;
      this.loadError = '';
      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          return this.$router.replace('/login');
        }

        const { data } = await axios.get(
          `${API}/api/assessments/requests/${this.requestId}/suggestions`,
          { headers }
        );

        this.suggestions = data.data || [];
        this.inferredType = data.inferred_type || null;
        this.countyUsed = data.county_used || null;

        // Auto-select top match
        if (this.suggestions.length) this.chosenId = this.suggestions[0].id;
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) return this.$router.replace('/login');
        if (status === 403) {
          this.loadError = 'You don\'t have access to this request.';
        } else if (status === 404) {
          this.loadError = 'Request not found.';
        } else {
          this.loadError = err.response?.data?.error || 'Could not load suggestions.';
        }
      } finally {
        this.loading = false;
      }
    },

    async confirmChoice() {
      if (!this.chosenId || this.saving) return;
      this.saving = true;
      this.error = '';
      try {
        const headers = await this.authHeader();
        await axios.patch(
          `${API}/api/assessments/requests/${this.requestId}/preferred`,
          { professional_id: this.chosenId },
          { headers }
        );
        const chosen = this.suggestions.find((s) => s.id === this.chosenId);
        this.successTitle = 'Choice saved';
        this.successText =
          `${chosen ? chosen.display_name : 'Your chosen professional'} will be contacted and will reach out soon.`;
        this.showSuccess = true;
      } catch (err) {
        const code = err.response?.data?.error;
        this.error = {
          request_already_routed: 'This request has already been routed.',
          professional_not_available: 'That professional is not available right now.',
          invalid_professional_id: 'Something went wrong with your selection.'
        }[code] || 'Could not save your choice. Try again.';
      } finally {
        this.saving = false;
      }
    },

    async skip() {
      if (this.saving) return;
      this.saving = true;
      this.error = '';
      try {
        const headers = await this.authHeader();
        await axios.patch(
          `${API}/api/assessments/requests/${this.requestId}/preferred`,
          { professional_id: null },
          { headers }
        );
        this.successTitle = 'Request submitted';
        this.successText = 'Our team will match you with the right professional within 1–2 working days.';
        this.showSuccess = true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Could not continue. Try again.';
      } finally {
        this.saving = false;
      }
    },

    /* ---- Helpers ---- */
    initials(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg(id) {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return p[(Number(id) || 0) % p.length];
    },
    typeLabel(t) {
      return {
        speech_therapist: 'Speech & language therapist',
        occupational_therapist: 'Occupational therapist',
        physiotherapist: 'Physiotherapist',
        psychologist: 'Psychologist',
        special_needs_teacher: 'Special-needs teacher',
        learning_support: 'Learning support',
        parent_coach: 'Parent coach',
        other: 'Specialist'
      }[t] || t || 'Specialist';
    },
    languagesLabel(l) {
      if (!l) return '';
      if (Array.isArray(l)) return l.join(', ');
      try {
        const p = JSON.parse(l);
        return Array.isArray(p) ? p.join(', ') : '';
      } catch (e) { return ''; }
    },
    formatPrice(n) {
      return Number(n || 0).toLocaleString('en-US');
    }
  }
};
</script>

<style scoped>
.match-page {
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
  background: var(--bg);
  padding-bottom: 48px;
}

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

.back-btn {
  width: 38px; height: 38px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
}
.back-btn:hover { background: #e6eef5; }
.topbar-title { font-size: 0.98rem; font-weight: 800; color: var(--ink); }
.topbar-spacer { width: 38px; }

.main { max-width: 640px; margin: 0 auto; padding: 24px 20px; }

.loading {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 60px 0; color: var(--muted); font-size: 0.9rem;
}

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
.error-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 20px; }

.head { margin-bottom: 24px; }
.head-kicker {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase; color: var(--purple);
  margin-bottom: 6px;
}
.head-title {
  font-size: 1.5rem; font-weight: 800; color: var(--ink);
  margin: 0 0 10px; letter-spacing: -0.02em; line-height: 1.2;
}
.head-sub { font-size: 0.9rem; color: var(--muted); margin: 0; line-height: 1.55; }
.head-sub strong { color: var(--ink); font-weight: 800; }

/* SUGGESTION CARDS */
.suggestions { display: grid; gap: 12px; margin-bottom: 20px; }

.sug-card {
  position: relative;
  display: block;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 2px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.sug-card:hover:not(:disabled) {
  border-color: #d9d2ec;
  transform: translateY(-1px);
  box-shadow: 0 16px 28px -20px rgba(74, 59, 140, 0.35);
}
.sug-card.active {
  border-color: var(--purple);
  background: linear-gradient(180deg, #faf8ff 0%, #f4f0ff 100%);
  box-shadow: 0 18px 32px -18px rgba(74, 59, 140, 0.45);
}
.sug-card:disabled { opacity: 0.6; cursor: not-allowed; }

.sug-badge {
  position: absolute; top: -10px; left: 18px;
  display: inline-flex; align-items: center; gap: 4px;
  background: linear-gradient(135deg, #e86a8a, #f48fb1);
  color: #fff;
  font-size: 0.62rem; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px;
  box-shadow: 0 6px 14px -6px rgba(232, 106, 138, 0.7);
}

.sug-head {
  display: flex; align-items: center; gap: 14px; margin-bottom: 12px;
}
.sug-avatar {
  width: 52px; height: 52px; border-radius: 14px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 16px; flex: 0 0 auto;
  letter-spacing: 0.3px;
  box-shadow: 0 10px 20px -10px rgba(74, 59, 140, 0.55);
}
.sug-body { flex: 1; min-width: 0; }
.sug-name {
  font-size: 1rem; font-weight: 800; color: var(--ink);
  margin-bottom: 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sug-type { font-size: 0.8rem; color: var(--muted); }
.sug-check {
  width: 26px; height: 26px; border-radius: 50%;
  background: #ececf1;
  display: grid; place-items: center;
  flex: 0 0 auto;
  transition: background 0.15s ease, transform 0.15s ease;
}
.sug-check .v-icon { opacity: 0; transition: opacity 0.15s ease; }
.sug-check.on {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  transform: scale(1.08);
}
.sug-check.on .v-icon { opacity: 1; }

.sug-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.sug-chip {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700;
  background: #f3f7fb; color: #4a5568;
}
.sug-chip-online { background: #e6f4f8; color: #0288a5; }

.sug-price {
  font-size: 0.82rem; font-weight: 700;
  color: var(--purple);
  padding-top: 10px;
  border-top: 1px solid #f0f0f5;
}

/* ACTIONS */
.actions {
  display: flex; gap: 10px;
  margin-top: 24px;
}
.btn-secondary {
  flex: 0 0 auto;
  padding: 14px 22px; border-radius: 12px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.92rem; font-weight: 700;
  cursor: pointer; font-family: inherit; min-height: 50px;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-secondary:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary {
  flex: 1;
  padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.92rem; font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 50px;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: var(--purple); font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }

/* EMPTY */
.empty-card {
  background: #fff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid var(--line);
  max-width: 520px; margin: 24px auto;
}
.empty-icon {
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg, #ede7f8, #fce4ec);
  display: grid; place-items: center; margin: 0 auto 18px;
}
.empty-card h2 { font-size: 1.15rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.empty-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0; }

/* ERROR BOX */
.error-box {
  padding: 12px 14px; border-radius: 12px;
  background: #fdecea; color: #c0392b;
  font-size: 0.85rem; font-weight: 500;
  display: flex; align-items: flex-start;
}
.error-box .v-icon { margin-top: 1px; flex: 0 0 auto; }

/* SUCCESS MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #fff; border-radius: 22px;
  padding: 32px 24px;
  max-width: 420px; width: 100%;
  text-align: center;
  box-shadow: 0 40px 80px -24px rgba(15, 13, 36, 0.5);
}
.success-icon {
  position: relative;
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg, #229954, #2ecc71);
  display: grid; place-items: center;
  margin: 0 auto 18px;
  color: #fff;
  box-shadow: 0 18px 36px -14px rgba(34, 153, 84, 0.6);
}
.success-pulse {
  position: absolute; inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 204, 113, 0.45), transparent 70%);
  animation: pulse 1.6s ease-out infinite;
  pointer-events: none;
}
@keyframes pulse {
  0% { transform: scale(0.85); opacity: 0.9; }
  100% { transform: scale(1.4); opacity: 0; }
}
.modal-title {
  font-size: 1.15rem; font-weight: 800;
  color: var(--ink); margin: 0 0 8px;
}
.modal-text {
  font-size: 0.9rem; color: var(--muted);
  line-height: 1.6; margin: 0 0 24px;
}
.modal-actions {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
.modal-actions button { min-width: 130px; }

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
}
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal {
  transform: translateY(20px) scale(0.97); opacity: 0;
}

@media (max-width: 599px) {
  .main { padding: 18px 14px; }
  .head-title { font-size: 1.3rem; }
  .actions { flex-direction: column-reverse; }
  .btn-secondary { width: 100%; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; min-width: 0; }
}
</style>