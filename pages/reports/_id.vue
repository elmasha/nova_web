<template>
  <div class="report-page">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Assessment report</div>
      <button class="icon-btn" @click="load" :disabled="loading" aria-label="Refresh">
        <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
      </button>
    </header>

    <main class="main">
      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="32" width="3" />
        <span>Loading report…</span>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Couldn't load the report</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
        <button class="link-btn mt-3" @click="goBack">Go back</button>
      </section>

      <!-- REPORT -->
      <template v-else-if="report">
        <!-- HERO -->
        <div class="hero">
          <div class="hero-body">
            <div class="hero-kicker">
              <v-icon x-small color="white" class="mr-1">mdi-file-document-outline</v-icon>
              Assessment report
            </div>
            <h1 class="hero-title">{{ report.child_name }}</h1>
            <div class="hero-meta">
              <span v-if="report.child_dob" class="hero-chip">
                <v-icon x-small color="white" class="chip-ico">mdi-cake-variant-outline</v-icon>
                {{ ageOf(report.child_dob) }}
              </span>
              <span class="hero-chip">
                <v-icon x-small color="white" class="chip-ico">mdi-stethoscope</v-icon>
                {{ professionalLabel(report.professional_name) }}
              </span>
              <span class="hero-chip">
                <v-icon x-small color="white" class="chip-ico">mdi-calendar-blank-outline</v-icon>
                {{ formatDate(report.created_at) }}
              </span>
            </div>
          </div>
          <div class="hero-glow"></div>
          <div class="hero-glow hero-glow-2"></div>
        </div>

        <!-- SUMMARY -->
        <div class="summary-strip">
          <div class="summary-chip" @click="scrollTo('findings')">
            <div class="summary-icon gradient-purple">
              <v-icon small color="white">mdi-clipboard-search-outline</v-icon>
            </div>
            <div class="summary-label">Findings</div>
          </div>
          <div class="summary-chip" @click="scrollTo('strengths')">
            <div class="summary-icon gradient-teal">
              <v-icon small color="white">mdi-star-outline</v-icon>
            </div>
            <div class="summary-label">Strengths</div>
          </div>
          <div class="summary-chip" @click="scrollTo('needs')">
            <div class="summary-icon gradient-pink">
              <v-icon small color="white">mdi-flag-outline</v-icon>
            </div>
            <div class="summary-label">Needs</div>
          </div>
          <div class="summary-chip" @click="scrollTo('recommendations')">
            <div class="summary-icon gradient-amber">
              <v-icon small color="white">mdi-lightbulb-outline</v-icon>
            </div>
            <div class="summary-label">Next steps</div>
          </div>
        </div>

        <!-- FINDINGS -->
        <section v-if="report.findings" id="findings" class="card card-purple">
          <div class="card-head">
            <div class="card-icon gradient-purple">
              <v-icon small color="white">mdi-clipboard-search-outline</v-icon>
            </div>
            <h2 class="card-title">Findings</h2>
          </div>
          <p class="card-text">{{ report.findings }}</p>
        </section>

        <!-- STRENGTHS -->
        <section v-if="report.strengths" id="strengths" class="card card-teal">
          <div class="card-head">
            <div class="card-icon gradient-teal">
              <v-icon small color="white">mdi-star-outline</v-icon>
            </div>
            <h2 class="card-title">Strengths</h2>
          </div>
          <p class="card-text">{{ report.strengths }}</p>
        </section>

        <!-- NEEDS -->
        <section v-if="report.needs" id="needs" class="card card-pink">
          <div class="card-head">
            <div class="card-icon gradient-pink">
              <v-icon small color="white">mdi-flag-outline</v-icon>
            </div>
            <h2 class="card-title">Areas requiring support</h2>
          </div>
          <p class="card-text">{{ report.needs }}</p>
        </section>

        <!-- RECOMMENDATIONS -->
        <section v-if="report.recommendations" id="recommendations" class="card card-amber">
          <div class="card-head">
            <div class="card-icon gradient-amber">
              <v-icon small color="white">mdi-lightbulb-outline</v-icon>
            </div>
            <h2 class="card-title">Recommendations</h2>
          </div>
          <p class="card-text">{{ report.recommendations }}</p>
        </section>

        <!-- GOALS -->
        <section v-if="goals.length" class="card">
          <div class="card-head">
            <div class="card-icon gradient-teal">
              <v-icon small color="white">mdi-target</v-icon>
            </div>
            <h2 class="card-title">Goals</h2>
            <span class="card-count">{{ goals.length }}</span>
          </div>
          <div class="goals-list">
            <div v-for="(g, i) in goals" :key="i" class="goal-row">
              <div class="goal-num">{{ i + 1 }}</div>
              <div class="goal-body">
                <div class="goal-desc">{{ g.description || g }}</div>
                <div v-if="g.baseline || g.target" class="goal-meta">
                  <span v-if="g.baseline" class="goal-pill">Baseline: {{ g.baseline }}</span>
                  <span v-if="g.target" class="goal-pill">Target: {{ g.target }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FOLLOW-UP -->
        <section v-if="report.follow_up_date" class="card followup-card">
          <div class="card-head">
            <div class="card-icon gradient-green">
              <v-icon small color="white">mdi-calendar-clock-outline</v-icon>
            </div>
            <h2 class="card-title">Follow-up</h2>
          </div>
          <p class="card-text">
            Recommended follow-up on
            <strong>{{ formatDate(report.follow_up_date) }}</strong>.
          </p>
        </section>

        <!-- ACTIONS -->
        <div class="actions">
          <button class="btn-secondary" @click="printPage">
            <v-icon small class="mr-1">mdi-printer-outline</v-icon>
            Print
          </button>
          <button class="btn-primary" @click="goBack">
            <v-icon small color="white" class="mr-1">mdi-arrow-left</v-icon>
            Back
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'ReportDetailPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',
      scrolled: false,
      report: null,
      user: null,
      role: 'parent'
    };
  },

  computed: {
    goals() {
      const raw = this.report?.goals_json;
      if (!raw) return [];
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') return Object.values(parsed);
        return [];
      } catch (e) {
        return [];
      }
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
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
      if (this.role === 'professional') {
        this.$router.push('/dashboard/professional?tab=requests').catch(() => {});
      } else {
        this.$router.push('/dashboard/parent?tab=assessments').catch(() => {});
      }
    },

    scrollTo(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    printPage() {
      try { window.print(); } catch (e) {}
    },

    async load() {
      this.loading = true;
      this.loadError = '';

      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          return this.$router.replace('/login');
        }

        const meRes = await axios.get(`${API}/api/users/me`, { headers }).catch(() => ({ data: { data: null } }));
        this.user = meRes.data?.data || null;
        this.role = this.user?.role === 'professional' ? 'professional' : 'parent';

        const reportId = Number(this.$route.params.id);
        if (!Number.isInteger(reportId) || reportId <= 0) {
          this.loadError = 'Invalid report.';
          return;
        }

        const { data } = await axios.get(`${API}/api/reports/${reportId}`, { headers });
        this.report = data.data || null;
        if (!this.report) this.loadError = 'Report not found.';
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          return this.$router.replace('/login');
        } else if (status === 403) {
          this.loadError = "You don't have access to this report.";
        } else if (status === 404) {
          this.loadError = 'Report not found.';
        } else {
          this.loadError = err.response?.data?.error || 'Could not load the report.';
        }
      } finally {
        this.loading = false;
      }
    },

    /* ---- Helpers ---- */
    formatDate(dt) {
      if (!dt) return '—';
      return new Date(dt).toLocaleDateString('en-KE', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    },
    ageOf(dob) {
      if (!dob) return '';
      const d = new Date(dob);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      let months = now.getMonth() - d.getMonth();
      if (months < 0) { years--; months += 12; }
      if (years <= 0) return `${months} mo`;
      if (years === 1) return '1 yr';
      return `${years} yrs`;
    },
    professionalLabel(name) {
      return name ? `By ${name}` : 'Report';
    }
  }
};
</script>

<style scoped>
.report-page {
  --purple: #4a3b8c;
  --purple-2: #5b4b9e;
  --teal: #56c2d9;
  --teal-2: #7ec8e3;
  --pink: #e86a8a;
  --pink-2: #f48fb1;
  --amber: #f39c12;
  --amber-2: #f7b955;
  --green: #229954;
  --green-2: #2ecc71;
  --ink: #1f2a37;
  --muted: #7f8c8d;
  --line: #eef0f5;
  --bg: #f5f7fb;
  --bg-2: #fbfcfe;
  min-height: 100vh;
  background:
    radial-gradient(900px 420px at 0% -10%, #ece7fa 0%, transparent 55%),
    radial-gradient(700px 380px at 100% 0%, #e6f4f8 0%, transparent 55%),
    var(--bg);
  padding-bottom: 64px;
}

/* ============================================================
   TOPBAR
   ============================================================ */
.topbar {
  position: sticky; top: 0; z-index: 40;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent;
  height: 64px;
  padding: 0 14px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  padding-top: env(safe-area-inset-top, 0);
}
.topbar.scrolled {
  border-bottom-color: var(--line);
  box-shadow: 0 12px 28px -22px rgba(44, 62, 80, 0.35);
}
@media (min-width: 768px) { .topbar { padding: 0 24px; height: 68px; } }

.back-btn, .icon-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: #f7f5ff;
  border: 1px solid #e9e4f8;
  display: grid; place-items: center; cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}
.back-btn:hover, .icon-btn:hover {
  background: #efeaf9;
  border-color: #d9d2ec;
  transform: translateY(-1px);
}
.back-btn:active, .icon-btn:active { transform: scale(0.96); }
.back-btn:disabled, .icon-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.topbar-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
  flex: 1;
  text-align: center;
}

/* ============================================================
   MAIN
   ============================================================ */
.main { max-width: 720px; margin: 0 auto; padding: 22px 18px 40px; }
@media (min-width: 768px) { .main { padding: 36px 24px 56px; } }

/* ============================================================
   LOADING
   ============================================================ */
.loading {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 80px 0; color: var(--muted); font-size: 0.9rem;
  font-weight: 600;
}

/* ============================================================
   ERROR
   ============================================================ */
.error-card {
  background: #fff; border-radius: 24px; padding: 44px 28px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
  box-shadow: 0 24px 48px -28px rgba(231, 76, 60, 0.35);
}
.error-icon {
  width: 84px; height: 84px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 18px;
}
.error-card h2 {
  font-size: 1.2rem; font-weight: 800; color: var(--ink);
  margin: 0 0 10px; letter-spacing: -0.01em;
}
.error-card p {
  font-size: 0.92rem; color: var(--muted); line-height: 1.65;
  margin: 0 0 22px;
}

/* ============================================================
   HERO
   ============================================================ */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #4a3b8c 0%, #5b4b9e 55%, #7ec8e3 140%);
  color: #fff;
  border-radius: 26px;
  padding: 28px 26px;
  margin-bottom: 18px;
  box-shadow: 0 30px 60px -26px rgba(74, 59, 140, 0.6);
}
.hero-body { position: relative; z-index: 2; }
.hero-kicker {
  display: inline-flex; align-items: center;
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.8px;
  text-transform: uppercase; opacity: 0.85;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  padding: 5px 10px;
  border-radius: 999px;
}
.hero-title {
  font-size: clamp(1.4rem, 4vw, 1.85rem);
  font-weight: 900; letter-spacing: -0.025em;
  margin: 0 0 14px; line-height: 1.15;
}
.hero-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.hero-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.chip-ico { opacity: 0.9; }

.hero-glow {
  position: absolute; top: -40%; right: -20%;
  width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.55), transparent 70%);
  filter: blur(20px); pointer-events: none;
}
.hero-glow-2 {
  top: auto; bottom: -40%; right: auto; left: -20%;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(86, 194, 217, 0.5), transparent 70%);
}

/* ============================================================
   SUMMARY STRIP
   ============================================================ */
.summary-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px; margin-bottom: 18px;
}
.summary-chip {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 14px 8px; background: #fff;
  border: 1px solid var(--line); border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 10px -6px rgba(44, 62, 80, 0.08);
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1),
              border-color 0.18s ease,
              box-shadow 0.18s ease;
}
.summary-chip:hover {
  transform: translateY(-3px);
  border-color: #d9d2ec;
  box-shadow: 0 14px 26px -14px rgba(74, 59, 140, 0.4);
}
.summary-icon {
  width: 38px; height: 38px; border-radius: 11px;
  display: grid; place-items: center;
  box-shadow: 0 8px 16px -8px rgba(74, 59, 140, 0.4);
}
.summary-label {
  font-size: 0.66rem; font-weight: 800; color: var(--ink);
  text-align: center; text-transform: uppercase; letter-spacing: 0.4px;
  line-height: 1.2;
}

/* ============================================================
   GRADIENTS
   ============================================================ */
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-amber  { background: linear-gradient(135deg, #d68a10, #f7b955); }
.gradient-green  { background: linear-gradient(135deg, #1e8a4c, #2ecc71); }

/* ============================================================
   CARD
   ============================================================ */
.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 22px 22px 24px;
  margin-bottom: 14px;
  scroll-margin-top: 88px;
  box-shadow: 0 4px 12px -8px rgba(44, 62, 80, 0.08);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.card:hover { box-shadow: 0 18px 34px -22px rgba(74, 59, 140, 0.35); }

/* Left accent stripe */
.card-purple { border-left: 3px solid #4a3b8c; }
.card-teal   { border-left: 3px solid #56c2d9; }
.card-pink   { border-left: 3px solid #e86a8a; }
.card-amber  { border-left: 3px solid #f39c12; }

.card-head {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.card-icon {
  width: 38px; height: 38px; border-radius: 11px;
  display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 8px 16px -8px rgba(74, 59, 140, 0.45);
}
.card-title {
  font-size: 1.02rem; font-weight: 800; color: var(--ink);
  margin: 0; letter-spacing: -0.01em;
  flex: 1;
}
.card-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; height: 24px; padding: 0 8px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800;
  background: rgba(74, 59, 140, 0.08);
  color: var(--purple);
}
.card-text {
  font-size: 0.94rem;
  color: #4a5568;
  line-height: 1.75;
  margin: 0;
  white-space: pre-wrap;
}

.followup-card {
  background: linear-gradient(180deg, #f4fbf7 0%, #ffffff 100%);
  border-color: #d9efe1;
  border-left: 3px solid var(--green);
}

/* ============================================================
   GOALS
   ============================================================ */
.goals-list { display: flex; flex-direction: column; gap: 12px; }
.goal-row {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 16px;
  background: #f8f9fd;
  border-radius: 14px;
  border: 1px solid #eef0f7;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.goal-row:hover {
  transform: translateX(2px);
  border-color: #d9d2ec;
  box-shadow: 0 12px 22px -18px rgba(74, 59, 140, 0.4);
}
.goal-num {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.72rem; font-weight: 800;
  display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 6px 12px -6px rgba(74, 59, 140, 0.6);
}
.goal-body { flex: 1; min-width: 0; }
.goal-desc {
  font-size: 0.9rem; font-weight: 700; color: var(--ink);
  line-height: 1.5;
}
.goal-meta {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 8px;
}
.goal-pill {
  display: inline-flex; align-items: center;
  font-size: 0.7rem; font-weight: 700;
  color: var(--purple);
  background: rgba(74, 59, 140, 0.08);
  padding: 3px 9px;
  border-radius: 999px;
  line-height: 1.4;
}

/* ============================================================
   ACTIONS
   ============================================================ */
.actions {
  display: flex; gap: 12px; margin-top: 28px;
  padding-top: 22px; border-top: 1px solid var(--line);
}
.btn-secondary {
  flex: 0 0 auto;
  padding: 14px 22px; border-radius: 14px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.92rem; font-weight: 700;
  cursor: pointer; font-family: inherit; min-height: 52px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}
.btn-secondary:hover {
  border-color: #c8c0e0;
  background: #f7f8fb;
  transform: translateY(-1px);
}
.btn-secondary:active { transform: scale(0.98); }

.btn-primary {
  flex: 1;
  padding: 14px 22px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.92rem; font-weight: 700;
  cursor: pointer; font-family: inherit; min-height: 52px;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 28px -14px rgba(74, 59, 140, 0.75);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -16px rgba(74, 59, 140, 0.85);
}
.btn-primary:active { transform: scale(0.98); }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: var(--purple); font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }
.mt-3 { margin-top: 12px; }
.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }

/* ============================================================
   MOBILE
   ============================================================ */
@media (max-width: 599px) {
  .main { padding: 18px 14px 32px; }
  .hero { padding: 22px 20px; border-radius: 20px; }
  .hero-title { font-size: 1.3rem; }
  .summary-strip { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .summary-chip { padding: 12px 6px; border-radius: 14px; }
  .summary-icon { width: 34px; height: 34px; }
  .card { padding: 18px 16px 20px; border-radius: 16px; }
  .card-text { font-size: 0.9rem; }
  .actions { flex-direction: column-reverse; gap: 10px; }
  .btn-secondary { width: 100%; }
  .goal-row { padding: 12px 14px; }
}
</style>