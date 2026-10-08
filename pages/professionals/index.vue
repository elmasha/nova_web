<template>
  <div class="professionals-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Find a professional</div>
      <button class="icon-btn" @click="load" :disabled="loading" aria-label="Refresh">
        <v-icon small color="#4a3b8c">mdi-refresh</v-icon>
      </button>
    </header>

    <main class="main">
      <!-- SEARCH -->
      <div class="search-bar">
        <v-icon small color="#7f8c8d" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model.trim="q"
          type="text"
          placeholder="Search by name or specialty"
          class="search-input"
          @input="debouncedSearch"
        />
        <button v-if="q" class="search-clear" @click="clearSearch" aria-label="Clear">
          <v-icon small color="#7f8c8d">mdi-close-circle</v-icon>
        </button>
      </div>

      <!-- FILTERS -->
      <div class="filters">
        <button class="filter-btn" :class="{ active: activeFilters }" @click="showFilters = !showFilters">
          <v-icon small color="#4a3b8c" class="mr-1">mdi-filter-variant</v-icon>
          Filters
          <span v-if="filterCount" class="filter-count">{{ filterCount }}</span>
        </button>

        <select v-model="type" class="filter-select" @change="load">
          <option value="">All specialties</option>
          <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>

        <select v-model="county" class="filter-select" @change="load">
          <option value="">All counties</option>
          <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- ADVANCED FILTERS PANEL -->
      <div v-if="showFilters" class="filters-panel">
        <label class="field-label">Availability</label>
        <div class="chip-row">
          <button
            type="button"
            class="chip"
            :class="{ active: onlineOnly }"
            @click="onlineOnly = !onlineOnly; load()"
          >
            Online sessions
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: inPersonOnly }"
            @click="inPersonOnly = !inPersonOnly; load()"
          >
            In-person
          </button>
        </div>

        <label class="field-label mt-4">Language</label>
        <div class="chip-row">
          <button
            v-for="l in languages"
            :key="l"
            type="button"
            class="chip"
            :class="{ active: language === l }"
            @click="language = language === l ? '' : l; load()"
          >
            {{ l }}
          </button>
        </div>

        <label class="field-label mt-4">Max price per session (KSh)</label>
        <input
          v-model.number="maxPrice"
          type="number"
          min="0"
          step="500"
          placeholder="e.g. 3000"
          class="text-input"
          @change="load"
        />

        <button class="btn-secondary mt-4" @click="resetFilters">Reset filters</button>
      </div>

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
            <div class="pro-avatar" :style="{ background: avatarBg(p) }">
              {{ initials(p.display_name || p.type) }}
            </div>

            <div class="pro-body">
              <div class="pro-name-row">
                <div class="pro-name">{{ p.display_name || 'Professional' }}</div>
                <span v-if="p.verification_status === 'verified'" class="verified-badge">
                  <v-icon x-small color="#ffffff">mdi-check</v-icon>
                </span>
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
            </div>

            <div class="pro-right">
              <div v-if="p.price_min" class="pro-price">
                <span class="price-from">From</span>
                <span class="price-value">KSh {{ formatPrice(p.price_min) }}</span>
              </div>
              <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
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
    this.load();
  },

  beforeDestroy() {
    if (this._searchTimer) clearTimeout(this._searchTimer);
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

        // In-person filter (backend doesn't have this param, filter client-side)
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

    // Helpers
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
.professionals-page {
  min-height: 100vh;
  background: #f3f7fb;
  padding-bottom: 48px;
}

/* TOP BAR */
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: #ffffff;
  border-bottom: 1px solid #ececf1;
  height: 60px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
@media (min-width: 768px) {
  .topbar { padding: 0 24px; }
}
.back-btn,
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f3f7fb;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s ease;
}
.back-btn:hover,
.icon-btn:hover { background: #e6eef5; }
.topbar-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.01em;
}

/* MAIN */
.main {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 16px;
}
@media (min-width: 768px) {
  .main { padding: 24px 24px; }
}

/* SEARCH BAR */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 16px;
  background: #ffffff;
  border: 1.5px solid #ececf1;
  border-radius: 14px;
  margin-bottom: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.search-bar:focus-within {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.08);
}
.search-icon { flex: 0 0 auto; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 0.95rem;
  background: transparent;
  color: #2c3e50;
  font-family: inherit;
  min-width: 0;
}
.search-input::placeholder { color: #95a5a6; }
.search-clear {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

/* FILTERS */
.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.filter-btn.active,
.filter-btn:hover {
  border-color: #4a3b8c;
  color: #4a3b8c;
}
.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #4a3b8c;
  color: #ffffff;
  font-size: 0.66rem;
  font-weight: 800;
  margin-left: 2px;
}
.filter-select {
  flex: 1;
  min-width: 130px;
  padding: 10px 14px;
  border: 1.5px solid #e0e4eb;
  border-radius: 10px;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.83rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  padding-right: 30px;
}
.filter-select:focus { border-color: #4a3b8c; }

/* FILTERS PANEL */
.filters-panel {
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}
.mt-4 { margin-top: 16px; }

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 9px 16px;
  border-radius: 999px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.chip:hover { border-color: #4a3b8c; color: #4a3b8c; }
.chip.active {
  background: #4a3b8c;
  color: #ffffff;
  border-color: #4a3b8c;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e0e4eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #ffffff;
  color: #2c3e50;
  outline: none;
  font-family: inherit;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}

/* LOADING / ERROR / EMPTY */
.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.error-card,
.empty-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  max-width: 520px;
  margin: 24px auto;
}
.error-card { border: 1px solid #fdecea; }
.empty-card { border: 1px solid #ececf1; }
.error-icon,
.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
}
.error-icon { background: #fdecea; }
.empty-icon { background: #e6e0f5; }
.error-card h2,
.empty-card h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 10px;
}
.error-card p,
.empty-card p {
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 20px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  transition: transform 0.15s ease;
  font-family: inherit;
}
.primary-btn:hover { transform: translateY(-1px); }

.btn-secondary {
  padding: 11px 18px;
  border-radius: 12px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-secondary:hover { border-color: #c8c0e0; background: #f7f8fb; }

/* RESULTS */
.results-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.results-count {
  font-size: 0.82rem;
  font-weight: 700;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.results-grid {
  display: grid;
  gap: 12px;
}

.pro-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pro-card:hover {
  border-color: #c8c0e0;
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25);
}
.pro-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 16px;
  flex: 0 0 auto;
  letter-spacing: 0.3px;
}
.pro-body { flex: 1; min-width: 0; }
.pro-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}
.pro-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.verified-badge {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #229954;
  flex: 0 0 auto;
}
.pro-type {
  font-size: 0.8rem;
  color: #4a3b8c;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: capitalize;
}
.pro-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.76rem;
  color: #7f8c8d;
  margin-bottom: 6px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
}
.online-tag { color: #56c2d9; font-weight: 700; }

.pro-langs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.lang-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f3f7fb;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.pro-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
}
.pro-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.price-from {
  font-size: 0.66rem;
  font-weight: 700;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.price-value {
  font-size: 0.88rem;
  font-weight: 800;
  color: #4a3b8c;
  letter-spacing: -0.01em;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .main { padding: 16px 12px; }
  .filters { flex-direction: column; }
  .filter-select { width: 100%; }
  .filter-btn { width: 100%; justify-content: center; }
  .pro-card { padding: 14px; gap: 10px; }
  .pro-avatar { width: 48px; height: 48px; border-radius: 13px; font-size: 14px; }
  .pro-name { font-size: 0.9rem; }
  .pro-price { display: none; }
}
</style>