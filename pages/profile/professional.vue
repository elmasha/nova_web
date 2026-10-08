<template>
  <div class="pro-profile">
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">My profile</div>
      <div class="topbar-spacer" />
    </header>

    <main class="main">
      <!-- TABS -->
      <div class="tabs">
        <button
          v-for="t in tabs"
          :key="t.value"
          class="tab"
          :class="{ active: tab === t.value }"
          @click="tab = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-if="loading" class="loading">
        <v-progress-circular indeterminate color="#4a3b8c" size="28" width="3" />
      </div>

      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="42" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Could not load profile</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">Try again</button>
      </section>

      <template v-else>
        <!-- ============ PROFILE TAB ============ -->
        <section v-if="tab === 'profile'" class="card">
          <h2 class="card-title">Professional details</h2>

          <label class="field-label">Professional type</label>
          <select v-model="form.type" class="text-input" :disabled="saving">
            <option value="">Select one</option>
            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>

          <label class="field-label mt-4">Years of experience</label>
          <input
            v-model.number="form.years_experience"
            type="number"
            min="0"
            max="60"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">Languages</label>
          <div class="chip-row">
            <button
              v-for="l in allLanguages"
              :key="l"
              type="button"
              class="chip"
              :class="{ active: form.languages.includes(l) }"
              :disabled="saving"
              @click="toggleLanguage(l)"
            >
              <v-icon v-if="form.languages.includes(l)" x-small color="white" class="mr-1">mdi-check</v-icon>
              {{ l }}
            </button>
          </div>

          <label class="field-label mt-4">Bio</label>
          <textarea
            v-model.trim="form.bio"
            rows="5"
            class="text-input textarea"
            :disabled="saving"
            placeholder="Tell families about your approach and background."
          ></textarea>
          <p class="hint">{{ form.bio.length }}/1000</p>

          <label class="field-label mt-4">County</label>
          <select v-model="form.county" class="text-input" :disabled="saving">
            <option value="">Select a county</option>
            <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
          </select>

          <label class="field-label mt-4">Area (optional)</label>
          <input v-model.trim="form.area" type="text" class="text-input" :disabled="saving" />

          <label class="field-label mt-4">Session type</label>
          <div class="chip-row">
            <button
              type="button"
              class="chip"
              :class="{ active: form.online === true }"
              :disabled="saving"
              @click="form.online = true"
            >
              <v-icon x-small class="mr-1">mdi-video-outline</v-icon>
              In person & online
            </button>
            <button
              type="button"
              class="chip"
              :class="{ active: form.online === false }"
              :disabled="saving"
              @click="form.online = false"
            >
              <v-icon x-small class="mr-1">mdi-map-marker-outline</v-icon>
              In person only
            </button>
          </div>

          <label class="field-label mt-4">Typical session price (KSh)</label>
          <div class="budget-row">
            <input v-model.number="form.price_min" type="number" min="0" step="100" placeholder="Min" class="text-input" :disabled="saving" />
            <span class="budget-sep">–</span>
            <input v-model.number="form.price_max" type="number" min="0" step="100" placeholder="Max" class="text-input" :disabled="saving" />
          </div>

          <div v-if="saveError" class="error-box">{{ saveError }}</div>
          <div v-if="saveSuccess" class="success-box">{{ saveSuccess }}</div>

          <button class="primary-btn mt-4" :disabled="!canSave || saving" @click="saveProfile">
            <span v-if="!saving">
              Save profile
              <v-icon small color="white" class="ml-2">mdi-check</v-icon>
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="18" width="2" color="white" />
              <span class="ml-2">Saving…</span>
            </span>
          </button>
        </section>

        <!-- ============ SERVICES TAB ============ -->
        <section v-if="tab === 'services'" class="card">
          <div class="card-head">
            <h2 class="card-title">Services</h2>
            <button class="link-btn" @click="openServiceModal()">
              <v-icon x-small class="mr-1">mdi-plus</v-icon>
              Add service
            </button>
          </div>

          <div v-if="!services.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-tag-outline</v-icon>
            <span>No services yet. Add one so families can book you.</span>
          </div>

          <div v-else class="service-list">
            <div v-for="s in services" :key="s.id" class="service-row">
              <div class="service-body">
                <div class="service-name">{{ s.type }}</div>
                <div v-if="s.description" class="service-desc">{{ s.description }}</div>
                <div class="service-meta">{{ s.duration_minutes }} min · KSh {{ formatPrice(s.price) }}</div>
              </div>
              <div class="service-actions">
                <button class="icon-sm" @click="openServiceModal(s)" aria-label="Edit">
                  <v-icon x-small color="#4a3b8c">mdi-pencil</v-icon>
                </button>
                <button class="icon-sm danger" @click="confirmDeleteService(s)" aria-label="Delete">
                  <v-icon x-small color="#e74c3c">mdi-delete-outline</v-icon>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ============ AVAILABILITY TAB ============ -->
        <section v-if="tab === 'availability'" class="card">
          <div class="card-head">
            <h2 class="card-title">Weekly availability</h2>
            <button class="link-btn" @click="openAvailModal()">
              <v-icon x-small class="mr-1">mdi-plus</v-icon>
              Add slot
            </button>
          </div>

          <div v-if="!availability.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-calendar-blank-outline</v-icon>
            <span>No availability set. Add slots so parents can book you.</span>
          </div>

          <div v-else class="avail-list">
            <div v-for="a in availability" :key="a.id" class="avail-row">
              <div class="avail-day">{{ dayName(a.day_of_week) }}</div>
              <div class="avail-time">{{ shortTimeStr(a.start_time) }} – {{ shortTimeStr(a.end_time) }}</div>
              <div class="avail-loc">{{ a.location_type === 'online' ? 'Online' : a.location_type === 'both' ? 'Both' : 'In person' }}</div>
              <button class="icon-sm danger" @click="confirmDeleteAvail(a)" aria-label="Delete">
                <v-icon x-small color="#e74c3c">mdi-close</v-icon>
              </button>
            </div>
          </div>
        </section>
      </template>
    </main>

    <!-- SERVICE MODAL -->
    <div v-if="serviceModal.open" class="modal-backdrop" @click.self="closeServiceModal">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">{{ serviceModal.editing ? 'Edit service' : 'Add service' }}</div>
          <button class="modal-close" @click="closeServiceModal">
            <v-icon small color="#7f8c8d">mdi-close</v-icon>
          </button>
        </div>

        <div class="modal-body">
          <label class="field-label">Service name</label>
          <input v-model.trim="serviceModal.type" type="text" placeholder="e.g. Speech therapy session" class="text-input" />

          <label class="field-label mt-4">Description (optional)</label>
          <textarea v-model.trim="serviceModal.description" rows="2" class="text-input textarea"></textarea>

          <label class="field-label mt-4">Price (KSh)</label>
          <input v-model.number="serviceModal.price" type="number" min="0" step="100" class="text-input" />

          <label class="field-label mt-4">Duration (minutes)</label>
          <input v-model.number="serviceModal.duration_minutes" type="number" min="15" step="15" class="text-input" />

          <div v-if="serviceModal.error" class="error-box">{{ serviceModal.error }}</div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closeServiceModal">Cancel</button>
          <button class="btn-primary" :disabled="serviceModal.saving || !serviceModal.type || !serviceModal.price" @click="saveService">
            {{ serviceModal.saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- AVAILABILITY MODAL -->
    <div v-if="availModal.open" class="modal-backdrop" @click.self="closeAvailModal">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">Add availability</div>
          <button class="modal-close" @click="closeAvailModal">
            <v-icon small color="#7f8c8d">mdi-close</v-icon>
          </button>
        </div>

        <div class="modal-body">
          <label class="field-label">Day of week</label>
          <select v-model.number="availModal.day_of_week" class="text-input">
            <option v-for="d in days" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>

          <label class="field-label mt-4">Start time</label>
          <input v-model="availModal.start_time" type="time" class="text-input" />

          <label class="field-label mt-4">End time</label>
          <input v-model="availModal.end_time" type="time" class="text-input" />

          <label class="field-label mt-4">Location</label>
          <select v-model="availModal.location_type" class="text-input">
            <option value="in_person">In person</option>
            <option value="online">Online</option>
            <option value="both">Both</option>
          </select>

          <div v-if="availModal.error" class="error-box">{{ availModal.error }}</div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closeAvailModal">Cancel</button>
          <button class="btn-primary" :disabled="availModal.saving" @click="saveAvail">
            {{ availModal.saving ? 'Saving…' : 'Save' }}
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
  name: 'ProfessionalProfilePage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      saving: false,
      loadError: '',
      saveError: '',
      saveSuccess: '',

      tab: 'profile',
      tabs: [
        { value: 'profile', label: 'Profile' },
        { value: 'services', label: 'Services' },
        { value: 'availability', label: 'Availability' }
      ],

      pro: null,
      services: [],
      availability: [],

      form: {
        type: '',
        bio: '',
        languages: [],
        county: '',
        area: '',
        online: true,
        years_experience: null,
        price_min: null,
        price_max: null
      },

      serviceModal: {
        open: false, saving: false, error: '',
        editing: null,
        type: '', description: '', price: null, duration_minutes: 60
      },

      availModal: {
        open: false, saving: false, error: '',
        day_of_week: 1, start_time: '09:00', end_time: '17:00', location_type: 'in_person'
      },

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

      allLanguages: ['English', 'Kiswahili'],

      counties: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi',
        'Meru', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira',
        'Kitui', 'Garissa', 'Turkana', 'Other'
      ],

      days: [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
      ]
    };
  },

  computed: {
    canSave() {
      if (!this.pro) return false;
      const f = this.form;
      return !!f.type && !!f.county && f.bio.trim().length >= 30;
    }
  },

  mounted() {
    const qTab = this.$route.query.tab;
    if (['profile', 'services', 'availability'].includes(qTab)) {
      this.tab = qTab;
    }
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
      this.$router.push('/dashboard/professional').catch(() => {});
    },

    async load() {
      this.loading = true;
      this.loadError = '';
      try {
        const headers = await this.authHeader();
        const [proRes, servRes, availRes] = await Promise.all([
          axios.get(`${API}/api/professionals/me/profile`, { headers }),
          axios.get(`${API}/api/services`, { headers }).catch(() => ({ data: { data: [] } })),
          axios.get(`${API}/api/availability`, { headers }).catch(() => ({ data: { data: [] } }))
        ]);

        this.pro = proRes.data?.data || null;
        this.services = servRes.data?.data || [];
        this.availability = availRes.data?.data || [];

        if (this.pro) {
          this.form.type = this.pro.type || '';
          this.form.bio = this.pro.bio || '';
          this.form.county = this.pro.county || '';
          this.form.area = this.pro.area || '';
          this.form.online = !!this.pro.online;
          this.form.years_experience = this.pro.years_experience || null;
          this.form.price_min = this.pro.price_min || null;
          this.form.price_max = this.pro.price_max || null;
          this.form.languages = this.parseLangs(this.pro.languages);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          this.loadError = 'You don\u2019t have a professional profile yet.';
        } else if (status === 403) {
          this.loadError = 'You don\u2019t have professional access.';
        } else {
          this.loadError = 'Could not load your profile. Try again.';
        }
        console.error('[pro profile]', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    parseLangs(l) {
      if (!l) return [];
      if (Array.isArray(l)) return l;
      try {
        const parsed = JSON.parse(l);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { return []; }
    },

    toggleLanguage(l) {
      const i = this.form.languages.indexOf(l);
      if (i >= 0) this.form.languages.splice(i, 1);
      else this.form.languages.push(l);
    },

    async saveProfile() {
      if (!this.canSave || this.saving) return;
      this.saveError = '';
      this.saveSuccess = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();
        const payload = {
          type: this.form.type,
          bio: this.form.bio || null,
          languages: this.form.languages,
          county: this.form.county || null,
          area: this.form.area || null,
          online: !!this.form.online,
          years_experience: this.form.years_experience || null,
          price_min: this.form.price_min || null,
          price_max: this.form.price_max || null
        };
        const { data } = await axios.post(`${API}/api/professionals/me`, payload, { headers });
        this.pro = { ...this.pro, ...payload, id: data.id || this.pro?.id };
        this.saveSuccess = 'Profile updated.';
        setTimeout(() => { this.saveSuccess = ''; }, 3000);
      } catch (err) {
        this.saveError = err.response?.data?.message || err.response?.data?.error || 'Could not save.';
      } finally {
        this.saving = false;
      }
    },

    openServiceModal(s = null) {
      this.serviceModal = {
        open: true, saving: false, error: '',
        editing: s,
        type: s?.type || '',
        description: s?.description || '',
        price: s?.price ? Number(s.price) : null,
        duration_minutes: s?.duration_minutes || 60
      };
    },

    closeServiceModal() {
      this.serviceModal.open = false;
    },

    async saveService() {
      const m = this.serviceModal;
      if (!m.type || !m.price) return;
      m.saving = true;
      m.error = '';
      try {
        const headers = await this.authHeader();
        const payload = {
          type: m.type,
          description: m.description || null,
          price: m.price,
          duration_minutes: m.duration_minutes || 60
        };
        if (m.editing) {
          await axios.patch(`${API}/api/services/${m.editing.id}`, payload, { headers });
        } else {
          await axios.post(`${API}/api/services`, payload, { headers });
        }
        this.closeServiceModal();
        this.load();
      } catch (err) {
        m.error = err.response?.data?.error || 'Could not save service.';
      } finally {
        m.saving = false;
      }
    },

    async confirmDeleteService(s) {
      if (!confirm(`Delete "${s.type}"?`)) return;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/services/${s.id}`, { headers });
        this.load();
      } catch (err) {
        alert('Could not delete.');
      }
    },

    openAvailModal() {
      this.availModal = {
        open: true, saving: false, error: '',
        day_of_week: 1, start_time: '09:00', end_time: '17:00', location_type: 'in_person'
      };
    },

    closeAvailModal() {
      this.availModal.open = false;
    },

    async saveAvail() {
      const m = this.availModal;
      m.saving = true;
      m.error = '';
      try {
        const headers = await this.authHeader();
        await axios.post(
          `${API}/api/availability`,
          {
            day_of_week: m.day_of_week,
            start_time: m.start_time,
            end_time: m.end_time,
            location_type: m.location_type
          },
          { headers }
        );
        this.closeAvailModal();
        this.load();
      } catch (err) {
        m.error = err.response?.data?.error || 'Could not save.';
      } finally {
        m.saving = false;
      }
    },

    async confirmDeleteAvail(a) {
      if (!confirm('Remove this availability slot?')) return;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/availability/${a.id}`, { headers });
        this.load();
      } catch (err) {
        alert('Could not remove.');
      }
    },

    dayName(d) {
      const found = this.days.find((x) => x.value === Number(d));
      return found ? found.label : '';
    },

    shortTimeStr(t) {
      if (!t) return '';
      const parts = String(t).split(':');
      const h = Number(parts[0]);
      const m = parts[1] || '00';
      const ampm = h < 12 ? 'AM' : 'PM';
      const hh = h % 12 || 12;
      return `${hh}:${m} ${ampm}`;
    },

    formatPrice(n) {
      return Number(n).toLocaleString('en-US');
    }
  }
};
</script>

<style scoped>
.pro-profile { min-height: 100vh; background: #f3f7fb; padding-bottom: 48px; }

.topbar {
  position: sticky; top: 0; z-index: 40;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  height: 60px; padding: 0 12px;
  display: flex; align-items: center; justify-content: space-between;
}
@media (min-width: 768px) { .topbar { padding: 0 24px; } }
.back-btn {
  width: 38px; height: 38px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
}
.back-btn:hover { background: #e6eef5; }
.topbar-title { font-size: 0.98rem; font-weight: 800; color: #2c3e50; }
.topbar-spacer { width: 38px; }

.main { max-width: 640px; margin: 0 auto; padding: 20px 16px; }
@media (min-width: 768px) { .main { padding: 28px 24px; } }

.tabs {
  display: flex; gap: 4px; background: #ffffff;
  border: 1px solid #ececf1; border-radius: 12px;
  padding: 4px; margin-bottom: 16px;
}
.tab {
  flex: 1; padding: 10px; border: none; background: transparent;
  border-radius: 8px; font-size: 0.85rem; font-weight: 700;
  color: #7f8c8d; cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.tab.active {
  background: #4a3b8c; color: #ffffff;
  box-shadow: 0 4px 10px rgba(74, 59, 140, 0.22);
}

.loading { display: flex; justify-content: center; padding: 60px 0; }

.error-card {
  background: #ffffff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon {
  width: 84px; height: 84px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 20px;
}
.error-card h2 { font-size: 1.15rem; font-weight: 800; color: #2c3e50; margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 20px; }

.card {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 18px; padding: 20px;
}
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: #2c3e50;
  margin: 0 0 16px; letter-spacing: -0.01em;
}
.card-head .card-title { margin: 0; }

.field-label { display: block; font-size: 0.82rem; font-weight: 700; color: #2c3e50; margin-bottom: 8px; }
.mt-4 { margin-top: 20px; }

.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #ffffff; color: #2c3e50;
  outline: none; font-family: inherit;
  -webkit-appearance: none; appearance: none;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.textarea { resize: vertical; min-height: 100px; line-height: 1.55; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center;
  padding: 10px 16px; border-radius: 999px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  color: #2c3e50; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; font-family: inherit; min-height: 40px;
}
.chip.active {
  background: #4a3b8c; color: #ffffff; border-color: #4a3b8c;
}

.budget-row { display: flex; align-items: center; gap: 10px; }
.budget-row .text-input { flex: 1; }
.budget-sep { color: #7f8c8d; font-weight: 700; }

.hint { font-size: 0.78rem; color: #95a5a6; margin: 8px 0 0; }

.error-box, .success-box {
  margin-top: 14px; padding: 12px 14px;
  border-radius: 10px; font-size: 0.83rem;
  font-weight: 500; line-height: 1.45;
}
.error-box { background: #fdecea; color: #c0392b; }
.success-box { background: #e6f9ee; color: #229954; }

.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.92rem; font-weight: 700;
  cursor: pointer; font-family: inherit; min-height: 50px;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
}
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.loading-row { display: inline-flex; align-items: center; gap: 8px; }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: #4a3b8c; font-weight: 700; font-size: 0.82rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }

.mini-empty {
  display: flex; align-items: center; padding: 20px;
  background: #f3f7fb; border: 1px dashed #d4dae4;
  border-radius: 12px; font-size: 0.86rem; color: #7f8c8d;
}

.service-list, .avail-list { display: grid; gap: 10px; }
.service-row, .avail-row {
  display: flex; align-items: center; gap: 12px;
  background: #f9fafc; border-radius: 12px; padding: 12px 14px;
}
.service-body { flex: 1; min-width: 0; }
.service-name {
  font-size: 0.92rem; font-weight: 800; color: #2c3e50;
  text-transform: capitalize; margin-bottom: 2px;
}
.service-desc { font-size: 0.78rem; color: #7f8c8d; margin-bottom: 4px; }
.service-meta { font-size: 0.74rem; color: #95a5a6; font-weight: 600; }
.service-actions, .avail-row { display: flex; gap: 6px; align-items: center; }

.icon-sm {
  width: 34px; height: 34px; border-radius: 10px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  cursor: pointer; display: grid; place-items: center;
}
.icon-sm:hover { border-color: #4a3b8c; }
.icon-sm.danger:hover { border-color: #e74c3c; }

.avail-day {
  flex: 0 0 90px; font-size: 0.85rem; font-weight: 800;
  color: #2c3e50;
}
.avail-time {
  flex: 1; font-size: 0.82rem; color: #4a5568; font-weight: 600;
}
.avail-loc {
  font-size: 0.72rem; color: #7f8c8d; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px;
}

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #ffffff; border-radius: 20px; padding: 22px;
  max-width: 440px; width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.modal-title { font-size: 1.05rem; font-weight: 800; color: #2c3e50; }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { margin-bottom: 16px; }
.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end;
  padding-top: 16px; border-top: 1px solid #f0f0f5;
}
.btn-secondary, .btn-primary {
  padding: 11px 18px; border-radius: 12px;
  font-size: 0.88rem; font-weight: 700; cursor: pointer;
  font-family: inherit;
}
.btn-secondary {
  border: 1.5px solid #e0e4eb; background: #ffffff; color: #2c3e50;
}
.btn-secondary:hover { border-color: #c8c0e0; background: #f7f8fb; }

@media (max-width: 599px) {
  .avail-row { flex-wrap: wrap; }
  .avail-day { flex: 0 0 100%; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
}
</style>