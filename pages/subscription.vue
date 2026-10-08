<template>
  <div class="d-flex bg-grey-lighten-4" style="min-height: 100vh;">
    <!-- Desktop Sidebar -->
    <v-navigation-drawer v-if="!nav_bars" permanent width="260" class="elevation-1" color="white">
      <div class="pa-6">
        <div class="d-flex align-center mb-1 cursor-pointer" @click="$router.push('/dashboard')">
          <v-avatar color="red darken-2" size="36" class="mr-3">
            <v-icon color="white" size="20">mdi-food-steak</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold red--text">MeatPro</div>
            <div class="text-caption grey--text text--darken-1">{{ shopName }}</div>
          </div>
        </div>
      </div>
      <v-divider class="mx-4" />
      <v-list dense nav class="px-3 py-2">
        <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to" link class="mb-1 rounded-lg" active-class="red lighten-5 red--text">
          <v-list-item-icon class="mr-3">
            <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="font-weight-medium text-body-2">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <div class="pa-4">
          <v-btn block outlined color="grey" class="rounded-lg text-capitalize" @click="logout">
            <v-icon left size="18">mdi-logout</v-icon> Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main :class="nav_bars ? 'pb-16' : ''">
      <v-container :fluid="nav_bars" class="px-4 px-sm-6 pt-4 pt-sm-6">

        <!-- Header -->
        <v-row align="center" class="mb-6">
          <v-col cols="12" sm="8">
            <div class="d-flex align-center">
              <v-btn icon small class="mr-3" to="/dashboard">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <div>
                <h1 class="text-h5 text-sm-h4 font-weight-bold grey--text text--darken-3">
                  Subscription & Billing
                </h1>
                <p class="text-caption grey--text mt-1 mb-0">
                  Manage your plan and M-Pesa payments
                </p>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Status Banner -->
        <v-row class="mb-6" v-if="currentSub">
          <v-col cols="12">
            <v-card class="rounded-2xl pa-6 d-flex align-center justify-space-between flex-wrap" :class="statusCardClass" elevation="3">
              <div class="d-flex align-center">
                <v-avatar :color="currentSub.is_active ? 'green' : 'orange darken-2'" size="56" class="mr-4 elevation-2">
                  <v-icon color="white" size="28">{{ currentSub.is_active ? 'mdi-crown' : 'mdi-alert' }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold white--text">{{ currentSub?.subscription?.display_name || 'Starter' }}</div>
                  <div class="text-caption white--text" style="opacity: 0.9;">
                    <span v-if="currentSub.is_active">
                      Active until {{ formatDate(currentSub?.subscription?.end_date) }}
                      <v-chip x-small color="white" class="ml-2" :text-color="(currentSub?.days_remaining || 0) < 7 ? 'red' : 'green'">
                        {{ currentSub?.days_remaining || 0 }} days left
                      </v-chip>
                    </span>
                    <span v-else-if="currentSub?.subscription?.status === 'cancelled'">
                      Cancelled — expires {{ formatDate(currentSub?.subscription?.end_date) }}
                    </span>
                    <span v-else>Your subscription has expired. Renew to unlock Pro features.</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 mt-sm-0">
                <v-btn v-if="!currentSub.is_active" color="white" class="red--text rounded-xl font-weight-bold px-6" @click="scrollToPlans">
                  <v-icon left>mdi-refresh</v-icon> Renew
                </v-btn>
                <!-- ONLY CHANGE: uses isPaidPlan instead of hardcoded 'pro' -->
                <v-btn v-else-if="isPaidPlan(currentSub?.subscription)" text color="white" class="rounded-xl text-capitalize" @click="cancelDialog = true">
                  Cancel
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Plans -->
        <v-row id="plans-section" align="stretch" class="mb-8">
          <v-col v-for="plan in plans" :key="plan.id" cols="12" md="6">
            <v-card class="plan-card rounded-2xl h-100 pa-6 d-flex flex-column"
              :class="{ 'plan-pro': plan.name === 'pro', 'plan-starter': plan.name === 'starter', 'elevation-8': isCurrentPlan(plan.name) }"
              elevation="2">

              <div class="d-flex align-center justify-space-between mb-4">
                <v-chip :color="plan.name === 'pro' ? 'red darken-2' : 'grey lighten-2'"
                  :text-color="plan.name === 'pro' ? 'white' : 'grey darken-2'"
                  small label class="font-weight-bold px-3">
                  {{ plan.display_name }}
                </v-chip>
                <v-icon v-if="isCurrentPlan(plan.name)" color="green" size="24">mdi-check-decagram</v-icon>
              </div>

              <div class="mb-4">
                <span class="text-h2 font-weight-black" :class="plan.name === 'pro' ? 'white--text' : 'grey--text text--darken-3'">
                  KES {{ formatNumber(plan.price_kes) }}
                </span>
                <span class="text-body-2 ml-2" :class="plan.name === 'pro' ? 'red--text text--lighten-3' : 'grey--text'">/month</span>
              </div>

              <p class="text-body-2 mb-6" :class="plan.name === 'pro' ? 'red--text text--lighten-4' : 'grey--text text--darken-1'">
                {{ plan.description }}
              </p>

              <v-divider class="mb-4 mb-sm-6" :class="parseFloat(plan.price_kes) > 500 ? 'red darken-2' : ''" />
                 <v-chip-group
                    v-for="(feature, i) in plan.features"
                    :key="feature"
                    class="mb-1 mb-sm-1"
                    color="green lighten-2"
                    column
                    mandatory
                  >
                    <v-chip label color="white" class="red--text font-weight-bold">{{ feature }}</v-chip>
                  </v-chip-group>
                <!-- <v-list dense :dark="parseFloat(plan.price_kes) > 10" class="mb-6 mb-sm-8 transparent pa-0">
                  <v-list-item
                    v-for="feature in parseFeatures(plan.features)"
                    :key="feature"
                    class="px-0 mb-1 mb-sm-2"
                  >
                    <v-icon :color="parseFloat(plan.price_kes) > 10 ? 'green lighten-2' : 'green'" small class="mr-3">mdi-check-circle</v-icon>
                    <span class="text-body-2" :class="parseFloat(plan.price_kes) > 10 ? 'red--text text--lighten-4' : 'grey--text text--darken-1'">{{ feature }}</span>
                  </v-list-item>
                </v-list> -->

              <v-btn
                v-if="plan.price_kes > 0"
                block
                x-large
                :color="plan.name === 'pro' ? 'white' : 'red darken-2'"
                :class="plan.name === 'pro' ? 'red--text font-weight-bold' : 'white--text'"
                class="rounded-xl text-capitalize elevation-4 hover-lift"
                @click="openPayment(plan)"
                :disabled="isCurrentPlan(plan.name) && currentSub?.is_active"
              >
                <v-icon left>{{ isCurrentPlan(plan.name) ? 'mdi-refresh' : 'mdi-crown-outline' }}</v-icon>
                {{ isCurrentPlan(plan.name) ? 'Renew Plan' : `Upgrade to ${plan.display_name}` }}
              </v-btn>

              <v-btn v-else block large outlined color="grey" class="rounded-xl text-capitalize" disabled>
                <v-icon left>mdi-check</v-icon> Free Plan Active
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- Payment History -->
        <v-row v-show="false">
          <v-col cols="12">
            <v-card class="rounded-2xl" elevation="1">
              <v-card-title class="px-4 px-sm-6 py-4">
                <v-icon color="red darken-2" class="mr-2">mdi-receipt-text</v-icon>
                <span class="text-h6 font-weight-bold grey--text text--darken-2">Payment History</span>
                <v-spacer />
                <v-btn small text color="red" class="text-capitalize" @click="loadPayments">
                  <v-icon left small>mdi-refresh</v-icon> Refresh
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-data-table :headers="paymentHeaders" :items="payments" dense class="rounded-b-xl">
                <template v-slot:item.amount="{ item }">
                  <span class="font-weight-bold">KES {{ formatNumber(item.amount) }}</span>
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip x-small :color="statusColor(item.status)" text-color="white" label>
                    {{ item.status }}
                  </v-chip>
                </template>
                <template v-slot:item.created_at="{ item }">
                  {{ formatDate(item.created_at) }}
                </template>
                <template v-slot:no-data>
                  <div class="text-center pa-4 grey--text">No payments yet</div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Mobile Bottom Nav -->
    <v-bottom-navigation v-if="nav_bars" v-model="bottomNav" color="red darken-2" grow fixed class="elevation-8" style="z-index: 100; border-radius: 16px 16px 0 0;">
      <v-btn v-for="item in bottomItems" :key="item.to" :to="item.to">
        <span>{{ item.title }}</span>
        <v-icon>{{ item.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>

    <!-- Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="480" persistent>
      <v-card class="rounded-2xl pa-6 pa-sm-8">
        <div class="text-center mb-6">
          <div class="mpesa-icon-wrapper mb-4 d-inline-block">
            <v-avatar color="green lighten-5" size="72">
              <v-icon color="green" size="36">mdi-cellphone-text</v-icon>
            </v-avatar>
          </div>
          <h3 class="text-h5 font-weight-bold grey--text text--darken-3">M-Pesa Payment</h3>
          <p class="text-caption grey--text mt-1">You will receive an STK push on your phone</p>
        </div>

        <div class="payment-summary pa-4 rounded-xl mb-6 grey lighten-4">
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 grey--text">Plan</span>
            <span class="text-body-2 font-weight-bold grey--text text--darken-2">{{ selectedPlan?.display_name }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 grey--text">Billing</span>
            <span class="text-body-2 font-weight-bold grey--text text--darken-2">Monthly</span>
          </div>
          <v-divider class="my-3" />
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-1 font-weight-bold">Total</span>
            <span class="text-h5 font-weight-black red--text">KES {{ formatNumber(selectedPlan?.price_kes) }}</span>
          </div>
        </div>

        <v-text-field
          v-model="mpesaPhone"
          label="M-Pesa Phone Number"
          placeholder="254712345678"
          outlined
          rounded
          dense
          prepend-inner-icon="mdi-phone"
          class="rounded-lg mb-4"
          :rules="[v => /^254\d{9}$/.test(v) || 'Format: 254712345678']"
        />

        <div v-if="timerEnabled" class="payment-wait text-center mb-2">
                <div class="timer-ring">
                    {{ timerCount }}
                </div>

                <h4>Waiting for M-Pesa confirmation</h4>
                <p>Check your phone and enter your PIN.</p>
            </div>

        <v-btn block x-large color="green darken-2" dark class="rounded-xl font-weight-bold text-capitalize mb-3 elevation-4" :loading="payLoading" @click="initiatePayment">
          <v-icon left>mdi-send</v-icon>
          Pay with M-Pesa
        </v-btn>

        <v-btn block text color="grey" class="text-capitalize" @click="paymentDialog = false">
          Cancel
        </v-btn>

        <v-chip v-if="demoMode" color="orange lighten-5" text-color="orange" x-small label class="mt-4 d-block text-center">
          <v-icon left x-small>mdi-information</v-icon> Demo Mode — Payment will auto-confirm
        </v-chip>
      </v-card>
    </v-dialog>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card class="rounded-2xl pa-6">
        <div class="text-center mb-4">
          <v-icon color="orange" size="48">mdi-alert-circle</v-icon>
          <h3 class="text-h6 font-weight-bold grey--text text--darken-3 mt-2">Cancel Subscription?</h3>
          <p class="text-body-2 grey--text mt-2">
            You'll keep Pro access until {{ formatDate(currentSub?.subscription?.end_date) }}, then revert to Free.
          </p>
        </div>
        <v-row dense>
          <v-col cols="6">
            <v-btn block text color="grey" class="rounded-xl text-capitalize" @click="cancelDialog = false">Keep Plan</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block color="red" dark class="rounded-xl text-capitalize font-weight-bold" :loading="cancelLoading" @click="cancelSubscription">Cancel</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="5000" bottom rounded="lg" class="mb-4">
      <div class="d-flex align-center">
        <v-icon left small>{{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import moment from 'moment';
import numeral from 'numeral';
import axios from 'axios';
import apiClient from '../services/api'

export default {
  name: 'Subscription',

  data() {
    return {
      timerEnabled: false,
      timerCount: 25,

      CheckoutRequestID: null,
      nav_bars: false,
      bottomNav: 3,
      shopName: 'Prime Cuts - CBD',
      firebaseUid: null,
      demoMode: true,

      plans: [],
      currentSub: null,
      payments: [],

      paymentDialog: false,
      cancelDialog: false,
      selectedPlan: null,
      mpesaPhone: '254',
      payLoading: false,
      cancelLoading: false,

      menuItems: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
        { title: 'Reports', icon: 'mdi-chart-line', to: '/reports' },
        { title: 'Profile', icon: 'mdi-account', to: '/profile' },
        { title: 'Subscription', icon: 'mdi-crown', to: '/subscription' }
      ],

      bottomItems: [
        { title: 'Home', icon: 'mdi-home', to: '/dashboard' },
        { title: 'Reports', icon: 'mdi-chart-line', to: '/reports' },
        { title: 'Profile', icon: 'mdi-account', to: '/profile' },
        { title: 'Pro', icon: 'mdi-crown', to: '/subscription' }
      ],

      paymentHeaders: [
        { text: 'Date', value: 'created_at' },
        { text: 'Amount', value: 'amount', align: 'end' },
        { text: 'Phone', value: 'phone' },
        { text: 'Receipt', value: 'mpesa_receipt' },
        { text: 'Status', value: 'status', align: 'center' }
      ],

      snackbar: { show: false, text: '', color: 'success' },
      authUnsubscribe: null
    }
  },
  watch: {
    timerEnabled(value) {
      if (value) {
        setTimeout(() => {
          this.timerCount--;
        }, 1000);
      }
    },

    timerCount: {
      handler(value) {
        if (value > 0 && this.timerEnabled) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        } else if (value === 0 && this.timerEnabled) {
          this.StkQuery();

        }
      },
      immediate: true,
    },
  },
  computed: {
    statusCardClass() {
      if (!this.currentSub) return 'grey darken-2';
      return this.currentSub.is_active ? 'gradient-active' : 'gradient-expired';
    }
  },

  methods: {
    async StkQuery() {
  if (!this.CheckoutRequestID) return;
  this.timerCount = 25;
  this.timerEnabled = false;

  this.showSnackbar('Checking payment status...', 'info');

  try {
    const response = await apiClient.post(`/subscriptions/query`, {
      checkout_request_id: this.CheckoutRequestID,
    });

    const data = response.data || {};
    const resultCode = String(data.result_code ?? '');
    const resultDesc = data.result_desc || '';
    const mpesaStatus = data.mpesa_status;

    // SUCCESS
    if (resultCode === '0') {
      this.paymentDialog = false;
      this.showSnackbar('Payment successful! Pro features activated.', 'success');

      // Refresh subscription data, then hard-reload the page
      try {
        await this.loadStatus();
        await this.loadPayments();
      } catch (e) {
        console.error(e);
      }

      setTimeout(() => {
        window.location.reload();
      }, 1200);
      return;
    }

    // CANCELLED by user
    if (resultCode === '1032') {
      this.showSnackbar('You cancelled the payment on your phone. No money was deducted.', 'warning');
      this.paymentDialog = false;
      return;
    }

    // WRONG PIN
    if (resultCode === '2001') {
      this.showSnackbar('You entered the wrong M-Pesa PIN. Please try again.', 'warning');
      this.paymentDialog = false;
      return;
    }

    // INSUFFICIENT BALANCE
    if (resultCode === '1') {
      this.showSnackbar('Your M-Pesa balance is too low for this transaction.', 'warning');
      this.paymentDialog = false;
      return;
    }

    // INVALID NUMBER
    if (resultCode === '1001') {
      this.showSnackbar('The phone number format is incorrect.', 'warning');
      this.paymentDialog = false;
      return;
    }

    // TIMEOUT
    if (resultCode === '1002') {
      this.showSnackbar('The M-Pesa request timed out. Please check if you received the prompt and try again.', 'warning');
      this.paymentDialog = false;
      return;
    }

    // FAILED
    if (mpesaStatus === 'failed') {
      this.showSnackbar(resultDesc || 'The payment could not be completed. Please try again.', 'warning');
      this.paymentDialog = false;
      return;
    }

    // Still pending — restart the wait timer and query again
    if (mpesaStatus === 'pending' || resultCode === '' || resultCode === '1037') {
      this.showSnackbar('Still waiting for M-Pesa confirmation...', 'info');
      this.timerCount = 25;
      this.timerEnabled = true;
      return;
    }

    console.log('StkQuery response:', data);
  } catch (error) {
    console.error('StkQuery error:', error);
    this.timerCount = 25;
    this.timerEnabled = false;
    this.showSnackbar('Could not confirm payment. Please try again.', 'error');
  }
},
    formatNumber(val) { return numeral(val || 0).format('0,0'); },
    formatDate(date) { return date ? moment(date).format('MMM D, YYYY') : 'N/A'; },
    parseFeatures(featuresJson) {
      try { return JSON.parse(featuresJson || '[]'); }
      catch { return []; }
    },
    // FIXED: Check by plan name (varchar) not plan_id
    isCurrentPlan(planName) {
      return this.currentSub?.subscription?.plan === planName ||
             this.currentSub?.subscription?.plan_name === planName;
    },
    statusColor(status) {
      return { pending: 'orange', success: 'green', failed: 'red' }[status] || 'grey';
    },
    scrollToPlans() {
      document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
    },

    async loadPlans() {
      try {
        const { data } = await apiClient.get('/plans');
        this.plans = data;
        console.log('Loaded plans:', data);
      } catch (e) { console.error('Plans error', e); }
    },

    async loadStatus() {
      if (!this.firebaseUid) return;
      try {
        const { data } = await apiClient.get(`/subscriptions/status?firebase_uid=${this.firebaseUid}`);
        this.currentSub = data;
      } catch (e) { console.error('Status error', e); }
    },

    async loadPayments() {
      if (!this.firebaseUid) return;
      try {
        const { data } = await apiClient.get(`/subscriptions/history?firebase_uid=${this.firebaseUid}`);
        this.payments = data || [];
      } catch (e) {
        console.error('Payments error', e);
        this.payments = [];
      }
    },

    openPayment(plan) {
      this.selectedPlan = plan;
      this.mpesaPhone = '254';
      this.paymentDialog = true;
    },

    async initiatePayment() {
      if (!/^254\d{9}$/.test(this.mpesaPhone)) {
        this.showSnackbar('Enter valid phone: 2547XXXXXXXX', 'warning');
        return;
      }

      this.payLoading = true;
      try {
        const { data } = await apiClient.post('/subscriptions/initiate', {
          firebase_uid: this.firebaseUid,
          plan_id: this.selectedPlan.id,
          phone: this.mpesaPhone
        });
        this.CheckoutRequestID = data.checkout_request_id;

          this.timerEnabled = true;

        console.log('Payment initiated:', data);

          this.showSnackbar(data.message, 'success');
          // this.paymentDialog = false;
          this.payLoading = false;


      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'Payment failed', 'error');
        this.payLoading = false;
      }
    },

    async cancelSubscription() {
      this.cancelLoading = true;
      try {
        await apiClient.post('/subscriptions/cancel', { firebase_uid: this.firebaseUid });
        this.showSnackbar('Subscription cancelled', 'success');
        this.cancelDialog = false;
        await this.loadStatus();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'Failed to cancel', 'error');
      } finally {
        this.cancelLoading = false;
      }
    },

    // ONLY ADDITION: determines if a plan is paid (shows cancel button)
    isPaidPlan(sub) {
      if (!sub) return false;
      const price = parseFloat(sub.price_kes);
      if (!isNaN(price) && price > 0) return true;
      const name = (sub.plan || sub.plan_name || '').toLowerCase();
      return !['starter', 'free', 'basic'].includes(name);
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color };
    },

    onResize() { this.nav_bars = window.innerWidth < 768; },
    logout() {
      this.$fire.auth.signOut();
      this.$router.push('/login');
    }
  },

  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);

    this.$fire.auth.onAuthStateChanged(user => {
      if (user) {
        this.firebaseUid = user.uid;
        this.loadPlans();
        this.loadStatus();
        this.loadPayments();
      } else {
        this.$router.push('/login');
      }
    });
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  }
}
</script>

<style scoped>
.timer-ring {
    width: 68px;
    height: 68px;
    border: 3px solid red;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 12px auto;
    color: red;
    font-weight: 900;
    font-size: 1.35rem;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.25);
}
.cursor-pointer { cursor: pointer; }
.bg-grey-lighten-4 { background-color: #f5f5f5 !important; }
.rounded-2xl { border-radius: 20px !important; }
.rounded-xl { border-radius: 16px !important; }

.gradient-active {
  background: linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #66bb6a 100%);
}

.gradient-expired {
  background: linear-gradient(135deg, #e65100 0%, #f57c00 50%, #ff9800 100%);
}

.plan-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-6px);
}

.plan-starter {
  background: white;
  border-color: #e0e0e0;
}

.plan-pro {
  background: linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #d32f2f 100%);
  color: white;
}

.plan-pro::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
  pointer-events: none;
}

.mpesa-icon-wrapper {
  position: relative;
}

.mpesa-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, transparent 70%);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(211, 47, 47, 0.35) !important;
}

.payment-summary {
  border: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}
</style>