<template>
  <div class="onboarding">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <nuxt-link to="/" class="brand">
        <span class="brand-mark"><v-icon small color="white">mdi-bridge</v-icon></span>
        <span class="brand-name">No<span class="brand-dot">va</span></span>
      </nuxt-link>
      <div class="topbar-spacer" />
    </header>

    <!-- PROGRESS -->
    <div class="progress-wrap">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }" />
      </div>
      <div class="progress-labels">
        <span>Step {{ step }} of {{ totalSteps }}</span>
        <span>{{ stepTitle }}</span>
      </div>
    </div>

    <main class="main">
      <div class="card">
        <!-- STEP 1: BASIC -->
        <div v-if="step === 1">
          <h1 class="title">Tell us about your child</h1>
          <p class="subtitle">
            This helps us understand who we're supporting. You can add more details later.
          </p>

          <label class="field-label">Full name</label>
          <input
            v-model.trim="form.full_name"
            type="text"
            placeholder="e.g. Amani Wanjiku"
            autocomplete="off"
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

          <p class="hint mt-3">
            No diagnosis is needed to continue. We'll help you find the right next step.
          </p>
        </div>

        <!-- STEP 2: LOCATION -->
        <div v-else-if="step === 2">
          <h1 class="title">Where are you based?</h1>
          <p class="subtitle">
            We use this to match you with professionals near you.
          </p>

          <label class="field-label">County</label>
          <select v-model="form.county" class="text-input" :disabled="saving">
            <option value="">Select a county</option>
            <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
          </select>

          <label class="field-label mt-4">Area or estate (optional)</label>
          <input
            v-model.trim="form.area"
            type="text"
            placeholder="e.g. Kilimani"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">School (optional)</label>
          <input
            v-model.trim="form.school_name"
            type="text"
            placeholder="Name of school or daycare"
            class="text-input"
            :disabled="saving"
          />
        </div>

        <!-- STEP 3: CONCERNS -->
        <div v-else>
          <h1 class="title">What's on your mind?</h1>
          <p class="subtitle">
            Optional. Anything you share helps the professional understand your child better.
          </p>

          <label class="field-label">Anything you'd like us to know?</label>
          <textarea
            v-model.trim="form.notes"
            rows="4"
            placeholder="e.g. He is 4 and not speaking yet. He understands us but doesn't use words."
            class="text-input textarea"
            :disabled="saving"
          ></textarea>

          <label class="field-label mt-4">Existing diagnosis (optional)</label>
          <input
            v-model.trim="form.diagnosis_optional"
            type="text"
            placeholder="If you have one, e.g. Autism, Down syndrome"
            class="text-input"
            :disabled="saving"
          />

          <div class="info-box mt-4">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-shield-lock-outline</v-icon>
            <span>
              Your child's information is encrypted and only visible to you and
              professionals you choose to share it with.
            </span>
          </div>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="error-box">
          <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
          <span>{{ error }}</span>
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <button
            v-if="step > 1"
            type="button"
            class="btn-secondary"
            :disabled="saving"
            @click="prev"
          >
            Back
          </button>
          <button
            v-else
            type="button"
            class="btn-secondary"
            :disabled="saving"
            @click="skip"
          >
            Skip
          </button>

          <button
            v-if="step < totalSteps"
            type="button"
            class="btn-primary"
            :disabled="!canProceed || saving"
            @click="next"
          >
            Continue
            <v-icon small color="white" class="ml-2">mdi-arrow-right</v-icon>
          </button>

          <button
            v-else
            type="button"
            class="btn-primary"
            :disabled="!canSubmit || saving"
            @click="submit"
          >
            <span v-if="!saving">
              Save & continue
              <v-icon small color="white" class="ml-2">mdi-check</v-icon>
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="18" width="2" color="white" />
              <span class="ml-2">Saving…</span>
            </span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'OnboardingChild',
  middleware: 'auth',

  data() {
    return {
      step: 1,
      totalSteps: 3,
      saving: false,
      error: '',

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
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' }
      ],

      counties: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu',
        'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Kilifi',
        'Meru', 'Kakamega', 'Bungoma', 'Kisii', 'Nyamira',
        'Kitui', 'Garissa', 'Turkana', 'Other'
      ]
    };
  },

  computed: {
    progressPct() {
      return (this.step / this.totalSteps) * 100;
    },
    stepTitle() {
      return ['Basic info', 'Location', 'Notes'][this.step - 1] || '';
    },
    todayISO() {
      return new Date().toISOString().split('T')[0];
    },
    canProceed() {
      if (this.step === 1) {
        return this.form.full_name.trim().length >= 2 && !!this.form.dob;
      }
      return true;
    },
    canSubmit() {
      return this.form.full_name.trim().length >= 2 && !!this.form.dob;
    }
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

    next() {
      if (!this.canProceed) return;
      this.error = '';
      if (this.step < this.totalSteps) this.step++;
    },

    prev() {
      this.error = '';
      if (this.step > 1) this.step--;
    },

    goBack() {
      if (this.step > 1) {
        this.prev();
      } else {
        this.$router.push('/dashboard').catch(() => {});
      }
    },

    skip() {
      this.$router.push('/dashboard').catch(() => {});
    },

    async submit() {
      if (!this.canSubmit || this.saving) return;
      this.error = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();

        // Build payload — strip empty fields
        const payload = {};
        for (const [k, v] of Object.entries(this.form)) {
          if (v !== '' && v !== null && v !== undefined) {
            payload[k] = v;
          }
        }

        await axios.post(`${API}/api/children`, payload, { headers });

        this.$router.push('/dashboard').catch(() => {});
      } catch (err) {
        console.error('[onboarding/child]', err);
        const msg = err.response?.data?.message
          || err.response?.data?.error
          || err.message
          || 'Something went wrong. Please try again.';

        if (err.response?.status === 401) {
          this.error = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1200);
        } else if (err.response?.status === 403) {
          this.error = 'Your account isn\'t set up yet. Please sign in again.';
        } else {
          this.error = msg;
        }
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: #f3f7fb;
  padding-bottom: 40px;
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
.topbar-spacer { width: 38px; }

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4a3b8c, #56c2d9);
  display: grid;
  place-items: center;
}
.brand-name {
  font-size: 15px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.02em;
}
.brand-dot { color: #e86a8a; }

/* PROGRESS */
.progress-wrap {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 20px 0;
}
.progress-track {
  height: 6px;
  background: #ececf1;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a3b8c, #56c2d9);
  border-radius: 999px;
  transition: width 0.3s ease;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  color: #7f8c8d;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* MAIN */
.main {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px;
}
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 24px;
  border: 1px solid #ececf1;
  box-shadow: 0 4px 20px -12px rgba(44, 62, 80, 0.08);
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.subtitle {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0 0 24px;
  line-height: 1.55;
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
.text-input:disabled {
  background: #f7f8fb;
  cursor: not-allowed;
}
.textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.55;
}
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

/* CHIPS */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 10px 18px;
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
.chip:hover:not(:disabled) {
  border-color: #4a3b8c;
  color: #4a3b8c;
}
.chip.active {
  background: #4a3b8c;
  color: #ffffff;
  border-color: #4a3b8c;
  box-shadow: 0 4px 10px rgba(74, 59, 140, 0.25);
}
.chip:disabled { opacity: 0.6; cursor: not-allowed; }

/* HINT */
.hint {
  font-size: 0.8rem;
  color: #7f8c8d;
  line-height: 1.55;
  margin: 0;
}

/* INFO BOX */
.info-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #e6e0f5;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.82rem;
  color: #4a3b8c;
  line-height: 1.55;
}

/* ERROR */
.error-box {
  margin-top: 16px;
  padding: 12px 14px;
  background: #fdecea;
  color: #c0392b;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  line-height: 1.45;
}

/* ACTIONS */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f5;
}
.btn-secondary {
  flex: 0 0 auto;
  padding: 14px 22px;
  border-radius: 12px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  min-height: 50px;
}
.btn-secondary:hover:not(:disabled) {
  border-color: #c8c0e0;
  background: #f7f8fb;
}
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary {
  flex: 1;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(74, 59, 140, 0.34);
}
.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 10px rgba(74, 59, 140, 0.18);
}
.loading-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .card { padding: 24px 20px; }
  .title { font-size: 1.3rem; }
  .actions { flex-direction: column-reverse; }
  .btn-secondary { width: 100%; }
}
</style>