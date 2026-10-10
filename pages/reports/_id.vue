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
            <div class="hero-kicker">Assessment report</div>
            <h1 class="hero-title">{{ report.child_name }}</h1>
            <div class="hero-meta">
              <span v-if="report.child_dob" class="hero-chip">
                {{ ageOf(report.child_dob) }}
              </span>
              <span class="hero-chip">
                {{ professionalLabel(report.professional_name) }}
              </span>
              <span class="hero-chip">
                {{ formatDate(report.created_at) }}
              </span>
            </div>
          </div>
          <div class="hero-glow"></div>
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
            <div class="summary-icon gradient-purple">
              <v-icon small color="white">mdi-lightbulb-outline</v-icon>
            </div>
            <div class="summary-label">Recommendations</div>
          </div>
        </div>

        <!-- FINDINGS -->
        <section v-if="report.findings" id="findings" class="card">
          <div class="card-head">
            <div class="card-icon gradient-purple">
              <v-icon small color="white">mdi-clipboard-search-outline</v-icon>
            </div>
            <h2 class="card-title">Findings</h2>
          </div>
          <p class="card-text">{{ report.findings }}</p>
        </section>

        <!-- STRENGTHS -->
        <section v-if="report.strengths" id="strengths" class="card">
          <div class="card-head">
            <div class="card-icon gradient-teal">
              <v-icon small color="white">mdi-star-outline</v-icon>
            </div>
            <h2 class="card-title">Strengths</h2>
          </div>
          <p class="card-text">{{ report.strengths }}</p>
        </section>

        <!-- NEEDS -->
        <section v-if="report.needs" id="needs" class="card">
          <div class="card-head">
            <div class="card-icon gradient-pink">
              <v-icon small color="white">mdi-flag-outline</v-icon>
            </div>
            <h2 class="card-title">Areas requiring support</h2>
          </div>
          <p class="card-text">{{ report.needs }}</p>
        </section>

        <!-- RECOMMENDATIONS -->
        <section v-if="report.recommendations" id="recommendations" class="card">
          <div class="card-head">
            <div class="card-icon gradient-purple">
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
          </div>
          <div class="goals-list">
            <div v-for="(g, i) in goals" :key="i" class="goal-row">
              <div class="goal-num">{{ i + 1 }}</div>
              <div class="goal-body">
                <div class="goal-desc">{{ g.description || g }}</div>
                <div v-if="g.baseline || g.target" class="goal-meta">
                  <span v-if="g.baseline">Baseline: {{ g.baseline }}</span>
                  <span v-if="g.target">
                    <span v-if="g.baseline"> · </span>
                    Target: {{ g.target }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FOLLOW-UP -->
        <section v-if="report.follow_up_date" class="card followup-card">
          <div class="card-head">
            <div class="card-icon gradient-pink">
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

        // Fetch user so we know where to send them back to
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
.topbar-title { font-size: 0.98rem; font-weight: 800; color: var(--ink); }

/* MAIN */
.main { max-width: 680px; margin: 0 auto; padding: 24px 20px; }
@media (min-width: 768px) { .main { padding: 32px 24px; } }

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
  margin: 0 0 10px; line-height: 1.2;
}
.hero-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.hero-chip {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(6px);
}
.hero-glow {
  position: absolute; top: -40%; right: -20%; width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.55), transparent 70%);
  filter: blur(20px); pointer-events: none;
}

/* SUMMARY STRIP */
.summary-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 8px; margin-bottom: 16px;
}
.summary-chip {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 6px; background: #fff;
  border: 1px solid var(--line); border-radius: 14px;
  cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;
}
.summary-chip:hover {
  transform: translateY(-2px);
  border-color: #d9d2ec;
}
.summary-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center;
}
.summary-label {
  font-size: 0.66rem; font-weight: 800; color: var(--ink);
  text-align: center; text-transform: uppercase; letter-spacing: 0.3px;
}
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }

/* CARD */
.card {
  background: #fff; border: 1px solid var(--line);
  border-radius: 18px; padding: 20px; margin-bottom: 14px;
  scroll-margin-top: 80px;
}
.card-head {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px;
}
.card-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center; flex: 0 0 auto;
}
.card-title {
  font-size: 1rem; font-weight: 800; color: var(--ink);
  margin: 0; letter-spacing: -0.01em;
}
.card-text {
  font-size: 0.92rem; color: #4a5568; line-height: 1.7;
  margin: 0; white-space: pre-wrap;
}

.followup-card {
  background: linear-gradient(180deg, #f7faf8 0%, #ffffff 100%);
  border-color: #d9efe1;
}

/* GOALS */
.goals-list { display: flex; flex-direction: column; gap: 10px; }
.goal-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; background: #f7f9fc;
  border-radius: 12px;
  border-left: 3px solid var(--purple);
}
.goal-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.72rem; font-weight: 800;
  display: grid; place-items: center; flex: 0 0 auto;
}
.goal-body { flex: 1; min-width: 0; }
.goal-desc {
  font-size: 0.88rem; font-weight: 700; color: var(--ink);
  line-height: 1.5;
}
.goal-meta {
  font-size: 0.74rem; color: var(--muted);
  margin-top: 4px;
}

/* ACTIONS */
.actions {
  display: flex; gap: 10px; margin-top: 24px;
  padding-top: 20px; border-top: 1px solid var(--line);
}
.btn-secondary {
  flex: 0 0 auto;
  padding: 14px 22px; border-radius: 12px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.92rem; font-weight: 700;
  cursor: pointer; font-family: inherit; min-height: 50px;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-secondary:hover { border-color: #c8c0e0; background: #f7f8fb; }
.btn-primary {
  flex: 1;
  padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.92rem; font-weight: 700;
  cursor: pointer; font-family: inherit; min-height: 50px;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  transition: transform 0.15s ease;
}
.btn-primary:hover { transform: translateY(-1px); }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: var(--purple); font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }
.mt-3 { margin-top: 12px; }

/* MOBILE */
@media (max-width: 599px) {
  .main { padding: 18px 14px; }
  .hero { padding: 20px 18px; border-radius: 18px; }
  .hero-title { font-size: 1.3rem; }
  .summary-strip { grid-template-columns: repeat(2, 1fr); }
  .actions { flex-direction: column-reverse; }
  .btn-secondary { width: 100%; }
}
</style>