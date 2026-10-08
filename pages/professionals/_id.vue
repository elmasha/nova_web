<template>
  <div class="pro-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Professional</div>
      <div class="topbar-spacer" />
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
        <h2>Could not load profile</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">Try again</button>
        <button class="link-btn mt-3" @click="goBack">Back to search</button>
      </section>

      <template v-else-if="pro">
        <!-- PROFILE HEADER -->
        <section class="profile-head">
          <div class="avatar-xl" :style="{ background: avatarBg }">
            {{ initials }}
          </div>

          <div class="profile-head-body">
            <div class="name-row">
              <h1 class="pro-name">{{ pro.display_name || 'Professional' }}</h1>
              <span v-if="pro.verification_status === 'verified'" class="verified-badge">
                <v-icon x-small color="#ffffff">mdi-check</v-icon>
              </span>
            </div>

            <div class="pro-type">{{ typeLabel(pro.type) }}</div>

            <div class="pro-meta">
              <span v-if="pro.county" class="meta-item">
                <v-icon x-small color="#7f8c8d" class="mr-1">mdi-map-marker-outline</v-icon>
                {{ pro.county }}<span v-if="pro.area">, {{ pro.area }}</span>
              </span>
              <span v-if="pro.years_experience" class="meta-item">
                <v-icon x-small color="#7f8c8d" class="mr-1">mdi-briefcase-outline</v-icon>
                {{ pro.years_experience }} years experience
              </span>
              <span v-if="pro.online" class="meta-item online-tag">
                <v-icon x-small color="#56c2d9" class="mr-1">mdi-video-outline</v-icon>
                Offers online
              </span>
            </div>

            <div v-if="langs.length" class="pro-langs">
              <span v-for="l in langs" :key="l" class="lang-tag">{{ l }}</span>
            </div>
          </div>
        </section>

        <!-- BIO -->
        <section v-if="pro.bio" class="card">
          <h2 class="card-title">About</h2>
          <p class="bio-text">{{ pro.bio }}</p>
        </section>

        <!-- SERVICES -->
        <section class="card">
          <h2 class="card-title">Services & pricing</h2>
          <div v-if="!services.length" class="mini-empty">
            <v-icon small color="#95a5a6" class="mr-2">mdi-tag-outline</v-icon>
            <span>No services listed yet.</span>
          </div>
          <div v-else class="services-list">
            <div
              v-for="s in services"
              :key="s.id"
              class="service-row"
              :class="{ selected: form.service_id === s.id }"
              @click="selectService(s)"
            >
              <div class="service-icon" style="background:#e6e0f5">
                <v-icon small color="#4a3b8c">mdi-tag-outline</v-icon>
              </div>
              <div class="service-body">
                <div class="service-name">{{ s.type }}</div>
                <div v-if="s.description" class="service-desc">{{ s.description }}</div>
                <div class="service-duration">{{ s.duration_minutes }} min</div>
              </div>
              <div class="service-price">
                <div class="price-value">KSh {{ formatPrice(s.price) }}</div>
                <v-icon
                  v-if="form.service_id === s.id"
                  small
                  color="#4a3b8c"
                >mdi-check-circle</v-icon>
              </div>
            </div>
          </div>
        </section>

        <!-- BOOKING CTA -->
        <section class="card cta-card">
          <div class="cta-body">
            <div class="cta-text">
              <div class="cta-title">Ready to book?</div>
              <div class="cta-sub">
                {{ pro.price_min ? `From KSh ${formatPrice(pro.price_min)} per session` : 'Contact for pricing' }}
              </div>
            </div>
            <button class="primary-btn" @click="openBooking">
              <v-icon small color="white" class="mr-2">mdi-calendar-plus</v-icon>
              Book session
            </button>
          </div>
        </section>
      </template>
    </main>

    <!-- BOOKING MODAL -->
    <div v-if="bookingOpen" class="modal-backdrop" @click.self="closeBooking">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">Book with {{ pro?.display_name || 'professional' }}</div>
          <button class="modal-close" @click="closeBooking" aria-label="Close">
            <v-icon small color="#7f8c8d">mdi-close</v-icon>
          </button>
        </div>

        <div class="modal-body">
          <!-- No children -->
          <div v-if="!children.length" class="mini-empty">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-account-child-outline</v-icon>
            <span>
              You need to add a child first.
              <nuxt-link to="/onboarding/child" class="link-inline">Add one</nuxt-link>
            </span>
          </div>

          <template v-else>
            <label class="field-label">Child</label>
            <select v-model.number="form.child_id" class="text-input">
              <option :value="null" disabled>Select child</option>
              <option v-for="c in children" :key="c.id" :value="c.id">
                {{ c.full_name }} — {{ age(c.dob) }}
              </option>
            </select>

            <label class="field-label mt-4">Service</label>
            <select v-model.number="form.service_id" class="text-input">
              <option :value="null" disabled>Select service</option>
              <option v-for="s in services" :key="s.id" :value="s.id">
                {{ s.type }} — KSh {{ formatPrice(s.price) }} ({{ s.duration_minutes }} min)
              </option>
            </select>

            <label class="field-label mt-4">Date</label>
            <input
              v-model="form.date"
              type="date"
              class="text-input"
              :min="todayISO"
            />

            <label class="field-label mt-4">Time</label>
            <div class="time-grid">
              <button
                v-for="slot in timeSlots"
                :key="slot.value"
                type="button"
                class="time-chip"
                :class="{ active: form.time === slot.value }"
                @click="form.time = slot.value"
              >
                {{ slot.label }}
              </button>
            </div>

            <label class="field-label mt-4">Session type</label>
            <div class="chip-row">
              <button
                type="button"
                class="chip"
                :class="{ active: form.location_type === 'in_person' }"
                @click="form.location_type = 'in_person'"
              >
                <v-icon x-small class="mr-1">mdi-map-marker-outline</v-icon>
                In person
              </button>
              <button
                v-if="pro && pro.online"
                type="button"
                class="chip"
                :class="{ active: form.location_type === 'online' }"
                @click="form.location_type = 'online'"
              >
                <v-icon x-small class="mr-1">mdi-video-outline</v-icon>
                Online
              </button>
            </div>

            <label class="field-label mt-4">Notes (optional)</label>
            <textarea
              v-model.trim="form.notes"
              rows="2"
              placeholder="Anything the professional should know?"
              class="text-input textarea"
            ></textarea>

            <!-- Payment preview -->
            <div v-if="selectedService" class="pay-preview mt-4">
              <div class="pay-preview-row">
                <span>{{ selectedService.type }}</span>
                <span class="pay-amount">KSh {{ formatPrice(selectedService.price) }}</span>
              </div>
              <div class="pay-preview-note">
                <v-icon x-small color="#4a3b8c" class="mr-1">mdi-information-outline</v-icon>
                <span>You'll be asked to pay via M-Pesa after confirming.</span>
              </div>
            </div>
          </template>

          <div v-if="error" class="error-box">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ error }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closeBooking" :disabled="saving">
            Cancel
          </button>
          <button
            class="btn-primary"
            :disabled="!canSubmit || saving"
            @click="submitBooking"
          >
            <span v-if="!saving">
              Confirm booking
              <v-icon small color="white" class="ml-2">mdi-check</v-icon>
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="16" width="2" color="white" />
              <span class="ml-2">Booking…</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL -->
    <div v-if="showSuccess" class="modal-backdrop">
      <div class="modal modal-sm">
        <div class="success-icon">
          <v-icon size="42" color="#229954">mdi-check</v-icon>
        </div>
        <h3 class="modal-title">Booking created</h3>
        <p class="modal-text">
          Pay now to confirm your session with
          {{ pro?.display_name || 'the professional' }}.
          You can also pay later from My bookings.
        </p>
        <div class="success-actions">
          <button class="btn-primary" @click="goToPayment">
            <v-icon small color="white" class="mr-2">mdi-cellphone-wireless</v-icon>
            Pay with M-Pesa
          </button>
          <button class="btn-secondary" @click="goToBookings">
            Pay later
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
  name: 'ProfessionalDetailPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',

      pro: null,
      services: [],
      children: [],

      bookingOpen: false,
      showSuccess: false,
      createdBookingId: null,
      saving: false,
      error: '',

      form: {
        child_id: null,
        service_id: null,
        date: '',
        time: '',
        location_type: 'in_person',
        notes: ''
      },

      timeSlots: [
        { value: '08:00', label: '8:00 AM' },
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '17:00', label: '5:00 PM' }
      ]
    };
  },

  computed: {
    proId() {
      return this.$route.params.id;
    },
    initials() {
      const n = (this.pro?.display_name || this.pro?.type || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg() {
      const palette = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return palette[(Number(this.proId) || 0) % palette.length];
    },
    langs() {
      const l = this.pro?.languages;
      if (!l) return [];
      if (Array.isArray(l)) return l;
      try {
        const parsed = JSON.parse(l);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },
    todayISO() {
      return new Date().toISOString().split('T')[0];
    },
    selectedService() {
      if (!this.form.service_id) return null;
      return this.services.find((s) => s.id === this.form.service_id) || null;
    },
    canSubmit() {
      return !!this.form.child_id
        && !!this.form.service_id
        && !!this.form.date
        && !!this.form.time
        && !!this.form.location_type;
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
      this.$router.push('/professionals').catch(() => {});
    },

    goToBookings() {
      this.$router.push('/dashboard/parent?tab=bookings').catch(() => {});
    },

    goToPayment() {
      if (!this.createdBookingId) {
        this.goToBookings();
        return;
      }
      this.$router.push(`/bookings/${this.createdBookingId}`).catch(() => {});
    },

    async load() {
      this.loading = true;
      this.loadError = '';

      try {
        const headers = await this.authHeader();

        const [proRes, childrenRes] = await Promise.all([
          axios.get(`${API}/api/professionals/${this.proId}`, { headers }),
          axios.get(`${API}/api/children`, { headers }).catch(() => ({ data: { data: [] } }))
        ]);

        this.pro = proRes.data?.data || null;
        this.services = this.pro?.services || [];
        this.children = childrenRes.data?.data || [];

        if (this.children.length === 1) {
          this.form.child_id = this.children[0].id;
        }
        if (this.services.length === 1) {
          this.form.service_id = this.services[0].id;
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
          this.loadError = 'This professional could not be found.';
        } else if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else {
          this.loadError = 'Could not load profile. Please try again.';
        }
        console.error('[pro detail] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    openBooking() {
      if (!this.children.length) {
        this.$router.push('/onboarding/child').catch(() => {});
        return;
      }
      this.error = '';
      this.bookingOpen = true;
    },

    closeBooking() {
      this.bookingOpen = false;
      this.error = '';
    },

    selectService(s) {
      this.form.service_id = s.id;
    },

    async submitBooking() {
      if (!this.canSubmit || this.saving) return;
      this.error = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();
        const service = this.services.find((s) => s.id === this.form.service_id);
        const scheduledAt = `${this.form.date}T${this.form.time}:00`;

        const { data } = await axios.post(
          `${API}/api/bookings`,
          {
            professional_id: Number(this.proId),
            child_id: this.form.child_id,
            service_id: this.form.service_id,
            scheduled_at: scheduledAt,
            duration_minutes: service?.duration_minutes || 60,
            location_type: this.form.location_type,
            notes: this.form.notes || null
          },
          { headers }
        );

        this.createdBookingId = data?.id || null;
        this.bookingOpen = false;
        this.showSuccess = true;
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;

        if (status === 401) {
          this.error = 'Your session expired. Please sign in again.';
        } else if (status === 403) {
          this.error = body?.error === 'child_not_owned'
            ? 'That child isn\'t linked to your account.'
            : 'You don\'t have permission to book this.';
        } else if (status === 400) {
          this.error = body?.details?.[0]?.message || body?.error || 'Check the form.';
        } else {
          this.error = body?.message || 'Could not create booking. Try again.';
        }
        console.error('[pro detail] booking failed', status, body);
      } finally {
        this.saving = false;
      }
    },

    // Helpers
    formatPrice(n) {
      return Number(n).toLocaleString('en-US');
    },
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
    typeLabel(t) {
      const map = {
        speech_therapist: 'Speech & language therapist',
        occupational_therapist: 'Occupational therapist',
        physiotherapist: 'Physiotherapist',
        psychologist: 'Psychologist',
        special_needs_teacher: 'Special-needs teacher',
        learning_support: 'Learning support',
        parent_coach: 'Parent coach',
        other: 'Other'
      };
      return map[t] || (t || 'Professional');
    }
  }
};
</script>

<style scoped>
.pro-page {
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
.back-btn {
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
.back-btn:hover { background: #e6eef5; }
.topbar-title {
  font-size: 0.98rem;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.01em;
}
.topbar-spacer { width: 38px; }

/* MAIN */
.main {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px;
}
@media (min-width: 768px) {
  .main { padding: 24px 24px; }
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

/* ERROR */
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
  margin: 0 0 20px;
}
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 20px; }

/* PROFILE HEAD */
.profile-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
}
.avatar-xl {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 26px;
  letter-spacing: 0.5px;
  flex: 0 0 auto;
}
.profile-head-body { flex: 1; min-width: 0; }
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.pro-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
  letter-spacing: -0.01em;
}
.verified-badge {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #229954;
  flex: 0 0 auto;
}
.pro-type {
  font-size: 0.85rem;
  color: #4a3b8c;
  font-weight: 600;
  margin-bottom: 10px;
}
.pro-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.78rem;
  color: #7f8c8d;
  margin-bottom: 8px;
}
.meta-item { display: inline-flex; align-items: center; }
.online-tag { color: #56c2d9; font-weight: 700; }
.pro-langs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.lang-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f3f7fb;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.3px;
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
.bio-text {
  font-size: 0.92rem;
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
}

/* SERVICES */
.services-list { display: grid; gap: 10px; }
.service-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafc;
  border: 1.5px solid #ececf1;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.service-row:hover {
  border-color: #c8c0e0;
  background: #ffffff;
}
.service-row.selected {
  border-color: #4a3b8c;
  background: #f7f5fd;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.08);
}
.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.service-body { flex: 1; min-width: 0; }
.service-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: #2c3e50;
  text-transform: capitalize;
  margin-bottom: 2px;
}
.service-desc {
  font-size: 0.78rem;
  color: #7f8c8d;
  margin-bottom: 4px;
  line-height: 1.4;
}
.service-duration {
  font-size: 0.72rem;
  color: #95a5a6;
  font-weight: 600;
}
.service-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: 0 0 auto;
}
.price-value {
  font-size: 0.9rem;
  font-weight: 800;
  color: #4a3b8c;
  letter-spacing: -0.01em;
}

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

/* CTA CARD */
.cta-card { border-color: #e6e0f5; background: linear-gradient(180deg, #faf8ff, #ffffff); }
.cta-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.cta-text { min-width: 0; }
.cta-title {
  font-size: 1rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 2px;
}
.cta-sub { font-size: 0.82rem; color: #7f8c8d; }

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 22px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  transition: transform 0.15s ease;
  font-family: inherit;
  min-height: 48px;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

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
.btn-secondary:hover { border-color: #c8c0e0; background: #f7f8fb; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

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
.link-inline {
  color: #4a3b8c;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}
.link-inline:hover { text-decoration: underline; }

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
  overflow-y: auto;
}
.modal {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
  margin: auto;
}
.modal-sm { max-width: 400px; text-align: center; padding: 32px 24px; }
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
}
.modal-close {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 8px;
}
.modal-close:hover { background: #f3f7fb; }

.modal-body { display: flex; flex-direction: column; }

.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 6px;
}

.text-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0e4eb;
  border-radius: 12px;
  font-size: 0.92rem;
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
.textarea { resize: vertical; min-height: 72px; line-height: 1.5; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
  padding-right: 36px;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.time-chip {
  padding: 10px 4px;
  border-radius: 10px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  min-height: 40px;
}
.time-chip:hover { border-color: #4a3b8c; color: #4a3b8c; }
.time-chip.active {
  background: #4a3b8c;
  color: #ffffff;
  border-color: #4a3b8c;
}

.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.84rem;
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

/* PAYMENT PREVIEW */
.pay-preview {
  background: #f7f5fd;
  border: 1px solid #e6e0f5;
  border-radius: 12px;
  padding: 12px 14px;
}
.pay-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.88rem;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
}
.pay-amount {
  font-size: 1rem;
  font-weight: 900;
  color: #4a3b8c;
  letter-spacing: -0.01em;
}
.pay-preview-note {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 0.76rem;
  color: #4a3b8c;
  line-height: 1.5;
}

.error-box {
  margin-top: 16px;
  padding: 12px 14px;
  background: #fdecea;
  color: #c0392b;
  border-radius: 10px;
  font-size: 0.83rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  line-height: 1.45;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f5;
  justify-content: flex-end;
}
.modal-actions .btn-primary { flex: 1; }

.loading-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #e6f9ee;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}
.modal-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 24px;
}
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.success-actions .btn-primary,
.success-actions .btn-secondary {
  width: 100%;
  justify-content: center;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .main { padding: 16px 12px; }
  .profile-head { flex-direction: column; align-items: center; text-align: center; }
  .profile-head-body { text-align: center; }
  .name-row { justify-content: center; }
  .pro-meta { justify-content: center; }
  .pro-langs { justify-content: center; }
  .avatar-xl { width: 72px; height: 72px; border-radius: 20px; font-size: 22px; }
  .cta-body { flex-direction: column; align-items: stretch; }
  .cta-body .primary-btn { width: 100%; }
  .time-grid { grid-template-columns: repeat(3, 1fr); }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
}
</style>