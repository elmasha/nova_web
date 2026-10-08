<template>
  <div class="child-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Child profile</div>
      <button class="icon-btn" @click="load" :disabled="loading" aria-label="Refresh">
        <v-icon small color="#4a3b8c">mdi-refresh</v-icon>
      </button>
    </header>

    <main class="main">
      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="28" width="3" />
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Could not load child</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">Try again</button>
        <button class="link-btn mt-3" @click="goBack">Back to dashboard</button>
      </section>

      <template v-else-if="child">
        <!-- IDENTITY CARD -->
        <section class="identity-card">
          <div class="avatar-lg" :style="{ background: avatarBg }">
            {{ initials }}
          </div>
          <div class="identity-body">
            <div class="identity-name">{{ child.full_name }}</div>
            <div class="identity-meta">
              {{ age(child.dob) }}
              <span v-if="child.gender"> · {{ genderLabel(child.gender) }}</span>
              <span v-if="child.county"> · {{ child.county }}</span>
            </div>
            <div class="identity-tags">
              <span v-if="child.school_name" class="tag tag-blue">
                <v-icon x-small color="#56c2d9" class="mr-1">mdi-school</v-icon>
                {{ child.school_name }}
              </span>
              <span v-if="child.diagnosis_optional" class="tag tag-pink">
                {{ child.diagnosis_optional }}
              </span>
            </div>
          </div>
        </section>

        <!-- QUICK ACTIONS -->
        <section class="quick-actions">
          <button class="quick-action" @click="startAssessment">
            <div class="qa-icon" style="background:#e6e0f5">
              <v-icon small color="#4a3b8c">mdi-clipboard-text-outline</v-icon>
            </div>
            <span>Start assessment</span>
          </button>
          <button class="quick-action" @click="goTo('/professionals')">
            <div class="qa-icon" style="background:#d9f0f6">
              <v-icon small color="#56c2d9">mdi-account-search-outline</v-icon>
            </div>
            <span>Find professional</span>
          </button>
          <button class="quick-action" @click="goTo('/dashboard/parent?tab=bookings')">
            <div class="qa-icon" style="background:#fce4ec">
              <v-icon small color="#e86a8a">mdi-calendar-month-outline</v-icon>
            </div>
            <span>Bookings</span>
          </button>
        </section>

        <!-- NOTES -->
        <section v-if="child.notes" class="card">
          <h2 class="card-title">Notes</h2>
          <p class="note-text">{{ child.notes }}</p>
        </section>

        <!-- ASSESSMENT REQUESTS -->
        <section class="card" v-if="requests.length">
          <h2 class="card-title">Assessment requests</h2>
          <div class="requests-list">
            <div v-for="r in requests" :key="r.id" class="request-row">
              <div class="request-icon">
                <v-icon small color="#4a3b8c">mdi-file-document-outline</v-icon>
              </div>
              <div class="request-body">
                <div class="request-title">Assessment request</div>
                <div class="request-sub">Submitted {{ relativeTime(r.created_at) }}</div>
              </div>
              <span class="status-pill" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
            </div>
          </div>
        </section>

        <!-- UPCOMING BOOKINGS -->
        <section class="card">
          <h2 class="card-title">Upcoming sessions</h2>
          <div v-if="!upcomingBookings.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-calendar-blank-outline</v-icon>
            <span>No upcoming sessions yet.</span>
          </div>
          <div v-else class="bookings-list">
            <div
              v-for="b in upcomingBookings"
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
              <span class="status-pill" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
            </div>
          </div>
        </section>

        <!-- EDIT -->
        <section class="card">
          <h2 class="card-title">Edit details</h2>

          <label class="field-label">Full name</label>
          <input
            v-model.trim="form.full_name"
            type="text"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">Date of birth</label>
          <input
            v-model="form.dob"
            type="date"
            class="text-input"
            :disabled="saving"
            :max="todayISO"
          />

          <label class="field-label mt-4">Gender</label>
          <div class="chip-row">
            <button
              v-for="g in genders"
              :key="g.value"
              type="button"
              class="chip"
              :class="{ active: form.gender === g.value }"
              :disabled="saving"
              @click="form.gender = g.value"
            >
              {{ g.label }}
            </button>
          </div>

          <label class="field-label mt-4">County</label>
          <select v-model="form.county" class="text-input" :disabled="saving">
            <option value="">Select a county</option>
            <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
          </select>

          <label class="field-label mt-4">Area (optional)</label>
          <input
            v-model.trim="form.area"
            type="text"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">School (optional)</label>
          <input
            v-model.trim="form.school_name"
            type="text"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">Existing diagnosis (optional)</label>
          <input
            v-model.trim="form.diagnosis_optional"
            type="text"
            placeholder="e.g. Autism, Down syndrome"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">Notes (optional)</label>
          <textarea
            v-model.trim="form.notes"
            rows="4"
            class="text-input textarea"
            :disabled="saving"
          ></textarea>

          <div v-if="saveError" class="error-box">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ saveError }}</span>
          </div>

          <div v-if="saveSuccess" class="success-box">
            <v-icon small color="#229954" class="mr-1">mdi-check-circle-outline</v-icon>
            <span>{{ saveSuccess }}</span>
          </div>

          <button class="primary-btn mt-4" :disabled="!canSave || saving" @click="save">
            <span v-if="!saving">
              Save changes
              <v-icon small color="white" class="ml-2">mdi-check</v-icon>
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="18" width="2" color="white" />
              <span class="ml-2">Saving…</span>
            </span>
          </button>
        </section>

        <!-- DANGER -->
        <section class="card danger-card">
          <h2 class="card-title danger-title">Danger zone</h2>
          <button class="row-btn danger-row" @click="confirmArchive">
            <div class="row-icon" style="background: #fdecea">
              <v-icon small color="#e74c3c">mdi-archive-outline</v-icon>
            </div>
            <div class="row-body">
              <div class="row-title">Archive this child</div>
              <div class="row-sub">Hides from dashboard. Data is kept.</div>
            </div>
            <v-icon small color="#95a5a6">mdi-chevron-right</v-icon>
          </button>
        </section>
      </template>
    </main>

    <!-- ARCHIVE CONFIRM -->
    <div v-if="showArchiveConfirm" class="modal-backdrop" @click.self="showArchiveConfirm = false">
      <div class="modal">
        <h3 class="modal-title">Archive {{ child?.full_name }}?</h3>
        <p class="modal-text">
          The child will be hidden from your dashboard. You can restore later by contacting support.
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showArchiveConfirm = false">Cancel</button>
          <button class="btn-danger" :disabled="saving" @click="archiveChild">
            Archive
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'ChildDetailPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      saving: false,
      loadError: '',
      saveError: '',
      saveSuccess: '',

      child: null,
      bookings: [],
      requests: [],

      form: {
        full_name: '',
        dob: '',
        gender: '',
        county: '',
        area: '',
        school_name: '',
        notes: '',
        diagnosis_optional: ''
      },

      genders: [
        { value: 'male', label: 'Boy' },
        { value: 'female', label: 'Girl' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],

      showArchiveConfirm: false,

      counties: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi',
        'Meru', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira',
        'Kitui', 'Garissa', 'Turkana', 'Other'
      ]
    };
  },

  computed: {
    childId() {
      return this.$route.params.id;
    },
    initials() {
      const n = (this.child?.full_name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg() {
      const palette = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return palette[(Number(this.childId) || 0) % palette.length];
    },
    todayISO() {
      return new Date().toISOString().split('T')[0];
    },
    upcomingBookings() {
      const now = Date.now();
      return this.bookings
        .filter((b) => {
          const t = new Date(b.scheduled_at).getTime();
          return t >= now && (b.status === 'pending' || b.status === 'confirmed');
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 5);
    },
    canSave() {
      if (!this.child) return false;
      const fields = ['full_name', 'dob', 'gender', 'county', 'area', 'school_name', 'notes', 'diagnosis_optional'];
      return fields.some((f) => (this.form[f] || '') !== (this.child[f] || ''))
        && this.form.full_name.trim().length >= 2;
    }
  },

  mounted() {
    this.load();
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
      this.$router.push('/dashboard/parent?tab=children').catch(() => {});
    },

    goTo(path) {
      if (!path) return;
      this.$router.push(path).catch(() => {});
    },

    async load() {
      this.loading = true;
      this.loadError = '';

      try {
        const headers = await this.authHeader();
        if (!headers.Authorization) {
          this.loadError = 'You are not signed in.';
          this.loading = false;
          return;
        }

        const [childRes, bookingsRes, requestsRes] = await Promise.all([
          axios.get(`${API}/api/children/${this.childId}`, { headers }),
          axios.get(`${API}/api/bookings/mine`, { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get(`${API}/api/assessments/requests/mine`, { headers })
            .catch(() => ({ data: { data: [] } }))
        ]);

        this.child = childRes.data?.data || null;

        const allBookings = bookingsRes.data?.data || [];
        const allRequests = requestsRes.data?.data || [];
        this.bookings = allBookings.filter((b) => String(b.child_id) === String(this.childId));
        this.requests = allRequests.filter((r) => String(r.child_id) === String(this.childId));

        if (this.child) {
          this.form.full_name = this.child.full_name || '';
          this.form.dob = this.child.dob ? String(this.child.dob).split('T')[0] : '';
          this.form.gender = this.child.gender || '';
          this.form.county = this.child.county || '';
          this.form.area = this.child.area || '';
          this.form.school_name = this.child.school_name || '';
          this.form.notes = this.child.notes || '';
          this.form.diagnosis_optional = this.child.diagnosis_optional || '';
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          this.loadError = 'This child could not be found.';
        } else if (status === 403) {
          this.loadError = 'You don\'t have access to this child\'s profile.';
        } else if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else {
          this.loadError = 'Could not load this child. Please try again.';
        }
        console.error('[child] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    async save() {
      if (!this.canSave || this.saving) return;
      this.saveError = '';
      this.saveSuccess = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();
        const payload = {
          full_name: this.form.full_name,
          dob: this.form.dob || null,
          gender: this.form.gender || null,
          county: this.form.county || null,
          area: this.form.area || null,
          school_name: this.form.school_name || null,
          notes: this.form.notes || null,
          diagnosis_optional: this.form.diagnosis_optional || null
        };

        const { data } = await axios.patch(
          `${API}/api/children/${this.childId}`,
          payload,
          { headers }
        );

        this.child = data.data || this.child;
        this.saveSuccess = 'Changes saved.';
        setTimeout(() => { this.saveSuccess = ''; }, 3000);
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;
        this.saveError = status === 400
          ? `Check the form: ${body?.details?.[0]?.message || body?.error}`
          : body?.message || 'Could not save. Please try again.';
        console.error('[child] save failed', status, body);
      } finally {
        this.saving = false;
      }
    },

    confirmArchive() {
      this.showArchiveConfirm = true;
    },

    async archiveChild() {
      this.saving = true;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/children/${this.childId}`, { headers });
        this.$router.push('/dashboard/parent?tab=children').catch(() => {});
      } catch (err) {
        this.saveError = 'Could not archive. Please try again.';
        this.showArchiveConfirm = false;
      } finally {
        this.saving = false;
      }
    },

    startAssessment() {
      this.$router.push({
        path: '/assessments/new',
        query: { child: this.childId }
      }).catch(() => {});
    },

    // Helpers
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
      const map = {
        male: 'Boy',
        female: 'Girl',
        other: 'Other',
        prefer_not_to_say: ''
      };
      return map[g] || '';
    },
    dayOf(dt) { return new Date(dt).getDate(); },
    monthOf(dt) {
      return new Date(dt).toLocaleString('en-US', { month: 'short' }).toUpperCase();
    },
    timeOf(dt) {
      return new Date(dt).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
      });
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
      const m = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
        no_show: 'No-show',
        submitted: 'Submitted',
        routing: 'Routing',
        assigned: 'Assigned',
        in_progress: 'In progress'
      };
      return m[s] || s || 'Unknown';
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
    }
  }
};
</script>

<style scoped>
.child-page {
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
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
}
@media (min-width: 768px) {
  .main { padding: 32px 24px; }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

/* ERROR CARD */
.error-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  border: 1px solid #fdecea;
  max-width: 520px;
  margin: 24px auto;
}
.error-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #fdecea;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
}
.error-card h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 10px;
}
.error-card p {
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 24px;
}
.error-card .link-btn {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.85rem;
}

/* IDENTITY CARD */
.identity-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
}
.avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.5px;
  flex: 0 0 auto;
}
.identity-body { min-width: 0; flex: 1; }
.identity-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 4px;
}
.identity-meta {
  font-size: 0.82rem;
  color: #7f8c8d;
  margin-bottom: 10px;
}
.identity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.2px;
}
.tag-blue { background: #d9f0f6; color: #0288a5; }
.tag-pink { background: #fce4ec; color: #c2185b; }

/* QUICK ACTIONS */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px;
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.quick-action:hover {
  transform: translateY(-2px);
  border-color: #c8c0e0;
  box-shadow: 0 10px 20px -10px rgba(74, 59, 140, 0.2);
}
.qa-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}
.quick-action span {
  font-size: 0.76rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  line-height: 1.3;
}

/* CARDS */
.card {
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 16px;
  letter-spacing: -0.01em;
}
.danger-card { border-color: #fdecea; }
.danger-title { color: #c0392b; }

.note-text {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.65;
  margin: 0;
  white-space: pre-wrap;
}

/* FORM */
.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 20px; }

.text-input {
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid #e0e4eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #ffffff;
  color: #2c3e50;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.textarea { resize: vertical; min-height: 100px; line-height: 1.55; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

/* CHIPS (gender selector) */
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  min-height: 40px;
}
.chip:hover:not(:disabled) { border-color: #4a3b8c; color: #4a3b8c; }
.chip.active {
  background: #4a3b8c;
  color: #ffffff;
  border-color: #4a3b8c;
}
.chip:disabled { opacity: 0.6; cursor: not-allowed; }

/* ROW BUTTONS */
.row-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 4px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  border-radius: 10px;
  transition: background 0.15s ease;
}
.row-btn:hover { background: #f7f8fb; }
.row-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.row-body { flex: 1; min-width: 0; }
.row-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2px;
}
.row-sub { font-size: 0.76rem; color: #7f8c8d; }
.danger-row .row-title { color: #c0392b; }

/* LISTS */
.mini-empty {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f3f7fb;
  border: 1px dashed #d4dae4;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #7f8c8d;
}
.bookings-list,
.requests-list {
  display: grid;
  gap: 10px;
}
.booking-row,
.request-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f9fafc;
  border-radius: 12px;
  padding: 12px;
}
.booking-row {
  cursor: pointer;
  transition: all 0.15s ease;
}
.booking-row:hover {
  background: #f3f0fc;
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -14px rgba(74, 59, 140, 0.25);
}
.booking-date {
  flex: 0 0 48px;
  text-align: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 6px 4px;
}
.booking-day {
  font-size: 1.05rem;
  font-weight: 900;
  color: #4a3b8c;
  line-height: 1;
  letter-spacing: -0.02em;
}
.booking-month {
  font-size: 0.6rem;
  font-weight: 800;
  color: #7f8c8d;
  letter-spacing: 1px;
  margin-top: 3px;
}
.booking-info,
.request-body { flex: 1; min-width: 0; }
.booking-title,
.request-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2px;
}
.booking-sub,
.request-sub {
  font-size: 0.76rem;
  color: #7f8c8d;
  text-transform: capitalize;
}
.request-icon {
  flex: 0 0 38px;
  height: 38px;
  border-radius: 10px;
  background: #e6e0f5;
  display: grid;
  place-items: center;
}

/* STATUS PILLS */
.status-pill {
  font-size: 0.66rem;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

/* BUTTONS */
.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px 22px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  font-family: inherit;
  min-height: 50px;
}
.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(74, 59, 140, 0.34);
}
.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 10px rgba(74, 59, 140, 0.18);
}
.btn-secondary {
  padding: 12px 20px;
  border-radius: 12px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-danger {
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: #e74c3c;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.loading-row { display: inline-flex; align-items: center; gap: 8px; }
.link-btn {
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #4a3b8c;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }

/* MESSAGES */
.error-box,
.success-box {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.83rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  line-height: 1.45;
}
.error-box { background: #fdecea; color: #c0392b; }
.success-box { background: #e6f9ee; color: #229954; }

/* MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 13, 36, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
.modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 8px;
}
.modal-text {
  font-size: 0.88rem;
  color: #7f8c8d;
  margin: 0 0 20px;
  line-height: 1.55;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .identity-card { padding: 16px; }
  .avatar-lg { width: 60px; height: 60px; border-radius: 16px; font-size: 18px; }
  .identity-name { font-size: 1rem; }
  .card { padding: 16px; }
  .quick-action span { font-size: 0.7rem; }
}
</style>