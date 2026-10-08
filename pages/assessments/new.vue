<template>
  <div class="assessment-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Assessment intake</div>
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
        <!-- STEP 1: CHILD -->
        <div v-if="step === 1">
          <h1 class="title">Who is this assessment for?</h1>
          <p class="subtitle">
            Select the child you'd like us to help support.
          </p>

          <div v-if="!children.length" class="empty-note">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-account-child-outline</v-icon>
            <span>
              You haven't added a child yet.
              <nuxt-link to="/onboarding/child">Add one first</nuxt-link>.
            </span>
          </div>

          <div v-else class="child-picker">
            <button
              v-for="c in children"
              :key="c.id"
              type="button"
              class="child-option"
              :class="{ active: form.child_id === c.id }"
              :disabled="saving"
              @click="form.child_id = c.id"
            >
              <div class="child-option-avatar" :style="{ background: avatarBg(c) }">
                {{ initials(c.full_name) }}
              </div>
              <div class="child-option-body">
                <div class="child-option-name">{{ c.full_name }}</div>
                <div class="child-option-meta">{{ age(c.dob) }}</div>
              </div>
              <v-icon
                v-if="form.child_id === c.id"
                small
                color="#4a3b8c"
              >mdi-check-circle</v-icon>
            </button>
          </div>
        </div>

        <!-- STEP 2: CONCERNS -->
        <div v-else-if="step === 2">
          <h1 class="title">What's on your mind?</h1>
          <p class="subtitle">
            In your own words. There are no wrong answers, and no diagnosis needed.
          </p>

          <label class="field-label">Your main concern</label>
          <textarea
            v-model.trim="form.concerns"
            rows="4"
            class="text-input textarea"
            placeholder="e.g. He is 4 and not speaking yet. He understands us but doesn't use words."
            :disabled="saving"
          ></textarea>

          <p class="hint">
            {{ form.concerns.length }}/2000 characters
          </p>
        </div>

        <!-- STEP 3: QUESTIONNAIRE -->
        <div v-else-if="step === 3">
          <h1 class="title">A quick check</h1>
          <p class="subtitle">
            Tap the option that best describes what you're noticing.
            This helps us route you to the right professional. It's not a diagnosis.
          </p>

          <div class="category-list">
            <div v-for="cat in categories" :key="cat.key" class="category">
              <div class="category-head">
                <div class="category-icon" :style="{ background: cat.bg }">
                  <v-icon small :color="cat.color">{{ cat.icon }}</v-icon>
                </div>
                <div class="category-title">{{ cat.label }}</div>
              </div>
              <div class="option-row">
                <button
                  v-for="opt in options"
                  :key="opt.value"
                  type="button"
                  class="option-chip"
                  :class="{
                    active: form.questionnaire[cat.key] === opt.value,
                    [`opt-${opt.value}`]: true
                  }"
                  :disabled="saving"
                  @click="form.questionnaire[cat.key] = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 4: PREFERENCES -->
        <div v-else>
          <h1 class="title">Almost done</h1>
          <p class="subtitle">
            Help us match you with the right professional near you.
          </p>

          <label class="field-label">Preferred county</label>
          <select v-model="form.preferred_county" class="text-input" :disabled="saving">
            <option value="">Select a county</option>
            <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
          </select>

          <label class="field-label mt-4">Preferred language</label>
          <div class="chip-row">
            <button
              v-for="l in languages"
              :key="l"
              type="button"
              class="chip"
              :class="{ active: form.preferred_language === l }"
              :disabled="saving"
              @click="form.preferred_language = l"
            >
              {{ l }}
            </button>
          </div>

          <label class="field-label mt-4">Preferred time</label>
          <div class="chip-row">
            <button
              v-for="t in times"
              :key="t.value"
              type="button"
              class="chip"
              :class="{ active: form.preferred_time === t.value }"
              :disabled="saving"
              @click="form.preferred_time = t.value"
            >
              {{ t.label }}
            </button>
          </div>

          <label class="field-label mt-4">Budget range (KSh, optional)</label>
          <div class="budget-row">
            <input
              v-model.number="form.budget_min"
              type="number"
              min="0"
              placeholder="Min"
              class="text-input"
              :disabled="saving"
            />
            <span class="budget-sep">–</span>
            <input
              v-model.number="form.budget_max"
              type="number"
              min="0"
              placeholder="Max"
              class="text-input"
              :disabled="saving"
            />
          </div>

          <div class="info-box mt-4">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-information-outline</v-icon>
            <span>
              After you submit, our team routes your request to a qualified professional
              who will review the information and reach out with next steps.
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
            @click="goBack"
          >
            Cancel
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
              Submit request
              <v-icon small color="white" class="ml-2">mdi-send</v-icon>
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="18" width="2" color="white" />
              <span class="ml-2">Submitting…</span>
            </span>
          </button>
        </div>
      </div>
    </main>

    <!-- SUCCESS MODAL -->
    <div v-if="showSuccess" class="modal-backdrop">
      <div class="modal">
        <div class="success-icon">
          <v-icon size="42" color="#229954">mdi-check</v-icon>
        </div>
        <h3 class="modal-title">Request submitted</h3>
        <p class="modal-text">
          We'll match you with a qualified professional and get back to you
          within 1–2 working days.
        </p>
        <button class="btn-primary" @click="goToDashboard">
          Back to dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'NewAssessmentPage',
  middleware: 'auth',

  data() {
    return {
      step: 1,
      totalSteps: 4,
      saving: false,
      error: '',
      showSuccess: false,

      children: [],

      form: {
        child_id: null,
        concerns: '',
        questionnaire: {
          communication: '',
          movement: '',
          learning: '',
          social: '',
          daily_living: '',
          behaviour: '',
          sensory: '',
          school: ''
        },
        preferred_county: '',
        preferred_language: '',
        preferred_time: '',
        budget_min: null,
        budget_max: null
      },

      options: [
        { value: 'no_concern', label: 'Not an issue' },
        { value: 'mild', label: 'Mild' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'significant', label: 'Significant' }
      ],

      categories: [
        { key: 'communication', label: 'Communication & speech', icon: 'mdi-account-voice', color: '#4a3b8c', bg: '#e6e0f5' },
        { key: 'movement',      label: 'Movement & coordination', icon: 'mdi-human-handsup', color: '#56c2d9', bg: '#d9f0f6' },
        { key: 'learning',      label: 'Learning & attention',    icon: 'mdi-brain', color: '#4a3b8c', bg: '#e6e0f5' },
        { key: 'social',        label: 'Social interaction',       icon: 'mdi-account-multiple-outline', color: '#e86a8a', bg: '#fce4ec' },
        { key: 'daily_living',  label: 'Daily living skills',      icon: 'mdi-home-outline', color: '#56c2d9', bg: '#d9f0f6' },
        { key: 'behaviour',     label: 'Behaviour & emotions',     icon: 'mdi-emoticon-outline', color: '#e86a8a', bg: '#fce4ec' },
        { key: 'sensory',       label: 'Sensory sensitivity',      icon: 'mdi-eye-outline', color: '#4a3b8c', bg: '#e6e0f5' },
        { key: 'school',        label: 'School & learning support', icon: 'mdi-school', color: '#56c2d9', bg: '#d9f0f6' }
      ],

      languages: ['English', 'Kiswahili', 'Both'],

      times: [
        { value: 'weekday_mornings', label: 'Weekday mornings' },
        { value: 'weekday_afternoons', label: 'Weekday afternoons' },
        { value: 'weekday_evenings', label: 'Weekday evenings' },
        { value: 'weekends', label: 'Weekends' }
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
      return ['Child', 'Concerns', 'Questionnaire', 'Preferences'][this.step - 1] || '';
    },
    canProceed() {
      if (this.step === 1) return !!this.form.child_id;
      if (this.step === 2) return this.form.concerns.trim().length >= 10;
      return true;
    },
    canSubmit() {
      return !!this.form.child_id && this.form.concerns.trim().length >= 10;
    }
  },

  mounted() {
    this.loadChildren();

    // Preselect child from query (?child=1)
    const qChild = Number(this.$route.query.child);
    if (qChild) this.form.child_id = qChild;
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
      if (this.step > 1) {
        this.prev();
      } else {
        this.$router.push('/dashboard').catch(() => {});
      }
    },

    goToDashboard() {
      this.$router.push('/dashboard').catch(() => {});
    },

    async loadChildren() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/children`, { headers });
        this.children = data.data || [];
        // Auto-select first if only one
        if (this.children.length === 1 && !this.form.child_id) {
          this.form.child_id = this.children[0].id;
        }
      } catch (err) {
        console.warn('[assessment] load children failed', err.message);
      }
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

    async submit() {
      if (!this.canSubmit || this.saving) return;
      this.error = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();

        // Build clean questionnaire — strip empty values
        const cleanQ = {};
        for (const [k, v] of Object.entries(this.form.questionnaire)) {
          if (v) cleanQ[k] = v;
        }

        const payload = {
          child_id: this.form.child_id,
          concerns: this.form.concerns || null,
          questionnaire: cleanQ,
          preferred_county: this.form.preferred_county || null,
          preferred_language: this.form.preferred_language || null,
          preferred_time: this.form.preferred_time || null,
          budget_min: this.form.budget_min || null,
          budget_max: this.form.budget_max || null
        };

        await axios.post(`${API}/api/assessments/requests`, payload, { headers });
        this.showSuccess = true;
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;

        if (status === 401) {
          this.error = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          this.error = body?.error === 'child_not_owned'
            ? 'That child isn\'t linked to your account. Please refresh and try again.'
            : 'You don\'t have permission to submit this request.';
        } else if (status === 400) {
          this.error = body?.details?.[0]?.message || body?.error || 'Please check the form.';
        } else {
          this.error = body?.message || 'Could not submit. Please try again.';
        }
        console.error('[assessment] submit failed', status, body);
      } finally {
        this.saving = false;
      }
    },

    // Helpers
    initials(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    avatarBg(child) {
      const palette = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      return palette[(child.id || 0) % palette.length];
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
    }
  }
};
</script>

<style scoped>
.assessment-page {
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
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}

/* CHILD PICKER */
.child-picker {
  display: grid;
  gap: 10px;
}
.child-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #f9fafc;
  border: 1.5px solid #ececf1;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-align: left;
  width: 100%;
}
.child-option:hover:not(:disabled) {
  border-color: #c8c0e0;
  background: #ffffff;
}
.child-option.active {
  border-color: #4a3b8c;
  background: #f7f5fd;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.child-option-avatar {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  flex: 0 0 auto;
  letter-spacing: 0.3px;
}
.child-option-body { flex: 1; min-width: 0; }
.child-option-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 2px;
}
.child-option-meta {
  font-size: 0.78rem;
  color: #7f8c8d;
}

.empty-note {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f3f7fb;
  border: 1px dashed #d4dae4;
  border-radius: 12px;
  font-size: 0.88rem;
  color: #4a5568;
  line-height: 1.5;
}
.empty-note a {
  color: #4a3b8c;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}
.empty-note a:hover { text-decoration: underline; }

/* QUESTIONNAIRE */
.category-list {
  display: grid;
  gap: 20px;
}
.category-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.category-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.category-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2c3e50;
}
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.option-chip {
  flex: 1;
  min-width: 80px;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #7f8c8d;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  min-height: 42px;
}
.option-chip:hover:not(:disabled) {
  border-color: #c8c0e0;
  color: #2c3e50;
}
.option-chip.active.opt-no_concern {
  background: #e6f9ee;
  border-color: #229954;
  color: #229954;
}
.option-chip.active.opt-mild {
  background: #fef3e0;
  border-color: #b7791f;
  color: #b7791f;
}
.option-chip.active.opt-moderate {
  background: #fce4ec;
  border-color: #e86a8a;
  color: #c2185b;
}
.option-chip.active.opt-significant {
  background: #fdecea;
  border-color: #c0392b;
  color: #c0392b;
}
.option-chip:disabled { opacity: 0.6; cursor: not-allowed; }

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

/* BUDGET */
.budget-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.budget-row .text-input { flex: 1; }
.budget-sep { color: #7f8c8d; font-weight: 700; }

/* INFO / HINT */
.hint {
  font-size: 0.78rem;
  color: #95a5a6;
  margin: 8px 0 0;
  text-align: right;
}
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
  padding: 32px 24px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
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
.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 8px;
}
.modal-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 24px;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .card { padding: 22px 18px; }
  .title { font-size: 1.3rem; }
  .actions { flex-direction: column-reverse; }
  .btn-secondary { width: 100%; }
  .option-chip { flex: 1 0 45%; }
}
</style>