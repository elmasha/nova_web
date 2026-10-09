<template>
  <div class="assessment-page">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Assessment intake</div>
      <button
        v-if="hasDraft"
        class="icon-btn"
        @click="confirmClearDraft = true"
        aria-label="Clear draft"
        title="Clear draft"
      >
        <v-icon small color="#e74c3c">mdi-delete-outline</v-icon>
      </button>
      <div v-else class="topbar-spacer" />
    </header>

    <!-- PROGRESS -->
    <div class="progress-wrap">
      <div class="step-dots">
        <template v-for="s in totalSteps">
          <div
            :key="'dot-' + s"
            class="step-dot"
            :class="{ done: s < step, current: s === step }"
          >
            <v-icon v-if="s < step" x-small color="white">mdi-check</v-icon>
            <span v-else>{{ s }}</span>
          </div>
          <div
            v-if="s < totalSteps"
            :key="'line-' + s"
            class="step-line"
            :class="{ done: s < step }"
          />
        </template>
      </div>
      <div class="progress-labels">
        <span>Step {{ step }} of {{ totalSteps }}</span>
        <span>{{ stepTitle }}</span>
      </div>
    </div>

    <main class="main">
      <transition name="fade-slide" mode="out-in">
        <div class="card" :key="step">
          <!-- ============================================================
               STEP 1: CHILD
               ============================================================ -->
          <div v-if="step === 1">
            <h1 class="title">Who is this assessment for?</h1>
            <p class="subtitle">
              Select the child you'd like us to help support.
            </p>

            <div v-if="!children.length" class="empty-note">
              <div class="empty-note-icon">
                <v-icon size="22" color="#4a3b8c">mdi-account-child-outline</v-icon>
              </div>
              <div class="empty-note-body">
                <div class="empty-note-title">No children added yet</div>
                <div class="empty-note-text">
                  Add a child first so we know who we're finding support for.
                </div>
                <button class="primary-btn small mt-3" @click="goToAddChild">
                  <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
                  Add a child
                </button>
              </div>
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
                  <div class="child-option-meta">
                    {{ age(c.dob) }}<span v-if="c.county"> · {{ c.county }}</span>
                  </div>
                </div>
                <div class="check-wrap" :class="{ on: form.child_id === c.id }">
                  <v-icon x-small color="white">mdi-check</v-icon>
                </div>
              </button>
            </div>
          </div>

          <!-- ============================================================
               STEP 2: CONCERNS
               ============================================================ -->
          <div v-else-if="step === 2">
            <h1 class="title">What's on your mind?</h1>
            <p class="subtitle">
              In your own words. There are no wrong answers, and no diagnosis is needed.
            </p>

            <label class="field-label">
              Your main concern
              <span class="field-hint">{{ form.concerns.length }}/2000</span>
            </label>
            <textarea
              v-model.trim="form.concerns"
              rows="6"
              maxlength="2000"
              class="text-input textarea"
              placeholder="e.g. He is 4 and not speaking yet. He understands us but doesn't use words."
              :disabled="saving"
            ></textarea>

            <div class="prompt-chips mt-3">
              <button
                v-for="p in concernPrompts"
                :key="p"
                type="button"
                class="prompt-chip"
                :disabled="saving"
                @click="appendPrompt(p)"
              >
                + {{ p }}
              </button>
            </div>

            <div class="info-box mt-4">
              <v-icon small color="#4a3b8c" class="mr-2">mdi-shield-check-outline</v-icon>
              <span>
                This information is confidential. It's used to route you to the right
                professional — nothing is shared without your consent.
              </span>
            </div>
          </div>

          <!-- ============================================================
               STEP 3: QUESTIONNAIRE
               ============================================================ -->
          <div v-else-if="step === 3">
            <h1 class="title">A quick check</h1>
            <p class="subtitle">
              Tap what you're noticing in each area. This helps us route you to the right
              professional — it's not a diagnosis.
            </p>

            <div class="progress-note">
              <div class="progress-note-head">
                <span>{{ answeredCount }} of {{ categories.length }} areas answered</span>
                <span v-if="answeredCount" class="progress-note-pct">
                  {{ Math.round((answeredCount / categories.length) * 100) }}%
                </span>
              </div>
              <div class="progress-note-track">
                <div
                  class="progress-note-fill"
                  :style="{ width: (answeredCount / categories.length * 100) + '%' }"
                />
              </div>
            </div>

            <div class="category-list mt-4">
              <div v-for="cat in categories" :key="cat.key" class="category">
                <div class="category-head">
                  <div class="category-icon" :style="{ background: cat.bg }">
                    <v-icon small :color="cat.color">{{ cat.icon }}</v-icon>
                  </div>
                  <div class="category-title">{{ cat.label }}</div>
                  <div v-if="form.questionnaire[cat.key]" class="category-answered">
                    <v-icon x-small color="#229954">mdi-check</v-icon>
                  </div>
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
                    :aria-pressed="form.questionnaire[cat.key] === opt.value"
                    @click="form.questionnaire[cat.key] = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ============================================================
               STEP 4: PREFERENCES
               ============================================================ -->
          <div v-else-if="step === 4">
            <h1 class="title">Almost done</h1>
            <p class="subtitle">
              Help us match you with the right professional near you.
            </p>

            <label class="field-label">Preferred county</label>
            <select v-model="form.preferred_county" class="text-input" :disabled="saving">
              <option value="">Select a county</option>
              <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
            </select>
            <p v-if="defaultCounty && form.preferred_county === defaultCounty" class="hint-left">
              Pre-filled from your child's profile.
            </p>

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
            <p class="hint-left">
              Leave blank if you'd rather not set a range. We'll show you options at all price points.
            </p>
          </div>

          <!-- ============================================================
               STEP 5: REVIEW
               ============================================================ -->
          <div v-else>
            <h1 class="title">Review & submit</h1>
            <p class="subtitle">
              A quick look at what you've shared. Tap any section to edit.
            </p>

            <div class="review-block">
              <div class="review-row">
                <div class="review-label">Child</div>
                <div class="review-value">
                  <span v-if="selectedChild">{{ selectedChild.full_name }}</span>
                  <span v-else class="muted">Not selected</span>
                </div>
                <button class="review-edit" @click="step = 1">Edit</button>
              </div>

              <div class="review-row">
                <div class="review-label">Concern</div>
                <div class="review-value">
                  <span v-if="form.concerns">{{ truncate(form.concerns, 140) }}</span>
                  <span v-else class="muted">Not provided</span>
                </div>
                <button class="review-edit" @click="step = 2">Edit</button>
              </div>

              <div class="review-row">
                <div class="review-label">Check</div>
                <div class="review-value">
                  <span v-if="answeredCount">{{ answeredCount }} areas rated</span>
                  <span v-else class="muted">Not answered</span>
                </div>
                <button class="review-edit" @click="step = 3">Edit</button>
              </div>

              <div class="review-row">
                <div class="review-label">Preferences</div>
                <div class="review-value">
                  <span v-if="!hasAnyPreference" class="muted">None set</span>
                  <template v-else>
                    <span v-if="form.preferred_county">{{ form.preferred_county }}</span>
                    <span v-if="form.preferred_language">
                      <span v-if="form.preferred_county"> · </span>
                      {{ form.preferred_language }}
                    </span>
                    <span v-if="form.preferred_time">
                      <span v-if="form.preferred_county || form.preferred_language"> · </span>
                      {{ preferredTimeLabel }}
                    </span>
                    <span v-if="budgetLabel">
                      <span v-if="form.preferred_county || form.preferred_language || form.preferred_time"> · </span>
                      {{ budgetLabel }}
                    </span>
                  </template>
                </div>
                <button class="review-edit" @click="step = 4">Edit</button>
              </div>
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
          <div v-if="error" class="error-box mt-4">
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
              <v-icon x-small class="mr-1">mdi-arrow-left</v-icon>
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
      </transition>
    </main>

    <!-- SUCCESS MODAL -->
    <transition name="modal">
      <div v-if="showSuccess" class="modal-backdrop">
        <div class="modal">
          <div class="success-icon">
            <div class="success-pulse"></div>
            <v-icon size="38" color="white">mdi-check</v-icon>
          </div>
          <h3 class="modal-title">Request submitted</h3>
          <p class="modal-text">
            We'll match {{ selectedChild ? selectedChild.full_name : 'your child' }}
            with a qualified professional and get back to you within 1–2 working days.
          </p>
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

    <!-- CLEAR DRAFT CONFIRM -->
    <transition name="modal">
      <div v-if="confirmClearDraft" class="modal-backdrop" @click.self="confirmClearDraft = false">
        <div class="modal modal-sm">
          <div class="confirm-icon danger">
            <v-icon size="34" color="#e74c3c">mdi-delete-outline</v-icon>
          </div>
          <h3 class="confirm-title">Clear draft?</h3>
          <p class="confirm-text">
            This will reset your progress and start the form from the beginning.
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="confirmClearDraft = false">Keep</button>
            <button class="btn-danger" @click="clearDraftNow">Clear</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';
const DRAFT_KEY = 'nova:assessmentDraft:v1';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default {
  name: 'NewAssessmentPage',
  middleware: 'auth',

  data() {
    return {
      step: 1,
      totalSteps: 5,
      saving: false,
      error: '',
      showSuccess: false,
      scrolled: false,
      hasDraft: false,
      confirmClearDraft: false,

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
        { key: 'communication', label: 'Communication & speech',   icon: 'mdi-account-voice',           color: '#4a3b8c', bg: '#e6e0f5' },
        { key: 'movement',      label: 'Movement & coordination',  icon: 'mdi-human-handsup',           color: '#56c2d9', bg: '#d9f0f6' },
        { key: 'learning',      label: 'Learning & attention',     icon: 'mdi-brain',                   color: '#4a3b8c', bg: '#e6e0f5' },
        { key: 'social',        label: 'Social interaction',        icon: 'mdi-account-multiple-outline',color: '#e86a8a', bg: '#fce4ec' },
        { key: 'daily_living',  label: 'Daily living skills',       icon: 'mdi-home-outline',            color: '#56c2d9', bg: '#d9f0f6' },
        { key: 'behaviour',     label: 'Behaviour & emotions',      icon: 'mdi-emoticon-outline',        color: '#e86a8a', bg: '#fce4ec' },
        { key: 'sensory',       label: 'Sensory sensitivity',       icon: 'mdi-eye-outline',             color: '#4a3b8c', bg: '#e6e0f5' },
        { key: 'school',        label: 'School & learning support', icon: 'mdi-school',                  color: '#56c2d9', bg: '#d9f0f6' }
      ],

      concernPrompts: [
        'Not speaking yet',
        'Speech is unclear',
        'Difficulty at school',
        'Sensory sensitivities',
        'Challenging behaviour',
        'Trouble with focus'
      ],

      languages: ['English', 'Kiswahili', 'Both'],

      times: [
        { value: 'weekday_mornings',   label: 'Weekday mornings' },
        { value: 'weekday_afternoons', label: 'Weekday afternoons' },
        { value: 'weekday_evenings',   label: 'Weekday evenings' },
        { value: 'weekends',           label: 'Weekends' }
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
    stepTitle() {
      return ['Child', 'Concerns', 'Check', 'Preferences', 'Review'][this.step - 1] || '';
    },
    canProceed() {
      if (this.step === 1) return !!this.form.child_id;
      if (this.step === 2) return this.form.concerns.trim().length >= 10;
      return true;
    },
    canSubmit() {
      return !!this.form.child_id && this.form.concerns.trim().length >= 10;
    },
    answeredCount() {
      return Object.values(this.form.questionnaire).filter(Boolean).length;
    },
    selectedChild() {
      return this.children.find((c) => c.id === this.form.child_id) || null;
    },
    defaultCounty() {
      if (!this.children.length) return '';
      const first = this.children.find((c) => c.county);
      return first ? first.county : '';
    },
    preferredTimeLabel() {
      const t = this.times.find((x) => x.value === this.form.preferred_time);
      return t ? t.label : '';
    },
    budgetLabel() {
      const min = this.form.budget_min;
      const max = this.form.budget_max;
      if (!min && !max) return '';
      const fmt = (n) => Number(n || 0).toLocaleString('en-US');
      if (min && max) return `KSh ${fmt(min)}–${fmt(max)}`;
      if (min) return `From KSh ${fmt(min)}`;
      return `Up to KSh ${fmt(max)}`;
    },
    hasAnyPreference() {
      return !!(
        this.form.preferred_county ||
        this.form.preferred_language ||
        this.form.preferred_time ||
        this.form.budget_min ||
        this.form.budget_max
      );
    }
  },

  watch: {
    form: {
      deep: true,
      handler() {
        if (!this.showSuccess) this.saveDraft();
      }
    },
    step() {
      if (!this.showSuccess) this.saveDraft();
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });

    this.restoreDraft();
    this.loadChildren();

    const qChild = Number(this.$route.query.child);
    if (qChild) this.form.child_id = qChild;
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
      if (this.step > 1 && !this.showSuccess) {
        this.prev();
      } else {
        this.$router.push('/dashboard/parent?tab=assessments').catch(() => {});
      }
    },

    goToDashboard() {
      this.$router.push('/dashboard/parent').catch(() => {});
    },

    goToAssessments() {
      this.$router.push('/dashboard/parent?tab=assessments').catch(() => {});
    },

    goToAddChild() {
      this.$router.push('/dashboard/parent?tab=children').catch(() => {});
    },

    async loadChildren() {
      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(`${API}/api/children`, { headers });
        this.children = data.data || [];

        // Auto-select when only one child
        if (this.children.length === 1 && !this.form.child_id) {
          this.form.child_id = this.children[0].id;
        }

        // Prefill county from first child that has one
        if (!this.form.preferred_county && this.defaultCounty) {
          this.form.preferred_county = this.defaultCounty;
        }
      } catch (err) {
        console.warn('[assessment] load children failed', err.message);
      }
    },

    appendPrompt(text) {
      const current = this.form.concerns || '';
      if (!current) {
        this.form.concerns = text;
      } else if (!current.toLowerCase().includes(text.toLowerCase())) {
        const trimmed = current.replace(/[,\s]+$/, '');
        this.form.concerns = `${trimmed}, ${text.toLowerCase()}`;
      }
    },

    next() {
      if (!this.canProceed) return;
      this.error = '';
      if (this.step < this.totalSteps) {
        this.step++;
        this.scrollTop();
      }
    },

    prev() {
      this.error = '';
      if (this.step > 1) {
        this.step--;
        this.scrollTop();
      }
    },

    scrollTop() {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
    },

    /* ---- Draft persistence ---- */
    saveDraft() {
      try {
        const payload = { form: this.form, step: this.step, savedAt: Date.now() };
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
        this.hasDraft = true;
      } catch (e) {}
    },

    restoreDraft() {
      try {
        const raw = window.localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);

        // Drop stale drafts
        if (!parsed.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
          window.localStorage.removeItem(DRAFT_KEY);
          return;
        }

        if (parsed.form && typeof parsed.form === 'object') {
          this.form = { ...this.form, ...parsed.form };
          // Re-merge questionnaire so unknown keys don't survive
          this.form.questionnaire = {
            communication: '',
            movement: '',
            learning: '',
            social: '',
            daily_living: '',
            behaviour: '',
            sensory: '',
            school: '',
            ...(parsed.form.questionnaire || {})
          };
        }

        if (Number.isInteger(parsed.step) && parsed.step >= 1 && parsed.step <= this.totalSteps) {
          this.step = parsed.step;
        }

        this.hasDraft = true;
      } catch (e) {}
    },

    clearDraftNow() {
      try { window.localStorage.removeItem(DRAFT_KEY); } catch (e) {}

      this.form = {
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
      };
      this.step = 1;
      this.error = '';
      this.hasDraft = false;
      this.confirmClearDraft = false;
    },

    /* ---- Submit ---- */
    async submit() {
      if (!this.canSubmit || this.saving) return;
      this.error = '';
      this.saving = true;

      try {
        const headers = await this.authHeader();

        // Only send answered questionnaire keys
        const cleanQ = {};
        for (const [k, v] of Object.entries(this.form.questionnaire)) {
          if (v) cleanQ[k] = v;
        }

        const payload = {
          child_id: Number(this.form.child_id),
          concerns: this.form.concerns || null,
          questionnaire: cleanQ,
          preferred_county: this.form.preferred_county || null,
          preferred_language: this.form.preferred_language || null,
          preferred_time: this.form.preferred_time || null,
          budget_min: this.form.budget_min || null,
          budget_max: this.form.budget_max || null
        };

        await axios.post(`${API}/api/assessments/requests`, payload, { headers });

        try { window.localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        this.hasDraft = false;

        this.showSuccess = true;
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;
        const code = body?.error;

        if (status === 401) {
          this.error = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403 && code === 'child_not_owned') {
          this.error = "That child isn't linked to your account. Please refresh and try again.";
        } else if (status === 400) {
          this.error = {
            invalid_child_id: 'Something went wrong with the child selection.',
            concerns_too_short: 'Please describe your concern in a bit more detail (at least 10 characters).',
            concerns_too_long: 'Your concern is too long. Keep it under 2000 characters.',
            invalid_budget_min: 'Minimum budget must be a positive number.',
            invalid_budget_max: 'Maximum budget must be a positive number.',
            budget_max_lt_min: 'Maximum budget must be at least the minimum budget.'
          }[code] || body?.details?.[0]?.message || 'Please check the form.';
        } else {
          this.error = body?.message || 'Could not submit. Please try again.';
        }
        console.error('[assessment] submit failed', status, body);
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
    },
    truncate(text, n) {
      const t = String(text || '');
      return t.length > n ? `${t.slice(0, n)}…` : t;
    }
  }
};
</script>

<style scoped>
.assessment-page {
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
.topbar-title { font-size: 0.98rem; font-weight: 800; color: var(--ink); letter-spacing: -0.01em; }
.topbar-spacer { width: 38px; }

/* STEP DOTS + PROGRESS */
.progress-wrap {
  max-width: 640px; margin: 0 auto; padding: 20px 20px 0;
}
.step-dots {
  display: flex; align-items: center; justify-content: space-between;
  gap: 4px;
}
.step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  background: #ececf1;
  display: grid; place-items: center;
  color: var(--muted);
  font-size: 0.72rem; font-weight: 800;
  flex: 0 0 auto;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.step-dot.current {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff;
  box-shadow: 0 0 0 5px rgba(74, 59, 140, 0.14);
}
.step-dot.done {
  background: linear-gradient(135deg, var(--purple), var(--teal));
  color: #fff;
}
.step-line {
  flex: 1; height: 2px; background: #ececf1;
  border-radius: 2px;
  transition: background 0.3s ease;
}
.step-line.done { background: linear-gradient(90deg, var(--purple), var(--teal-2)); }

.progress-labels {
  display: flex; justify-content: space-between;
  font-size: 0.72rem; font-weight: 700;
  color: var(--muted);
  margin-top: 10px;
  text-transform: uppercase; letter-spacing: 0.06em;
}

/* MAIN */
.main { max-width: 640px; margin: 0 auto; padding: 24px 20px; }
.card {
  background: #fff; border-radius: 20px;
  padding: 28px 24px;
  border: 1px solid var(--line);
  box-shadow: 0 8px 32px -20px rgba(44, 62, 80, 0.18);
}

.title {
  font-size: 1.5rem; font-weight: 800;
  color: var(--ink); margin: 0 0 8px;
  letter-spacing: -0.02em; line-height: 1.2;
}
.subtitle {
  font-size: 0.9rem; color: var(--muted);
  margin: 0 0 24px; line-height: 1.55;
}

/* FORM */
.field-label {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.82rem; font-weight: 700; color: var(--ink);
  margin-bottom: 8px;
}
.field-hint { font-size: 0.72rem; font-weight: 600; color: var(--muted); }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 20px; }

.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #fff; color: var(--ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none; font-family: inherit;
  -webkit-appearance: none; appearance: none;
}
.text-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.textarea { resize: vertical; min-height: 130px; line-height: 1.6; }
select.text-input {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237f8c8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
}
.hint-left {
  font-size: 0.75rem; color: var(--muted);
  margin: 6px 0 0;
}

/* CHILD PICKER */
.child-picker { display: grid; gap: 10px; }
.child-option {
  display: flex; align-items: center; gap: 14px;
  padding: 14px;
  background: #f9fafc;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  text-align: left;
  width: 100%;
}
.child-option:hover:not(:disabled) { border-color: #c8c0e0; background: #fff; }
.child-option.active {
  border-color: var(--purple);
  background: #f7f5fd;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.child-option-avatar {
  width: 46px; height: 46px; border-radius: 13px;
  display: grid; place-items: center;
  color: #fff; font-weight: 800; font-size: 14px;
  flex: 0 0 auto; letter-spacing: 0.3px;
  box-shadow: 0 8px 18px -10px rgba(74, 59, 140, 0.5);
}
.child-option-body { flex: 1; min-width: 0; }
.child-option-name {
  font-size: 0.95rem; font-weight: 800; color: var(--ink);
  margin-bottom: 2px;
}
.child-option-meta { font-size: 0.78rem; color: var(--muted); }

.check-wrap {
  width: 24px; height: 24px; border-radius: 50%;
  background: #ececf1;
  display: grid; place-items: center;
  flex: 0 0 auto;
  transition: background 0.15s ease, transform 0.15s ease;
}
.check-wrap .v-icon { opacity: 0; transition: opacity 0.15s ease; }
.check-wrap.on {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  transform: scale(1.05);
}
.check-wrap.on .v-icon { opacity: 1; }

.empty-note {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 20px;
  background: linear-gradient(135deg, #f7f5ff, #f3f9fc);
  border: 1px dashed #d4dae4;
  border-radius: 16px;
  line-height: 1.5;
}
.empty-note-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: #e6e0f5;
  display: grid; place-items: center;
  flex: 0 0 auto;
}
.empty-note-body { flex: 1; min-width: 0; }
.empty-note-title { font-size: 0.95rem; font-weight: 800; color: var(--ink); margin-bottom: 3px; }
.empty-note-text { font-size: 0.85rem; color: var(--muted); }

/* PROMPT CHIPS */
.prompt-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.prompt-chip {
  padding: 6px 12px; border-radius: 999px;
  border: 1.5px dashed #d4dae4; background: transparent;
  color: var(--purple); font-size: 0.76rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
}
.prompt-chip:hover:not(:disabled) {
  border-style: solid; border-color: var(--purple);
  background: #f7f5fd;
}
.prompt-chip:disabled { opacity: 0.5; cursor: not-allowed; }

/* QUESTIONNAIRE */
.progress-note {
  background: #f3f7fb;
  border-radius: 12px;
  padding: 12px 14px;
}
.progress-note-head {
  display: flex; justify-content: space-between;
  font-size: 0.78rem; font-weight: 700;
  color: var(--muted); margin-bottom: 8px;
}
.progress-note-pct { color: var(--purple); }
.progress-note-track {
  height: 6px; background: #e5e9f0;
  border-radius: 999px; overflow: hidden;
}
.progress-note-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--purple), var(--teal-2));
  transition: width 0.4s ease;
}

.category-list { display: grid; gap: 22px; }
.category-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 10px;
}
.category-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center;
  flex: 0 0 auto;
}
.category-title {
  font-size: 0.9rem; font-weight: 700; color: var(--ink);
  flex: 1;
}
.category-answered {
  width: 22px; height: 22px; border-radius: 50%;
  background: #e6f9ee;
  display: grid; place-items: center;
  flex: 0 0 auto;
}

.option-row { display: flex; flex-wrap: wrap; gap: 6px; }
.option-chip {
  flex: 1; min-width: 80px;
  padding: 10px 8px; border-radius: 10px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--muted); font-size: 0.78rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s ease;
  font-family: inherit; min-height: 42px;
}
.option-chip:hover:not(:disabled) {
  border-color: #c8c0e0; color: var(--ink);
}
.option-chip.active.opt-no_concern {
  background: #e6f9ee; border-color: #229954; color: #229954;
}
.option-chip.active.opt-mild {
  background: #fef3e0; border-color: #b7791f; color: #b7791f;
}
.option-chip.active.opt-moderate {
  background: #fce4ec; border-color: #e86a8a; color: #c2185b;
}
.option-chip.active.opt-significant {
  background: #fdecea; border-color: #c0392b; color: #c0392b;
}
.option-chip:disabled { opacity: 0.6; cursor: not-allowed; }

/* CHIPS */
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 10px 18px; border-radius: 999px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s ease;
  font-family: inherit; min-height: 40px;
}
.chip:hover:not(:disabled) { border-color: var(--purple); color: var(--purple); }
.chip.active {
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; border-color: var(--purple);
  box-shadow: 0 8px 16px -8px rgba(74, 59, 140, 0.5);
}
.chip:disabled { opacity: 0.6; cursor: not-allowed; }

/* BUDGET */
.budget-row { display: flex; align-items: center; gap: 10px; }
.budget-row .text-input { flex: 1; }
.budget-sep { color: var(--muted); font-weight: 700; }

/* REVIEW */
.review-block {
  display: grid; gap: 10px;
}
.review-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  background: #f9fafc;
  border: 1px solid var(--line);
  border-radius: 12px;
}
.review-label {
  flex: 0 0 100px;
  font-size: 0.7rem; font-weight: 800;
  color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  padding-top: 2px;
}
.review-value {
  flex: 1; min-width: 0;
  font-size: 0.88rem; color: var(--ink); font-weight: 600;
  line-height: 1.5; word-break: break-word;
}
.review-value .muted { color: var(--muted); font-weight: 500; font-style: italic; }
.review-edit {
  flex: 0 0 auto;
  background: transparent; border: none;
  color: var(--purple); font-size: 0.76rem; font-weight: 800;
  cursor: pointer; font-family: inherit; padding: 4px 6px;
  border-radius: 6px;
}
.review-edit:hover { background: #ede7f8; }

/* INFO / ERROR */
.info-box {
  display: flex; align-items: flex-start; gap: 8px;
  background: #ede7f8;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.82rem; color: var(--purple);
  line-height: 1.55;
}
.error-box {
  padding: 12px 14px;
  background: #fdecea; color: #c0392b;
  border-radius: 12px;
  font-size: 0.85rem; font-weight: 500;
  display: flex; align-items: flex-start;
  line-height: 1.45;
}
.error-box .v-icon { margin-top: 1px; flex: 0 0 auto; }

/* ACTIONS */
.actions {
  display: flex; gap: 10px;
  margin-top: 32px; padding-top: 24px;
  border-top: 1px solid #f0f0f5;
}
.btn-secondary {
  flex: 0 0 auto;
  padding: 14px 22px; border-radius: 12px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.92rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s ease;
  font-family: inherit; min-height: 50px;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-secondary:hover:not(:disabled) {
  border-color: #c8c0e0; background: #f7f8fb;
}
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary {
  flex: 1;
  padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.92rem; font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  font-family: inherit;
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 50px;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
.btn-primary:active:not(:disabled) { transform: translateY(0) scale(0.995); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

/* MODAL */
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
.modal-sm { max-width: 400px; }
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
.confirm-icon {
  width: 68px; height: 68px; border-radius: 50%;
  background: #fdecea;
  display: grid; place-items: center;
  margin: 4px auto 14px;
}
.modal-title {
  font-size: 1.15rem; font-weight: 800;
  color: var(--ink); margin: 0 0 8px;
}
.modal-text {
  font-size: 0.9rem; color: var(--muted);
  line-height: 1.6; margin: 0 0 24px;
}
.confirm-title {
  font-size: 1.05rem; font-weight: 800;
  color: var(--ink); margin: 0 0 8px;
}
.confirm-text {
  font-size: 0.88rem; color: var(--muted);
  line-height: 1.55; margin: 0 0 20px;
}
.modal-actions {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
.modal-actions button { min-width: 130px; }

/* TRANSITIONS */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-slide-enter { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-6px); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
}
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal {
  transform: translateY(20px) scale(0.97); opacity: 0;
}

/* MOBILE */
@media (max-width: 599px) {
  .main { padding: 18px 14px; }
  .card { padding: 22px 18px; border-radius: 18px; }
  .title { font-size: 1.3rem; }
  .actions { flex-direction: column-reverse; }
  .btn-secondary { width: 100%; }
  .option-chip { flex: 1 0 45%; }
  .review-row { flex-wrap: wrap; }
  .review-label { flex: 0 0 100%; padding-bottom: 2px; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; min-width: 0; }
  .step-dot { width: 24px; height: 24px; font-size: 0.66rem; }
}
</style>