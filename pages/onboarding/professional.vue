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
        <!-- STEP 1: PROFILE -->
        <div v-if="step === 1">
          <h1 class="title">Your professional practice</h1>
          <p class="subtitle">
            Tell us who you are and what you do. This is what families will see.
          </p>

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
            placeholder="e.g. 5"
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
              <v-icon
                v-if="form.languages.includes(l)"
                x-small
                color="white"
                class="mr-1"
              >mdi-check</v-icon>
              {{ l }}
            </button>
          </div>

          <label class="field-label mt-4">Short bio</label>
          <textarea
            v-model.trim="form.bio"
            rows="4"
            placeholder="Tell families about your approach, background, and the children you work with best."
            class="text-input textarea"
            :disabled="saving"
          ></textarea>
          <p class="hint">{{ form.bio.length }}/1000 characters</p>
        </div>

        <!-- STEP 2: LOCATION & PRICING -->
        <div v-else-if="step === 2">
          <h1 class="title">Where you work and what you charge</h1>
          <p class="subtitle">
            This helps us match you with families near you and within their budget.
          </p>

          <label class="field-label">County</label>
          <select v-model="form.county" class="text-input" :disabled="saving">
            <option value="">Select a county</option>
            <option v-for="c in counties" :key="c" :value="c">{{ c }}</option>
          </select>

          <label class="field-label mt-4">Area or neighbourhood (optional)</label>
          <input
            v-model.trim="form.area"
            type="text"
            placeholder="e.g. Kilimani"
            class="text-input"
            :disabled="saving"
          />

          <label class="field-label mt-4">Do you offer online sessions?</label>
          <div class="chip-row">
            <button
              type="button"
              class="chip"
              :class="{ active: form.online === true }"
              :disabled="saving"
              @click="form.online = true"
            >
              <v-icon x-small class="mr-1">mdi-video-outline</v-icon>
              Yes, I offer online
            </button>
            <button
              type="button"
              class="chip"
              :class="{ active: form.online === false }"
              :disabled="saving"
              @click="form.online = false"
            >
              <v-icon x-small class="mr-1">mdi-map-marker-outline</v-icon>
              In-person only
            </button>
          </div>

          <label class="field-label mt-4">Typical session price (KSh)</label>
          <div class="budget-row">
            <input
              v-model.number="form.price_min"
              type="number"
              min="0"
              step="100"
              placeholder="Min"
              class="text-input"
              :disabled="saving"
            />
            <span class="budget-sep">–</span>
            <input
              v-model.number="form.price_max"
              type="number"
              min="0"
              step="100"
              placeholder="Max"
              class="text-input"
              :disabled="saving"
            />
          </div>
          <p class="hint">Per session. You can change this later.</p>
        </div>

        <!-- STEP 3: DOCUMENTS -->
        <div v-else-if="step === 3">
          <h1 class="title">Verification documents</h1>
          <p class="subtitle">
            We verify every professional on Nova. Upload a file or paste a link —
            whichever is easier. Your documents are encrypted and reviewed only by our
            verification team.
          </p>

          <!-- ID -->
          <div class="upload-block">
            <label class="field-label">National ID or passport</label>
            <div class="upload-row">
              <input
                ref="idInput"
                type="file"
                accept="image/*,.pdf"
                class="hidden-input"
                :disabled="saving || uploading.id"
                @change="(e) => handleUpload(e, 'id')"
              />
              <button
                type="button"
                class="upload-btn"
                :class="{ done: form.id_doc_url && !form.id_url_pasted }"
                :disabled="saving || uploading.id"
                @click="$refs.idInput.click()"
              >
                <v-icon
                  small
                  :color="form.id_doc_url && !form.id_url_pasted ? '#229954' : '#4a3b8c'"
                >
                  {{ form.id_doc_url && !form.id_url_pasted ? 'mdi-check-circle' : 'mdi-upload' }}
                </v-icon>
                <span>
                  {{ uploading.id
                    ? 'Uploading…'
                    : (form.id_doc_url && !form.id_url_pasted ? 'Uploaded' : 'Upload file') }}
                </span>
              </button>
              <button
                type="button"
                class="paste-btn"
                :disabled="saving || uploading.id"
                @click="openPaste('id')"
              >
                <v-icon small color="#4a3b8c">mdi-link-variant</v-icon>
                <span>Paste URL</span>
              </button>
              <button
                v-if="form.id_doc_url"
                type="button"
                class="clear-btn"
                @click="clearDoc('id')"
              >
                <v-icon x-small>mdi-close</v-icon>
              </button>
            </div>
            <div v-if="form.id_doc_url" class="doc-preview">
              <v-icon x-small color="#229954" class="mr-1">mdi-check-circle</v-icon>
              <span class="doc-preview-label">
                {{ form.id_url_pasted ? 'URL provided' : 'File uploaded' }}
              </span>
              <a
                :href="form.id_doc_url"
                target="_blank"
                rel="noopener"
                class="doc-preview-link"
              >View</a>
            </div>
          </div>

          <!-- Qualification -->
          <div class="upload-block">
            <label class="field-label">Professional qualification / certificate</label>
            <div class="upload-row">
              <input
                ref="qualInput"
                type="file"
                accept="image/*,.pdf"
                class="hidden-input"
                :disabled="saving || uploading.qual"
                @change="(e) => handleUpload(e, 'qual')"
              />
              <button
                type="button"
                class="upload-btn"
                :class="{ done: form.qualification_doc_url && !form.qual_url_pasted }"
                :disabled="saving || uploading.qual"
                @click="$refs.qualInput.click()"
              >
                <v-icon
                  small
                  :color="form.qualification_doc_url && !form.qual_url_pasted ? '#229954' : '#4a3b8c'"
                >
                  {{ form.qualification_doc_url && !form.qual_url_pasted ? 'mdi-check-circle' : 'mdi-upload' }}
                </v-icon>
                <span>
                  {{ uploading.qual
                    ? 'Uploading…'
                    : (form.qualification_doc_url && !form.qual_url_pasted ? 'Uploaded' : 'Upload file') }}
                </span>
              </button>
              <button
                type="button"
                class="paste-btn"
                :disabled="saving || uploading.qual"
                @click="openPaste('qual')"
              >
                <v-icon small color="#4a3b8c">mdi-link-variant</v-icon>
                <span>Paste URL</span>
              </button>
              <button
                v-if="form.qualification_doc_url"
                type="button"
                class="clear-btn"
                @click="clearDoc('qual')"
              >
                <v-icon x-small>mdi-close</v-icon>
              </button>
            </div>
            <div v-if="form.qualification_doc_url" class="doc-preview">
              <v-icon x-small color="#229954" class="mr-1">mdi-check-circle</v-icon>
              <span class="doc-preview-label">
                {{ form.qual_url_pasted ? 'URL provided' : 'File uploaded' }}
              </span>
              <a
                :href="form.qualification_doc_url"
                target="_blank"
                rel="noopener"
                class="doc-preview-link"
              >View</a>
            </div>
          </div>

          <!-- Licence -->
          <div class="upload-block">
            <label class="field-label">
              Practising licence
              <span class="optional">(if applicable)</span>
            </label>
            <div class="upload-row">
              <input
                ref="licInput"
                type="file"
                accept="image/*,.pdf"
                class="hidden-input"
                :disabled="saving || uploading.lic"
                @change="(e) => handleUpload(e, 'lic')"
              />
              <button
                type="button"
                class="upload-btn"
                :class="{ done: form.licence_doc_url && !form.lic_url_pasted }"
                :disabled="saving || uploading.lic"
                @click="$refs.licInput.click()"
              >
                <v-icon
                  small
                  :color="form.licence_doc_url && !form.lic_url_pasted ? '#229954' : '#4a3b8c'"
                >
                  {{ form.licence_doc_url && !form.lic_url_pasted ? 'mdi-check-circle' : 'mdi-upload' }}
                </v-icon>
                <span>
                  {{ uploading.lic
                    ? 'Uploading…'
                    : (form.licence_doc_url && !form.lic_url_pasted ? 'Uploaded' : 'Upload file') }}
                </span>
              </button>
              <button
                type="button"
                class="paste-btn"
                :disabled="saving || uploading.lic"
                @click="openPaste('lic')"
              >
                <v-icon small color="#4a3b8c">mdi-link-variant</v-icon>
                <span>Paste URL</span>
              </button>
              <button
                v-if="form.licence_doc_url"
                type="button"
                class="clear-btn"
                @click="clearDoc('lic')"
              >
                <v-icon x-small>mdi-close</v-icon>
              </button>
            </div>
            <div v-if="form.licence_doc_url" class="doc-preview">
              <v-icon x-small color="#229954" class="mr-1">mdi-check-circle</v-icon>
              <span class="doc-preview-label">
                {{ form.lic_url_pasted ? 'URL provided' : 'File uploaded' }}
              </span>
              <a
                :href="form.licence_doc_url"
                target="_blank"
                rel="noopener"
                class="doc-preview-link"
              >View</a>
            </div>
          </div>

          <!-- References -->
          <label class="field-label mt-4">References (optional)</label>
          <textarea
            v-model.trim="referencesText"
            rows="3"
            placeholder="Name, relationship, and contact for up to 2 references. One per line."
            class="text-input textarea"
            :disabled="saving"
          ></textarea>
          <p class="hint">Separate references with a new line.</p>

          <div class="info-box mt-4">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-shield-lock-outline</v-icon>
            <span>
              Only our verification team sees these documents. They are never
              shown to families.
            </span>
          </div>
        </div>

        <!-- STEP 4: REVIEW -->
        <div v-else>
          <h1 class="title">Review and submit</h1>
          <p class="subtitle">
            Once submitted, our team reviews your application. This usually takes
            1–2 working days.
          </p>

          <div class="review-block">
            <div class="review-row">
              <div class="review-label">Name</div>
              <div class="review-value">{{ userName || '—' }}</div>
            </div>
            <div class="review-row">
              <div class="review-label">Type</div>
              <div class="review-value">{{ typeLabel(form.type) || '—' }}</div>
            </div>
            <div class="review-row">
              <div class="review-label">Experience</div>
              <div class="review-value">
                {{ form.years_experience ? `${form.years_experience} years` : '—' }}
              </div>
            </div>
            <div class="review-row">
              <div class="review-label">Languages</div>
              <div class="review-value">{{ form.languages.join(', ') || '—' }}</div>
            </div>
            <div class="review-row">
              <div class="review-label">Location</div>
              <div class="review-value">
                {{ form.county || '—' }}<span v-if="form.area">, {{ form.area }}</span>
              </div>
            </div>
            <div class="review-row">
              <div class="review-label">Session type</div>
              <div class="review-value">
                {{ form.online ? 'In person & online' : 'In person' }}
              </div>
            </div>
            <div class="review-row">
              <div class="review-label">Price range</div>
              <div class="review-value">
                <template v-if="form.price_min || form.price_max">
                  KSh {{ form.price_min || '0' }} – {{ form.price_max || '—' }}
                </template>
                <template v-else>—</template>
              </div>
            </div>
            <div class="review-row">
              <div class="review-label">Documents</div>
              <div class="review-value">
                <span v-if="form.id_doc_url" class="doc-check">ID</span>
                <span v-if="form.qualification_doc_url" class="doc-check">Qualification</span>
                <span v-if="form.licence_doc_url" class="doc-check">Licence</span>
                <span
                  v-if="!form.id_doc_url && !form.qualification_doc_url && !form.licence_doc_url"
                >—</span>
              </div>
            </div>
          </div>

          <div class="info-box mt-4">
            <v-icon small color="#4a3b8c" class="mr-2">mdi-information-outline</v-icon>
            <span>
              By submitting, you agree that Nova may verify the information
              and documents provided.
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
              Submit for review
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

    <!-- PASTE URL MODAL -->
    <div
      v-if="pasteModal.open"
      class="modal-backdrop"
      @click.self="closePaste"
    >
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">{{ pasteModal.title }}</div>
          <button class="modal-close" @click="closePaste" aria-label="Close">
            <v-icon small color="#7f8c8d">mdi-close</v-icon>
          </button>
        </div>

        <div class="modal-body">
          <p class="paste-hint">
            Paste a link to the document. It can be hosted anywhere — Google Drive,
            Dropbox, or your own website. Make sure the link is publicly viewable.
          </p>

          <label class="field-label">Document URL</label>
          <input
            v-model.trim="pasteModal.url"
            type="url"
            placeholder="https://drive.google.com/file/d/..."
            class="text-input"
            autofocus
            @keyup.enter="confirmPaste"
          />

          <div v-if="pasteModal.error" class="error-box mt-3">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ pasteModal.error }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="closePaste">Cancel</button>
          <button class="btn-primary" @click="confirmPaste">
            Save URL
            <v-icon small color="white" class="ml-2">mdi-check</v-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- SUCCESS MODAL -->
    <div v-if="showSuccess" class="modal-backdrop">
      <div class="modal">
        <div class="success-icon">
          <v-icon size="42" color="#229954">mdi-check</v-icon>
        </div>
        <h3 class="modal-title">Application submitted</h3>
        <p class="modal-text">
          Our team will review your credentials and get back to you within
          1–2 working days. You'll be able to see bookings once verified.
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
  name: 'ProfessionalOnboardingPage',
  middleware: 'auth',

  data() {
    return {
      step: 1,
      totalSteps: 4,
      saving: false,
      error: '',
      showSuccess: false,
      userName: '',

      uploading: { id: false, qual: false, lic: false },

      form: {
        type: '',
        bio: '',
        languages: ['English'],
        county: '',
        area: '',
        online: true,
        years_experience: null,
        price_min: null,
        price_max: null,
        id_doc_url: '',
        qualification_doc_url: '',
        licence_doc_url: '',
        // flags: true when the URL came from Paste, false when uploaded
        id_url_pasted: false,
        qual_url_pasted: false,
        lic_url_pasted: false
      },

      referencesText: '',

      pasteModal: {
        open: false,
        kind: '',
        title: '',
        url: '',
        error: ''
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
      ]
    };
  },

  computed: {
    progressPct() {
      return (this.step / this.totalSteps) * 100;
    },
    stepTitle() {
      return ['Profile', 'Location & pricing', 'Documents', 'Review'][this.step - 1] || '';
    },
    canProceed() {
      if (this.step === 1) {
        return this.form.type
          && this.form.languages.length > 0
          && this.form.bio.trim().length >= 30;
      }
      if (this.step === 2) {
        return !!this.form.county;
      }
      if (this.step === 3) {
        return !!this.form.id_doc_url && !!this.form.qualification_doc_url;
      }
      return true;
    },
    canSubmit() {
      return !!this.form.type
        && !!this.form.county
        && !!this.form.id_doc_url
        && !!this.form.qualification_doc_url;
    }
  },

  mounted() {
    const auth = this._fbAuth();
    const user = auth?.currentUser;
    if (user) {
      this.userName = user.displayName || user.email || '';
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

    _fbStorage() {
      const fb = this.$firebase;
      if (!fb) return null;
      if (typeof fb.storage === 'function') return fb.storage();
      return fb.storage || null;
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
        this.$router.push('/dashboard/professional').catch(() => {});
      }
    },

    goToDashboard() {
      this.$router.push('/dashboard/professional').catch(() => {});
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

    toggleLanguage(l) {
      const i = this.form.languages.indexOf(l);
      if (i >= 0) this.form.languages.splice(i, 1);
      else this.form.languages.push(l);
    },

    /* ---------------- File upload ---------------- */
    async handleUpload(event, kind) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.error = 'File is too large. Max 10 MB.';
        event.target.value = '';
        return;
      }

      const auth = this._fbAuth();
      const user = auth?.currentUser;
      if (!user) {
        this.error = 'You must be signed in to upload.';
        event.target.value = '';
        return;
      }

      const storage = this._fbStorage();
      if (!storage) {
        this.error =
          'File upload is not available right now. Use "Paste URL" instead.';
        event.target.value = '';
        return;
      }

      const mapping = {
        id: {
          flag: 'id',
          field: 'id_doc_url',
          pastedFlag: 'id_url_pasted',
          prefix: 'id'
        },
        qual: {
          flag: 'qual',
          field: 'qualification_doc_url',
          pastedFlag: 'qual_url_pasted',
          prefix: 'qualification'
        },
        lic: {
          flag: 'lic',
          field: 'licence_doc_url',
          pastedFlag: 'lic_url_pasted',
          prefix: 'licence'
        }
      };
      const m = mapping[kind];
      if (!m) return;

      this.uploading[m.flag] = true;
      this.error = '';

      try {
        const ext = file.name.split('.').pop() || 'bin';
        const path = `verifications/${user.uid}/${m.prefix}_${Date.now()}.${ext}`;
        const ref = storage.ref().child(path);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        this.form[m.field] = url;
        this.form[m.pastedFlag] = false;
      } catch (err) {
        console.error('[upload] failed', err);
        this.error =
          'Upload failed: ' +
          (err.message || 'unknown error') +
          '. You can try again, or use "Paste URL" instead.';
      } finally {
        this.uploading[m.flag] = false;
        event.target.value = '';
      }
    },

    /* ---------------- Paste URL ---------------- */
    openPaste(kind) {
      const titles = {
        id: 'Paste ID document URL',
        qual: 'Paste qualification URL',
        lic: 'Paste licence URL'
      };
      this.pasteModal = {
        open: true,
        kind,
        title: titles[kind] || 'Paste URL',
        url: '',
        error: ''
      };
    },

    closePaste() {
      this.pasteModal = {
        open: false,
        kind: '',
        title: '',
        url: '',
        error: ''
      };
    },

    confirmPaste() {
      const url = (this.pasteModal.url || '').trim();

      if (!url) {
        this.pasteModal.error = 'Please paste a URL.';
        return;
      }

      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          this.pasteModal.error = 'URL must start with http:// or https://';
          return;
        }
      } catch (e) {
        this.pasteModal.error = 'That doesn\u2019t look like a valid URL.';
        return;
      }

      const mapping = {
        id: { field: 'id_doc_url', flag: 'id_url_pasted' },
        qual: { field: 'qualification_doc_url', flag: 'qual_url_pasted' },
        lic: { field: 'licence_doc_url', flag: 'lic_url_pasted' }
      };
      const m = mapping[this.pasteModal.kind];
      if (!m) return;

      this.form[m.field] = url;
      this.form[m.flag] = true;
      this.closePaste();
    },

    clearDoc(kind) {
      const mapping = {
        id: { field: 'id_doc_url', flag: 'id_url_pasted' },
        qual: { field: 'qualification_doc_url', flag: 'qual_url_pasted' },
        lic: { field: 'licence_doc_url', flag: 'lic_url_pasted' }
      };
      const m = mapping[kind];
      if (!m) return;
      this.form[m.field] = '';
      this.form[m.flag] = false;
    },

    /* ---------------- Submit ---------------- */
    parseReferences() {
      return this.referencesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    },

    async submit() {
      if (!this.canSubmit || this.saving) return;
      this.error = '';
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
          price_max: this.form.price_max || null,
          id_doc_url: this.form.id_doc_url || null,
          qualification_doc_url: this.form.qualification_doc_url || null,
          licence_doc_url: this.form.licence_doc_url || null,
          references_json: this.parseReferences()
        };

        await axios.post(
          `${API}/api/professionals/me/verification`,
          payload,
          { headers }
        );

        this.showSuccess = true;
      } catch (err) {
        const status = err.response?.status;
        const body = err.response?.data;

        if (status === 401) {
          this.error = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          this.error =
            'You don\u2019t have permission to submit this. Contact support.';
        } else if (status === 400) {
          this.error =
            body?.details?.[0]?.message || body?.error || 'Please check the form.';
        } else {
          this.error = body?.message || 'Could not submit. Please try again.';
        }
        console.error('[pro onboarding] submit failed', status, body);
      } finally {
        this.saving = false;
      }
    },

    typeLabel(t) {
      const found = this.types.find((x) => x.value === t);
      return found ? found.label : '';
    }
  }
};
</script>

<style scoped>
/* ============================================================
   LAYOUT
   ============================================================ */
.onboarding {
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
.optional {
  font-weight: 500;
  color: #95a5a6;
  font-size: 0.76rem;
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

/* UPLOAD */
.upload-block { margin-bottom: 16px; }
.upload-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hidden-input { display: none; }

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1.5px dashed #c8c0e0;
  background: #f9fafc;
  color: #4a3b8c;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  flex: 1;
  min-height: 48px;
}
.upload-btn:hover:not(:disabled) {
  border-color: #4a3b8c;
  background: #ffffff;
}
.upload-btn.done {
  border-style: solid;
  border-color: #229954;
  background: #e6f9ee;
  color: #229954;
}
.upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.paste-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #4a3b8c;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  min-height: 48px;
  white-space: nowrap;
}
.paste-btn:hover:not(:disabled) {
  border-color: #4a3b8c;
  background: #f7f5fd;
}
.paste-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.clear-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #7f8c8d;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-family: inherit;
}
.clear-btn:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.doc-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #e6f9ee;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #229954;
  font-weight: 600;
}
.doc-preview-label { flex: 1; }
.doc-preview-link {
  color: #229954;
  text-decoration: underline;
  font-weight: 700;
}

/* HINT */
.hint {
  font-size: 0.78rem;
  color: #95a5a6;
  margin: 8px 0 0;
  line-height: 1.5;
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

/* REVIEW */
.review-block {
  background: #f9fafc;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 8px;
}
.review-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #eef0f5;
}
.review-row:last-child { border-bottom: none; }
.review-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  flex: 0 0 auto;
}
.review-value {
  font-size: 0.88rem;
  color: #2c3e50;
  font-weight: 600;
  text-align: right;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}
.doc-check {
  display: inline-block;
  padding: 2px 8px;
  margin-left: 4px;
  background: #e6f9ee;
  color: #229954;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2px;
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
.btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

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
  padding: 24px;
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
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

.paste-hint {
  font-size: 0.82rem;
  color: #7f8c8d;
  line-height: 1.55;
  margin: 0 0 16px;
  padding: 12px 14px;
  background: #f3f7fb;
  border-radius: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f5;
  justify-content: flex-end;
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
  text-align: center;
}

/* Success modal centers content */
.modal-backdrop > .modal:last-child {
  text-align: center;
}
.modal-backdrop > .modal:last-child .modal-actions {
  justify-content: center;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .card { padding: 24px 20px; }
  .title { font-size: 1.3rem; }
  .actions { flex-direction: column-reverse; }
  .btn-secondary { width: 100%; }
  .review-row {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  .review-value { text-align: left; }

  /* Stack upload + paste + clear */
  .upload-row { flex-wrap: wrap; }
  .upload-btn { flex: 1 1 100%; }
  .paste-btn { flex: 1; }
  .clear-btn { flex: 0 0 auto; }
}
</style>