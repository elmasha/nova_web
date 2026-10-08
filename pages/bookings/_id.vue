<template>
  <div class="booking-page">
    <!-- TOP BAR -->
    <header class="topbar">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Booking</div>
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
        <h2>Could not load booking</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">Try again</button>
        <button class="link-btn mt-3" @click="goBack">Back to bookings</button>
      </section>

      <template v-else-if="booking">
        <!-- HEADER CARD -->
        <section class="header-card">
          <div class="header-row">
            <div class="avatar-lg" :style="{ background: avatarBg }">
              {{ initials(role === 'parent' ? booking.professional_name : booking.child_name) }}
            </div>
            <div class="header-body">
              <div class="header-title">
                {{ role === 'parent'
                  ? (booking.professional_name || 'Professional')
                  : (booking.child_name || 'Client') }}
              </div>
              <div class="header-sub">
                {{ typeLabel(booking.professional_type) || 'Session' }}
              </div>
            </div>
            <span class="status-pill" :class="statusClass(booking.status)">
              {{ statusLabel(booking.status) }}
            </span>
          </div>
        </section>

        <!-- DETAILS -->
        <section class="card">
          <h2 class="card-title">Details</h2>

          <div class="detail-row">
            <div class="detail-label">When</div>
            <div class="detail-value">{{ fullDate(booking.scheduled_at) }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time</div>
            <div class="detail-value">
              {{ timeRange(booking.scheduled_at, booking.duration_minutes) }}
            </div>
          </div>
          <div class="detail-row" v-if="booking.service_name">
            <div class="detail-label">Service</div>
            <div class="detail-value">{{ booking.service_name }}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Type</div>
            <div class="detail-value">
              {{ booking.location_type === 'online' ? 'Online session' : 'In person' }}
            </div>
          </div>
          <div class="detail-row" v-if="role === 'parent' && booking.child_name">
            <div class="detail-label">Child</div>
            <div class="detail-value">{{ booking.child_name }}</div>
          </div>
          <div class="detail-row" v-if="role === 'professional' && booking.parent_name">
            <div class="detail-label">Parent</div>
            <div class="detail-value">
              {{ booking.parent_name }}
              <span v-if="booking.parent_phone" class="muted"> · {{ booking.parent_phone }}</span>
            </div>
          </div>
          <div class="detail-row" v-if="booking.notes">
            <div class="detail-label">Notes</div>
            <div class="detail-value">{{ booking.notes }}</div>
          </div>
        </section>

        <!-- PAYMENT (parent only) -->
        <section v-if="role === 'parent'" class="card">
          <h2 class="card-title">Payment</h2>

          <div class="amount-box" :class="paymentClass">
            <div class="amount-body">
              <div class="amount-label">Amount due</div>
              <div class="amount-value">KSh {{ formatPrice(amountDue) }}</div>
            </div>
            <v-icon
              size="36"
              :color="paymentIconColor"
            >{{ paymentIcon }}</v-icon>
          </div>

          <div v-if="isPaid" class="paid-note">
            <v-icon small color="#229954" class="mr-1">mdi-check-circle</v-icon>
            Paid · Ref {{ booking.payment_ref || '—' }}
          </div>

          <div v-if="paymentError" class="error-box mt-3">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ paymentError }}</span>
          </div>

          <button
            v-if="canPay"
            class="primary-btn mt-4"
            :disabled="paying"
            @click="openPayModal"
          >
            <v-icon small color="white" class="mr-2">mdi-cellphone-wireless</v-icon>
            Pay with M-Pesa
          </button>

          <div v-else-if="isPaid" class="paid-badge">
            <v-icon small color="#229954">mdi-check-circle</v-icon>
            <span>Payment complete</span>
          </div>

          <div v-else-if="booking.status === 'cancelled'" class="paid-badge cancelled">
            <v-icon small color="#c0392b">mdi-cancel</v-icon>
            <span>Booking was cancelled</span>
          </div>
        </section>

        <!-- ACTIONS -->
        <section class="card">
          <h2 class="card-title">Actions</h2>

          <div class="actions-grid">
            <!-- Parent: cancel pending/confirmed -->
            <button
              v-if="role === 'parent' && ['pending', 'confirmed'].includes(booking.status)"
              class="action-btn danger"
              :disabled="acting"
              @click="confirmCancel = true"
            >
              <v-icon small color="#e74c3c" class="mr-2">mdi-close-circle-outline</v-icon>
              Cancel booking
            </button>

            <!-- Professional actions -->
            <button
              v-if="role === 'professional' && booking.status === 'pending'"
              class="action-btn primary"
              :disabled="acting"
              @click="setStatus('confirmed')"
            >
              <v-icon small color="#ffffff" class="mr-2">mdi-check</v-icon>
              Confirm booking
            </button>
            <button
              v-if="role === 'professional' && booking.status === 'confirmed'"
              class="action-btn primary"
              :disabled="acting"
              @click="setStatus('completed')"
            >
              <v-icon small color="#ffffff" class="mr-2">mdi-check-all</v-icon>
              Mark complete
            </button>
            <button
              v-if="role === 'professional' && booking.status === 'confirmed'"
              class="action-btn"
              :disabled="acting"
              @click="setStatus('no_show')"
            >
              <v-icon small color="#b7791f" class="mr-2">mdi-account-off-outline</v-icon>
              Mark no-show
            </button>

            <!-- Both: back -->
            <button class="action-btn" @click="goBack">
              <v-icon small class="mr-2">mdi-arrow-left</v-icon>
              Back to bookings
            </button>
          </div>
        </section>
      </template>
    </main>

    <!-- PAY MODAL -->
    <div v-if="payModal.open" class="modal-backdrop" @click.self="closePayModal">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">Pay with M-Pesa</div>
          <button class="modal-close" @click="closePayModal">
            <v-icon small color="#7f8c8d">mdi-close</v-icon>
          </button>
        </div>

        <div class="modal-body">
          <div class="pay-summary">
            <div class="pay-amount">KSh {{ formatPrice(amountDue) }}</div>
            <div class="pay-desc">
              {{ booking?.service_name || 'Session' }} ·
              {{ booking?.child_name || 'Your child' }}
            </div>
          </div>

          <label class="field-label mt-4">M-Pesa phone number</label>
          <input
            v-model.trim="payModal.phone"
            type="tel"
            inputmode="tel"
            placeholder="0712 345 678"
            class="text-input"
            :disabled="payModal.paying"
          />
          <p class="hint">
            Enter the phone number that will receive the M-Pesa prompt.
          </p>

          <div v-if="payModal.error" class="error-box mt-3">
            <v-icon small color="#e74c3c" class="mr-1">mdi-alert-circle-outline</v-icon>
            <span>{{ payModal.error }}</span>
          </div>

          <div v-if="payModal.stage === 'polling'" class="polling-box mt-4">
            <v-progress-circular indeterminate size="20" width="2" color="#4a3b8c" />
            <div>
              <div class="polling-title">Waiting for M-Pesa…</div>
              <div class="polling-text">Enter your PIN on your phone to complete payment.</div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" :disabled="payModal.paying" @click="closePayModal">
            Cancel
          </button>
          <button
            class="btn-primary"
            :disabled="payModal.paying || !canPaySubmit"
            @click="submitPay"
          >
            <span v-if="!payModal.paying">
              Send M-Pesa request
            </span>
            <span v-else class="loading-row">
              <v-progress-circular indeterminate size="16" width="2" color="white" />
              <span class="ml-2">Sending…</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- CANCEL CONFIRM -->
    <div v-if="confirmCancel" class="modal-backdrop" @click.self="confirmCancel = false">
      <div class="modal modal-sm">
        <h3 class="modal-title">Cancel booking?</h3>
        <p class="modal-text">
          {{ booking?.service_name || 'This session' }} with
          {{ booking?.professional_name || 'the professional' }} will be cancelled.
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmCancel = false">Keep</button>
          <button class="btn-danger" :disabled="acting" @click="cancelBooking">
            {{ acting ? 'Cancelling…' : 'Cancel booking' }}
          </button>
        </div>
      </div>
    </div>

    <!-- PAYMENT SUCCESS MODAL -->
    <div v-if="paySuccess" class="modal-backdrop">
      <div class="modal modal-sm">
        <div class="success-icon">
          <v-icon size="42" color="#229954">mdi-check</v-icon>
        </div>
        <h3 class="modal-title">Payment received</h3>
        <p class="modal-text">
          Your booking is confirmed. You'll see it in your upcoming sessions.
        </p>
        <button class="btn-primary" @click="closePaySuccess">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

export default {
  name: 'BookingDetailPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',
      acting: false,

      booking: null,
      role: 'parent',
      user: null,

      payModal: {
        open: false,
        phone: '',
        paying: false,
        error: '',
        stage: 'idle', // 'idle' | 'polling'
        paymentId: null,
        checkoutId: null
      },

      pollTimer: null,
      paySuccess: false,
      confirmCancel: false,
      paymentError: ''
    };
  },

  computed: {
    amountDue() {
      if (!this.booking) return 0;
      return Number(this.booking.service_price || this.booking.payment_amount || 0);
    },
    isPaid() {
      return this.booking?.payment_status === 'paid';
    },
    canPay() {
      if (!this.booking) return false;
      if (this.isPaid) return false;
      if (this.booking.status === 'cancelled') return false;
      if (this.booking.status === 'completed') return false;
      if (this.booking.status === 'no_show') return false;
      return this.amountDue > 0;
    },
    canPaySubmit() {
      const digits = String(this.payModal.phone || '').replace(/\D/g, '');
      return digits.length >= 9;
    },
    avatarBg() {
      const p = ['#4a3b8c', '#56c2d9', '#e86a8a', '#7ec8e3', '#f48fb1'];
      const id = this.booking?.professional_id || this.booking?.child_id || 0;
      return p[(Number(id) || 0) % p.length];
    },
    paymentClass() {
      if (this.isPaid) return 'amount-paid';
      if (this.booking?.status === 'cancelled') return 'amount-cancelled';
      return 'amount-due';
    },
    paymentIcon() {
      if (this.isPaid) return 'mdi-check-circle';
      if (this.booking?.status === 'cancelled') return 'mdi-cancel';
      return 'mdi-cash-clock';
    },
    paymentIconColor() {
      if (this.isPaid) return '#229954';
      if (this.booking?.status === 'cancelled') return '#c0392b';
      return '#4a3b8c';
    }
  },

  mounted() {
    this.load();
  },

  beforeDestroy() {
    this.stopPolling();
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
      this.$router.push(
        this.role === 'professional'
          ? '/dashboard/professional?tab=bookings'
          : '/dashboard/parent?tab=bookings'
      ).catch(() => {});
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

        // Read current user to know role
        const meRes = await axios.get(`${API}/api/users/me`, { headers });
        this.user = meRes.data?.data || null;
        this.role = this.user?.role === 'professional' ? 'professional' : 'parent';

        const { data } = await axios.get(`${API}/api/bookings/${this.$route.params.id}`, {
          headers
        });
        this.booking = data.data || null;

        // Prefill phone from user
        if (this.role === 'parent' && this.user?.phone && !this.payModal.phone) {
          this.payModal.phone = this.user.phone;
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) this.loadError = 'Booking not found.';
        else if (status === 403) this.loadError = 'You don\'t have access to this booking.';
        else if (status === 401) {
          this.loadError = 'Your session expired. Please sign in again.';
          setTimeout(() => this.$router.push('/login'), 1500);
        } else this.loadError = 'Could not load booking.';
        console.error('[booking detail]', status, err.response?.data);
      } finally {
        this.loading = false;
      }
    },

    /* ---------------- Payment ---------------- */
    openPayModal() {
      this.paymentError = '';
      this.payModal = {
        open: true,
        phone: this.payModal.phone || this.user?.phone || '',
        paying: false,
        error: '',
        stage: 'idle',
        paymentId: null,
        checkoutId: null
      };
    },

    closePayModal() {
      if (this.payModal.paying || this.payModal.stage === 'polling') {
        // Don't close while in flight
        if (this.payModal.stage === 'polling') {
          // Allow closing if user wants
          this.stopPolling();
        } else {
          return;
        }
      }
      this.payModal.open = false;
    },

    async submitPay() {
      if (!this.canPaySubmit || this.payModal.paying) return;
      this.payModal.paying = true;
      this.payModal.error = '';

      try {
        const headers = await this.authHeader();
        const { data } = await axios.post(
          `${API}/api/payments/mpesa/stk`,
          {
            booking_id: Number(this.$route.params.id),
            phone: this.payModal.phone
          },
          { headers }
        );

        this.payModal.paymentId = data.payment_id;
        this.payModal.checkoutId = data.checkout_request_id;
        this.payModal.stage = 'polling';
        this.payModal.paying = false;

        // Start polling
        this.startPolling();
      } catch (err) {
        const body = err.response?.data;
        this.payModal.error =
          body?.message ||
          body?.error ||
          err.message ||
          'Could not send M-Pesa request.';
        this.payModal.paying = false;
      }
    },

    startPolling() {
      this.stopPolling();
      let attempts = 0;
      const maxAttempts = 20; // 20 * 3s = 60s

      this.pollTimer = setInterval(async () => {
        attempts++;
        try {
          const headers = await this.authHeader();
          const { data } = await axios.get(
            `${API}/api/payments/${this.payModal.paymentId}/status`,
            { headers }
          );
          const status = data.data?.status;

          if (status === 'paid') {
            this.stopPolling();
            this.payModal.open = false;
            this.paySuccess = true;
            this.load();
            return;
          }
          if (status === 'failed') {
            this.stopPolling();
            this.payModal.stage = 'idle';
            this.payModal.error = 'Payment was not completed. Try again.';
            return;
          }
        } catch (e) {
          // Ignore transient errors during polling
        }

        if (attempts >= maxAttempts) {
          this.stopPolling();
          this.payModal.stage = 'idle';
          this.payModal.error = 'Timed out waiting for M-Pesa. If you entered your PIN, refresh in a moment.';
        }
      }, 3000);
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    closePaySuccess() {
      this.paySuccess = false;
    },

    /* ---------------- Cancel / status ---------------- */
    async cancelBooking() {
      if (this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(
          `${API}/api/bookings/${this.$route.params.id}/status`,
          { status: 'cancelled' },
          { headers }
        );
        this.confirmCancel = false;
        await this.load();
      } catch (err) {
        alert(err.response?.data?.error || 'Could not cancel.');
      } finally {
        this.acting = false;
      }
    },

    async setStatus(status) {
      if (this.acting) return;
      this.acting = true;
      try {
        const headers = await this.authHeader();
        await axios.patch(
          `${API}/api/bookings/${this.$route.params.id}/status`,
          { status },
          { headers }
        );
        await this.load();
      } catch (err) {
        alert(err.response?.data?.error || 'Could not update.');
      } finally {
        this.acting = false;
      }
    },

    /* ---------------- Formatting ---------------- */
    initials(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    formatPrice(n) {
      return Number(n || 0).toLocaleString('en-US');
    },
    fullDate(dt) {
      return new Date(dt).toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    },
    timeRange(dt, mins = 60) {
      const start = new Date(dt);
      const end = new Date(start.getTime() + (Number(mins) || 60) * 60000);
      const f = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${f(start)} – ${f(end)}`;
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
      const m = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', no_show: 'No-show' };
      return m[s] || s || 'Unknown';
    },
    typeLabel(t) {
      const m = {
        speech_therapist: 'Speech & language',
        occupational_therapist: 'Occupational therapy',
        physiotherapist: 'Physiotherapy',
        psychologist: 'Psychology',
        special_needs_teacher: 'Special-needs education',
        learning_support: 'Learning support',
        parent_coach: 'Parent coaching',
        other: 'Other'
      };
      return m[t] || t || '';
    }
  }
};
</script>

<style scoped>
.booking-page { min-height: 100vh; background: #f3f7fb; padding-bottom: 48px; }

.topbar {
  position: sticky; top: 0; z-index: 40;
  background: #ffffff; border-bottom: 1px solid #ececf1;
  height: 60px; padding: 0 12px;
  display: flex; align-items: center; justify-content: space-between;
}
@media (min-width: 768px) { .topbar { padding: 0 24px; } }
.back-btn,
.icon-btn {
  width: 38px; height: 38px; border-radius: 10px; background: #f3f7fb;
  border: none; display: grid; place-items: center; cursor: pointer;
}
.back-btn:hover,
.icon-btn:hover { background: #e6eef5; }
.topbar-title { font-size: 0.98rem; font-weight: 800; color: #2c3e50; }

.main { max-width: 640px; margin: 0 auto; padding: 20px 16px; }
@media (min-width: 768px) { .main { padding: 28px 24px; } }

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

/* HEADER */
.header-card {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 18px; padding: 16px; margin-bottom: 16px;
}
.header-row { display: flex; align-items: center; gap: 14px; }
.avatar-lg {
  width: 52px; height: 52px; border-radius: 14px;
  color: #ffffff; display: grid; place-items: center;
  font-weight: 800; font-size: 15px; flex: 0 0 auto;
  letter-spacing: 0.3px;
}
.header-body { flex: 1; min-width: 0; }
.header-title {
  font-size: 1rem; font-weight: 800; color: #2c3e50;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.header-sub { font-size: 0.8rem; color: #7f8c8d; margin-top: 2px; }

.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.66rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.3px; white-space: nowrap; flex: 0 0 auto;
}
.status-green { background: #e6f9ee; color: #229954; }
.status-amber { background: #fef3e0; color: #b7791f; }
.status-red   { background: #fdecea; color: #c0392b; }
.status-grey  { background: #ececf1; color: #7f8c8d; }

/* CARD */
.card {
  background: #ffffff; border: 1px solid #ececf1;
  border-radius: 18px; padding: 20px; margin-bottom: 16px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: #2c3e50;
  margin: 0 0 16px; letter-spacing: -0.01em;
}

/* DETAIL ROWS */
.detail-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; padding: 10px 0;
  border-bottom: 1px solid #f0f0f5;
}
.detail-row:last-child { border-bottom: none; }
.detail-label {
  font-size: 0.76rem; font-weight: 700; color: #7f8c8d;
  text-transform: uppercase; letter-spacing: 0.4px; flex: 0 0 auto;
}
.detail-value {
  font-size: 0.88rem; color: #2c3e50; font-weight: 600;
  text-align: right; flex: 1; min-width: 0; word-break: break-word;
}
.detail-value .muted { color: #95a5a6; font-weight: 500; }

/* AMOUNT BOX */
.amount-box {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 16px 18px; border-radius: 14px;
  border: 1px solid;
}
.amount-due      { background: #e6e0f5; border-color: #c8b8e8; }
.amount-paid     { background: #e6f9ee; border-color: #a7e3c0; }
.amount-cancelled { background: #fdecea; border-color: #f5c2bd; }

.amount-label {
  font-size: 0.72rem; font-weight: 800; color: #7f8c8d;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
}
.amount-value {
  font-size: 1.5rem; font-weight: 900; color: #2c3e50;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.paid-note {
  display: flex; align-items: center;
  margin-top: 12px; padding: 10px 12px;
  background: #f9fafc; border-radius: 10px;
  font-size: 0.8rem; color: #229954; font-weight: 600;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
}

.paid-badge {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; margin-top: 16px; padding: 12px;
  background: #e6f9ee; border-radius: 12px;
  font-size: 0.88rem; font-weight: 700; color: #229954;
}
.paid-badge.cancelled {
  background: #fdecea; color: #c0392b;
}

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.92rem; font-weight: 700; cursor: pointer;
  font-family: inherit; box-shadow: 0 8px 20px rgba(74, 59, 140, 0.28);
  min-height: 50px;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #ffffff; color: #2c3e50;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-primary {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff; font-size: 0.88rem; font-weight: 700; cursor: pointer;
  font-family: inherit;
}
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: #e74c3c; color: #ffffff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: #4a3b8c; font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }
.mt-3 { margin-top: 12px; }

/* ACTIONS */
.actions-grid { display: grid; gap: 8px; }
.action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 12px 16px; border-radius: 12px;
  border: 1.5px solid #e0e4eb; background: #ffffff;
  color: #2c3e50; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
  min-height: 46px;
}
.action-btn:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn.primary {
  border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(74, 59, 140, 0.24);
}
.action-btn.danger {
  border-color: #f5c2bd;
  background: #fdecea;
  color: #c0392b;
}
.action-btn.danger:hover:not(:disabled) {
  background: #fad4ce;
}

/* FORM */
.field-label {
  display: block; font-size: 0.82rem; font-weight: 700;
  color: #2c3e50; margin-bottom: 8px;
}
.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #ffffff; color: #2c3e50;
  outline: none; font-family: inherit;
}
.text-input:focus {
  border-color: #4a3b8c;
  box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1);
}
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.hint { font-size: 0.78rem; color: #95a5a6; margin: 6px 0 0; line-height: 1.5; }

.error-box {
  padding: 12px 14px; border-radius: 10px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500; line-height: 1.45;
  display: flex; align-items: flex-start;
}
.error-box .v-icon { margin-top: 2px; }

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
.modal-sm { max-width: 380px; text-align: center; }
.modal-sm .modal-actions { justify-content: center; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.modal-title { font-size: 1.05rem; font-weight: 800; color: #2c3e50; margin: 0; }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { margin-bottom: 16px; }
.modal-text { font-size: 0.88rem; color: #7f8c8d; line-height: 1.6; margin: 0 0 22px; }
.modal-actions {
  display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
}

/* PAY SUMMARY */
.pay-summary {
  padding: 16px; background: #f9fafc;
  border-radius: 14px; text-align: center;
}
.pay-amount {
  font-size: 1.6rem; font-weight: 900; color: #4a3b8c;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
}
.pay-desc {
  font-size: 0.82rem; color: #7f8c8d; margin-top: 4px;
}

/* POLLING */
.polling-box {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: #e6e0f5;
}
.polling-title {
  font-size: 0.85rem; font-weight: 800; color: #4a3b8c;
}
.polling-text {
  font-size: 0.78rem; color: #4a3b8c; opacity: 0.8;
  margin-top: 2px;
}

/* SUCCESS ICON */
.success-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: #e6f9ee; display: grid; place-items: center;
  margin: 0 auto 16px;
}

/* RESPONSIVE */
@media (max-width: 599px) {
  .main { padding: 16px 12px; }
  .card { padding: 16px; }
  .amount-value { font-size: 1.3rem; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
  .detail-row { flex-direction: column; gap: 4px; align-items: flex-start; }
  .detail-value { text-align: left; }
}
</style>