<template>
  <div class="booking-page">
    <!-- TOPBAR -->
    <header class="topbar" :class="{ scrolled }">
      <button class="back-btn" @click="goBack" aria-label="Back">
        <v-icon small color="#4a3b8c">mdi-arrow-left</v-icon>
      </button>
      <div class="topbar-title">Booking</div>
      <button class="icon-btn" @click="load" :disabled="loading" aria-label="Refresh">
        <v-icon small color="#4a3b8c" :class="{ spinning: loading }">mdi-refresh</v-icon>
      </button>
    </header>

    <main class="main">
      <!-- SKELETON -->
      <div v-if="loading" class="skeleton-wrap">
        <div class="sk-hero"></div>
        <div class="sk-card"></div>
        <div class="sk-card"></div>
      </div>

      <!-- ERROR -->
      <section v-else-if="loadError" class="error-card">
        <div class="error-icon">
          <v-icon size="38" color="#e74c3c">mdi-alert-circle-outline</v-icon>
        </div>
        <h2>Could not load booking</h2>
        <p>{{ loadError }}</p>
        <button class="primary-btn" @click="load">
          <v-icon small color="white" class="mr-2">mdi-refresh</v-icon>
          Try again
        </button>
        <button class="link-btn mt-3" @click="goBack">Back to bookings</button>
      </section>

      <template v-else-if="booking">
        <!-- HERO -->
        <section class="hero">
          <div class="hero-body">
            <div class="hero-avatars">
              <div class="avatar-lg" :style="{ background: avatarBg }">
                {{ initials(role === 'parent' ? booking.professional_name : booking.child_name) }}
              </div>
              <div
                v-if="role === 'parent' && booking.child_name"
                class="avatar-sm"
                :style="{ background: avatarBgAlt }"
              >
                {{ initials(booking.child_name) }}
              </div>
            </div>
            <div class="hero-info">
              <div class="hero-kicker">{{ typeLabel(booking.professional_type) || 'Session' }}</div>
              <div class="hero-title">
                {{ role === 'parent'
                  ? (booking.professional_name || 'Professional')
                  : (booking.child_name || 'Client') }}
              </div>
              <div class="hero-when">
                <v-icon x-small color="#ffffff" style="opacity: 0.7">mdi-clock-outline</v-icon>
                {{ shortDate(booking.scheduled_at) }}
              </div>
            </div>
            <span class="status-pill" :class="statusClass(booking.status)">
              {{ statusLabel(booking.status) }}
            </span>
          </div>
          <div class="hero-glow"></div>
        </section>

        <!-- STEPPER -->
        <section class="card stepper-card">
          <div class="stepper">
            <template v-for="(step, i) in steps">
              <div
                :key="step.key"
                class="step"
                :class="{ done: step.done, current: step.current, cancelled: step.cancelled }"
              >
                <div class="step-dot">
                  <v-icon x-small color="white">{{ step.icon }}</v-icon>
                </div>
                <div class="step-label">{{ step.label }}</div>
              </div>
              <div
                v-if="i < steps.length - 1"
                :key="'conn-' + i"
                class="step-connector"
                :class="{ done: step.done }"
              ></div>
            </template>
          </div>
        </section>

        <!-- DETAILS -->
        <section class="card">
          <h2 class="card-title">Details</h2>

          <div class="detail-row">
            <div class="detail-icon gradient-purple">
              <v-icon x-small color="white">mdi-calendar-outline</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">When</div>
              <div class="detail-value">{{ fullDate(booking.scheduled_at) }}</div>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-icon gradient-teal">
              <v-icon x-small color="white">mdi-clock-outline</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">Time</div>
              <div class="detail-value">
                {{ timeRange(booking.scheduled_at, booking.duration_minutes) }}
              </div>
            </div>
          </div>

          <div class="detail-row" v-if="booking.service_name">
            <div class="detail-icon gradient-pink">
              <v-icon x-small color="white">mdi-tag-outline</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">Service</div>
              <div class="detail-value">{{ booking.service_name }}</div>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-icon gradient-purple">
              <v-icon x-small color="white">{{ booking.location_type === 'online' ? 'mdi-video-outline' : 'mdi-map-marker-outline' }}</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">Format</div>
              <div class="detail-value">
                {{ booking.location_type === 'online' ? 'Online session' : 'In person' }}
              </div>
            </div>
          </div>

          <div class="detail-row" v-if="role === 'parent' && booking.child_name">
            <div class="detail-icon gradient-teal">
              <v-icon x-small color="white">mdi-account-child-outline</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">Child</div>
              <div class="detail-value">{{ booking.child_name }}</div>
            </div>
          </div>

          <div class="detail-row" v-if="role === 'professional' && booking.parent_name">
            <div class="detail-icon gradient-teal">
              <v-icon x-small color="white">mdi-account-outline</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">Parent</div>
              <div class="detail-value">
                {{ booking.parent_name }}
                <span v-if="booking.parent_phone" class="muted"> · {{ booking.parent_phone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-row" v-if="booking.notes">
            <div class="detail-icon gradient-pink">
              <v-icon x-small color="white">mdi-note-text-outline</v-icon>
            </div>
            <div class="detail-body">
              <div class="detail-label">Notes</div>
              <div class="detail-value notes-value">{{ booking.notes }}</div>
            </div>
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
            <div class="amount-icon" :class="paymentIconWrapClass">
              <v-icon small color="white">{{ paymentIcon }}</v-icon>
            </div>
          </div>

          <div v-if="isPaid" class="paid-note">
            <v-icon small color="#229954" class="mr-2">mdi-check-circle</v-icon>
            <span>Paid · Ref <span class="mono">{{ booking.payment_ref || '—' }}</span></span>
          </div>

          <div v-if="paymentError" class="error-box mt-3">
            <v-icon small color="#e74c3c" class="mr-2">mdi-alert-circle-outline</v-icon>
            <span>{{ paymentError }}</span>
          </div>

          <button
            v-if="canPay"
            class="mpesa-btn mt-4"
            :disabled="paying"
            @click="openPayModal"
          >
            <span class="mpesa-left">
              <v-icon small color="white" class="mr-2">mdi-cellphone-wireless</v-icon>
              Pay with M-Pesa
            </span>
            <v-icon small color="white">mdi-chevron-right</v-icon>
          </button>

          <div v-else-if="isPaid" class="state-chip green">
            <v-icon small color="#229954">mdi-check-circle</v-icon>
            <span>Payment complete</span>
          </div>

          <div v-else-if="booking.status === 'cancelled'" class="state-chip red">
            <v-icon small color="#c0392b">mdi-cancel</v-icon>
            <span>Booking was cancelled</span>
          </div>
        </section>

        <!-- ACTIONS -->
        <section class="card">
          <h2 class="card-title">Actions</h2>

          <div class="actions-grid">
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
              class="action-btn warning"
              :disabled="acting"
              @click="setStatus('no_show')"
            >
              <v-icon small color="#b7791f" class="mr-2">mdi-account-off-outline</v-icon>
              Mark no-show
            </button>

            <button
              v-if="role === 'parent' && ['pending', 'confirmed'].includes(booking.status)"
              class="action-btn danger"
              :disabled="acting"
              @click="confirmCancel = true"
            >
              <v-icon small color="#e74c3c" class="mr-2">mdi-close-circle-outline</v-icon>
              Cancel booking
            </button>

            <button class="action-btn" @click="goBack">
              <v-icon small class="mr-2">mdi-arrow-left</v-icon>
              Back to bookings
            </button>
          </div>
        </section>
      </template>
    </main>

    <!-- PAY MODAL -->
    <transition name="modal">
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
              <div class="pay-logo">
                <v-icon small color="white">mdi-cellphone-wireless</v-icon>
              </div>
              <div class="pay-amount">KSh {{ formatPrice(amountDue) }}</div>
              <div class="pay-desc">
                {{ booking?.service_name || 'Session' }} ·
                {{ booking?.child_name || 'Your child' }}
              </div>
            </div>

            <!-- IDLE: phone input -->
            <template v-if="payModal.stage === 'idle'">
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
            </template>

            <!-- WAITING: 25s countdown -->
            <div v-if="payModal.stage === 'waiting'" class="waiting-box mt-4">
              <div class="waiting-ring">
                <svg viewBox="0 0 36 36" class="ring-svg">
                  <circle cx="18" cy="18" r="16" class="ring-track" />
                  <circle
                    cx="18" cy="18" r="16"
                    class="ring-fill"
                    :style="{ strokeDasharray: ringDash, strokeDashoffset: ringOffset }"
                  />
                </svg>
                <div class="ring-count">{{ payModal.secondsLeft }}</div>
              </div>
              <div class="waiting-copy">
                <div class="waiting-title">Confirming payment…</div>
                <div class="waiting-text">
                  Enter your M-Pesa PIN on your phone. We'll check in {{ payModal.secondsLeft }}s.
                </div>
                <button class="link-btn mt-2" @click="checkPaymentNow">
                  Check now
                </button>
              </div>
            </div>

            <!-- CHECKING: single request in flight -->
            <div v-if="payModal.stage === 'checking'" class="waiting-box mt-4">
              <div class="checking-spinner">
                <v-progress-circular indeterminate size="22" width="2" color="#4a3b8c" />
              </div>
              <div class="waiting-copy">
                <div class="waiting-title">Checking payment…</div>
                <div class="waiting-text">One moment.</div>
              </div>
            </div>

            <!-- STILL PENDING after 25s -->
            <div v-if="payModal.stage === 'still_pending'" class="still-pending-box mt-4">
              <div class="still-icon">
                <v-icon small color="#b7791f">mdi-clock-alert-outline</v-icon>
              </div>
              <div class="waiting-copy">
                <div class="waiting-title">Still processing</div>
                <div class="waiting-text">
                  M-Pesa hasn't confirmed yet. If you entered your PIN, wait a few seconds and check again.
                </div>
                <button class="link-btn mt-2" @click="checkPaymentNow">Check again</button>
              </div>
            </div>

            <div v-if="payModal.error" class="error-box mt-3">
              <v-icon small color="#e74c3c" class="mr-2">mdi-alert-circle-outline</v-icon>
              <span>{{ payModal.error }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" :disabled="payModal.paying" @click="closePayModal">
              {{ payModal.stage === 'waiting' || payModal.stage === 'checking' ? 'Cancel' : 'Close' }}
            </button>
            <button
              v-if="payModal.stage === 'idle'"
              class="btn-primary"
              :disabled="payModal.paying || !canPaySubmit"
              @click="submitPay"
            >
              <span v-if="!payModal.paying">Send M-Pesa request</span>
              <span v-else class="loading-row">
                <v-progress-circular indeterminate size="14" width="2" color="white" />
                <span class="ml-2">Sending…</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- CANCEL CONFIRM -->
    <transition name="modal">
      <div v-if="confirmCancel" class="modal-backdrop" @click.self="confirmCancel = false">
        <div class="modal modal-sm">
          <div class="confirm-icon danger">
            <v-icon size="34" color="#e74c3c">mdi-close-circle-outline</v-icon>
          </div>
          <h3 class="confirm-title">Cancel booking?</h3>
          <p class="confirm-text">
            {{ booking?.service_name || 'This session' }} with
            {{ booking?.professional_name || 'the professional' }} will be cancelled.
          </p>
          <div class="modal-footer">
            <button class="btn-secondary" @click="confirmCancel = false">Keep</button>
            <button class="btn-danger" :disabled="acting" @click="cancelBooking">
              {{ acting ? 'Cancelling…' : 'Cancel booking' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- PAYMENT SUCCESS -->
    <transition name="modal">
      <div v-if="paySuccess" class="modal-backdrop">
        <div class="modal modal-sm">
          <div class="success-icon">
            <div class="success-pulse"></div>
            <v-icon size="38" color="white">mdi-check</v-icon>
          </div>
          <h3 class="confirm-title">Payment received</h3>
          <p class="confirm-text">
            Your booking is confirmed. You'll see it in your upcoming sessions.
          </p>
          <div class="modal-footer">
            <button class="btn-primary" @click="closePaySuccess">Done</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- TOASTS -->
    <div class="toast-wrap">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast-${t.type}`"
        >
          <v-icon small color="white" class="mr-2">{{ t.icon }}</v-icon>
          <span class="toast-text">{{ t.message }}</span>
          <span class="toast-bar" />
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API = process.env.API_BASE_URL || 'https://novaserver-production-b5fd.up.railway.app';

const CONFIRM_DELAY_SECONDS = 25;

export default {
  name: 'BookingDetailPage',
  middleware: 'auth',

  data() {
    return {
      loading: true,
      loadError: '',
      acting: false,
      scrolled: false,

      booking: null,
      role: 'parent',
      user: null,

      payModal: {
        open: false,
        phone: '',
        paying: false,
        error: '',
        stage: 'idle', // 'idle' | 'waiting' | 'checking' | 'still_pending'
        paymentId: null,
        checkoutId: null,
        secondsLeft: CONFIRM_DELAY_SECONDS
      },

      confirmTimer: null,
      tickTimer: null,
      paySuccess: false,
      confirmCancel: false,
      paymentError: '',

      toasts: []
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
      if (['cancelled', 'completed', 'no_show'].includes(this.booking.status)) return false;
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
    avatarBgAlt() {
      const p = ['#e86a8a', '#7ec8e3', '#f48fb1', '#56c2d9', '#4a3b8c'];
      const id = this.booking?.child_id || 0;
      return p[(Number(id) || 0) % p.length];
    },
    paymentClass() {
      if (this.isPaid) return 'amount-paid';
      if (this.booking?.status === 'cancelled') return 'amount-cancelled';
      return 'amount-due';
    },
    paymentIcon() {
      if (this.isPaid) return 'mdi-check';
      if (this.booking?.status === 'cancelled') return 'mdi-close';
      return 'mdi-cellphone-wireless';
    },
    paymentIconWrapClass() {
      if (this.isPaid) return 'gradient-green';
      if (this.booking?.status === 'cancelled') return 'gradient-red';
      return 'gradient-purple';
    },
    /* Countdown ring math */
    ringDash() {
      const r = 16;
      return 2 * Math.PI * r; // ~100.53
    },
    ringOffset() {
      const total = CONFIRM_DELAY_SECONDS;
      const elapsed = total - this.payModal.secondsLeft;
      const pct = Math.min(1, Math.max(0, elapsed / total));
      return this.ringDash * (1 - pct);
    },
    steps() {
      const status = this.booking?.status || 'pending';
      const isCancelled = status === 'cancelled';
      const isNoShow = status === 'no_show';

      const order = ['pending', 'confirmed', 'completed'];
      const idx = order.indexOf(status);

      return [
        {
          key: 'pending',
          label: 'Booked',
          icon: 'mdi-check',
          done: isCancelled || isNoShow ? true : idx >= 0,
          current: status === 'pending',
          cancelled: false
        },
        {
          key: 'confirmed',
          label: isCancelled ? 'Cancelled' : isNoShow ? 'No-show' : 'Confirmed',
          icon: isCancelled ? 'mdi-close' : isNoShow ? 'mdi-account-off-outline' : 'mdi-check',
          done: isCancelled || isNoShow ? true : idx >= 1,
          current: status === 'confirmed',
          cancelled: isCancelled || isNoShow
        },
        {
          key: 'completed',
          label: 'Completed',
          icon: 'mdi-check-all',
          done: idx >= 2,
          current: status === 'completed',
          cancelled: false
        }
      ];
    }
  },

  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.load();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    this.clearTimers();
  },

  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 4;
    },

    toast(message, type = 'success', icon = 'mdi-check-circle-outline') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type, icon });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3200);
    },

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

        const meRes = await axios.get(`${API}/api/users/me`, { headers });
        this.user = meRes.data?.data || null;
        this.role = this.user?.role === 'professional' ? 'professional' : 'parent';

        const { data } = await axios.get(`${API}/api/bookings/${this.$route.params.id}`, {
          headers
        });
        this.booking = data.data || null;

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

    openPayModal() {
      this.paymentError = '';
      this.payModal = {
        open: true,
        phone: this.payModal.phone || this.user?.phone || '',
        paying: false,
        error: '',
        stage: 'idle',
        paymentId: null,
        checkoutId: null,
        secondsLeft: CONFIRM_DELAY_SECONDS
      };
    },

    closePayModal() {
      if (this.payModal.paying) return;
      this.clearTimers();
      this.payModal.open = false;
    },

    clearTimers() {
      if (this.confirmTimer) {
        clearTimeout(this.confirmTimer);
        this.confirmTimer = null;
      }
      if (this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
      }
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
        this.payModal.paying = false;

        this.startWait();
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

    /* 25s wait → single status query */
    startWait() {
      this.clearTimers();
      this.payModal.stage = 'waiting';
      this.payModal.secondsLeft = CONFIRM_DELAY_SECONDS;

      // Tick once per second to update the ring + countdown text
      this.tickTimer = setInterval(() => {
        if (this.payModal.secondsLeft > 0) {
          this.payModal.secondsLeft -= 1;
        }
        if (this.payModal.secondsLeft <= 0) {
          clearInterval(this.tickTimer);
          this.tickTimer = null;
        }
      }, 1000);

      // The single deferred check
      this.confirmTimer = setTimeout(() => {
        this.confirmTimer = null;
        this.checkPayment();
      }, CONFIRM_DELAY_SECONDS * 1000);
    },

    checkPaymentNow() {
      // Called by "Check now" / "Check again" — cancel the pending timer
      this.clearTimers();
      this.checkPayment();
    },

    async checkPayment() {
      if (!this.payModal.paymentId) return;
      this.payModal.stage = 'checking';
      this.payModal.error = '';

      try {
        const headers = await this.authHeader();
        const { data } = await axios.get(
          `${API}/api/payments/${this.payModal.paymentId}/status`,
          { headers }
        );

        const status = data.data?.status;
        const failureReason = data.data?.failure_reason;

        if (status === 'paid') {
          this.payModal.open = false;
          this.paySuccess = true;
          await this.load();
          return;
        }

        if (status === 'failed') {
          this.payModal.stage = 'idle';
          this.payModal.error = failureReason || 'Payment was not completed. Try again.';
          return;
        }

        // Still pending
        this.payModal.stage = 'still_pending';
      } catch (err) {
        const code = err.response?.status;
        if (code === 404) {
          this.payModal.stage = 'idle';
          this.payModal.error = 'Payment record not found. Try again.';
        } else {
          this.payModal.stage = 'still_pending';
        }
      }
    },

    closePaySuccess() {
      this.paySuccess = false;
    },

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
        this.toast('Booking cancelled', 'warn', 'mdi-calendar-remove-outline');
        await this.load();
      } catch (err) {
        this.toast(err.response?.data?.error || 'Could not cancel.', 'error', 'mdi-alert-circle-outline');
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
        const verb = { confirmed: 'confirmed', completed: 'completed', no_show: 'marked as no-show' }[status] || status;
        this.toast(`Booking ${verb}`);
        await this.load();
      } catch (err) {
        this.toast(err.response?.data?.error || 'Could not update.', 'error', 'mdi-alert-circle-outline');
      } finally {
        this.acting = false;
      }
    },

    initials(name) {
      const n = (name || '').trim();
      if (!n) return '?';
      return n.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    },
    formatPrice(n) {
      return Number(n || 0).toLocaleString('en-US');
    },
    shortDate(dt) {
      if (!dt) return '—';
      return new Date(dt).toLocaleDateString('en-KE', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit'
      });
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
.booking-page {
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
.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.topbar-title { font-size: 0.98rem; font-weight: 800; color: var(--ink); }

/* MAIN */
.main { max-width: 640px; margin: 0 auto; padding: 20px 16px; }
@media (min-width: 768px) { .main { padding: 28px 24px; } }

/* SKELETON */
.skeleton-wrap { padding-top: 4px; }
.sk-hero {
  height: 130px; border-radius: 22px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 16px;
}
.sk-card {
  height: 90px; border-radius: 18px;
  background: linear-gradient(90deg, #eaedf3 0%, #f3f5f9 50%, #eaedf3 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  margin-bottom: 12px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ERROR */
.error-card {
  background: #fff; border-radius: 20px; padding: 40px 24px;
  text-align: center; border: 1px solid #fdecea;
  max-width: 520px; margin: 24px auto;
}
.error-icon {
  width: 76px; height: 76px; border-radius: 50%; background: #fdecea;
  display: grid; place-items: center; margin: 0 auto 16px;
}
.error-card h2 { font-size: 1.15rem; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
.error-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin: 0 0 20px; }

/* HERO */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #4a3b8c 0%, #5b4b9e 55%, #7ec8e3 140%);
  color: #fff;
  border-radius: 22px;
  padding: 22px 20px;
  margin-bottom: 14px;
  box-shadow: 0 24px 48px -20px rgba(74, 59, 140, 0.55);
}
.hero-body {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 14px;
}
.hero-avatars { position: relative; flex: 0 0 auto; }
.avatar-lg {
  width: 58px; height: 58px; border-radius: 16px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 16px; letter-spacing: 0.3px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 12px 24px -12px rgba(15, 13, 36, 0.5);
}
.avatar-sm {
  position: absolute; right: -10px; bottom: -6px;
  width: 32px; height: 32px; border-radius: 10px;
  color: #fff; display: grid; place-items: center;
  font-weight: 800; font-size: 11px;
  border: 2px solid #fff;
  box-shadow: 0 6px 14px -6px rgba(15, 13, 36, 0.5);
}
.hero-info { flex: 1; min-width: 0; }
.hero-kicker {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase; opacity: 0.78; margin-bottom: 4px;
}
.hero-title {
  font-size: 1.1rem; font-weight: 800; letter-spacing: -0.01em;
  margin-bottom: 4px; line-height: 1.2;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hero-when {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; opacity: 0.88;
}
.hero-glow {
  position: absolute; top: -50%; right: -25%; width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(232, 106, 138, 0.5), transparent 70%);
  filter: blur(20px); pointer-events: none;
}

/* STATUS PILL */
.status-pill {
  display: inline-flex; align-items: center;
  font-size: 0.62rem; font-weight: 800; padding: 5px 10px;
  border-radius: 999px; text-transform: uppercase;
  letter-spacing: 0.4px; white-space: nowrap; flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* STEPPER */
.stepper-card { padding: 22px 18px 24px; }
.stepper {
  display: flex; align-items: center; gap: 4px;
}
.step {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; flex: 0 0 auto;
}
.step-dot {
  width: 30px; height: 30px; border-radius: 50%;
  background: #e5e9f0;
  display: grid; place-items: center;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.step-dot .v-icon { color: #95a5a6 !important; }
.step.done .step-dot { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.step.done .step-dot .v-icon { color: #fff !important; }
.step.current .step-dot {
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  box-shadow: 0 0 0 5px rgba(74, 59, 140, 0.16);
}
.step.current .step-dot .v-icon { color: #fff !important; }
.step.cancelled .step-dot { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.step.cancelled .step-dot .v-icon { color: #fff !important; }
.step-label {
  font-size: 0.68rem; font-weight: 700;
  color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.4px; white-space: nowrap;
}
.step.done .step-label,
.step.current .step-label { color: var(--purple); }
.step.cancelled .step-label { color: #c0392b; }

.step-connector {
  flex: 1; height: 2px; border-radius: 2px;
  background: #e5e9f0; margin: 0 -4px;
  margin-bottom: 22px;
  transition: background 0.2s ease;
}
.step-connector.done { background: linear-gradient(90deg, #4a3b8c, #7ec8e3); }

/* CARD */
.card {
  background: #fff; border: 1px solid var(--line);
  border-radius: 18px; padding: 20px; margin-bottom: 14px;
}
.card-title {
  font-size: 0.98rem; font-weight: 800; color: var(--ink);
  margin: 0 0 14px; letter-spacing: -0.01em;
}

/* DETAIL ROWS */
.detail-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f5;
}
.detail-row:last-child { border-bottom: none; padding-bottom: 0; }
.detail-row:first-of-type { padding-top: 4px; }

.detail-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center; flex: 0 0 auto;
  box-shadow: 0 6px 14px -8px rgba(74, 59, 140, 0.4);
}
.gradient-purple { background: linear-gradient(135deg, #4a3b8c, #5b4b9e); }
.gradient-teal   { background: linear-gradient(135deg, #3a9fb8, #7ec8e3); }
.gradient-pink   { background: linear-gradient(135deg, #e86a8a, #f48fb1); }
.gradient-green  { background: linear-gradient(135deg, #229954, #2ecc71); }
.gradient-red    { background: linear-gradient(135deg, #c0392b, #e74c3c); }

.detail-body { flex: 1; min-width: 0; }
.detail-label {
  font-size: 0.68rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;
}
.detail-value {
  font-size: 0.9rem; color: var(--ink); font-weight: 600;
  word-break: break-word; line-height: 1.45;
}
.detail-value .muted { color: #95a5a6; font-weight: 500; }
.notes-value { white-space: pre-wrap; }

/* AMOUNT BOX */
.amount-box {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; padding: 18px;
  border-radius: 16px; border: 1px solid;
  position: relative; overflow: hidden;
}
.amount-due       { background: linear-gradient(135deg, #ece7fa, #f5f2fd); border-color: #d5cbf0; }
.amount-paid      { background: linear-gradient(135deg, #e6f9ee, #f1fcf6); border-color: #a7e3c0; }
.amount-cancelled { background: linear-gradient(135deg, #fdecea, #fef5f4); border-color: #f5c2bd; }

.amount-body { flex: 1; min-width: 0; }
.amount-label {
  font-size: 0.68rem; font-weight: 800; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
}
.amount-value {
  font-size: 1.6rem; font-weight: 900; color: var(--ink);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.amount-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: grid; place-items: center;
  box-shadow: 0 10px 20px -12px rgba(74, 59, 140, 0.55);
}

.paid-note {
  display: flex; align-items: center;
  margin-top: 12px; padding: 11px 13px;
  background: #f7faf8; border-radius: 12px;
  border: 1px solid #d9efe1;
  font-size: 0.8rem; color: #229954; font-weight: 600;
}
.paid-note .mono {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  letter-spacing: 0.5px;
  color: var(--ink);
}

.state-chip {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; margin-top: 14px; padding: 12px;
  border-radius: 12px;
  font-size: 0.86rem; font-weight: 700;
}
.state-chip.green { background: #e6f9ee; color: #229954; }
.state-chip.red   { background: #fdecea; color: #c0392b; }

/* MPESA BUTTON */
.mpesa-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 14px 18px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #fff; font-size: 0.92rem; font-weight: 800;
  cursor: pointer; font-family: inherit;
  min-height: 52px;
  box-shadow: 0 14px 28px -12px rgba(74, 59, 140, 0.7);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.mpesa-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 18px 32px -14px rgba(74, 59, 140, 0.8); }
.mpesa-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.mpesa-left { display: inline-flex; align-items: center; }

/* ACTIONS */
.actions-grid { display: grid; gap: 8px; }
.action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 12px 16px; border-radius: 12px;
  border: 1.5px solid #e0e4eb; background: #fff;
  color: var(--ink); font-size: 0.88rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s ease;
  min-height: 46px;
}
.action-btn:hover:not(:disabled) { border-color: #c8c0e0; background: #f7f8fb; }
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn.primary {
  border: none;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  color: #fff;
  box-shadow: 0 10px 22px -12px rgba(74, 59, 140, 0.7);
}
.action-btn.warning {
  border-color: #f5dab7;
  background: #fef3e0;
  color: #b7791f;
}
.action-btn.warning:hover:not(:disabled) { background: #fce7c4; border-color: #eec48a; }
.action-btn.danger {
  border-color: #f5c2bd;
  background: #fdecea;
  color: #c0392b;
}
.action-btn.danger:hover:not(:disabled) { background: #fad4ce; }

/* FORM */
.field-label {
  display: block; font-size: 0.82rem; font-weight: 700;
  color: var(--ink); margin-bottom: 8px;
}
.text-input {
  width: 100%; padding: 13px 16px;
  border: 1.5px solid #e0e4eb; border-radius: 12px;
  font-size: 0.95rem; background: #fff; color: var(--ink);
  outline: none; font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.text-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(74, 59, 140, 0.1); }
.text-input:disabled { background: #f7f8fb; cursor: not-allowed; }
.hint { font-size: 0.78rem; color: #95a5a6; margin: 6px 0 0; line-height: 1.5; }

.error-box {
  padding: 12px 14px; border-radius: 12px;
  background: #fdecea; color: #c0392b;
  font-size: 0.83rem; font-weight: 500; line-height: 1.45;
  display: flex; align-items: flex-start;
}
.error-box .v-icon { margin-top: 1px; flex: 0 0 auto; }

/* BUTTONS */
.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; padding: 13px 22px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--purple), var(--purple-2));
  color: #fff; font-size: 0.9rem; font-weight: 800; cursor: pointer;
  font-family: inherit; min-height: 48px;
  box-shadow: 0 12px 24px -12px rgba(74, 59, 140, 0.7);
  transition: transform 0.15s ease;
}
.primary-btn:hover:not(:disabled) { transform: translateY(-1px); }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-secondary {
  padding: 11px 18px; border-radius: 12px; border: 1.5px solid #e0e4eb;
  background: #fff; color: var(--ink);
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  min-height: 44px;
}
.btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-danger {
  padding: 11px 18px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  min-height: 44px;
  box-shadow: 0 10px 22px -12px rgba(231, 76, 60, 0.7);
}
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-row { display: inline-flex; align-items: center; gap: 8px; }

.link-btn {
  display: inline-flex; align-items: center;
  background: transparent; border: none;
  color: var(--purple); font-weight: 700; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; padding: 4px 0;
}
.link-btn:hover { text-decoration: underline; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-2 { margin-top: 8px; }

/* MODAL */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 13, 36, 0.55);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal {
  background: #fff; border-radius: 22px;
  max-width: 440px; width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 40px 80px -24px rgba(15, 13, 36, 0.5);
}
.modal-sm { max-width: 400px; text-align: center; }
.modal-head {
  padding: 20px 22px 16px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #f0f0f5;
}
.modal-title { font-size: 1.02rem; font-weight: 800; color: var(--ink); margin: 0; }
.modal-close {
  background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 10px;
}
.modal-close:hover { background: #f3f7fb; }
.modal-body { padding: 16px 22px; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 14px 22px 18px;
  display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
  border-top: 1px solid #f0f0f5;
  background: #fbfcfe;
}
.modal-sm .modal-footer { justify-content: center; }
.modal-sm .modal-footer button { min-width: 140px; }

/* PAY SUMMARY */
.pay-summary {
  padding: 20px 16px; background: linear-gradient(135deg, #f5f2fd, #fbfaff);
  border-radius: 16px; text-align: center;
  border: 1px solid #e5def5;
}
.pay-logo {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, #4a3b8c, #5b4b9e);
  display: grid; place-items: center; margin: 0 auto 10px;
  box-shadow: 0 10px 22px -12px rgba(74, 59, 140, 0.6);
}
.pay-amount {
  font-size: 1.7rem; font-weight: 900; color: var(--purple);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.pay-desc {
  font-size: 0.82rem; color: var(--muted); margin-top: 6px;
}

/* WAITING / CHECKING */
.waiting-box {
  display: flex; align-items: center; gap: 14px;
  padding: 14px; border-radius: 14px;
  background: #ece7fa;
  border: 1px solid #d5cbf0;
}
.waiting-copy { flex: 1; min-width: 0; }
.waiting-title { font-size: 0.88rem; font-weight: 800; color: var(--purple); }
.waiting-text { font-size: 0.78rem; color: var(--purple); opacity: 0.85; margin-top: 3px; line-height: 1.45; }

/* Countdown ring */
.waiting-ring {
  position: relative;
  width: 52px; height: 52px;
  flex: 0 0 auto;
}
.ring-svg {
  width: 100%; height: 100%;
  transform: rotate(-90deg);
}
.ring-track {
  fill: none; stroke: #d5cbf0; stroke-width: 3;
}
.ring-fill {
  fill: none; stroke: #4a3b8c; stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}
.ring-count {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  font-size: 0.85rem; font-weight: 900;
  color: var(--purple);
  font-variant-numeric: tabular-nums;
}
.checking-spinner {
  width: 52px; height: 52px;
  display: grid; place-items: center;
  flex: 0 0 auto;
}

/* STILL PENDING */
.still-pending-box {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px; border-radius: 14px;
  background: #fef3e0;
  border: 1px solid #f5dab7;
}
.still-icon {
  width: 42px; height: 42px; border-radius: 50%;
  background: #fbe0b0;
  display: grid; place-items: center;
  flex: 0 0 auto;
}
.still-pending-box .waiting-title { color: #b7791f; }
.still-pending-box .waiting-text  { color: #8a5a12; opacity: 1; }
.still-pending-box .link-btn { color: #b7791f; }

/* CONFIRM / SUCCESS */
.confirm-icon {
  width: 68px; height: 68px; border-radius: 50%;
  background: #fdecea;
  display: grid; place-items: center;
  margin: 4px auto 14px;
}
.confirm-title {
  font-size: 1.05rem; font-weight: 800; color: var(--ink);
  margin: 0 0 8px;
}
.confirm-text {
  font-size: 0.88rem; color: var(--muted); line-height: 1.55;
  margin: 0 0 20px; padding: 0 4px;
}
.success-icon {
  position: relative;
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg, #229954, #2ecc71);
  display: grid; place-items: center;
  margin: 4px auto 16px;
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

/* TOASTS */
.toast-wrap {
  position: fixed; bottom: 24px; right: 24px; z-index: 200;
  display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
  pointer-events: none;
}
.toast {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center;
  padding: 12px 18px 14px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 700; color: #fff;
  box-shadow: 0 20px 40px -16px rgba(15, 13, 36, 0.5);
  max-width: 340px;
}
.toast-text { flex: 1; }
.toast-bar {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: rgba(255, 255, 255, 0.45);
  transform-origin: left;
  animation: toastBar 3.2s linear forwards;
}
@keyframes toastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.toast-success { background: linear-gradient(135deg, #229954, #2ecc71); }
.toast-warn    { background: linear-gradient(135deg, #b7791f, #f39c12); }
.toast-error   { background: linear-gradient(135deg, #c0392b, #e74c3c); }

/* TRANSITIONS */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
}
.modal-enter, .modal-leave-to { opacity: 0; }
.modal-enter .modal, .modal-leave-to .modal { transform: translateY(20px) scale(0.97); opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(20px); }

/* RESPONSIVE */
@media (max-width: 599px) {
  .main { padding: 16px 12px; }
  .card { padding: 16px; }
  .hero { padding: 18px 16px; border-radius: 18px; }
  .amount-value { font-size: 1.4rem; }
  .amount-icon { width: 40px; height: 40px; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-footer button { width: 100%; }
  .modal-sm .modal-footer button { min-width: 0; }
  .toast-wrap { left: 14px; right: 14px; align-items: stretch; }
  .toast { max-width: none; }
}
</style>