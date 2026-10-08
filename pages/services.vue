<template>
  <div class="services-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">My services</div>
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
        <h2>Could not load services</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">Try again</button>
      </section>

      <template v-else>
        <!-- SUMMARY CARD -->
        <section class="summary-card">
          <div class="summary-stat">
            <div class="summary-value">{{ services.length }}</div>
            <div class="summary-label">{{ services.length === 1 ? 'Service' : 'Services' }}</div>
          </div>
          <div class="summary-divider" />
          <div class="summary-stat">
            <div class="summary-value">
              {{ avgPrice ? `KSh ${avgPrice}` : '—' }}
            </div>
            <div class="summary-label">Average price</div>
          </div>
          <div class="summary-divider" />
          <div class="summary-stat">
            <div class="summary-value">{{ avgDuration ? `${avgDuration}m` : '—' }}</div>
            <div class="summary-label">Avg duration</div>
          </div>
        </section>

        <!-- ADD BUTTON -->
        <button class="add-btn" @click="openModal()">
          <v-icon small color="white" class="mr-2">mdi-plus</v-icon>
          Add a service
        </button>

        <!-- EMPTY -->
        <section v-if="!services.length" class="empty-card">
          <div class="empty-icon">
            <v-icon size="48" color="#4a3b8c">mdi-tag-outline</v-icon>
          </div>
          <h2>No services yet</h2>
          <p>
            Add the services you offer — session types, prices, and durations.
            Parents will see these on your profile.
          </p>
        </section>

        <!-- SERVICES LIST -->
        <section v-else class="services-list">
          <div v-for="s in services" :key="s.id" class="service-card">
            <div class="service-head">
              <div class="service-icon" :style="{ background: iconBg(s.type) }">
                <v-icon small :color="iconColor(s.type)">{{ iconFor(s.type) }}</v-icon>
              </div>
              <div class="service-body">
                <div class="service-name">{{ s.type }}</div>
                <div class="service-chips">
                  <span class="chip-meta">
                    <v-icon x-small color="#7f8c8d" class="mr-1">mdi-cash</v-icon>
                    KSh {{ formatPrice(s.price) }}
                  </span>
                  <span class="chip-meta">
                    <v-icon x-small color="#7f8c8d" class="mr-1">mdi-clock-outline</v-icon>
                    {{ s.duration_minutes }} min
                  </span>
                  <span
                    class="chip-meta"
                    :class="s.active ? 'chip-active' : 'chip-inactive'"
                  >
                    {{ s.active ? 'Active' : 'Hidden' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="s.description" class="service-desc">
              {{ s.description }}
            </div>

            <div class="service-actions">
              <button class="action-btn" @click="openModal(s)">
                <v-icon x-small color="#4a3b8c" class="mr-1">mdi-pencil</v-icon>
                Edit
              </button>
              <button
                class="action-btn"
                :disabled="toggling === s.id"
                @click="toggleActive(s)"
              >
                <v-icon x-small color="#b7791f" class="mr-1">
                  {{ s.active ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
                </v-icon>
                {{ s.active ? 'Hide' : 'Show' }}
              </button>
              <button
                class="action-btn danger"
                :disabled="deleting === s.id"
                @click="confirmDelete(s)"
              >
                <v-icon x-small color="#e74c3c" class="mr-1">mdi-delete-outline</v-icon>
                Delete
              </button>
            </div>
          </div>
        </section>

        <!-- TIP -->
        <div v-if="services.length" class="tip-box">
          <v-icon small color="#4a3b8c" class="mr-2">mdi-lightbulb-outline</v-icon>
          <span>
            Services marked <strong>Hidden</strong> won't appear on your public profile
            but are kept for your records.
          </span>
        </div>
      </template>
    </main>

    <!-- SERVICE MODAL -->
    <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">{{ modal.editing ? 'Edit service' : 'Add a service' }}</div>
          <button class="modal-close" @click="closeModal" aria-label="Close">
            <v-icon small color="#7f8c8d">mdi-close</v-icon>
          </button>
        </div>

        <div class="modal-body">
          <label class="field-label">Service name</label>
          <input
            v-model.trim="modal.type"
            type="text"
            placeholder="e.g. Speech therapy session"
            class="text-input"
            :disabled="modal.saving"
          />

          <label class="field-label mt-4">Description (optional)</label>
          <textarea
            v-model.trim="modal.description"
            rows="3"
            placeholder="What does this session include? Who is it for?"
            class="text-input textarea"
            :disabled="modal.saving"
          ></textarea>

          <div class="field-row mt-4">
            <div class="field-col">
              <label class="field-label">Price (KSh)</label>
              <input
                v-model.number="modal.price"
                type="number"
                min="0"
                step="100"
                placeholder="2000"
                class="text-input"
                :disabled="modal.saving"
              />
            </div>
            <div class="field-col">
              <label class="field-label">Duration (min)</label>
              <input
                v-model.number="modal.duration_minutes"
                type="number"
                min="15"
                step="15"
                placeholder="60"
                class="text-input"
                :disabled="modal.saving"
              />
            </div>
          </div>

          <div class="preset-row mt-4">
            <button
              v-for="p in presets"
              :key="p.label"
              type="button"
              class="preset-chip"
              :disabled="modal.saving"
              @click="applyPreset(p)"
            >
              {{ p.label }}
            </button>
          </div>

          <div v-if="modal.error" class="error-box mt-4">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ modal.error }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" :disabled="modal.saving" @click="closeModal">
            Cancel
          </button>
          <button
            class="btn-primary"
            :disabled="!canSave || modal.saving"
            @click="save"
          >
            <span v-if="!modal.saving">
              {{ modal.editing ? 'Save changes' : 'Add service' }}
              <v-icon small color="white" class="ml-2">mdi-check</v-icon>
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="16" width="2" color="white" />
              <span class="ml-2">Saving…</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <h3 class="modal-title">Delete service?</h3>
        <p class="modal-text">
          <strong>{{ deleteTarget.type }}</strong> will be permanently removed
          from your profile. Existing bookings aren't affected.
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn-danger" :disabled="deleting" @click="deleteService">
            {{ deleting ? 'Deleting…' : 'Delete' }}
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
  name: 'ServicesPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',

      services: [],
      toggling: null,
      deleting: null,
      deleteTarget: null,

      modal: {
        open: false,
        editing: null,
        saving: false,
        error: '',
        type: '',
        description: '',
        price: null,
        duration_minutes: 60
      },

      presets: [
        { label: '30 min · KSh 1,500', price: 1500, duration_minutes: 30 },
        { label: '45 min · KSh 2,000', price: 2000, duration_minutes: 45 },
        { label: '60 min · KSh 2,500', price: 2500, duration_minutes: 60 },
        { label: '90 min · KSh 3,500', price: 3500, duration_minutes: 90 }
      ]
    };
  },

  computed: {
    avgPrice() {
      if (!this.services.length) return null;
      const sum = this.services.reduce((acc, s) => acc + Number(s.price || 0), 0);
      return Math.round(sum / this.services.length).toLocaleString('en-US');
    },
    avgDuration() {
      if (!this.services.length) return null;
      const sum = this.services.reduce((acc, s) => acc + Number(s.duration_minutes || 0), 0);
      return Math.round(sum / this.services.length);
    },
    canSave() {
      const m = this.modal;
      return !!m.type
        && m.type.length >= 3
        && m.price !== null
        && Number(m.price) >= 0
        && m.duration_minutes
        && Number(m.duration_minutes) >= 15;
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
      this.$router.push('/dashboard/professional').catch(() => {});
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

        const { data } = await axios.get(`${API}/api/services`, { headers });
        this.services = data.data || [];
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else if (status === 403) {
          this.loadError = 'You don\'t have professional access.';
        } else {
          this.loadError = 'Could not load services. Please try again.';
        }
        console.error('[services] load failed', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    openModal(s = null) {
      this.modal = {
        open: true,
        editing: s,
        saving: false,
        error: '',
        type: s?.type || '',
        description: s?.description || '',
        price: s?.price ? Number(s.price) : null,
        duration_minutes: s?.duration_minutes || 60
      };
    },

    closeModal() {
      this.modal.open = false;
    },

    applyPreset(p) {
      this.modal.price = p.price;
      this.modal.duration_minutes = p.duration_minutes;
    },

    async save() {
      if (!this.canSave || this.modal.saving) return;
      this.modal.saving = true;
      this.modal.error = '';

      try {
        const headers = await this.authHeader();
        const payload = {
          type: this.modal.type,
          description: this.modal.description || null,
          price: this.modal.price,
          duration_minutes: this.modal.duration_minutes
        };

        if (this.modal.editing) {
          await axios.patch(
            `${API}/api/services/${this.modal.editing.id}`,
            payload,
            { headers }
          );
        } else {
          await axios.post(`${API}/api/services`, payload, { headers });
        }

        this.closeModal();
        await this.load();
      } catch (err) {
        this.modal.error =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Could not save. Please try again.';
        console.error('[services] save failed', err.response?.data);
      } finally {
        this.modal.saving = false;
      }
    },

    async toggleActive(s) {
      if (this.toggling) return;
      this.toggling = s.id;
      try {
        const headers = await this.authHeader();
        await axios.patch(
          `${API}/api/services/${s.id}`,
          { active: !s.active },
          { headers }
        );
        s.active = !s.active;
      } catch (err) {
        alert('Could not update. Please try again.');
        console.error('[services] toggle failed', err.response?.data);
      } finally {
        this.toggling = null;
      }
    },

    confirmDelete(s) {
      this.deleteTarget = s;
    },

    async deleteService() {
      if (!this.deleteTarget) return;
      const id = this.deleteTarget.id;
      this.deleting = id;
      try {
        const headers = await this.authHeader();
        await axios.delete(`${API}/api/services/${id}`, { headers });
        this.services = this.services.filter((s) => s.id !== id);
        this.deleteTarget = null;
      } catch (err) {
        alert('Could not delete. Please try again.');
        console.error('[services] delete failed', err.response?.data);
      } finally {
        this.deleting = null;
      }
    },

    // Display helpers
    formatPrice(n) {
      return Number(n || 0).toLocaleString('en-US');
    },

    iconFor(type) {
      const t = String(type || '').toLowerCase();
      if (t.includes('speech') || t.includes('language')) return 'mdi-account-voice';
      if (t.includes('occupational')) return 'mdi-hand-heart';
      if (t.includes('physio')) return 'mdi-human-handsup';
      if (t.includes('psych')) return 'mdi-brain';
      if (t.includes('special') || t.includes('education')) return 'mdi-school';
      if (t.includes('learning')) return 'mdi-book-open-page-variant';
      if (t.includes('parent')) return 'mdi-account-supervisor';
      if (t.includes('assess')) return 'mdi-clipboard-text-outline';
      if (t.includes('group')) return 'mdi-account-group';
      return 'mdi-tag-outline';
    },

    iconBg(type) {
      const t = String(type || '').toLowerCase();
      if (t.includes('speech')) return '#e6e0f5';
      if (t.includes('occupational')) return '#fce4ec';
      if (t.includes('physio')) return '#e6e0f5';
      if (t.includes('psych')) return '#d9f0f6';
      if (t.includes('special') || t.includes('education')) return '#fce4ec';
      if (t.includes('learning')) return '#d9f0f6';
      return '#e6e0f5';
    },

    iconColor(type) {
      const t = String(type || '').toLowerCase();
      if (t.includes('occupational') || t.includes('special')) return '#e86a8a';
      if (t.includes('psych') || t.includes('learning')) return '#56c2d9';
      return '#4a3b8c';
    }
  }
};
</script>

<style scoped>
.services-page {
  min-height: 100vh;
  background: #f3f7fb;
  padding-bottom: 100px;
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
  padding: 20px 16px;
}
@media (min-width: 768px) {
  .main { padding: 28px 24px; }
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

/* SUMMARY */
.summary-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 16px;
  padding: 18px 12px;
  margin-bottom: 16px;
}
.summary-stat { flex: 1; text-align: center; }
.summary-value {
  font-size: 1.15rem;
  font-weight: 900;
  color: #4a3b8c;
  letter-spacing: -0.02em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.summary-label {
  font-size: 0.66rem;
  font-weight: 800;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
.summary-divider {
  width: 1px;
  height: 30px;
  background: #ececf1;
}

/* ADD BUTTON */
.add-btn {
  display: flex;
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
  font-family: inherit;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  transition: transform 0.15s ease;
  margin-bottom: 20px;
  min-height: 50px;
}
.add-btn:hover { transform: translateY(-1px); }

/* EMPTY */
.empty-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  border: 1px solid #ececf1;
  max-width: 520px;
  margin: 0 auto;
}
.empty-icon {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #e6e0f5;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
}
.empty-card h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 10px;
}
.empty-card p {
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
}

/* SERVICES LIST */
.services-list { display: grid; gap: 12px; }
.service-card {
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.15s ease;
}
.service-card:hover { border-color: #c8c0e0; }

.service-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.service-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.service-body { flex: 1; min-width: 0; }
.service-name {
  font-size: 0.98rem;
  font-weight: 800;
  color: #2c3e50;
  text-transform: capitalize;
  margin-bottom: 6px;
}
.service-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip-meta {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  background: #f3f7fb;
  color: #4a5568;
}
.chip-active {
  background: #e6f9ee;
  color: #229954;
}
.chip-inactive {
  background: #ececf1;
  color: #7f8c8d;
}

.service-desc {
  font-size: 0.84rem;
  color: #7f8c8d;
  line-height: 1.55;
  margin-bottom: 12px;
  padding-top: 4px;
}

.service-actions {
  display: flex;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f5;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #2c3e50;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.action-btn:hover:not(:disabled) {
  border-color: #c8c0e0;
  background: #f7f8fb;
}
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn.danger:hover:not(:disabled) {
  border-color: #e74c3c;
  background: #fdecea;
}

/* TIP */
.tip-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #e6e0f5;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.82rem;
  color: #4a3b8c;
  line-height: 1.55;
  margin-top: 20px;
}

/* BUTTONS */
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
  font-family: inherit;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
}
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
.btn-secondary:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
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
.btn-danger:hover:not(:disabled) { background: #c0392b; }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

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
  padding: 22px;
  max-width: 460px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 60px -20px rgba(15, 13, 36, 0.4);
}
.modal-sm {
  max-width: 380px;
  text-align: center;
}
.modal-sm .modal-actions { justify-content: center; }
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
  margin: 0 0 4px;
}
.modal-close {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 8px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-text {
  font-size: 0.88rem;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 22px;
}
.modal-body { margin-bottom: 4px; }
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f5;
  margin-top: 20px;
}

/* FIELDS */
.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}
.mt-4 { margin-top: 18px; }
.field-row {
  display: flex;
  gap: 10px;
}
.field-col { flex: 1; }

.text-input {
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid #e0e4eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #ffffff;
  color: #2c3e50;
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
.textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

/* PRESETS */
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.preset-chip {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1.5px solid #e0e4eb;
  background: #ffffff;
  color: #4a3b8c;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.preset-chip:hover {
  border-color: #4a3b8c;
  background: #f7f5fd;
}

/* ERROR */
.error-box {
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

/* RESPONSIVE */
@media (max-width: 599px) {
  .main { padding: 16px 12px; }
  .summary-card { padding: 14px 8px; }
  .summary-value { font-size: 1rem; }
  .service-actions { flex-direction: column; }
  .action-btn { width: 100%; justify-content: center; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
  .field-row { flex-direction: column; gap: 0; }
  .field-col + .field-col { margin-top: 18px; }
}
</style>