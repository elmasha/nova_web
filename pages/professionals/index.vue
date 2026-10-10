<template>
  <div class="professionals-page">
    <!-- TOP BAR -->
    <header class="topbar" :class="{ scrolled: scrolled }">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Find a professional</div>
      <button class="icon-btn" @click="load" :disabled="loading" aria-label="Refresh">
        <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
      </button>
    </header>

    <main class="main">
      <!-- SEARCH -->
      <div class="search-bar" :class="{ focused: searchFocused }">
        <v-icon small color="#7f8c8d" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model.trim="q"
          type="text"
          placeholder="Search by name or specialty"
          class="search-input"
          @input="debouncedSearch"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
        <transition name="fade">
          <button v-if="q" class="search-clear" @click="clearSearch" aria-label="Clear">
            <v-icon small color="#7f8c8d">mdi-close-circle</v-icon>
          </button>
        </transition>
      </div>

      <!-- FILTERS -->
      <div class="filters">
        <button class="filter-btn" :class="{ active: activeFilters }" @click="showFilters = !showFilters">
          <v-icon small color="#4a3b8c" class="mr-1">mdi-filter-variant</v-icon>
          <span>Filters</span>
          <span v-if="filterCount" class="filter-count">{{ filterCount }}</span>
        </button>

        <div class="select-wrap">
          <select v-model="type" class="filter-select" @change="load">
            <option value="">All specialties</option>
            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <v-icon x-small color="#7f8c8d" class="select-caret">mdi-chevron-down</v-icon>
        </div>

        <div class="select-wrap">
          <select v-model="county" class="filter-select" @change="load">
            <option value="">All counties</option>
            <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
          </select>
          <v-icon x-small color="#7f8c8d" class="select-caret">mdi-chevron-down</v-icon>
        </div>
      </div>

      <!-- ADVANCED FILTERS PANEL -->
      <transition name="panel">
        <div v-if="showFilters" class="filters-panel">
          <div class="panel-group">
            <label class="field-label">Availability</label>
            <div class="chip-row">
              <button
                type="button"
                class="chip"
                :class="{ active: onlineOnly }"
                @click="onlineOnly = !onlineOnly; load()"
              >
                <v-icon x-small class="chip-check">mdi-check</v-icon>
                Online sessions
              </button>
              <button
                type="button"
                class="chip"
                :class="{ active: inPersonOnly }"
                @click="inPersonOnly = !inPersonOnly; load()"
              >
                <v-icon x-small class="chip-check">mdi-check</v-icon>
                In-person
              </button>
            </div>
          </div>

          <div class="panel-group">
            <label class="field-label">Language</label>
            <div class="chip-row">
              <button
                v-for="l in languages"
                :key="l"
                type="button"
                class="chip"
                :class="{ active: language === l }"
                @click="language = language === l ? '' : l; load()"
              >
                <v-icon x-small class="chip-check">mdi-check</v-icon>
                {{ l }}
              </button>
            </div>
          </div>

          <div class="panel-group">
            <label class="field-label">Max price per session (KSh)</label>
            <input
              v-model.number="maxPrice"
              type="number"
              min="0"
              step="500"
              placeholder="e.g. 3000"
              class="text-input"
              @change="load"
            />
          </div>

          <button class="btn-secondary mt-4 full" @click="resetFilters">
            <v-icon small class="mr-2">mdi-filter-remove-outline</v-icon>
            Reset filters
          </button>
        </div>
      </transition>

      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="28" width="3" />
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Could not load professionals</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">Try again</button>
      </section>

      <!-- EMPTY -->
      <section v-else-if="!results.length" class="empty-card">
        <div class="empty-icon">
          <v-icon size="48" color="#4a3b8c">mdi-account-search-outline</v-icon>
        </div>
        <h2>No professionals found</h2>
        <p v-if="activeFilters">
          Try removing some filters or searching a different area.
        </p>
        <p v-else>
          We're growing our network. Check back soon or contact us to recommend a professional.
        </p>
        <button v-if="activeFilters" class="primary-btn" @click="resetFilters">
          Clear filters
        </button>
      </section>

      <!-- RESULTS -->
      <section v-else>
        <div class="results-head">
          <span class="results-count">
            {{ results.length }} {{ results.length === 1 ? 'professional' : 'professionals' }}
          </span>
        </div>

        <div class="results-grid">
          <div
            v-for="p in results"
            :key="p.id"
            class="pro-card"
            @click="goTo(`/professionals/${p.id}`)"
          >
            <div class="pro-avatar-wrap">
              <div class="pro-avatar" :style="{ background: avatarBg(p) }">
                {{ initials(p.display_name || p.type) }}
              </div>
              <span v-if="p.verification_status === 'verified'" class="verified-tick" aria-label="Verified">
                <v-icon x-small color="#ffffff">mdi-check</v-icon>
              </span>
            </div>

            <div class="pro-body">
              <div class="pro-name-row">
                <div class="pro-name">{{ p.display_name || 'Professional' }}</div>
              </div>

              <div class="pro-type">{{ typeLabel(p.type) }}</div>

              <div class="pro-meta">
                <span v-if="p.county" class="meta-item">
                  <v-icon x-small color="#7f8c8d" class="mr-1">mdi-map-marker-outline</v-icon>
                  {{ p.county }}
                </span>
                <span v-if="p.years_experience" class="meta-item">
                  <v-icon x-small color="#7f8c8d" class="mr-1">mdi-briefcase-outline</v-icon>
                  {{ p.years_experience }} yrs
                </span>
                <span v-if="p.online" class="meta-item online-tag">
                  <v-icon x-small color="#56c2d9" class="mr-1">mdi-video-outline</v-icon>
                  Online
                </span>
              </div>

              <div v-if="p.languages && p.languages.length" class="pro-langs">
                <span v-for="l in parseLangs(p.languages)" :key="l" class="lang-tag">{{ l }}</span>
              </div>

              <!-- Mobile: price + chevron shown below meta -->
              <div class="pro-bottom-mobile">
                <div v-if="p.price_min" class="pro-price pro-price-inline">
                  <span class="price-from">From</span>
                  <span class="price-value">KSh {{ formatPrice(p.price_min) }}</span>
                </div>
              </div>
            </div>

            <div class="pro-right">
              <div v-if="p.price_min" class="pro-price">
                <span class="price-from">From</span>
                <span class="price-value">KSh {{ formatPrice(p.price_min) }}</span>
              </div>
              <v-icon small color="#c8c0e0" class="pro-chevron">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'ProfessionalsListPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',
      scrolled: false,
      searchFocused: false,

      q: '',
      type: '',
      county: '',
      language: '',
      maxPrice: null,
      onlineOnly: false,
      inPersonOnly: false,
      showFilters: false,

      results: [],
      _searchTimer: null,

      types: [
        { value: 'speech_therapist', label: 'Speech & language therapist' },
        { value: 'occupational_therapist', label: 'Occupational therapist' },
        { value: 'physiotherapist', label: 'Physiotherapist' },
        { value: 'psychologist', label: 'Psychologist' },
        { value: 'special_needs_teacher', label: 'Special-needs teacher' },
        { value: 'learning_support', label: 'Learning support' },
        { value: 'parent_coach', label: 'Parent coach' },
        { value: 'other', label: 'Other' }
      ],

      languages: ['English', 'Kiswahili'],

      counties: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi',
        'Meru', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira',
        'Kitui', 'Garissa', 'Turkana', 'Other'
      ]
    };
  },

  computed: {
    activeFilters() {
      return !!(this.q || this.type || this.county || this.language
        || this.maxPrice || this.onlineOnly || this.inPersonOnly);
    },
    filterCount() {
      let n = 0;
      if (this.language) n++;
      if (this.maxPrice) n++;
      if (this.onlineOnly) n++;
      if (this.inPersonOnly) n++;
      return n;
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.load();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    if (this._searchTimer) clearTimeout(this._searchTimer);
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
      this.$router.push('/dashboard').catch(() => {});
    },

    goTo(path) {
      if (!path) return;
      this.$router.push(path).catch(() => {});
    },

    debouncedSearch() {
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.load(), 300);
    },

    clearSearch() {
      this.q = '';
      this.load();
    },

    resetFilters() {
      this.q = '';
      this.type = '';
      this.county = '';
      this.language = '';
      this.maxPrice = null;
      this.onlineOnly = false;
      this.inPersonOnly = false;
      this.load();
    },

    async load() {
      this.loading = true;
      this.loadError = '';

      try {
        const headers = await this.authHeader();
        const params = {};
        if (this.q) params.q = this.q;
        if (this.type) params.type = this.type;
        if (this.county) params.county = this.county;
        if (this.language) params.language = this.language;
        if (this.maxPrice) params.max_price = this.maxPrice;
        if (this.onlineOnly) params.online = 'true';

        const { data } = await axios.get(`${API}/api/professionals`, {
          headers,
          params
        });

        let list = data.data || [];

        if (this.inPersonOnly) {
          list = list.filter((p) => !p.online || p.price_min);
        }

        this.results = list;
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status >= 500) {
          this.loadError = 'Server error. Please try again in a moment.';
        } else {
          this.loadError = 'Could not load professionals. Check your connection.';
        }
        console.error('[professionals] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    initials(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },

    avatarBg(p) {
      const palette = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return palette[(p.id || 0) % palette.length];
    },

    typeLabel(t) {
      const found = this.types.find((x) => x.value === t);
      return found ? found.label : (t || 'Professional');
    },

    parseLangs(langs) {
      if (!langs) return [];
      if (Array.isArray(langs)) return langs;
      try {
        const parsed = JSON.parse(langs);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },

    formatPrice(n) {
      return Number(n).toLocaleString('en-US');
    }
  }
};
</script>

<style scoped>
/* ============ TOKENS ============ */
.professionals-page {
  --purple: #4a3b8c;
  --purple-2: #5b4b9e;
  --purple-soft: #ede7f8;
  --teal: #56c2d9;
  --teal-2: #7ec8e3;
  --pink: #e86a8a;
  --pink-2: #f48fb1;
  --ink: #1f2a37;
  --muted: #7f8c8d;
  --muted-2: #95a5a6;
  --line: #e9eaf0;
  --line-2: #f0f0f5;
  --bg: #f5f7fb;
  --bg-2: #fbfcfe;
  --white: #ffffff;
  --green: #229954;

  --radius-lg: 20px;
  --radius: 14px;
  --radius-sm: 10px;
  --shadow-1: 0 2px 6px -2px rgba(44, 62, 80, 0.06);
  --shadow-2: 0 14px 32px -20px rgba(74, 59, 140, 0.28);
  --ring: 0 0 0 3px rgba(74, 59, 140, 0.12);

  min-height: 100vh;
  background:
    radial-gradient(900px 400px at 0% -10%, #ece7fa 0%, transparent 55%),
    radial-gradient(700px 380px at 100% 0%, #e6f4f8 0%, transparent 55%),
    var(--bg);
  padding-bottom: 48px;
  color: var(--ink);
}

/* ============ TOP BAR ============ */
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 62px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
.topbar.scrolled {
  border-bottom-color: var(--line);
  box-shadow: 0 10px 30px -22px rgba(44, 62, 80, 0.35);
}
@media (min-width: 768px) { .topbar { padding: 0 24px; } }

.back-btn,
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  border: 1px solid var(--line);
  background: var(--white);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: var(--shadow-1);
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.back-btn:hover,
.icon-btn:hover:not(:disabled) { background: #f7f5ff; border-color: #d9d2ec; transform: translateY(-1px); }
.back-btn:active,
.icon-btn:active:not(:disabled) { transform: scale(0.96); }
.icon-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.topbar-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.01em;
}

/* ============ MAIN ============ */
.main {
  max-width: 980px;
  margin: 0 auto;
  padding: 22px 16px 40px;
}
@media (min-width: 768px) { .main { padding: 28px 24px 56px; } }

/* ============ SEARCH ============ */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 18px;
  background: var(--white);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  margin-bottom: 14px;
  box-shadow: var(--shadow-1);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.search-bar.focused {
  border-color: var(--purple);
  box-shadow: var(--ring);
}
.search-icon { flex: 0 0 auto; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 13px 0;
  font-size: 0.95rem;
  background: transparent;
  color: var(--ink);
  font-family: inherit;
  min-width: 0;
}
.search-input::placeholder { color: var(--muted-2); }
.search-clear {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: grid;
  place-items: center;
  border-radius: 50%;
  transition: background 0.15s ease;
}
.search-clear:hover { background: #f3f7fb; }

/* ============ FILTERS ============ */
.filters {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
@media (max-width: 640px) {
  .filters { grid-template-columns: 1fr; }
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--line);
  background: var(--white);
  color: var(--ink);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: var(--shadow-1);
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.filter-btn:hover { border-color: #d9d2ec; color: var(--purple); }
.filter-btn.active {
  border-color: var(--purple);
  color: var(--purple);
  background: #fbfaff;
}
.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff;
  font-size: 0.66rem;
  font-weight: 800;
  margin-left: 2px;
}

.select-wrap { position: relative; }
.filter-select {
  width: 100%;
  padding: 11px 34px 11px 14px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  background: var(--white);
  color: var(--ink);
  font-size: 0.84rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: var(--shadow-1);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.filter-select:hover { border-color: #d9d2ec; }
.filter-select:focus { border-color: var(--purple); box-shadow: var(--ring); }
.select-caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* ============ FILTERS PANEL ============ */
.filters-panel {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 22px;
  margin-bottom: 18px;
  box-shadow: var(--shadow-1);
}
.panel-group + .panel-group { margin-top: 20px; }

.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 10px;
}

.mt-4 { margin-top: 16px; }

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--line);
  background: var(--white);
  color: var(--ink);
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.chip .chip-check { display: none; color: #fff; }
.chip:hover { border-color: #d9d2ec; color: var(--purple); }
.chip.active {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 20px -10px rgba(74, 59, 140, 0.6);
}
.chip.active .chip-check { display: inline-flex; }

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--white);
  color: var(--ink);
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.text-input:focus { border-color: var(--purple); box-shadow: var(--ring); }

/* ============ LOADING / ERROR / EMPTY ============ */
.loading { display: flex; justify-content: center; padding: 60px 0; }

.error-card,
.empty-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 44px 26px;
  text-align: center;
  max-width: 520px;
  margin: 32px auto;
  box-shadow: var(--shadow-2);
}
.error-card { border: 1px solid #fdecea; }
.empty-card { border: 1px solid var(--line); }

.error-icon,
.empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 22px;
}
.error-icon { background: #fdecea; }
.empty-icon { background: var(--purple-soft); }

.error-card h2,
.empty-card h2 {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}
.error-card p,
.empty-card p {
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.6;
  margin: 0 0 22px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 26px;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 14px 26px -12px rgba(74, 59, 140, 0.75);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.primary-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 34px -14px rgba(74, 59, 140, 0.85); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1.5px solid var(--line);
  background: var(--white);
  color: var(--ink);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.btn-secondary:hover { border-color: var(--purple); color: var(--purple); background: #f9f8ff; }
.btn-secondary.full { width: 100%; }

/* ============ RESULTS ============ */
.results-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.results-count {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.results-grid { display: grid; gap: 12px; }

.pro-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 16px 18px;
  cursor: pointer;
  position: relative;
  box-shadow: var(--shadow-1);
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
}
.pro-card:hover {
  border-color: #d9d2ec;
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -22px rgba(74, 59, 140, 0.4);
}

.pro-avatar-wrap { position: relative; flex: 0 0 auto; }
.pro-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.3px;
  box-shadow: 0 10px 22px -10px rgba(74, 59, 140, 0.55);
}
.verified-tick {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #229954, #2ecc71);
  display: grid;
  place-items: center;
  border: 2px solid var(--white);
  box-shadow: 0 6px 12px -6px rgba(34, 153, 84, 0.7);
}

.pro-body { flex: 1; min-width: 0; }
.pro-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}
.pro-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.005em;
}
.pro-type {
  font-size: 0.8rem;
  color: var(--purple);
  font-weight: 700;
  margin-bottom: 8px;
}
.pro-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.76rem;
  color: var(--muted);
  margin-bottom: 6px;
}
.meta-item { display: inline-flex; align-items: center; }
.online-tag { color: var(--teal); font-weight: 700; }

.pro-langs { display: flex; flex-wrap: wrap; gap: 4px; }
.lang-tag {
  font-size: 0.66rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--purple-soft);
  color: var(--purple);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pro-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  flex: 0 0 auto;
}
.pro-price { display: flex; flex-direction: column; align-items: flex-end; }
.price-from {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--muted-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.price-value {
  font-size: 0.92rem;
  font-weight: 900;
  color: var(--purple);
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.pro-chevron { flex: 0 0 auto; }

.pro-bottom-mobile { display: none; }

/* ============ TRANSITIONS ============ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter, .fade-leave-to { opacity: 0; }

.panel-enter-active, .panel-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.panel-enter, .panel-leave-to { opacity: 0; transform: translateY(-6px); }

/* ============ RESPONSIVE ============ */
@media (max-width: 599px) {
  .main { padding: 16px 12px; }
  .pro-card {
    padding: 14px;
    gap: 12px;
    align-items: flex-start;
  }
  .pro-avatar { width: 48px; height: 48px; border-radius: 13px; font-size: 14px; }
  .verified-tick { width: 18px; height: 18px; }
  .pro-name { font-size: 0.92rem; }
  .pro-right { display: none; }
  .pro-bottom-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--line);
  }
  .pro-price-inline {
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
  }
}
</style>